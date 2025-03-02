import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';

import './style.css';

// biome-ignore lint/style/noNonNullAssertion:
ReactDOM.createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
