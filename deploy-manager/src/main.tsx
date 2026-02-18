import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App/App'
import SiteList from './SiteList/SiteList'
import SiteDetail from './SiteDetail/SiteDetail'
import './index.css'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<Navigate to="/team" replace />} />
          <Route path="team" element={<SiteList />} />
          <Route path="team/:teamSlug" element={<SiteList />} />
          <Route path="team/:teamSlug/site/:siteId" element={<SiteDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
