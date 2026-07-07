import type { ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  minWidth?: number;
  hideOnMobile?: boolean;
  /** How to render the cell on screen. */
  render?: (row: T) => ReactNode;
  /** Value used for sorting (string or number). */
  sortValue?: (row: T) => string | number;
  /** Marked [C]: not shown on screen, but included in CSV export. */
  csvOnly?: boolean;
  /** Marked screen-only: shown on screen, excluded from CSV. */
  screenOnly?: boolean;
  /** Explicit value for the CSV cell (falls back to sortValue, then key). */
  csvValue?: (row: T) => string | number;
}

export type FacetKind = 'select' | 'dateRange';

export interface Facet<T> {
  key: string;
  label: string;
  kind: FacetKind;
  /** select: the option value for a row (null = excluded from every option). */
  value?: (row: T) => string | null;
  /** select: fixed option ordering; otherwise derived from the data. */
  options?: string[];
  /** dateRange: the ISO date (yyyy-mm-dd) a row is bucketed by. */
  dateValue?: (row: T) => string | null;
  /** Optional helper text under the facet. */
  hint?: string;
}
