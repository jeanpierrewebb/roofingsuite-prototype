import { useState } from 'react';
import { Alert, Link, Typography } from '@mui/material';
import { FilterableTable } from '../components/FilterableTable';
import { StatusChip } from '../components/StatusChip';
import { RecordFormDialog } from '../components/forms/RecordFormDialog';
import { salesProjectForm } from '../components/forms/formConfigs';
import type { Column, Facet } from '../components/tableTypes';
import type { SalesProject } from '../data/types';
import {
  mockSalesProjects,
  uniqueCities,
  uniqueCounties,
  uniqueOwners,
  leadSources,
  SALES_STAGES,
} from '../data/mockData';
import { formatCurrency, formatDate, telHref } from '../utils/format';

const columns: Column<SalesProject>[] = [
  {
    key: 'title',
    label: 'Lead / Project',
    sortable: true,
    sortValue: (r) => r.title,
    render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.title}</Typography>,
    minWidth: 180,
  },
  { key: 'homeownerName', label: 'Homeowner', sortable: true, sortValue: (r) => r.homeownerName, minWidth: 150 },
  {
    key: 'stage',
    label: 'Stage',
    render: (r) => <StatusChip {...r.stage} />,
    csvValue: (r) => r.stage.name,
    minWidth: 160,
  },
  { key: 'ownerName', label: 'Sales Rep', sortable: true, sortValue: (r) => r.ownerName, minWidth: 120 },
  {
    key: 'estimatedValue',
    label: 'Est. Value',
    align: 'right',
    sortable: true,
    sortValue: (r) => r.estimatedValue,
    render: (r) => formatCurrency(r.estimatedValue),
  },
  { key: 'city', label: 'City', sortable: true, sortValue: (r) => r.city },
  { key: 'zip', label: 'Zip', sortable: true, sortValue: (r) => r.zip },
  { key: 'leadSource', label: 'Lead Source', sortable: true, sortValue: (r) => r.leadSource, minWidth: 120 },
  {
    key: 'nextFollowUp',
    label: 'Next Follow-up',
    sortable: true,
    sortValue: (r) => r.nextFollowUp ?? '',
    render: (r) => formatDate(r.nextFollowUp),
  },
  // ---- CSV-only ----
  { key: 'street', label: 'Street Address', csvOnly: true, csvValue: (r) => r.street },
  { key: 'county', label: 'County', csvOnly: true, csvValue: (r) => r.county },
  { key: 'phone', label: 'Phone', csvOnly: true, csvValue: (r) => r.phone },
  { key: 'email', label: 'Email', csvOnly: true, csvValue: (r) => r.email },
  { key: 'damageType', label: 'Damage Type', csvOnly: true, csvValue: (r) => r.damageType },
  { key: 'insuranceClaimNumber', label: 'Insurance Claim #', csvOnly: true, csvValue: (r) => r.insuranceClaimNumber ?? '' },
  { key: 'insuranceCarrier', label: 'Insurance Carrier', csvOnly: true, csvValue: (r) => r.insuranceCarrier ?? '' },
  { key: 'adjusterName', label: 'Adjuster', csvOnly: true, csvValue: (r) => r.adjusterName ?? '' },
  { key: 'createdDate', label: 'Created', csvOnly: true, csvValue: (r) => r.createdDate },
];

const facets: Facet<SalesProject>[] = [
  { key: 'stage', label: 'Stage', kind: 'select', value: (r) => r.stage.name, options: SALES_STAGES.map((s) => s.name) },
  { key: 'leadSource', label: 'Lead Source', kind: 'select', value: (r) => r.leadSource, options: leadSources },
  { key: 'ownerName', label: 'Sales Rep', kind: 'select', value: (r) => r.ownerName, options: uniqueOwners },
  { key: 'city', label: 'City', kind: 'select', value: (r) => r.city, options: uniqueCities },
  { key: 'county', label: 'County', kind: 'select', value: (r) => r.county, options: uniqueCounties },
  {
    key: 'damageType',
    label: 'Damage Type',
    kind: 'select',
    value: (r) => r.damageType,
    options: ['Hail', 'Wind', 'Age / Wear', 'Storm', 'Tree Impact'],
  },
  { key: 'nextFollowUp', label: 'Next Follow-up', kind: 'dateRange', dateValue: (r) => r.nextFollowUp },
];

export default function SalesProjectsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Sales Projects
      </Typography>
      <Alert severity="success" sx={{ mb: 2 }}>
        <strong>One-step creation:</strong> "Add Sales Project (Lead)" captures the contact, type,
        category, salesperson, pipeline & status — and <strong>auto-creates the linked Account</strong>{' '}
        (no separate Add Account). <strong>Click a row</strong> to edit, or Convert a Lead into a Job.
      </Alert>
      <FilterableTable
        rows={mockSalesProjects}
        columns={columns}
        facets={facets}
        getRowId={(r) => r.id}
        searchText={(r) => `${r.title} ${r.homeownerName} ${r.city} ${r.zip}`}
        csvBase="sales-projects"
        entityLabel="sales projects"
        addLabel="Add Sales Project"
        onAdd={() => {
          setMode('add');
          setFormOpen(true);
        }}
        onRowClick={() => {
          setMode('edit');
          setFormOpen(true);
        }}
      />
      <RecordFormDialog open={formOpen} onClose={() => setFormOpen(false)} config={salesProjectForm} mode={mode} />
    </>
  );
}
