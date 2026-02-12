import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { UserProvider } from './context/UserContext'
import { TaskProvider } from './context/TaskContext'
import { EditorProvider } from './context/EditorContext'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <TaskProvider>
          <EditorProvider>
            <App />
          </EditorProvider>
        </TaskProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>,
)
