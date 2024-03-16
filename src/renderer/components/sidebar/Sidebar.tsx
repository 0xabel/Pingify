import React from 'react';
import Pingify from '../../images/Pingify.png';
import { BiSolidDashboard } from 'react-icons/bi';
import { GrTasks } from 'react-icons/gr';
import { Link } from 'react-router-dom';
import { useTheme } from '@/renderer/context/theme-context';
import { NavLink } from 'react-router-dom';
import { IoSettings } from 'react-icons/io5';
import { Slider } from '@/components/ui/slider';

export default function Sidebar() {
	const theme = useTheme();

	const handleMode = (mode: string) => {
		theme.setTheme(mode as 'light' | 'dark' | 'system');
		console.log('Current theme:', theme.theme);
	};

	return (
		<div className={`flex h-full flex-col w-30 gap-10 bg-lighterShade1`}>
			<div className="py-5 drag">
				<img src={Pingify} alt="Pingify" width={100} className="leading-4" />
			</div>
			<div className="flex items-center flex-col gap-10 ">
				<NavLink
					to="/"
					className={({ isActive, isPending }) =>
						isPending ? '' : isActive ? 'bg-primary no-underline rounded' : ''
					}
				>
					<div
						className={`rounded border-2 border-primary  px-2 py-1 flex items-center`}
					>
						<BiSolidDashboard size={25} color="white" />
					</div>
				</NavLink>

				<NavLink
					to="/tasks"
					className={({ isActive, isPending }) =>
						isPending ? '' : isActive ? 'bg-primary no-underline rounded' : ''
					}
				>
					<div className="rounded border-2 border-primary px-2 py-1 flex items-center">
						<GrTasks size={25} color="white" />
					</div>
				</NavLink>

				<NavLink
					to="/settings"
					className={({ isActive, isPending }) =>
						isPending ? '' : isActive ? 'bg-primary no-underline rounded' : ''
					}
				>
					<div className="rounded border-2 border-primary px-2 py-1 flex items-center">
						<IoSettings size={25} color="white" />
					</div>
				</NavLink>
			</div>
		</div>
	);
}
