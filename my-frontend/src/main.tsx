import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './css/index.css'
import App from './App'
import './css/App.css'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="399778715347-5qmr901ulefh93194ol123ekgdcilrn4.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
  </StrictMode>,
)
