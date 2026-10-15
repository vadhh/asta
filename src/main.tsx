import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/baloo-2/latin-500.css'
import '@fontsource/baloo-2/latin-600.css'
import '@fontsource/baloo-2/latin-700.css'
import '@fontsource/baloo-2/latin-800.css'
import './styles.css'
import App from './App'

// Text boxes size their font to fit on first layout, so measure with Baloo 2, not the fallback.
// Wait for the font (max 3 s on a slow network) before the first render.
const fonts = Promise.all(['500', '600', '700', '800'].map((w) => document.fonts.load(`${w} 40px "Baloo 2"`)))
const timeout = new Promise((r) => setTimeout(r, 3000))

Promise.race([fonts, timeout])
  .catch(() => {})
  .then(() =>
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
  )
