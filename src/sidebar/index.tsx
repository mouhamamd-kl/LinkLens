import React from 'react'
import ReactDOM from 'react-dom/client'
import SidebarApp from './SidebarApp'
import './styles.css'
import '../tokens.css'
import '../fonts.css'
import '../motion.css'

const container = document.getElementById('root')

if (container) {
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <SidebarApp />
    </React.StrictMode>
  )
}