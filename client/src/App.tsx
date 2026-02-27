import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { NameEntryPage } from './pages/NameEntryPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { KickedOutPage } from './pages/KickedOutPage';
import { UserProvider } from './context/UserContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <UserProvider>
        <SocketProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/name-entry" element={<NameEntryPage />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
              <Route path="/kicked-out" element={<KickedOutPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </SocketProvider>
      </UserProvider>
    </BrowserRouter>
  );
};

export default App;
