import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/layout/Layout';

// Pages
import FeedPage from './pages/FeedPage';
import CatalogPage from './pages/CatalogPage';
import BookDetailPage from './pages/BookDetailPage';
import ClubsPage from './pages/ClubsPage';
import ClubRoomPage from './pages/ClubRoomPage';
import AuthorStudioPage from './pages/AuthorStudioPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<FeedPage />} />
              <Route path="books" element={<CatalogPage />} />
              <Route path="books/:id" element={<BookDetailPage />} />
              <Route path="clubs" element={<ClubsPage />} />
              <Route path="clubs/:roomId" element={<ClubRoomPage />} />
              <Route path="author-studio" element={<AuthorStudioPage />} />
              <Route path="profile/:username" element={<ProfilePage />} />
              <Route path="login" element={<AuthPage />} />
              <Route path="register" element={<AuthPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
