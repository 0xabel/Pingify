// // todo: menubar ellipsis on overflow
import { Routes, Route } from 'react-router-dom';

import '../../styles/globals.scss';
import Dashboard from '../../pages/Dashboard';
import Sidebar from '../../components/sidebar/Sidebar';
import Tasks from '@/renderer/pages/Tasks';
import Settings from '@/renderer/pages/Settings';
export default function App() {
	return (
		<div className="flex bg-backgroud h-full ">
			<Sidebar />
			<div className="h-full w-full px-4">
				<Routes>
					<Route path="/" element={<Dashboard />} />
					<Route path="/tasks" element={<Tasks />} />
					<Route path="/settings" element={<Settings />} />
				</Routes>
			</div>
		</div>
	);
}
