import { createRoot } from 'react-dom/client'
import { App } from './App'
import { MobileProvider } from './hooks/useIsMobile'
import './style.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <MobileProvider>
    <App />
  </MobileProvider>,
)
