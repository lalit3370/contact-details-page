import { http, HttpResponse, delay } from 'msw';
import { apiUrl } from '@/shared/utils.js';

import layoutData from './data/layout.json';
import fieldsData from './data/contactFields.json';
import ownersData from './data/owners.json';
import contact1 from './data/contacts/1.json';
import contact2 from './data/contacts/2.json';
import conversations1 from './data/conversations/1.json';
import conversations2 from './data/conversations/2.json';
import notes1 from './data/notes/1.json';
import notes2 from './data/notes/2.json';

const CONTACTS = {
  1: contact1,
  2: contact2,
};
const CONVERSATIONS = {
  1: conversations1,
  2: conversations2,
};
const NOTES = {
  1: notes1,
  2: notes2,
};

const latency = () => delay(Math.floor(200 + Math.random() * 200));

function isSimulatedError(url) {
  return new URL(url).searchParams.get('simulate') === 'error';
}

function maybeError(request) {
  return isSimulatedError(request.url)
    ? HttpResponse.json({ error: 'Simulated server error' }, { status: 500 })
    : null;
}

export const handlers = [
  http.get(apiUrl('/contacts'), async ({ request }) => {
    await latency();
    const err = maybeError(request);
    if (err) return err;
    return HttpResponse.json({
      contacts: Object.values(CONTACTS).map((c) => ({
        id: c.id,
        displayName: c.header.displayName,
        avatarUrl: c.header.avatarUrl,
      })),
    });
  }),

  http.get(apiUrl('/contacts/:id'), async ({ params, request }) => {
    await latency();
    const err = maybeError(request);
    if (err) return err;
    const contact = CONTACTS[params.id];
    if (!contact) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json(contact);
  }),

  http.get(apiUrl('/contact/fields'), async ({ request }) => {
    await latency();
    const err = maybeError(request);
    if (err) return err;
    return HttpResponse.json(fieldsData);
  }),

  http.get(apiUrl('/contact/layout'), async ({ request }) => {
    await latency();
    const err = maybeError(request);
    if (err) return err;
    return HttpResponse.json(layoutData);
  }),

  http.get(apiUrl('/owners'), async ({ request }) => {
    await latency();
    const err = maybeError(request);
    if (err) return err;
    return HttpResponse.json(ownersData);
  }),

  http.get(apiUrl('/contacts/:id/conversations'), async ({ params, request }) => {
    await latency();
    const err = maybeError(request);
    if (err) return err;
    const data = CONVERSATIONS[params.id];
    return HttpResponse.json(data ?? { threads: [] });
  }),

  http.get(apiUrl('/contacts/:id/notes'), async ({ params, request }) => {
    await latency();
    const err = maybeError(request);
    if (err) return err;
    const data = NOTES[params.id];
    return HttpResponse.json(data ?? { notes: [] });
  }),
];
