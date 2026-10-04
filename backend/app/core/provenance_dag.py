from typing import List, Dict, Any, Optional, Set
from collections import defaultdict, deque
from app.core.provenance import ProvenanceNode, ProvenanceEdge, NodeType, EdgeRelation
from app.core.taint import TaintLabel

class ProvenanceDAG:
    """
    In-memory and persistent DAG manager for information-flow provenance tracking.
    Maintains causal parent-child relationships and detects untrusted lineage.
    """

    def __init__(self, task_id: str):
        self.task_id = task_id
        self.nodes: Dict[str, ProvenanceNode] = {}
        self.edges: List[ProvenanceEdge] = []
        self._adj_forward: Dict[str, List[str]] = defaultdict(list)
        self._adj_backward: Dict[str, List[str]] = defaultdict(list)

    def add_node(
        self,
        label: str,
        node_type: NodeType,
        source: str,
        trust_level: str,
        taint_labels: List[str],
        payload_snippet: str,
        node_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> ProvenanceNode:
        node = ProvenanceNode(
            id=node_id or f"prov-{len(self.nodes)+1:03d}",
            task_id=self.task_id,
            label=label,
            node_type=node_type,
            source=source,
            trust_level=trust_level,
            taint_labels=taint_labels,
            payload_snippet=payload_snippet[:200] if payload_snippet else "",
            metadata=metadata or {},
        )
        self.nodes[node.id] = node
        return node

    def add_edge(self, from_node: str, to_node: str, relation: EdgeRelation) -> ProvenanceEdge:
        edge = ProvenanceEdge(
            task_id=self.task_id,
            from_node=from_node,
            to_node=to_node,
            relation=relation,
        )
        self.edges.append(edge)
        self._adj_forward[from_node].append(to_node)
        self._adj_backward[to_node].append(from_node)
        return edge

    def get_ancestors(self, node_id: str) -> List[ProvenanceNode]:
        """Return all ancestor nodes leading into node_id."""
        visited: Set[str] = set()
        queue = deque([node_id])
        ancestors: List[ProvenanceNode] = []

        while queue:
            curr = queue.popleft()
            for parent_id in self._adj_backward.get(curr, []):
                if parent_id not in visited:
                    visited.add(parent_id)
                    queue.append(parent_id)
                    if parent_id in self.nodes:
                        ancestors.append(self.nodes[parent_id])
        return ancestors

    def get_descendants(self, node_id: str) -> List[ProvenanceNode]:
        """Return all descendant nodes derived from node_id."""
        visited: Set[str] = set()
        queue = deque([node_id])
        descendants: List[ProvenanceNode] = []

        while queue:
            curr = queue.popleft()
            for child_id in self._adj_forward.get(curr, []):
                if child_id not in visited:
                    visited.add(child_id)
                    queue.append(child_id)
                    if child_id in self.nodes:
                        descendants.append(self.nodes[child_id])
        return descendants

    def has_untrusted_ancestor(self, node_id: str) -> bool:
        """
        Check if this node or any ancestor carries UNTRUSTED taint.
        Rule: TRANSFORMATION CANNOT ERASE PROVENANCE.
        """
        curr_node = self.nodes.get(node_id)
        if curr_node and (
            curr_node.trust_level == "UNTRUSTED"
            or TaintLabel.UNTRUSTED.value in curr_node.taint_labels
            or TaintLabel.DERIVED_UNTRUSTED.value in curr_node.taint_labels
        ):
            return True

        for ancestor in self.get_ancestors(node_id):
            if (
                ancestor.trust_level == "UNTRUSTED"
                or TaintLabel.UNTRUSTED.value in ancestor.taint_labels
                or TaintLabel.DERIVED_UNTRUSTED.value in ancestor.taint_labels
            ):
                return True
        return False

    def to_graph_data(self) -> Dict[str, Any]:
        """Format suitable for frontend visualization."""
        nodes_list = []
        for n in self.nodes.values():
            parents = self._adj_backward.get(n.id, [])
            children = self._adj_forward.get(n.id, [])
            nodes_list.append({
                "id": n.id,
                "label": n.label,
                "type": n.node_type.value,
                "source": n.source,
                "trustLevel": n.trust_level,
                "taintLabels": n.taint_labels,
                "payloadSnippet": n.payload_snippet,
                "createdAt": n.created_at,
                "metadata": n.metadata,
                "parentIds": parents,
                "childIds": children,
            })

        edges_list = [
            {
                "id": e.id,
                "source": e.from_node,
                "target": e.to_node,
                "relation": e.relation.value,
                "label": e.relation.value.replace("_", " "),
            }
            for e in self.edges
        ]

        return {
            "taskId": self.task_id,
            "nodes": nodes_list,
            "edges": edges_list,
        }

# Global registry of active DAGs per task
_DAG_REGISTRY: Dict[str, ProvenanceDAG] = {}

def get_or_create_dag(task_id: str) -> ProvenanceDAG:
    if task_id not in _DAG_REGISTRY:
        _DAG_REGISTRY[task_id] = ProvenanceDAG(task_id)
    return _DAG_REGISTRY[task_id]
