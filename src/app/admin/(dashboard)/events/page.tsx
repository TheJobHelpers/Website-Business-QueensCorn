import EventsManager from '@/components/admin/EventsManager';
import { requireAdminPage } from '@/server/auth/guard';
import { events } from '@/server/repositories';

// This page is rendered per request (it reads the session cookie), so "now" is the request time.
const requestTime = () => Date.now();

export default async function AdminEventsPage() {
  await requireAdminPage();
  return <EventsManager events={await events.list()} now={requestTime()} />;
}
