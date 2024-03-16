import React, { useEffect, useMemo, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import CountUp from 'react-countup';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
	useFormField,
} from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CellContext, Row } from '@tanstack/react-table';
import { set, useForm } from 'react-hook-form';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import {
	Table,
	TableHeader,
	TableBody,
	TableFooter,
	TableHead,
	TableRow,
	TableCell,
	TableCaption,
} from '@/components/ui/table';
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { Play, Trash2, Pause } from 'lucide-react';

import { simpleUUID } from '@/utils/getUUID';
import { Checkbox } from '@/components/ui/checkbox';
import { useDataContext } from '../context/data-context';

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

const formSchema = zod.object({
	proxies: zod.string().refine(
		(value) => {
			// Split proxies by line breaks
			const proxyList = value.split('\n');

			// Validate each proxy in the list
			const isValid = proxyList.every((proxy) =>
				validateIpAndPort(proxy.trim()),
			);

			return isValid;
		},
		{ message: 'Invalid proxy format' },
	),
	url: zod.string(),
});

const validateIpAndPort = (input: string): boolean => {
	const [ip, port] = input.split(':');
	const ipSegments: string[] = ip.split('.');
	return (
		validateNum(port, 1, 65535) &&
		ipSegments.length === 4 &&
		ipSegments.every((segment) => validateNum(segment, 0, 255))
	);
};

const validateNum = (input: string, min: number, max: number): boolean => {
	const num: number = +input;
	return num >= min && num <= max && input === num.toString();
};

export default function Tasks() {
	const { data, setData } = useDataContext();
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});
	const [tasks, setTasks] = React.useState<any[]>([]);
	const tableContainerRef = React.useRef<HTMLDivElement>(null);

	const form = useForm<zod.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			proxies: '',
			url: '',
		},
	});

	useEffect(() => {
		window.electron.ipcRenderer.invoke('get-app-data').then((data) => {
			console.log('Data:', data);
			setData({
				proxies: data.proxies,
			});
		});
	}, []);

	const stopTask = (id: string) => {
		// Set the status of the proxy to testing
		const updatedProxies = data.proxies.map((proxy: any) => {
			if (proxy.id === id) {
				return {
					...proxy,
					status: 'pending',
					ping: 0,
				};
			}
			return proxy;
		});

		setData({ proxies: updatedProxies });

		// Send the data to the main process

		window.electron.ipcRenderer.send('set-app-data', {
			proxies: updatedProxies,
		});

		// Remove the task from the tasks array

		const filteredTasks = tasks.filter((task) => task.id !== id);

		setTasks(filteredTasks);
	};
	// Update the startTask function to return a promise
	const startTask = async (id: string) => {
		const proxy = data.proxies.find((proxy) => proxy.id === id);

		setTasks([proxy]);

		// Set the status of the proxy to testing
		const updatedStatus = data.proxies.map((proxy: any) => {
			if (proxy.id === id) {
				return {
					...proxy,
					status: 'testing',
				};
			}
			return proxy;
		});

		setData({ proxies: updatedStatus });

		try {
			const result = await window.electron.getProxyPing(id);
			const updatedProxies = data.proxies.map((proxy) => {
				if (proxy.id === id) {
					proxy.ping = result.ping;
					proxy.status = result.status;
				}
				return proxy;
			});

			setData({ proxies: updatedProxies });

			const removedTasks = tasks.filter((task) => {
				return task.id !== id;
			});

			setTasks(removedTasks);
			return { id, success: true };
		} catch (error) {
			console.log('Error while starting task:', error);
			return { id, success: false };
		}
	};
	const columns: ColumnDef<{}, any>[] = [
		{
			id: 'select',
			header: ({ table }) => (
				<Checkbox
					checked={table.getIsAllPageRowsSelected()}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Select all"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
				/>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'id',
			header: 'ID',
			accessorKey: 'id',
			cell: ({ row }) => <div>{row.getValue('id')}</div>,
		},
		{
			id: 'proxy',
			accessorKey: 'proxy',
			header: 'Proxy',
			cell: ({ row }) => {
				const [ip, port] = (row.getValue('proxy') as string).split(':');
				const [username, password] = (row.getValue('proxy') as string)
					.split(':')
					.slice(2);
				return (
					<HoverCard>
						<HoverCardTrigger asChild>
							<div className="flex cursor-pointer">
								<span>{ip}</span>:<span>{port}</span>
							</div>
						</HoverCardTrigger>
						<HoverCardContent className="w-80 bg-white">
							<div>
								<div>
									<span>IP: {ip}</span>
								</div>
								<div>
									<span>Port: {port}</span>
								</div>
								<div>
									<span>Username: {username}</span>
								</div>
								<div>
									<span>Password: {password}</span>
								</div>
							</div>
						</HoverCardContent>
					</HoverCard>
				);
			},
		},
		{
			id: 'url',
			accessorKey: 'url',
			header: 'URL',
			cell: ({ row }) => <span>{row.getValue('url')}</span>,
		},
		{
			id: 'status',
			accessorKey: 'status',
			header: 'Status',
			cell: ({ row }) => {
				const status: string = row.getValue('status');

				const colors: any = {
					success: 'text-primary',
					failed: 'text-red-500',
					timeout: 'text-purple-500',
					pending: 'text-gray-500',
					testing: 'text-yellow-500',
				};

				return (
					<HoverCard>
						<HoverCardTrigger asChild>
							<span className={colors[status]}>{status as string}</span>
						</HoverCardTrigger>
						<HoverCardContent className="w-50 bg-white">
							<div>
								<div>Status : {(status as string).toUpperCase()}</div>
							</div>
						</HoverCardContent>
					</HoverCard>
				);
			},
		},
		{
			id: 'ping',
			header: 'Ping',
			accessorKey: 'ping',
			cell: ({ row }) => {
				const ping = Number(row.getValue('ping'));
				const id = row.getValue('id');

				const taskExists = tasks.find((task) => task.id === id);
				if (taskExists) {
					return <CountUp end={ping} duration={2} />;
				} else {
					return <span>{ping}</span>;
				}
			},
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => (
				<div>
					<div className="flex gap-2">
						{row.getValue('status') === 'testing' ? (
							<Pause
								size={22}
								className="cursor-pointer text-primary"
								onClick={() => stopTask(row.getValue('id'))}
							/>
						) : (
							<Play
								size={22}
								className="cursor-pointer text-primary"
								onClick={() => startTask(row.getValue('id'))}
							/>
						)}
						<Trash2
							size={22}
							className="cursor-pointer text-red-500"
							onClick={() => handleDeleteRow(row.getValue('id'))}
						/>
					</div>
				</div>
			),
		},
	];

	const table = useReactTable({
		data: data.proxies,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
	});

	const handleSubmit = (values: zod.infer<typeof formSchema>) => {
		// Extract proxies from the form input
		const proxyList = values.proxies.split('\n');

		// Create new proxies with unique IDs and other properties
		const newProxies = proxyList.map((proxy) => ({
			id: simpleUUID(),
			proxy,
			status: 'pending' as 'pending',
			ping: null,
			url: values.url,
		}));

		// Update state with the new proxies
		setData({
			proxies: [...data.proxies, ...newProxies],
		});

		// Send the new proxies to the main process
		window.electron.ipcRenderer.send('set-app-data', {
			proxies: [...data.proxies, ...newProxies],
		});
	};

	const handleDeleteRow = (id: string) => {
		console.log('Deleting row:', id);

		// Remove row from the data
		const filteredProxies = data.proxies.filter(
			(proxy: any) => proxy.id !== id,
		);

		setData({ proxies: filteredProxies });

		// Send the data to the main process

		window.electron.ipcRenderer.send('delete-task', id);

		table.toggleAllPageRowsSelected(false);
	};

	const selectedRowIds: any = useMemo(() => {
		return table
			.getSelectedRowModel()
			.rows.map((row: Row<any>) => row.getValue('id'));
	}, [table.getSelectedRowModel().rows]);

	const handleDeleteSelectedRows = () => {
		console.log('Deleting selected rows:', selectedRowIds);

		window.electron.ipcRenderer.send('delete-selected-tasks', selectedRowIds);

		const filteredData = data.proxies.filter(
			(proxy: any) => !selectedRowIds.includes(proxy.id),
		);

		setData({ proxies: filteredData });

		table.toggleAllPageRowsSelected(false);
	};
	const startSelectedTasks = async () => {
		// Map selected row IDs to startTask promises
		const updatedStatus = data.proxies.map((p: any) => {
			if (selectedRowIds.includes(p.id)) {
				return {
					...p,
					status: 'testing',
				};
			}

			return p;
		});
		setData({ proxies: updatedStatus });

		try {
			const results = await window.electron.startSelectedTasks(selectedRowIds);
			console.log(results);
			const updatedTableData = data.proxies.map((p: any) => {
				const resultForProxy = results.find(
					(result: any) => result.id === p.id,
				);
				if (resultForProxy) {
					return {
						...p,
						ping: resultForProxy.ping,
						status: resultForProxy.status,
					};
				} else {
					return p; // No result found for this proxy, return it unchanged
				}
			});

			setData({ proxies: updatedTableData });
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div className=" h-full flex flex-col justify-items-center ">
			<div className="py-7 drag">
				<h1>Tasks</h1>
			</div>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(handleSubmit)}
					className="flex flex-col gap-2 items-center"
				>
					<FormField
						name="proxies"
						control={form.control}
						render={({ field }) => (
							<FormItem className="w-5/6">
								<Label>Enter your list of proxies here. One per line.</Label>
								<FormMessage className="text-red-500" />
								<FormControl>
									<Textarea
										{...field}
										placeholder="Example format:&#10;&#10;203.243.63.16:80&#10;3.24.58.156:3128&#10;95.217.104.21:24815&#10;95.217.104.21:24815"
										required
										className="h-40 resize-none"
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						name="url"
						control={form.control}
						render={({ field }) => (
							<FormItem className="w-4/6">
								<FormMessage className="bg-warning" />
								<FormControl>
									<Input
										{...field}
										placeholder="(url):https://google.com"
										required
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					<Button className="text-white">Create Tasks</Button>
				</form>
			</Form>
			<div className="w-full">
				<div className="flex py-4 justify-between">
					<Input
						placeholder="Filter proxies"
						value={(table.getColumn('proxy')?.getFilterValue() as string) ?? ''}
						onChange={(event) =>
							table.getColumn('proxy')?.setFilterValue(event.target.value)
						}
						className="max-w-sm"
					/>

					<div className="flex gap-2">
						<Button onClick={startSelectedTasks}>
							<Play size={22} className="cursor-pointer text-white" />
						</Button>
						<Button onClick={handleDeleteSelectedRows}>
							<Trash2 size={22} className="cursor-pointer text-red-500" />
						</Button>
					</div>
				</div>
				<div className="rounded-md border" ref={tableContainerRef}>
					<ScrollArea className="h-[310px]">
						<Table>
							<TableHeader>
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map((header) => {
											return (
												<TableHead key={header.id}>
													{header.isPlaceholder
														? null
														: flexRender(
																header.column.columnDef.header,
																header.getContext(),
															)}
												</TableHead>
											);
										})}
									</TableRow>
								))}
							</TableHeader>

							<TableBody>
								{table.getRowModel().rows?.length ? (
									table.getRowModel().rows.map((row) => (
										<TableRow
											key={row.id}
											data-state={row.getIsSelected() && 'selected'}
										>
											{row.getVisibleCells().map((cell) => (
												<TableCell key={cell.id}>
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext(),
													)}
												</TableCell>
											))}
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={columns.length}
											className="h-24 text-center"
										>
											No results.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</ScrollArea>
				</div>
				<div className="flex items-center justify-end space-x-2 py-4">
					<div className="flex-1 text-sm text-muted-foreground">
						{table.getFilteredSelectedRowModel().rows.length} of{' '}
						{table.getFilteredRowModel().rows.length} row(s) selected.
					</div>
				</div>
			</div>
		</div>
	);
}
