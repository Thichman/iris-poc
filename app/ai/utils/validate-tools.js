export function validateTool(tool) {
    if (!tool.schema) {
        throw new Error(`Tool "${tool.name}" is missing a schema.`);
    }
    if (!tool.func) {
        throw new Error(`Tool "${tool.name}" is missing a function implementation.`);
    }
}
