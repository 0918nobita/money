interface IRun {
	// biome-ignore lint/suspicious/noExplicitAny:
	withSuccessHandler: (callback: (res: any) => void) => IRun;
	getData(): unknown;
}

declare namespace google {
	namespace script {
		const run: IRun;
	}
}
