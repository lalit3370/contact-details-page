import { useParams } from 'react-router-dom';
import { PageLayout } from '../layout/PageLayout.jsx';

export function ContactDetailsRoute() {
  const { contactId } = useParams();
  return <PageLayout contactId={contactId} />;
}
