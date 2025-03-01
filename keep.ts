export const keepFunctions = (
	// biome-ignore lint/suspicious/noExplicitAny:
	...funcs: Array<(...args: any[]) => any>
) => {
	for (const _func of funcs) {
	}
};
