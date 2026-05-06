import React from 'react';
import { HashRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { RecordAttempt } from './pages/RecordAttempt';
import { Reflection } from './pages/Reflection';
import { Garden } from './pages/Garden';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="record" element={<RecordAttempt />} />
            <Route path="reflection" element={<Reflection />} />
            <Route path="garden" element={<Garden />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
