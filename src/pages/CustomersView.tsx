import { Alert, Link, Typography } from '@mui/material';
import { FilterableTable } from '../components/FilterableTable';
import type { Column, Facet } from '../components/tableTypes';
import type { HomeownerView } from '../data/types';
import {
  customersView,
  uniqueCities,
  uniqueCounties,
  uniqueZips,
  uniqueOwners,
  leadSources,
} from '../data/mockData';
import { formatCurrency, formatDate, telHref } from '../utils/format';

const columns: Column<HomeownerView>[] = [
  {
    key: 'name',
    label: 'Homeowner',
    sortable: true,
    sortValue: (r) => r.name,
    render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.name}</Typography>,
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
  { key: 'zip', label: 'Zip', sortable: true, sortValue: (r) => r.zip },
  {
    key: 'fieldProjectCount',
    label: 'Projects',
    align: 'right',
    sortable: true,
    sortValue: (r) => r.fieldProjectCount,
  },
  {
    key: 'lifetimeValue',
    label: 'Lifetime Value',
    align: 'right',
    sortable: true,
    sortValue: (r) => r.lifetimeValue,
    render: (r) => formatCurrency(r.lifetimeValue),
  },
  { key: 'owner', label: 'Owner', sortable: true, sortValue: (r) => r.owner, minWidth: 120 },
  {
    key: 'customerSince',
    label: 'Customer Since',
    sortable: true,
    sortValue: (r) => r.customerSince ?? '',
    render: (r) => formatDate(r.customerSince),
  },
  // ---- CSV-only fields ----
  { key: 'street', label: 'Street Address', csvOnly: true, csvValue: (r) => r.street },
  { key: 'county', label: 'County', csvOnly: true, csvValue: (r) => r.county },
  { key: 'email', label: 'Email', csvOnly: true, csvValue: (r) => r.email },
  { key: 'accountCount', label: 'Accounts', csvOnly: true, csvValue: (r) => r.accountCount },
  { key: 'leadSource', label: 'Lead Source', csvOnly: true, csvValue: (r) => r.leadSource },
];

const facets: Facet<HomeownerView>[] = [
  { key: 'city', label: 'City', kind: 'select', value: (r) => r.city, options: uniqueCities },
  { key: 'county', label: 'County', kind: 'select', value: (r) => r.county, options: uniqueCounties },
  { key: 'zip', label: 'Zip', kind: 'select', value: (r) => r.zip, options: uniqueZips },
  { key: 'leadSource', label: 'Lead Source', kind: 'select', value: (r) => r.leadSource, options: leadSources },
  { key: 'owner', label: 'Owner', kind: 'select', value: (r) => r.owner, options: uniqueOwners },
  {
    key: 'customerSince',
    label: 'Customer Since',
    kind: 'dateRange',
    dateValue: (r) => r.customerSince,
    hint: 'Holiday cards: set From 2026-01-01, To 2026-12-31.',
  },
];

export default function CustomersView() {
  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Customers
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>One row per homeowner</strong> (de-duplicated). Shows homeowners you've done business
        with. Try the holiday-card flow: filter <strong>Customer Since</strong> to 2026, then{' '}
        <strong>Export all filtered</strong> — the CSV includes street address for mailing labels.
      </Alert>
      <FilterableTable
        rows={customersView}
        columns={columns}
        facets={facets}
        getRowId={(r) => r.homeownerId}
        searchText={(r) => `${r.name} ${r.city} ${r.zip} ${r.phone} ${r.email}`}
        csvBase="customers"
        entityLabel="customers"
      />
    </>
  );
}
