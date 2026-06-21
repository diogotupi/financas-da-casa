import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SiteOffline } from './components/SiteOffline.tsx'
import { PasswordGate } from './components/PasswordGate.tsx'
import { SITE_OFFLINE } from './config/site.ts'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {SITE_OFFLINE ? (
      <SiteOffline />
    ) : (
      <PasswordGate>
        <App />
      </PasswordGate>
    )}
  </StrictMode>,
)
