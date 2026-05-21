import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { LayoutOverrideContext } from '../layout/LayoutOverrideContext.jsx';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.json();
}

export function useContacts() {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: () => fetchJson('/api/contacts'),
  });
}

export function useContact(contactId) {
  return useQuery({
    queryKey: ['contact', contactId],
    queryFn: () => fetchJson(`/api/contacts/${contactId}`),
    enabled: Boolean(contactId),
  });
}

export function useFields() {
  const { override } = useContext(LayoutOverrideContext);
  const real = useQuery({
    queryKey: ['fields'],
    queryFn: () => fetchJson('/api/contact/fields'),
  });
  if (override?.fields) {
    return { ...real, data: override.fields, isLoading: false, isError: false, error: null };
  }
  return real;
}

export function useLayout() {
  const { override } = useContext(LayoutOverrideContext);
  const real = useQuery({
    queryKey: ['layout'],
    queryFn: () => fetchJson('/api/contact/layout'),
  });
  if (override?.layout) {
    return { ...real, data: override.layout, isLoading: false, isError: false, error: null };
  }
  return real;
}

export function useConversations(contactId) {
  return useQuery({
    queryKey: ['conversations', contactId],
    queryFn: () => fetchJson(`/api/contacts/${contactId}/conversations`),
    enabled: Boolean(contactId),
  });
}

export function useNotes(contactId) {
  return useQuery({
    queryKey: ['notes', contactId],
    queryFn: () => fetchJson(`/api/contacts/${contactId}/notes`),
    enabled: Boolean(contactId),
  });
}
