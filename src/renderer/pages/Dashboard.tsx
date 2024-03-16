import React, { useEffect, useState } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useDataContext } from '../context/data-context';
import { useSettingsContext } from '../context/settings-context';
Chart.register(...registerables);

interface ProxyData {
	timestamp: string; // Assuming timestamp is of type string
	ping: number; // Assuming ping is of type number
}

const Dashboard: React.FC = () => {
	const [lineGraphData, setLineGraphData] = useState<any>({
		labels: [],
		datasets: [
			{
				label: 'Ping',
				data: [],
				fill: false,
				borderColor: 'rgb(75, 192, 192)',
				tension: 0.1,
			},
		],
	});

	const settings = useSettingsContext();

	const [statistics, setStatistics] = useState<{
		totalTasks: number;
		successfulTasks: number;
		failedTasks: number;
	}>({
		totalTasks: 0,
		successfulTasks: 0,
		failedTasks: 0,
	});

	const [pieChartData, setPieChartData] = useState<any>({
		labels: [],
		datasets: [
			{
				data: [],
				backgroundColor: [
					'rgba(255, 99, 132, 0.2)',
					'rgba(54, 162, 235, 0.2)',
					'rgba(255, 206, 86, 0.2)',
					'rgba(75, 192, 192, 0.2)',
					'rgba(153, 102, 255, 0.2)',
					'rgba(255, 159, 64, 0.2)',
				],
				borderColor: [
					'rgba(255, 99, 132, 1)',
					'rgba(54, 162, 235, 1)',
					'rgba(255, 206, 86, 1)',
					'rgba(75, 192, 192, 1)',
					'rgba(153, 102, 255, 1)',
					'rgba(255, 159, 64, 1)',
				],
				borderWidth: 1,
			},
		],
	});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const result: any = await window.electron.getAppData();
				// Assuming result contains your data
				if (result && result.proxies && result.proxies.length > 0) {
					const proxyData: ProxyData[] = result.proxies;

					// Calculate statistics
					const totalTasks = proxyData.length;
					const successfulTasks = proxyData.filter(
						(proxy: any) => proxy.status === 'success',
					).length;
					const failedTasks = proxyData.filter(
						(proxy: any) => proxy.status === 'failed',
					).length;

					setStatistics({ totalTasks, successfulTasks, failedTasks });

					// Count occurrences of each site
					const siteCounts: { [url: string]: number } = {};
					proxyData.forEach((proxy: any) => {
						siteCounts[proxy.url] = (siteCounts[proxy.url] || 0) + 1;
					});

					// Extract site names and counts
					const siteNames = Object.keys(siteCounts);
					const siteCountValues = Object.values(siteCounts);

					// Format data for pie chart
					const formattedDataPie = {
						labels: siteNames,
						datasets: [
							{
								data: siteCountValues,
								backgroundColor: [
									'rgba(255, 99, 132, 0.2)',
									'rgba(54, 162, 235, 0.2)',
									'rgba(255, 206, 86, 0.2)',
									'rgba(75, 192, 192, 0.2)',
									'rgba(153, 102, 255, 0.2)',
									'rgba(255, 159, 64, 0.2)',
								].slice(0, siteNames.length), // Limiting colors to the number of sites
							},
						],
					};

					setPieChartData(formattedDataPie);

					const formattedData = {
						labels: proxyData.map((proxy: any) => proxy.proxy.split(':')[0]),
						datasets: [
							{
								label: 'Ping Response Time',
								data: proxyData.map((proxy) => proxy.ping), // Assuming ping is the y-axis data
								fill: false,
								borderColor: 'rgb(75, 192, 192)',
								tension: 0.1,
							},
						],
					};

					setLineGraphData(formattedData);
				}
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};

		fetchData();
	}, []);

	return (
		<div>
			<div className="py-7 flex justify-between drag">
				<div>
					<h1>Dashboard</h1>
				</div>
				<div>
					<h1>Hello {settings.settings.name}</h1>
				</div>
			</div>
			<div>
				<div className="flex gap-2 text-white my-5">
					<div className="bg-primary w-1/2 h-40 flex justify-center items-center rounded">
						<span> Total Tasks: {statistics.totalTasks}</span>
					</div>
					<div className="bg-green w-1/2 h-40 flex justify-center items-center rounded">
						<span> Successful Tasks: {statistics.successfulTasks}</span>
					</div>
					<div className="bg-red-500 w-1/2 h-40 flex justify-center items-center rounded">
						<span> Failed Tasks: {statistics.failedTasks}</span>
					</div>
				</div>
			</div>
			<div className="flex  item-center">
				<div className="w-5/6 rounder px-10 py-10 b">
					<Line data={lineGraphData} />
				</div>
				<div className="w-1/2 h-100">
					<Pie data={pieChartData} />
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
