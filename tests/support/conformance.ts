import type { AnalysisSource, EvidenceInput } from "../../src/index.js";
import { canonical } from "../../src/common.js";

type WireEvidence = {
    [K in keyof EvidenceInput]: Array<EvidenceInput[K] extends Map<string, infer V> ? V : never>;
};
export interface ConformanceInput {
    sources: Array<{ id: string; label: string; fingerprint: string; evidence: WireEvidence }>;
    selected_runs: Array<{ source: string; run: string }>;
}

export function conformanceSources(input: ConformanceInput): AnalysisSource[] {
    return input.sources.map((source) => ({
        ...source,
        evidence: {
            runs: new Map(source.evidence.runs.map((item) => [item.id, item])),
            sequences: new Map(source.evidence.sequences.map((item) => [item.id, item])),
            observations: new Map(source.evidence.observations.map((item) => [item.id, item])),
            actions: new Map(source.evidence.actions.map((item) => [item.id, item])),
            executions: new Map(
                source.evidence.executions.map((item) => [item.execution.id, item]),
            ),
        },
    }));
}

export function ordered<T>(values: T[]): T[] {
    return [...values].sort((a, b) => canonical(a).localeCompare(canonical(b), "en"));
}
