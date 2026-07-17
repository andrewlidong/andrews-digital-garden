import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// A note for the kind of visitor who opens the console.
console.log(
  '%cthis garden keeps secrets - help only tells you some of the commands in the terminal',
  'color:#9ece9e;font-family:monospace;font-size:12px;'
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
