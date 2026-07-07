import { useState } from 'react';
import { Alert, Link, Typography } from '@mui/material';
import { FilterableTable } from '../components/FilterableTable';
import { RecordFormDialog } from '../components/forms/RecordFormDialog';
import { contactForm } from '../components/forms/formConfigs';
import type { Column, Facet } from '../components/tableTypes';
import type { Contact } from '../data/types';
import {
  mockContacts,
  uniqueCities,
  uniqueCounties,
  contactTypes,
} from '../data/mockData';
import { telHref } from '../utils/format';

const columns: Column<Contact>[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    sortValue: (r) => `${r.lastName}, ${r.firstName}`,
    render: (r) => (
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {r.lastName}, {r.firstName}
      </Typography>
    ),
    csvValue: (r) => `${r.lastName}, ${r.firstName}`,
    minWidth: 160,
  },
  { key: 'type', label: 'Type', sortable: true, sortValue: (r) => r.type, minWidth: 140 },
  {
    key: 'phone',
    label: 'Phone',
    render: (r) => (r.phone ? <Link href={telHref(r.phone)}>{r.phone}</Link> : '—'),
    minWidth: 130,
  },
  { key: 'email', label: 'Email', sortable: true, sortValue: (r) => r.email, minWidth: 200 },
  { key: 'city', label: 'City', sortable: true, sortValue: (r) => r.city },
  { key: 'state', label: 'State', sortable: true, sortValue: (r) => r.state },
  {
    key: 'linked',
    label: 'Linked Accounts',
    align: 'right',
    sortable: true,
    sortValue: (r) => r.accountIds.length,
    render: (r) => r.accountIds.length,
    csvValue: (r) => r.accountIds.length,
  },
  // ---- CSV-only ----
  { key: 'street', label: 'Street Address', csvOnly: true, csvValue: (r) => r.street },
  { key: 'zip', label: 'Zip', csvOnly: true, csvValue: (r) => r.zip },
  { key: 'county', label: 'County', csvOnly: true, csvValue: (r) => r.county },
  { key: 'secondaryPhone', label: 'Secondary Phone', csvOnly: true, csvValue: (r) => r.secondaryPhone ?? '' },
  { key: 'preferredContact', label: 'Preferred Contact', csvOnly: true, csvValue: (r) => r.preferredContact },
  { key: 'company', label: 'Company', csvOnly: true, csvValue: (r) => r.company ?? '' },
];

const facets: Facet<Contact>[] = [
  { key: 'type', label: 'Contact Type', kind: 'select', value: (r) => r.type, options: contactTypes },
  { key: 'city', label: 'City', kind: 'select', value: (r) => r.city, options: uniqueCities },
  { key: 'county', label: 'County', kind: 'select', value: (r) => r.county, options: uniqueCounties },
  {
    key: 'preferredContact',
    label: 'Preferred Contact',
    kind: 'select',
    value: (r) => r.preferredContact,
    options: ['email', 'phone', 'sms'],
  },
];

export default function ContactsPage() {
  const [formOpen, setFormOpen] = useState(false);
  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Contacts
      </Typography>
      <Alert severity="success" sx={{ mb: 2 }}>
        Proposed columns for sign-off. <strong>Removed from list:</strong> long Notes column,
        secondary phone (kept in CSV / on the record).
      </Alert>
      <FilterableTable
        rows={mockContacts}
        columns={columns}
        facets={facets}
        getRowId={(r) => r.id}
        searchText={(r) => `${r.firstName} ${r.lastName} ${r.email} ${r.city} ${r.company ?? ''}`}
        csvBase="contacts"
        entityLabel="contacts"
        addLabel="Add Contact"
        onAdd={() => setFormOpen(true)}
      />
      <RecordFormDialog open={formOpen} onClose={() => setFormOpen(false)} config={contactForm} />
    </>
  );
}
