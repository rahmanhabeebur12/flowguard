import hmac
import hashlib
import json
import time
from typing import Dict, Any, Optional

SECRET_KEY = "FLOWGUARD_INTERNAL_SECRET_SIGNING_KEY_39148"

class SecurityViolationException(Exception):
    """Raised when an execution bypass of FlowGuard Reference Monitor is attempted."""
    pass

class FlowGuardExecutionToken:
    """
    Cryptographic execution authorization ticket issued strictly by the Reference Monitor upon ALLOW.
    Sensitive tools refuse execution if this token is missing, expired, tampered, for wrong tool, or for wrong arguments.
    """

    @classmethod
    def compute_args_hash(cls, arguments: Dict[str, Any]) -> str:
        canonical = json.dumps(arguments, sort_keys=True)
        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()[:16]

    @classmethod
    def generate(cls, task_id: str, tool_name: str, arguments: Dict[str, Any], expiry_seconds: int = 60) -> str:
        args_hash = cls.compute_args_hash(arguments)
        timestamp = str(int(time.time()))
        expiry = str(expiry_seconds)
        payload = f"{task_id}:{tool_name}:{args_hash}:{timestamp}:{expiry}"
        signature = hmac.new(SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
        return f"{payload}:{signature}"

    @classmethod
    def verify(
        cls,
        token: str,
        expected_tool: str,
        expected_arguments: Optional[Dict[str, Any]] = None,
        expected_task_id: Optional[str] = None,
    ) -> bool:
        if not token:
            return False
        try:
            parts = token.split(":")
            if len(parts) != 6:
                return False
            task_id, tool_name, args_hash, timestamp_str, expiry_str, sig = parts

            # 1. Verify Tool Match
            if tool_name != expected_tool:
                return False

            # 2. Verify Task ID Match if expected
            if expected_task_id and task_id != expected_task_id:
                return False

            # 3. Verify Argument Hash Match if expected (prevents parameter tampering)
            if expected_arguments is not None:
                expected_hash = cls.compute_args_hash(expected_arguments)
                if not hmac.compare_digest(args_hash, expected_hash):
                    return False

            # 4. Check Expiration
            token_time = int(timestamp_str)
            expiry_seconds = int(expiry_str)
            current_time = int(time.time())
            if (current_time - token_time > expiry_seconds) or (current_time < token_time - 5):
                return False

            # 5. Verify Cryptographic HMAC Signature
            payload = f"{task_id}:{tool_name}:{args_hash}:{timestamp_str}:{expiry_str}"
            expected_sig = hmac.new(SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
            return hmac.compare_digest(sig, expected_sig)
        except Exception:
            return False

class BaseTool:
    name: str = "base_tool"
    is_sensitive: bool = True

    def run(
        self,
        arguments: Dict[str, Any],
        execution_token: Optional[str] = None,
        task_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Enforces Invariant 3 & Invariant 4:
        Sensitive tools cannot be directly executed by the agent without a valid token matching
        the exact tool and arguments.
        """
        if self.is_sensitive:
            if not execution_token or not FlowGuardExecutionToken.verify(
                token=execution_token,
                expected_tool=self.name,
                expected_arguments=arguments,
                expected_task_id=task_id,
            ):
                raise SecurityViolationException(
                    f"Direct execution of sensitive tool '{self.name}' BLOCKED! "
                    "All sensitive tool calls must be authorized and routed through FlowGuard Reference Monitor with a valid execution token matching the exact operation and arguments."
                )
        return self._execute(arguments)

    def _execute(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError
