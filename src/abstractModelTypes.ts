import type { AbstractActionEvidence } from "./abstractActionTypes.js";
import type { RecordedExecution } from "./evidence-input.js";
import type { EvidenceReference } from "./types.js";

export interface ExecutionReference {
    source: string;
    run: string;
    execution: string;
}

export interface AbstractModelNode {
    id: string;
    label: string;
    groupId?: string;
    members: EvidenceReference[];
    unmatchedReason?: string;
}

export interface AbstractModelOrderLink {
    source: EvidenceReference;
    target: EvidenceReference;
}

export interface AbstractModelEdge {
    id: string;
    kind: "execution" | "observation_order";
    source: string;
    target: string;
    label: string;
    actionType?: string;
    abstractAction?: string;
    executions: ExecutionReference[];
    orderLinks: AbstractModelOrderLink[];
}

export interface UnlinkedExecution {
    reference: ExecutionReference;
    sourceNode: string | null;
    reason: string;
    status: RecordedExecution["status"];
}

export interface AbstractModel {
    actionEvidence?: AbstractActionEvidence;
    nodes: AbstractModelNode[];
    edges: AbstractModelEdge[];
    unlinkedExecutions: UnlinkedExecution[];
    counts: {
        matchedNodes: number;
        unmatchedNodes: number;
        observations: number;
        executionEdges: number;
        completedExecutions: number;
        unlinkedExecutions: number;
        orderEdges: number;
        orderLinks: number;
    };
}
