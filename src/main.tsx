import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import Sidebar from './components/Sidebar.tsx'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './app/store.ts'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
    <Sidebar />
    <App />
    </Provider>
  </React.StrictMode>,
)
