export class AbstractionError extends Error {}
function requireAbstraction(condition: unknown, message: string): asserts condition {
    if (!condition) {
        throw new AbstractionError(message);
    }
}
export function canonical(value: unknown): string {
    if (typeof value === "bigint") {
        return value.toString();
    }
    if (Array.isArray(value)) {
        return "[" + value.map(canonical).join(",") + "]";
    }
    if (value !== null && typeof value === "object") {
        const record = value as Record<string, unknown>;
        return (
            "{" +
            Object.keys(record)
                .sort()
                .map((key) => JSON.stringify(key) + ":" + canonical(record[key]))
                .join(",") +
            "}"
        );
    }
    return JSON.stringify(value);
}
export function parseJson(text: string): unknown {
    let value: unknown;
    try {
        value = JSON.parse(text, (_key: string, item: unknown, context?: { source?: string }) => {
            if (typeof item === "number" && Number.isInteger(item) && !Number.isSafeInteger(item)) {
                requireAbstraction(
                    context?.source,
                    "This browser cannot preserve large JSON integers.",
                );
                if (/^-?\d+$/u.test(context.source)) {
                    return BigInt(context.source);
                }
            }
            return item;
        });
    } catch (error) {
        if (error instanceof AbstractionError) {
            throw error;
        }
        throw new AbstractionError("Invalid JSON.");
    }
    const pending = [{ value, depth: 0 }];
    while (pending.length > 0) {
        const item = pending.pop()!;
        requireAbstraction(item.depth <= 48, "JSON exceeds the nesting limit of 48.");
        if (item.value !== null && typeof item.value === "object") {
            for (const child of Object.values(item.value)) {
                pending.push({ value: child, depth: item.depth + 1 });
            }
        }
        if (typeof item.value === "number") {
            requireAbstraction(Number.isFinite(item.value), "JSON numbers must be finite.");
        }
    }
    return value;
}
export async function digest(bytes: BufferSource): Promise<string> {
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(hash), (value) => value.toString(16).padStart(2, "0")).join(
        "",
    );
}
