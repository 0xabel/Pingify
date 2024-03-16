import React, {
	createContext,
	useContext,
	useMemo,
	useState,
	ReactNode,
} from 'react';

interface ProxyType {
	ping: number | null;
	status: 'pending' | 'testing' | 'success' | 'failed' | 'timeout';
	proxy: string;
	id: string;
}

interface DataType {
	proxies: ProxyType[];
}

interface DataContextType {
	data: DataType;
	setData: React.Dispatch<React.SetStateAction<DataType>>;
}

const initialData: DataType = {
	proxies: [],
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useDataContext = () => {
	const context = useContext(DataContext);
	if (!context) {
		throw new Error('useDataContext must be used within a DataContextProvider');
	}
	return context;
};

export const DataContextProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [data, setData] = useState<DataType>(initialData);

	// You may include useEffect to synchronize the data with IPC calls or any other data source

	const value = useMemo(() => ({ data, setData }), [data, setData]);

	return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;
