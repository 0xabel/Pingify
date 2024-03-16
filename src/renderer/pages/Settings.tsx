'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useSettingsContext } from '../context/settings-context';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';

const formSchema = z.object({
	name: z.string().min(2, {
		message: 'Name must be atleast two characters',
	}),
	timeout: z
		.string()
		.transform((val) => parseInt(val))
		.refine((val) => val >= 1, {
			message: 'Timeout must be greater than or equal to 1',
		})
		.refine((val) => val <= 25000, {
			message: 'Timeout must be less than or equal to 25000',
		}),
});

export default function Settings() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: '',
			timeout: 0,
		},
	});
	const settings = useSettingsContext();
	useEffect(() => {
		window.electron.ipcRenderer.invoke('get-app-settings').then((data: any) => {
			settings.setSettings(data);
		});
	}, []);

	useEffect(() => {
		form.setValue('name', settings.settings.name);
		form.setValue('timeout', settings.settings.timeout);
	}, [settings.settings.name, settings.settings.timeout]);

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		window.electron.setAppSettings(values);
	}
	return (
		<div>
			<div className="py-7 drag">
				<h1>Settings</h1>
			</div>
			<div className="flex flex-col justify-center">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem className="w-1/2">
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter your name" {...field} />
									</FormControl>
									<FormMessage className="text-red-500" />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="timeout"
							render={({ field }) => (
								<FormItem className="w-1/2">
									<FormLabel>Timeout</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="Enter timeout"
											{...field}
										/>
									</FormControl>
									<FormMessage className="text-red-500" />
								</FormItem>
							)}
						/>
						<Button type="submit" className="text-white">
							Save
						</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}
