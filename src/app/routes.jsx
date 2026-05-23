import { Navigate, Route, Routes } from 'react-router-dom';
import { ContactDetailsRoute } from '@/features/contact-details/routes/ContactDetailsRoute.jsx';
import { NotFoundRoute } from './NotFoundRoute.jsx';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/contact/details/1" replace />} />
      <Route path="/contact/details/:contactId" element={<ContactDetailsRoute />} />
      <Route path="*" element={<NotFoundRoute />} />
    </Routes>
  );
}
