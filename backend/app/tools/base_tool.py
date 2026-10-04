import hmac
import hashlib
import time
from typing import Dict, Any, Optional

SECRET_KEY = "FLOWGUARD_INTERNAL_SECRET_SIGNING_KEY_39148"

class SecurityViolationException(Exception):
    """Raised when an execution bypass of FlowGuard Reference Monitor is attempted."""
    pass

class FlowGuardExecutionToken:
    """
    Cryptographic execution authorization ticket issued strictly by the Reference Monitor.
    Sensitive tools refuse execution if this token is missing, expired, or invalid.
    """

    @classmethod
    def generate(cls, task_id: str, tool_name: str, arguments_hash: str) -> str:
        timestamp = str(int(time.time()))
        payload = f"{task_id}:{tool_name}:{arguments_hash}:{timestamp}"
        signature = hmac.new(SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
        return f"{payload}:{signature}"

    @classmethod
    def verify(cls, token: str, expected_tool: str) -> bool:
        if not token:
            return False
        try:
            parts = token.split(":")
            if len(parts) != 5:
                return False
            task_id, tool_name, args_hash, timestamp_str, sig = parts
            if tool_name != expected_tool:
                return False
            
            # Check expiration (valid for 60 seconds)
            token_time = int(timestamp_str)
            if abs(time.time() - token_time) > 60:
                return False

            payload = f"{task_id}:{tool_name}:{args_hash}:{timestamp_str}"
            expected_sig = hmac.new(SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
            return hmac.compare_digest(sig, expected_sig)
        except Exception:
            return False

class BaseTool:
    name: str = "base_tool"
    is_sensitive: bool = True

    def run(self, arguments: Dict[str, Any], execution_token: Optional[str] = None) -> Dict[str, Any]:
        """
        Enforce Invariant 3 & Invariant 4:
        Sensitive tools cannot be directly executed by the agent without a valid token.
        """
        if self.is_sensitive:
            if not execution_token or not FlowGuardExecutionToken.verify(execution_token, self.name):
                raise SecurityViolationException(
                    f"Direct execution of sensitive tool '{self.name}' BLOCKED! "
                    "All sensitive tool calls must be authorized and routed through FlowGuard Reference Monitor."
                )
        return self._execute(arguments)

    def _execute(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError
