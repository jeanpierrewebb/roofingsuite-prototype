import { useState } from 'react';
import { Alert, Link, Typography } from '@mui/material';
import { FilterableTable } from '../components/FilterableTable';
import { StatusChip } from '../components/StatusChip';
import { RecordFormDialog } from '../components/forms/RecordFormDialog';
import { fieldProjectForm } from '../components/forms/formConfigs';
import type { Column, Facet } from '../components/tableTypes';
import type { FieldProject } from '../data/types';
import {
  mockFieldProjects,
  uniqueCities,
  uniqueCounties,
  uniqueOwners,
  jobTypes,
  FIELD_STATUSES,
} from '../data/mockData';
import { formatCurrency, formatDate, telHref } from '../utils/format';

const columns: Column<FieldProject>[] = [
  {
    key: 'title',
    label: 'Project',
    sortable: true,
    sortValue: (r) => r.title,
    render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.title}</Typography>,
    minWidth: 170,
  },
  { key: 'homeownerName', label: 'Homeowner', sortable: true, sortValue: (r) => r.homeownerName, minWidth: 150 },
  {
    key: 'status',
    label: 'Job Status',
    render: (r) => <StatusChip {...r.status} />,
    csvValue: (r) => r.status.name,
    minWidth: 150,
  },
  { key: 'jobType', label: 'Job Type', sortable: true, sortValue: (r) => r.jobType, minWidth: 130 },
  { key: 'projectManager', label: 'PM / Crew', sortable: true, sortValue: (r) => r.projectManager, minWidth: 120 },
  {
    key: 'contractValue',
    label: 'Contract Value',
    align: 'right',
    sortable: true,
    sortValue: (r) => r.contractValue,
    render: (r) => formatCurrency(r.contractValue),
  },
  {
    key: 'startDate',
    label: 'Start Date',
    sortable: true,
    sortValue: (r) => r.startDate,
    render: (r) => formatDate(r.startDate),
  },
  { key: 'city', label: 'City', sortable: true, sortValue: (r) => r.city },
  // ---- CSV-only ----
  { key: 'street', label: 'Street Address', csvOnly: true, csvValue: (r) => r.street },
  { key: 'zip', label: 'Zip', csvOnly: true, csvValue: (r) => r.zip },
  { key: 'county', label: 'County', csvOnly: true, csvValue: (r) => r.county },
  { key: 'phone', label: 'Phone', csvOnly: true, csvValue: (r) => r.phone },
  {
    key: 'completionDate',
    label: 'Completion Date',
    csvOnly: true,
    csvValue: (r) => r.completionDate ?? '',
  },
  { key: 'material', label: 'Material', csvOnly: true, csvValue: (r) => r.material },
  { key: 'insuranceJob', label: 'Insurance Job', csvOnly: true, csvValue: (r) => (r.insuranceJob ? 'Yes' : 'No') },
  { key: 'warrantyRegistered', label: 'Warranty Registered', csvOnly: true, csvValue: (r) => (r.warrantyRegistered ? 'Yes' : 'No') },
];

const facets: Facet<FieldProject>[] = [
  { key: 'status', label: 'Job Status', kind: 'select', value: (r) => r.status.name, options: FIELD_STATUSES.map((s) => s.name) },
  { key: 'jobType', label: 'Job Type', kind: 'select', value: (r) => r.jobType, options: jobTypes },
  { key: 'projectManager', label: 'PM / Crew', kind: 'select', value: (r) => r.projectManager, options: uniqueOwners },
  { key: 'city', label: 'City', kind: 'select', value: (r) => r.city, options: uniqueCities },
  { key: 'county', label: 'County', kind: 'select', value: (r) => r.county, options: uniqueCounties },
  { key: 'startDate', label: 'Start Date', kind: 'dateRange', dateValue: (r) => r.startDate },
];

export default function FieldProjectsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Field Projects
      </Typography>
      <Alert severity="success" sx={{ mb: 2 }}>
        <strong>Shortcut for already-won deals</strong> (e.g. a simple repair) — skips the sales
        pipeline and <strong>auto-creates the linked Account</strong>. <strong>Removed (per Jeromy):</strong>{' '}
        "Estimated" amount & completion date. <strong>Click a row</strong> to edit, or Convert a Job
        back into a Lead if it was filed by mistake.
      </Alert>
      <FilterableTable
        rows={mockFieldProjects}
        columns={columns}
        facets={facets}
        getRowId={(r) => r.id}
        searchText={(r) => `${r.title} ${r.homeownerName} ${r.city} ${r.material}`}
        csvBase="field-projects"
        entityLabel="field projects"
        addLabel="Add Field Project"
        onAdd={() => {
          setMode('add');
          setFormOpen(true);
        }}
        onRowClick={() => {
          setMode('edit');
          setFormOpen(true);
        }}
      />
      <RecordFormDialog open={formOpen} onClose={() => setFormOpen(false)} config={fieldProjectForm} mode={mode} />
    </>
  );
}
