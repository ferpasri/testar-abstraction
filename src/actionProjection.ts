import { canonical } from "./common.js";
import { referenceKey, type EvidenceIndex } from "./evidenceIndex.js";
import { projectFields } from "./fields.js";
import type { ActionRules, EvidenceReference, Field } from "./types.js";

export function projectAction(
    index: EvidenceIndex,
    observation: EvidenceReference,
    actionDescription: string,
    targetWidget: string | null,
    rules: ActionRules,
    parameters?: Record<string, unknown>,
): { actionType: string; comparison: unknown } {
    const action = index.actions.get(canonical([observation.source, actionDescription]))?.action;
    if (!action) {
        throw new Error("The original action description is unavailable.");
    }
    const operation = projectFields({ operation: action.action_type }, [
        {
            name: "operation",
            keys: ["operation"],
            transforms: rules.type,
        },
    ]).projection[0].reading.value;
    if (typeof operation !== "string" || operation.trim().length === 0) {
        throw new Error("The normalized action type must contain text.");
    }
    const description = projectSelected(action.properties, rules.description ?? []);
    let target: unknown[] = [];
    if (rules.target?.length) {
        const widget =
            targetWidget === null
                ? undefined
                : index.widgets.get(referenceKey({ ...observation, widget: targetWidget }))?.widget;
        if (!widget) {
            throw new Error("The bound target widget is unavailable for action comparison.");
        }
        target = projectSelected(widget.properties, rules.target);
    }
    const input = rules.parameters
        ? projectSelected(
              parameters ?? action.properties,
              parameters === undefined ? rules.parameters.available : rules.parameters.executed,
          )
        : [];
    return {
        actionType: operation,
        comparison: { operation, description, target, parameters: input },
    };
}

function projectSelected(properties: Record<string, unknown>, fields: Field[]): unknown[] {
    const projected = projectFields(properties, fields);
    if (fields.length && !projected.informative) {
        throw new Error("No captured values are available for the selected action fields.");
    }
    return projected.projection.sort((left, right) =>
        left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
    );
}
