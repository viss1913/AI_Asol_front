import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import { UserProvider } from './context/UserContext'
import { TaskProvider } from './context/TaskContext'
import { EditorProvider } from './context/EditorContext'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <UserProvider>
          <TaskProvider>
            <EditorProvider>
              <App />
            </EditorProvider>
          </TaskProvider>
        </UserProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
