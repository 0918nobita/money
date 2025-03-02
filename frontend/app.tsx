import type React from 'react';
import { Suspense, use } from 'react';

import { getData } from './gas';

const DisplayData: React.FC<{ dataPromise: Promise<{ foo: number }> }> = ({
	dataPromise,
}) => {
	const data = use(dataPromise);

	return <div>Number: {data.foo}</div>;
};

export const App: React.FC = () => {
	return (
		<>
			<h1>
				Hello from <span className="text-sky-700">React</span>
			</h1>
			<Suspense fallback={<p>Loading...</p>}>
				<DisplayData dataPromise={getData()} />
			</Suspense>
		</>
	);
};
