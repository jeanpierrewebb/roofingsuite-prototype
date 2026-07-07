import { Chip } from '@mui/material';
import { getOptimalTextColor } from '../utils/colorUtils';

export function StatusChip({ name, color }: { name: string; color: string }) {
  return (
    <Chip
      label={name}
      size="small"
      sx={{
        bgcolor: color,
        color: getOptimalTextColor(color),
        fontWeight: 600,
        borderRadius: 1.5,
      }}
    />
  );
}

export function StatusDot({ name, color }: { name: string; color: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: color,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {name}
    </span>
  );
}
