import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
    buildAbstractModel,
    parseAbstractionRules,
    previewAbstraction,
    runKey,
    type AnalysisSource,
    type EvidenceInput,
    type AbstractionPreview,
    type AbstractModel,
} from "../src/index.js";
import { canonical } from "../src/common.js";

type WireEvidence = {
    [K in keyof EvidenceInput]: Array<EvidenceInput[K] extends Map<string, infer V> ? V : never>;
};
interface Input {
    sources: Array<{ id: string; label: string; fingerprint: string; evidence: WireEvidence }>;
    selected_runs: Array<{ source: string; run: string }>;
}

function sources(input: Input): AnalysisSource[] {
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

function ordered<T>(values: T[]): T[] {
    return [...values].sort((a, b) => canonical(a).localeCompare(canonical(b), "en"));
}

function result(preview: AbstractionPreview, model: AbstractModel) {
    const members = new Map(model.nodes.map((node) => [node.id, ordered(node.members)]));
    return {
        groups: ordered(
            preview.groups.map((group) => ordered(group.members.map((member) => member.reference))),
        ),
        unmatched: ordered(preview.unmatched.map((item) => item.reference)),
        transitions: ordered(
            model.edges
                .filter((edge) => edge.kind === "execution")
                .map((edge) => ({
                    from: members.get(edge.source),
                    to: members.get(edge.target),
                    action_type: edge.actionType,
                    executions: ordered(edge.executions),
                })),
        ),
        observation_order_links: ordered(model.edges.flatMap((edge) => edge.orderLinks)),
        unlinked_executions: ordered(
            model.unlinkedExecutions.map((item) => ({
                reference: item.reference,
                status: item.status,
            })),
        ),
        widget_correspondences: ordered(
            preview.groups.flatMap((group) =>
                group.widgetCorrespondences.map((item) => ({
                    members: ordered(item.members),
                    ambiguous: item.ambiguous,
                })),
            ),
        ),
    };
}

const directory = fileURLToPath(new URL("../conformance/cases/", import.meta.url));
const cases = (await readdir(directory)).sort();
describe("shared abstraction conformance", () => {
    for (const name of cases) {
        it(name, async () => {
            const input = JSON.parse(
                await readFile(`${directory}/${name}/input.json`, "utf8"),
            ) as Input;
            const before = canonical(input);
            const evidence = sources(input);
            const rules = parseAbstractionRules(
                await readFile(`${directory}/${name}/rules.json`, "utf8"),
            );
            const preview = await previewAbstraction(
                evidence,
                rules,
                input.selected_runs.map((run) => runKey(run.source, run.run)),
            );
            const model = buildAbstractModel(preview, evidence);
            const expected = JSON.parse(
                await readFile(`${directory}/${name}/expected.json`, "utf8"),
            );
            expected.groups = ordered(expected.groups.map((group: unknown[]) => ordered(group)));
            for (const transition of expected.transitions) {
                transition.from = ordered(transition.from);
                transition.to = ordered(transition.to);
                transition.executions = ordered(transition.executions);
            }
            for (const correspondence of expected.widget_correspondences) {
                correspondence.members = ordered(correspondence.members);
            }
            for (const key of Object.keys(expected)) {
                expected[key] = ordered(expected[key]);
            }
            expect(result(preview, model)).toEqual(expected);
            expect(canonical(input)).toBe(before);
            const reversed = await previewAbstraction(
                [...evidence].reverse(),
                rules,
                input.selected_runs.map((run) => runKey(run.source, run.run)),
            );
            expect(result(reversed, buildAbstractModel(reversed, evidence))).toEqual(expected);
        });
    }
});
