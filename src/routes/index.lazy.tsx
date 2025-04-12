import { createLazyFileRoute } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { lazy } from 'react';

export const Route = createLazyFileRoute('/')({
    component: RouteComponent,
});

const LineChart = lazy(() =>
    import('@mui/x-charts/LineChart').then((m) => ({ default: m.LineChart })),
);

function RouteComponent() {
    const { currentBalance, balanceHistory } = Route.useLoaderData();

    const formatter = new Intl.NumberFormat('ja-JP');

    return (
        <>
            <LineChart
                series={[
                    {
                        yAxisId: 'balance',
                        data: balanceHistory.map(
                            ({ currentBalance }) => currentBalance,
                        ),
                    },
                ]}
                xAxis={[
                    {
                        id: 'date',
                        data: balanceHistory.map(({ at }) =>
                            dayjs(at).toDate(),
                        ),
                        scaleType: 'band',
                        valueFormatter: (value) =>
                            (value as Date).toLocaleDateString(),
                    },
                ]}
                yAxis={[
                    {
                        id: 'balance',
                        valueFormatter: (value) =>
                            `${formatter.format(value as number)} 円`,
                        min: 0,
                    },
                ]}
                width={600}
                height={400}
                grid={{ horizontal: true, vertical: true }}
                viewBox={{ x: -50, y: 50, width: 650, height: 300 }}
                title="資産推移"
            />

            <p>現在の総資産は {formatter.format(currentBalance)} 円です</p>
        </>
    );
}
