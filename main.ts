import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import timezone from 'dayjs/plugin/timezone';
import { parse as parseToml } from 'smol-toml';
import { z } from 'zod';

dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(timezone);

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

async function main(): Promise<void> {
	const [toml2025_3, toml2025_4] = await Promise.all([
		import('./data/2025-03.toml?raw'),
		import('./data/2025-04.toml?raw'),
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

	const { currentBalance, balanceHistory } = [...transactionsPerDay.entries()]
		.map(([day, entry]) => [dayjs(day), entry] as const)
		.toSorted(([day1], [day2]) => (day1.isSameOrBefore(day2) ? -1 : 1))
		.reduce<{
			currentBalance: number;
			balanceHistory: Array<[number, number]>;
		}>(
			(acc, [day, diff]) => {
				const currentBalance = acc.currentBalance + diff;

				return {
					currentBalance,
					balanceHistory: [
						...acc.balanceHistory,
						[dayjs(day).toDate().getTime(), currentBalance],
					],
				};
			},
			{
				currentBalance: initialBalance,
				balanceHistory: [],
			},
		);

	const highcharts = await import('highcharts');

	await import('highcharts/modules/accessibility');

	dayjs.tz.setDefault('Asia/Tokyo');

	highcharts.setOptions({
		time: {
			timezone: 'Asia/Tokyo',
		},
	});

	highcharts.chart('container', {
		title: {
			text: '資産推移',
		},
		xAxis: {
			type: 'datetime',
			title: {
				text: '時間',
			},
			labels: {
				format: '{value:%Y-%m-%d}',
			},
		},
		yAxis: {
			title: {
				text: '金額',
			},
			labels: {
				format: '{value}円',
			},
			min: 0,
		},
		series: [
			{
				type: 'line',
				name: '資産',
				data: balanceHistory,
			},
		],
	});

	const pElement = document.createElement('p');

	const formatter = new Intl.NumberFormat('ja-JP');

	pElement.textContent = `現在の資産は ${formatter.format(currentBalance)} 円です`;

	document.body.appendChild(pElement);
}

void main();
