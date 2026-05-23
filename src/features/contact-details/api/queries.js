import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { LayoutOverrideContext } from '../layout/LayoutOverrideContext.jsx';
import { apiUrl } from '@/shared/utils.js';
import { qk } from './queryKeys.js';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.json();
}

export function useContacts() {
  return useQuery({
    queryKey: qk.contacts,
    queryFn: () => fetchJson(apiUrl('/contacts')),
  });
}

export function useContact(contactId) {
  return useQuery({
    queryKey: qk.contact(contactId),
    queryFn: () => fetchJson(apiUrl(`/contacts/${contactId}`)),
    enabled: Boolean(contactId),
  });
}

export function useFields() {
  const { override } = useContext(LayoutOverrideContext);
  const real = useQuery({
    queryKey: qk.fields,
    queryFn: () => fetchJson(apiUrl('/contact/fields')),
  });
  if (override?.fields) {
    return { ...real, data: override.fields, isLoading: false, isError: false, error: null };
  }
  return real;
}

export function useLayout() {
  const { override } = useContext(LayoutOverrideContext);
  const real = useQuery({
    queryKey: qk.layout,
    queryFn: () => fetchJson(apiUrl('/contact/layout')),
  });
  if (override?.layout) {
    return { ...real, data: override.layout, isLoading: false, isError: false, error: null };
  }
  return real;
}

export function useOwners() {
  return useQuery({
    queryKey: qk.owners,
    queryFn: () => fetchJson(apiUrl('/owners')),
  });
}

export function useConversations(contactId) {
  return useQuery({
    queryKey: qk.conversations(contactId),
    queryFn: () => fetchJson(apiUrl(`/contacts/${contactId}/conversations`)),
    enabled: Boolean(contactId),
  });
}

export function useNotes(contactId) {
  return useQuery({
    queryKey: qk.notes(contactId),
    queryFn: () => fetchJson(apiUrl(`/contacts/${contactId}/notes`)),
    enabled: Boolean(contactId),
  });
}
