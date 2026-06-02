import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PasswordGate } from './components/PasswordGate.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PasswordGate>
      <App />
    </PasswordGate>
  </StrictMode>,
)
