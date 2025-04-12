import { RouterProvider, createRouter } from '@tanstack/react-router';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import timezone from 'dayjs/plugin/timezone';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);

dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Tokyo');

// biome-ignore lint/style/noNonNullAssertion:
const rootElement = document.getElementById('app')!;
const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
);
