import { createFileRoute } from '@tanstack/react-router';
import dayjs from 'dayjs';
import {
	CartesianGrid,
	Line,
	LineChart,
	Tooltip,
	XAxis,
	YAxis,
	type TooltipProps,
} from 'recharts';
import type {
	NameType,
	ValueType,
} from 'recharts/types/component/DefaultTooltipContent';
import { parse as parseToml } from 'smol-toml';
import { z } from 'zod';

const categorySchema = z.union([
	z.literal('家賃'),
	z.literal('保険'),
	z.literal('通信費'),
	z.literal('食費'),
	z.literal('日用品費'),
	z.literal('交通費'),
	z.literal('医療費'),
	z.literal('娯楽費'),
	z.literal('教育費'),
	z.literal('家電'),
	z.literal('手数料'),
	z.literal('給与'),
	z.literal('売却'),
	z.literal('利子'),
	z.literal('ポイント交換'),
]);

const expenseSchema = z
	.object({
		desc: z.string().optional(),
		amount: z.number().int().min(0),
		at: z.date(),
		deffered: z.date().optional(),
		cat: categorySchema,
	})
	.strict()
	.readonly();

const incomeSchema = z
	.object({
		desc: z.string().optional(),
		amount: z.number().int().min(0),
		at: z.date(),
		cat: categorySchema,
	})
	.strict()
	.readonly();

const transactionsSchema = z
	.object({
		expenses: z.array(expenseSchema).readonly(),
		income: z.array(incomeSchema).readonly(),
	})
	.strict()
	.readonly();

export const Route = createFileRoute('/')({
	loader: async () => {
		const [toml2025_3, toml2025_4] = await Promise.all([
			import('../../data/2025-03.toml?raw'),
			import('../../data/2025-04.toml?raw'),
		]);

		const tomlPerMonth = [
			['2025-03', toml2025_3.default],
			['2025-04', toml2025_4.default],
		];

		const transactionsPerMonth = tomlPerMonth.flatMap(([month, tomlText]) => {
			const tomlContent = parseToml(tomlText);

			const result = transactionsSchema.safeParse(tomlContent);

			if (!result.success) {
				console.error('Failed to parse, skipping:', month);
				console.error(result.error);
				return [];
			}

			return [result.data];
		});

		const expenses = transactionsPerMonth.flatMap((transactions) =>
			transactions.expenses.map((expense) => ({
				type: 'expense' as const,
				...expense,
			})),
		);

		const income = transactionsPerMonth.flatMap((transactions) =>
			transactions.income.map((income) => ({
				type: 'income' as const,
				...income,
			})),
		);

		const transactionsPerDay = new Map<string, number>();

		for (const transaction of [...expenses, ...income]) {
			const day = dayjs(transaction.at).format('YYYY-MM-DD');

			const entry = transactionsPerDay.get(day);

			if (entry === undefined) {
				transactionsPerDay.set(
					day,
					transaction.type === 'expense'
						? -transaction.amount
						: transaction.amount,
				);
			} else {
				transactionsPerDay.set(
					day,
					transaction.type === 'expense'
						? entry - transaction.amount
						: entry + transaction.amount,
				);
			}
		}

		const initialBalance = 757_232;

		return [...transactionsPerDay.entries()]
			.map(([day, entry]) => [dayjs(day), entry] as const)
			.toSorted(([day1], [day2]) => (day1.isSameOrBefore(day2) ? -1 : 1))
			.reduce<{
				currentBalance: number;
				balanceHistory: Array<{ at: string; currentBalance: number }>;
			}>(
				(acc, [day, diff]) => {
					const currentBalance = acc.currentBalance + diff;

					return {
						currentBalance,
						balanceHistory: [
							...acc.balanceHistory,
							{ at: dayjs(day).toISOString(), currentBalance },
						],
					};
				},
				{
					currentBalance: initialBalance,
					balanceHistory: [],
				},
			);
	},
	component: RouteComponent,
});

const formatter = new Intl.NumberFormat('ja-JP');

function CustomTooltip(props: TooltipProps<ValueType, NameType>) {
	if (!props.active) return null;

	const {
		payload: { at, currentBalance },
		// biome-ignore lint/style/noNonNullAssertion:
	} = props.payload![0] as {
		payload: { at: string; currentBalance: number };
	};

	return (
		<p>
			{dayjs(at).format('MM/DD')}：{formatter.format(currentBalance)} 円
		</p>
	);
}

function RouteComponent() {
	const { currentBalance, balanceHistory } = Route.useLoaderData();

	return (
		<>
			<LineChart width={800} height={400} data={balanceHistory}>
				<Line type="monotone" dataKey="currentBalance" stroke="#8884d8" />
				<CartesianGrid stroke="#ccc" strokeDasharray="5 5" />

				<XAxis
					dataKey="at"
					tickFormatter={(value) => dayjs(value).format('MM/DD')}
				/>

				<YAxis />

				<Tooltip content={CustomTooltip} />
			</LineChart>

			<p>現在の総資産は {formatter.format(currentBalance)} 円です</p>
		</>
	);
}
