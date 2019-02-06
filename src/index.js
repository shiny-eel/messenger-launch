import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.tsx';
import registerServiceWorker from './registerServiceWorker.ts';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
