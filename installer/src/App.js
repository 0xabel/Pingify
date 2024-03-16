import React from 'react';

const App = () => {
	const downloadFile = (fileUrl, fileName) => {
		const link = document.createElement('a');
		link.href = fileUrl;
		link.download = fileName; // Make sure to include the file extension
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<div className="App">
			<h1>Welcome to My App</h1>
			<button onClick={() => downloadFile('hotplate-3.0.0.dmg', 'pingify.dmg')}>
				Download MacOS (Apple Chip)
			</button>
		</div>
	);
};

export default App;
