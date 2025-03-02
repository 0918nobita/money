export const getData = () =>
	new Promise<{ foo: number }>((resolve) => {
		google.script.run
			.withSuccessHandler((res) => {
				console.log(res);
				resolve(res);
			})
			.getData();
	});
