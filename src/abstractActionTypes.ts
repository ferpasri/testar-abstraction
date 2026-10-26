import type { ExecutionReference } from "./abstractModelTypes.js";
import type { Observation, RecordedExecution } from "./evidence-input.js";

export interface AvailableActionReference {
    source: string;
    run: string;
    observation: string;
    actionDescription: string;
    targetWidget: string | null;
}

export interface AbstractActionAvailability {
    reference: AvailableActionReference;
    scope: Observation["available_action_scope"];
    recordedExecutions: ExecutionReference[];
}

export interface AbstractActionExecution {
    reference: ExecutionReference;
    status: RecordedExecution["status"];
    relationship: "recorded" | "abstraction";
    recordedAvailableActions: AvailableActionReference[];
    diagnostic?: string;
}

export interface AbstractAction {
    id: string;
    sourceNode: string;
    actionType: string;
    comparison: unknown;
    availability: AbstractActionAvailability[];
    executions: AbstractActionExecution[];
    ambiguous: boolean;
}

export interface AbstractActionEvidence {
    actions: AbstractAction[];
    unmatchedAvailableActions: Array<{
        reference: AvailableActionReference;
        sourceNode: string;
        reason: string;
        recordedExecutions: ExecutionReference[];
    }>;
    unmatchedExecutions: Array<{
        reference: ExecutionReference;
        sourceNode: string | null;
        reason: string;
        possibleActionIds: string[];
        recordedAvailableActions: AvailableActionReference[];
    }>;
}
