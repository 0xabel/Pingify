import React, {
	createContext,
	useContext,
	useMemo,
	useState,
	ReactNode,
} from 'react';

interface SettingsType {
	name: string;
	timeout: number;
}

interface SettingsContextType {
	settings: SettingsType;
	setSettings: React.Dispatch<React.SetStateAction<SettingsType>>;
}

const initialSettings: SettingsType = {
	name: '',
	timeout: 0,
};

const SettingsContext = createContext<SettingsContextType | undefined>(
	undefined,
);

export const useSettingsContext = () => {
	const context = useContext(SettingsContext);
	if (!context) {
		throw new Error(
			'useSettingsContext must be used within a SettingsContextProvider',
		);
	}
	return context;
};

export const SettingsContextProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [settings, setSettings] = useState<SettingsType>(initialSettings);

	// You may include useEffect to synchronize the settings with IPC calls or any other data source

	const value = useMemo(
		() => ({ settings, setSettings }),
		[settings, setSettings],
	);

	return (
		<SettingsContext.Provider value={value}>
			{children}
		</SettingsContext.Provider>
	);
};

export default SettingsContext;
