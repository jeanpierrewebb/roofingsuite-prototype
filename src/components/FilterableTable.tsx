import { useMemo, useState, useEffect, type ReactNode } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Checkbox,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  FormControlLabel,
  Typography,
  Divider,
  Drawer,
  IconButton,
  Card,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import type { Column, Facet, SortDirection } from './tableTypes';
import { exportRowsToCsv, timestampedFilename } from '../utils/exportCsv';

function useDebounced<T>(value: T, delay = 250): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

interface SortSpec {
  key: string;
  dir: SortDirection;
}

interface Props<T> {
  rows: T[];
  columns: Column<T>[];
  facets: Facet<T>[];
  getRowId: (row: T) => string;
  searchText: (row: T) => string;
  csvBase: string;
  entityLabel: string; // plural, e.g. "homeowners"
  banner?: ReactNode;
  addLabel?: string;
  onAdd?: (row?: T) => void;
  onRowClick?: (row: T) => void;
}

export function FilterableTable<T>({
  rows,
  columns,
  facets,
  getRowId,
  searchText,
  csvBase,
  entityLabel,
  banner,
  addLabel,
  onAdd,
  onRowClick,
}: Props<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);
  const [selectedFacets, setSelectedFacets] = useState<Record<string, Set<string>>>({});
  const [dateRanges, setDateRanges] = useState<Record<string, { from: string; to: string }>>({});
  const [sorts, setSorts] = useState<SortSpec[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null);

  const screenColumns = useMemo(() => columns.filter((c) => !c.csvOnly), [columns]);
  const csvColumns = useMemo(() => columns.filter((c) => !c.screenOnly), [columns]);
  const csvOnlyLabels = columns.filter((c) => c.csvOnly).map((c) => c.label);

  // facet option lists (fixed order if provided, else derived)
  const facetOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const f of facets) {
      if (f.kind !== 'select') continue;
      if (f.options) {
        map[f.key] = f.options;
      } else {
        const set = new Set<string>();
        for (const r of rows) {
          const v = f.value?.(r);
          if (v) set.add(v);
        }
        map[f.key] = Array.from(set).sort();
      }
    }
    return map;
  }, [facets, rows]);

  // ---- filtering helpers ----
  function matchesSearch(row: T): boolean {
    if (!debouncedSearch.trim()) return true;
    return searchText(row).toLowerCase().includes(debouncedSearch.trim().toLowerCase());
  }
  function matchesSelectFacet(row: T, f: Facet<T>): boolean {
    const sel = selectedFacets[f.key];
    if (!sel || sel.size === 0) return true;
    const v = f.value?.(row) ?? null;
    return v != null && sel.has(v);
  }
  function matchesDateFacet(row: T, f: Facet<T>): boolean {
    const range = dateRanges[f.key];
    if (!range || (!range.from && !range.to)) return true;
    const d = f.dateValue?.(row) ?? null;
    if (!d) return false;
    if (range.from && d < range.from) return false;
    if (range.to && d > range.to) return false;
    return true;
  }
  function matchesFacet(row: T, f: Facet<T>): boolean {
    return f.kind === 'dateRange' ? matchesDateFacet(row, f) : matchesSelectFacet(row, f);
  }

  const filteredRows = useMemo(() => {
    return rows.filter((r) => matchesSearch(r) && facets.every((f) => matchesFacet(r, f)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, facets, selectedFacets, dateRanges, debouncedSearch]);

  // live facet counts: rows passing all OTHER facets + search
  const facetCounts = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};
    for (const f of facets) {
      if (f.kind !== 'select') continue;
      const base = rows.filter(
        (r) => matchesSearch(r) && facets.every((o) => (o.key === f.key ? true : matchesFacet(r, o))),
      );
      const tally: Record<string, number> = {};
      for (const r of base) {
        const v = f.value?.(r);
        if (v) tally[v] = (tally[v] ?? 0) + 1;
      }
      counts[f.key] = tally;
    }
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, facets, selectedFacets, dateRanges, debouncedSearch]);

  const sortedRows = useMemo(() => {
    if (sorts.length === 0) return filteredRows;
    const colByKey = new Map(columns.map((c) => [c.key, c]));
    const arr = [...filteredRows];
    arr.sort((a, b) => {
      for (const s of sorts) {
        const col = colByKey.get(s.key);
        if (!col?.sortValue) continue;
        const av = col.sortValue(a);
        const bv = col.sortValue(b);
        let cmp = 0;
        if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
        else cmp = String(av).localeCompare(String(bv));
        if (cmp !== 0) return s.dir === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
    return arr;
  }, [filteredRows, sorts, columns]);

  // ---- interactions ----
  function toggleFacetValue(key: string, val: string) {
    setSelectedFacets((prev) => {
      const next = { ...prev };
      const set = new Set(next[key] ?? []);
      if (set.has(val)) set.delete(val);
      else set.add(val);
      next[key] = set;
      return next;
    });
  }
  function clearAll() {
    setSelectedFacets({});
    setDateRanges({});
    setSearch('');
  }
  function handleSort(key: string, additive: boolean) {
    setSorts((prev) => {
      const existing = prev.find((s) => s.key === key);
      if (additive) {
        if (!existing) return [...prev, { key, dir: 'asc' }];
        if (existing.dir === 'asc')
          return prev.map((s) => (s.key === key ? { ...s, dir: 'desc' } : s));
        return prev.filter((s) => s.key !== key);
      }
      // single-sort
      if (!existing) return [{ key, dir: 'asc' }];
      if (existing.dir === 'asc') return [{ key, dir: 'desc' }];
      return [];
    });
  }
  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAllFiltered() {
    const ids = sortedRows.map(getRowId);
    const allSelected = ids.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  }

  function csvValueOf(col: Column<T>, row: T): string | number {
    if (col.csvValue) return col.csvValue(row);
    if (col.sortValue) return col.sortValue(row);
    return String((row as Record<string, unknown>)[col.key] ?? '');
  }
  function doExport(which: 'filtered' | 'selected') {
    const source =
      which === 'selected' ? sortedRows.filter((r) => selectedIds.has(getRowId(r))) : sortedRows;
    exportRowsToCsv(
      source,
      csvColumns.map((c) => ({ header: c.label, value: (r: T) => csvValueOf(c, r) })),
      timestampedFilename(`${csvBase}-${which}`),
    );
    setExportAnchor(null);
  }

  // ---- active filter chips ----
  const activeChips: { key: string; label: string; onDelete: () => void }[] = [];
  for (const f of facets) {
    if (f.kind === 'select') {
      const sel = selectedFacets[f.key];
      if (sel) {
        for (const v of sel) {
          activeChips.push({
            key: `${f.key}:${v}`,
            label: `${f.label}: ${v}`,
            onDelete: () => toggleFacetValue(f.key, v),
          });
        }
      }
    } else {
      const range = dateRanges[f.key];
      if (range && (range.from || range.to)) {
        activeChips.push({
          key: `${f.key}:date`,
          label: `${f.label}: ${range.from || '…'} → ${range.to || '…'}`,
          onDelete: () => setDateRanges((p) => ({ ...p, [f.key]: { from: '', to: '' } })),
        });
      }
    }
  }

  const selectedCount = sortedRows.filter((r) => selectedIds.has(getRowId(r))).length;
  const allFilteredSelected =
    sortedRows.length > 0 && sortedRows.every((r) => selectedIds.has(getRowId(r)));

  // ---- facet panel ----
  const facetPanel = (
    <Box sx={{ width: 260, flexShrink: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Filters
        </Typography>
        {activeChips.length > 0 && (
          <Button size="small" onClick={clearAll}>
            Clear all
          </Button>
        )}
      </Box>
      {facets.map((f) => (
        <Box key={f.key} sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            {f.label.toUpperCase()}
          </Typography>
          {f.kind === 'select' ? (
            <Box sx={{ mt: 0.5, maxHeight: 220, overflowY: 'auto', pr: 1 }}>
              {facetOptions[f.key]?.map((opt) => {
                const count = facetCounts[f.key]?.[opt] ?? 0;
                const checked = selectedFacets[f.key]?.has(opt) ?? false;
                return (
                  <Box
                    key={opt}
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <FormControlLabel
                      sx={{ m: 0, flex: 1, '& .MuiFormControlLabel-label': { fontSize: 14 } }}
                      control={
                        <Checkbox
                          size="small"
                          checked={checked}
                          onChange={() => toggleFacetValue(f.key, opt)}
                        />
                      }
                      label={opt}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {count}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <TextField
                type="date"
                size="small"
                label="From"
                InputLabelProps={{ shrink: true }}
                value={dateRanges[f.key]?.from ?? ''}
                onChange={(e) =>
                  setDateRanges((p) => ({
                    ...p,
                    [f.key]: { from: e.target.value, to: p[f.key]?.to ?? '' },
                  }))
                }
              />
              <TextField
                type="date"
                size="small"
                label="To"
                InputLabelProps={{ shrink: true }}
                value={dateRanges[f.key]?.to ?? ''}
                onChange={(e) =>
                  setDateRanges((p) => ({
                    ...p,
                    [f.key]: { from: p[f.key]?.from ?? '', to: e.target.value },
                  }))
                }
              />
            </Stack>
          )}
          {f.hint && (
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}>
              {f.hint}
            </Typography>
          )}
          <Divider sx={{ mt: 1.5 }} />
        </Box>
      ))}
    </Box>
  );

  return (
    <Box>
      {banner}

      {/* Toolbar */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          alignItems: 'center',
          mb: 2,
        }}
      >
        <TextField
          size="small"
          placeholder={`Search ${entityLabel}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 240, flex: '1 1 240px', maxWidth: 360 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        {isMobile && (
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setDrawerOpen(true)}
          >
            Filters{activeChips.length ? ` (${activeChips.length})` : ''}
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={(e) => setExportAnchor(e.currentTarget)}
        >
          Export CSV
        </Button>
        <Menu anchorEl={exportAnchor} open={!!exportAnchor} onClose={() => setExportAnchor(null)}>
          <MenuItem onClick={() => doExport('filtered')}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            Export all filtered ({sortedRows.length})
          </MenuItem>
          <MenuItem disabled={selectedCount === 0} onClick={() => doExport('selected')}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            Export selected ({selectedCount})
          </MenuItem>
        </Menu>
        {onAdd && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => onAdd()}>
            {addLabel ?? 'Add'}
          </Button>
        )}
      </Box>

      {/* Active chips + count */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {sortedRows.length} {entityLabel}
        </Typography>
        {selectedCount > 0 && (
          <Chip size="small" color="primary" label={`${selectedCount} selected`} />
        )}
        {activeChips.map((chip) => (
          <Chip key={chip.key} size="small" label={chip.label} onDelete={chip.onDelete} />
        ))}
        {activeChips.length > 0 && (
          <Button size="small" onClick={clearAll}>
            Clear all
          </Button>
        )}
      </Box>

      {/* CSV legend */}
      {csvOnlyLabels.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2,
            p: 1,
            borderRadius: 1,
            bgcolor: '#e3f2fd',
            color: '#0d47a1',
          }}
        >
          <DownloadIcon fontSize="small" />
          <Typography variant="caption">
            CSV export also includes fields not shown on screen:{' '}
            <strong>{csvOnlyLabels.join(', ')}</strong>.
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        {!isMobile && facetPanel}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {isMobile ? (
            // Mobile: stacked cards
            <Stack spacing={1.5}>
              {sortedRows.map((row) => {
                const id = getRowId(row);
                return (
                  <Card key={id} sx={{ p: 1.5 }} variant="outlined">
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Checkbox
                        size="small"
                        sx={{ mt: -0.5 }}
                        checked={selectedIds.has(id)}
                        onChange={() => toggleRow(id)}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }} onClick={() => onRowClick?.(row)}>
                        {screenColumns.map((col) => (
                          <Box
                            key={col.key}
                            sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, py: 0.25 }}
                          >
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {col.label}
                            </Typography>
                            <Box sx={{ textAlign: 'right', fontSize: 14 }}>
                              {col.render ? col.render(row) : String(csvValueOf(col, row))}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Card>
                );
              })}
            </Stack>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={allFilteredSelected}
                        indeterminate={selectedCount > 0 && !allFilteredSelected}
                        onChange={toggleAllFiltered}
                      />
                    </TableCell>
                    {screenColumns.map((col) => {
                      const sortSpec = sorts.find((s) => s.key === col.key);
                      const orderIndex = sorts.findIndex((s) => s.key === col.key);
                      return (
                        <TableCell
                          key={col.key}
                          align={col.align}
                          sx={{ minWidth: col.minWidth }}
                        >
                          {col.sortable ? (
                            <Tooltip title="Click to sort • Shift-click to add a secondary sort">
                              <TableSortLabel
                                active={!!sortSpec}
                                direction={sortSpec?.dir ?? 'asc'}
                                onClick={(e) => handleSort(col.key, e.shiftKey)}
                              >
                                {col.label}
                                {sorts.length > 1 && orderIndex >= 0 && (
                                  <Box component="span" sx={{ fontSize: 10, ml: 0.25 }}>
                                    {orderIndex + 1}
                                  </Box>
                                )}
                              </TableSortLabel>
                            </Tooltip>
                          ) : (
                            col.label
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedRows.map((row) => {
                    const id = getRowId(row);
                    return (
                      <TableRow
                        key={id}
                        hover
                        selected={selectedIds.has(id)}
                        sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            size="small"
                            checked={selectedIds.has(id)}
                            onChange={() => toggleRow(id)}
                          />
                        </TableCell>
                        {screenColumns.map((col) => (
                          <TableCell
                            key={col.key}
                            align={col.align}
                            onClick={() => onRowClick?.(row)}
                          >
                            {col.render ? col.render(row) : String(csvValueOf(col, row))}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                  {sortedRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={screenColumns.length + 1} align="center">
                        <Typography variant="body2" sx={{ color: 'text.secondary', py: 3 }}>
                          No {entityLabel} match the current filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>

      {/* Mobile filter drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ p: 2, width: 300 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          {facetPanel}
          <Button fullWidth variant="contained" onClick={() => setDrawerOpen(false)} sx={{ mt: 1 }}>
            Show {sortedRows.length} {entityLabel}
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}
