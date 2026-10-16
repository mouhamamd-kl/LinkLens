import React from 'react'
import ReactDOM from 'react-dom/client'
import './locked.css'

function BlockedApp() {
    return <h1>Blocked by LinkLens</h1> // your UI here
}

const container = document.getElementById('root')
if (container) {
    ReactDOM.createRoot(container).render(
        <React.StrictMode><BlockedApp /></React.StrictMode>
    )
}