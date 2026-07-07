import { useState } from 'react';
import { Alert, Link, Stack, Typography } from '@mui/material';
import { FilterableTable } from '../components/FilterableTable';
import { StatusChip } from '../components/StatusChip';
import { RecordFormDialog } from '../components/forms/RecordFormDialog';
import { accountForm } from '../components/forms/formConfigs';
import type { Column, Facet } from '../components/tableTypes';
import type { Account } from '../data/types';
import {
  mockAccounts,
  uniqueCities,
  uniqueCounties,
  uniqueOwners,
  leadSources,
  customerTypes,
} from '../data/mockData';
import { formatDate, telHref } from '../utils/format';

function statusLabel(a: Account): string {
  if (a.isProspect && a.isCustomer) return 'Prospect + Customer';
  if (a.isProspect) return 'Prospect';
  if (a.isCustomer) return 'Customer';
  return '—';
}

const columns: Column<Account>[] = [
  {
    key: 'name',
    label: 'Account Name',
    sortable: true,
    sortValue: (r) => r.name,
    render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.name}</Typography>,
    minWidth: 220,
  },
  { key: 'type', label: 'Type', sortable: true, sortValue: (r) => r.type },
  {
    key: 'status',
    label: 'Status',
    csvValue: (r) => statusLabel(r),
    render: (r) => (
      <Stack direction="row" spacing={0.5}>
        {r.isProspect && <StatusChip name="Prospect" color="#ffa726" />}
        {r.isCustomer && <StatusChip name="Customer" color="#2e7d32" />}
        {!r.isProspect && !r.isCustomer && '—'}
      </Stack>
    ),
    minWidth: 160,
  },
  {
    key: 'phone',
    label: 'Phone',
    render: (r) => (r.phone ? <Link href={telHref(r.phone)}>{r.phone}</Link> : '—'),
    minWidth: 130,
  },
  { key: 'city', label: 'City', sortable: true, sortValue: (r) => r.city },
  { key: 'state', label: 'State', sortable: true, sortValue: (r) => r.state },
  { key: 'ownerName', label: 'Owner', sortable: true, sortValue: (r) => r.ownerName, minWidth: 120 },
  {
    key: 'createdDate',
    label: 'Created',
    sortable: true,
    sortValue: (r) => r.createdDate,
    render: (r) => formatDate(r.createdDate),
  },
  // ---- CSV-only ----
  { key: 'street', label: 'Street Address', csvOnly: true, csvValue: (r) => r.street },
  { key: 'zip', label: 'Zip', csvOnly: true, csvValue: (r) => r.zip },
  { key: 'county', label: 'County', csvOnly: true, csvValue: (r) => r.county },
  { key: 'email', label: 'Email', csvOnly: true, csvValue: (r) => r.email },
  { key: 'leadSource', label: 'Lead Source', csvOnly: true, csvValue: (r) => r.leadSource },
  { key: 'insuranceCarrier', label: 'Insurance Carrier', csvOnly: true, csvValue: (r) => r.insuranceCarrier ?? '' },
];

const facets: Facet<Account>[] = [
  { key: 'type', label: 'Type', kind: 'select', value: (r) => r.type, options: customerTypes },
  {
    key: 'status',
    label: 'Status',
    kind: 'select',
    value: (r) => statusLabel(r),
    options: ['Prospect', 'Customer', 'Prospect + Customer'],
  },
  { key: 'city', label: 'City', kind: 'select', value: (r) => r.city, options: uniqueCities },
  { key: 'county', label: 'County', kind: 'select', value: (r) => r.county, options: uniqueCounties },
  { key: 'leadSource', label: 'Lead Source', kind: 'select', value: (r) => r.leadSource, options: leadSources },
  { key: 'ownerName', label: 'Owner', kind: 'select', value: (r) => r.ownerName, options: uniqueOwners },
  { key: 'createdDate', label: 'Created', kind: 'dateRange', dateValue: (r) => r.createdDate },
];

export default function AccountsPage() {
  const [formOpen, setFormOpen] = useState(false);
  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Accounts
      </Typography>
      <Alert severity="success" sx={{ mb: 2 }}>
        Proposed columns for sign-off. <strong>Added:</strong> Lead Source, Insurance Carrier (CSV).{' '}
        <strong>Removed:</strong> Tax rate, custom-field clutter. Click <strong>Add Account</strong>{' '}
        to review the proposed form fields.
      </Alert>
      <FilterableTable
        rows={mockAccounts}
        columns={columns}
        facets={facets}
        getRowId={(r) => r.id}
        searchText={(r) => `${r.name} ${r.primaryContactName} ${r.city} ${r.zip} ${r.phone}`}
        csvBase="accounts"
        entityLabel="accounts"
        addLabel="Add Account"
        onAdd={() => setFormOpen(true)}
      />
      <RecordFormDialog open={formOpen} onClose={() => setFormOpen(false)} config={accountForm} />
    </>
  );
}
