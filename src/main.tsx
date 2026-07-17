import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// A note for the kind of visitor who opens the console.
console.log(
  '%c❀ you found the compost layer',
  'color:#9ece9e;font-family:monospace;font-size:13px;',
  '\n\ncurious people are my favorite people.' +
    '\nthe terminal upstairs keeps a few secrets — help only tells you some of them.' +
    '\nsay hi: andrewdong1994@gmail.com\n'
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
