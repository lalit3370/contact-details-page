import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProviders } from './AppProviders.jsx';
import { ContactDetailsRoute } from '@/features/contact-details/routes/ContactDetailsRoute.jsx';
import { NotFoundRoute } from './NotFoundRoute.jsx';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export function App() {
  return (
    <AppProviders>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<Navigate to="/contact/details/1" replace />} />
          <Route path="/contact/details/:contactId" element={<ContactDetailsRoute />} />
          <Route path="*" element={<NotFoundRoute />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}
