export interface Widget {
    id: string;
    parent: string | null;
    properties: Record<string, unknown>;
}

export interface RecordedState {
    id: string;
    properties: Record<string, unknown>;
    widgets: Widget[];
    capture: "complete" | "filtered" | "unavailable";
}

export interface Observation {
    id: string;
    test_sequence: string;
    observation_index: number | bigint;
    timestamp_micros: number | bigint;
    recorded_state: RecordedState;
    available_action_scope: "generated" | "eligible" | "unknown";
    available_actions: Array<{ action_description: string; target_widget: string | null }>;
    artifacts: Array<{
        id: string;
        path: string;
        media_type: string;
        sha256: string;
        width?: number | bigint | null;
        height?: number | bigint | null;
    }>;
}

export interface RecordedRun {
    id: string;
    producer: string;
    source_run: string;
    properties: Record<string, unknown>;
    status: "running" | "finished";
    reason: string | null;
}

export interface RecordedSequence {
    id: string;
    test_run: string;
    sequence_index: number | bigint;
    source_sequence: string;
    properties: Record<string, unknown>;
    status: "running" | "finished";
    reason: string | null;
}

export interface ActionDescription {
    id: string;
    action_type: string;
    properties: Record<string, unknown>;
}

export interface RecordedExecution {
    execution: {
        id: string;
        test_sequence: string;
        source_observation: string;
        action_description: string;
        target_widget: string | null;
        parameters: Record<string, unknown>;
    };
    status:
        | "awaiting_execution_result"
        | "awaiting_resulting_observation"
        | "failed"
        | "completed"
        | "incomplete";
    executionResult: {
        action_execution: string;
        outcome: "returned" | "error";
        error: string | null;
    } | null;
    resultingObservation: string | null;
}

/** Records already reconstructed and validated by the caller's evidence reader. */
export interface EvidenceInput {
    runs: Map<string, RecordedRun>;
    sequences: Map<string, RecordedSequence>;
    observations: Map<string, Observation>;
    actions: Map<string, ActionDescription>;
    executions: Map<string, RecordedExecution>;
}

export function testRunForSequence(evidence: EvidenceInput, sequence: string): string {
    const record = evidence.sequences.get(sequence);
    if (!record) {
        throw new Error("Unknown test sequence.");
    }
    return record.test_run;
}

export function compareIndex(left: number | bigint, right: number | bigint): number {
    return left < right ? -1 : left > right ? 1 : 0;
}
