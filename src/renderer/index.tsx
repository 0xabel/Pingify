import App from '@/renderer/windows/main/App';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/renderer/context/theme-context';
import { DataContextProvider } from '@/renderer/context/data-context';
import { SettingsContextProvider } from './context/settings-context';
const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
	<MemoryRouter>
		<SettingsContextProvider>
			<DataContextProvider>
				<App />
			</DataContextProvider>
		</SettingsContextProvider>
	</MemoryRouter>,
);
