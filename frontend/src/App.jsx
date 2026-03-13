import { Routes, Route, Navigate } from 'react-router-dom'
import useUserStore from './store/userStore'
import useSocket from './hooks/useSocket'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import TeamFinderPage from './pages/TeamFinderPage'
import StudentProfilePage from './pages/StudentProfilePage'
import MarketplacePage from './pages/MarketplacePage'
import MarketplaceItemPage from './pages/MarketplaceItemPage'
import CreateListingPage from './pages/CreateListingPage'
import ProfilePage from './pages/ProfilePage'
import ConnectionsPage from './pages/ConnectionsPage'
import EventsPage from './pages/EventsPage'
import CreateEventPage from './pages/CreateEventPage'
import EventDetailPage from './pages/EventDetailPage'
import MessagesPage from './pages/MessagesPage'
import WorkspacePage from './pages/WorkspacePage'
import WorkspaceDetailPage from './pages/WorkspaceDetailPage'
import ResourcesPage from './pages/ResourcesPage'

function ProtectedRoute({ children }) {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  const hasHydrated = useUserStore((state) => state._hasHydrated)

  // Wait for Zustand persist to rehydrate from localStorage before deciding
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  // Establish persistent Socket.io connection for real-time notifications
  useSocket()

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/team-finder" element={<ProtectedRoute><TeamFinderPage /></ProtectedRoute>} />
      <Route path="/profile/:id" element={<ProtectedRoute><StudentProfilePage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/marketplace/create" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
      <Route path="/marketplace/:id" element={<ProtectedRoute><MarketplaceItemPage /></ProtectedRoute>} />
      <Route path="/marketplace" element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
      <Route path="/connections" element={<ProtectedRoute><ConnectionsPage /></ProtectedRoute>} />
      <Route path="/messages/:userId" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
      <Route path="/workspace/:id" element={<ProtectedRoute><WorkspaceDetailPage /></ProtectedRoute>} />
      <Route path="/workspace" element={<ProtectedRoute><WorkspacePage /></ProtectedRoute>} />
      <Route path="/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
      <Route path="/events/create" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
      <Route path="/events/:id" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
