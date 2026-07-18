import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import LoadingState from './components/common/LoadingState'

const HomePage = lazy(() => import('./pages/HomePage'))
const RoomsPage = lazy(() => import('./pages/RoomsPage'))
const CreateRoomPage = lazy(() => import('./pages/CreateRoomPage'))
const JoinRoomPage = lazy(() => import('./pages/JoinRoomPage'))
const RoomPage = lazy(() => import('./pages/RoomPage'))
const VideoChatPage = lazy(() => import('./pages/VideoChatPage'))
const ActivityPage = lazy(() => import('./pages/ActivityPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

export default function App() {
  return (
    <AppShell>
      <Suspense fallback={<LoadingState label="A preparar o Link&Live…" />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/create" element={<CreateRoomPage />} />
          <Route path="/rooms/join" element={<JoinRoomPage />} />
          <Route path="/rooms/:uuid" element={<RoomPage />} />
          <Route path="/video" element={<VideoChatPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  )
}
