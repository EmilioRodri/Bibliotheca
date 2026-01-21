import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// REMOVIDO: BrowserRouter, AuthProvider, etc.
// O App.jsx vai cuidar de tudo isso.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)