import { Alert, Link, Typography } from '@mui/material';
import { FilterableTable } from '../components/FilterableTable';
import { StatusChip } from '../components/StatusChip';
import type { Column, Facet } from '../components/tableTypes';
import type { HomeownerView } from '../data/types';
import {
  prospectsView,
  uniqueCities,
  uniqueCounties,
  uniqueZips,
  uniqueOwners,
  leadSources,
  SALES_STAGES,
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
    key: 'stage',
    label: 'Stage',
    render: (r) => (r.currentStage ? <StatusChip {...r.currentStage} /> : '—'),
    csvValue: (r) => r.currentStage?.name ?? '',
    minWidth: 150,
  },
  {
    key: 'pipelineValue',
    label: 'Pipeline Value',
    align: 'right',
    sortable: true,
    sortValue: (r) => r.pipelineValue,
    render: (r) => formatCurrency(r.pipelineValue),
  },
  { key: 'owner', label: 'Owner', sortable: true, sortValue: (r) => r.owner, minWidth: 120 },
  {
    key: 'lastActivity',
    label: 'Last Activity',
    sortable: true,
    sortValue: (r) => r.lastActivity,
    render: (r) => formatDate(r.lastActivity),
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
  {
    key: 'county',
    label: 'County',
    kind: 'select',
    value: (r) => r.county,
    options: uniqueCounties,
    hint: 'Storms are reported by county / zip.',
  },
  { key: 'zip', label: 'Zip', kind: 'select', value: (r) => r.zip, options: uniqueZips },
  {
    key: 'stage',
    label: 'Stage',
    kind: 'select',
    value: (r) => r.currentStage?.name ?? null,
    options: SALES_STAGES.map((s) => s.name),
  },
  { key: 'leadSource', label: 'Lead Source', kind: 'select', value: (r) => r.leadSource, options: leadSources },
  { key: 'owner', label: 'Owner', kind: 'select', value: (r) => r.owner, options: uniqueOwners },
  { key: 'lastActivity', label: 'Last Activity', kind: 'dateRange', dateValue: (r) => r.lastActivity },
];

export default function ProspectsView() {
  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Prospects
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>One row per homeowner</strong> (de-duplicated). Shows homeowners with an active deal
        in a sales pipeline — a homeowner with multiple accounts/projects appears once. Try the
        post-storm flow: filter by <strong>County = Butler</strong> or a <strong>Zip</strong>, select
        the affected rows, then <strong>Export selected</strong>.
      </Alert>
      <FilterableTable
        rows={prospectsView}
        columns={columns}
        facets={facets}
        getRowId={(r) => r.homeownerId}
        searchText={(r) => `${r.name} ${r.city} ${r.zip} ${r.phone} ${r.email}`}
        csvBase="prospects"
        entityLabel="prospects"
      />
    </>
  );
}
