import { Box } from '@mui/material';

export interface Segment {
  key: string;
  label: string;
  count?: number;
}

interface Props {
  segments: Segment[];
  value: string;
  onChange: (key: string) => void;
}

// iOS-style pill toggle matching the real app's SegmentToggle.
export function SegmentToggle({ segments, value, onChange }: Props) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        p: '3px',
        bgcolor: '#E2E2E7',
        borderRadius: '10px',
        gap: '3px',
      }}
    >
      {segments.map((seg) => {
        const active = seg.key === value;
        return (
          <Box
            key={seg.key}
            role="button"
            onClick={() => onChange(seg.key)}
            sx={{
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 2,
              py: 0.75,
              borderRadius: '8px',
              fontSize: 14,
              fontWeight: 600,
              color: active ? '#1A73E8' : '#3c3c43',
              bgcolor: active ? '#ffffff' : 'transparent',
              boxShadow: active ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
              userSelect: 'none',
            }}
          >
            {seg.label}
            {seg.count != null && (
              <Box
                component="span"
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  px: 0.75,
                  borderRadius: '999px',
                  bgcolor: active ? '#E8F0FE' : '#D5D5DA',
                  color: active ? '#1A73E8' : '#70707A',
                }}
              >
                {seg.count}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
