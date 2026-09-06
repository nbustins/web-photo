import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// antd 5 static message/notification/Modal are silent no-ops under React 19 without this patch.
import '@ant-design/v5-patch-for-react-19'
import './styles/base.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App/>
    </StrictMode>,
)
