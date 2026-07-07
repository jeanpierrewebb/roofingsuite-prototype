import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Box,
  Grid,
  Chip,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
} from '@mui/material';
import type { FormConfig } from './formConfigs';

interface Props {
  open: boolean;
  onClose: () => void;
  config: FormConfig | null;
  mode?: 'add' | 'edit';
}

// Non-functional form mockup — the point is to show the client the cleaned-up
// field set (grouped), what's new, and what was removed.
export function RecordFormDialog({ open, onClose, config, mode = 'add' }: Props) {
  if (!config) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {mode === 'edit' ? 'Edit' : 'Add'} {config.title}
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          Prototype mockup — this form is for reviewing the proposed fields, not for saving data.
        </Alert>
        {config.note && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {config.note}
          </Alert>
        )}

        {config.sections.map((section) => (
          <Box key={section.title} sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'primary.main' }}>
              {section.title}
            </Typography>
            <Grid container spacing={2}>
              {section.fields.map((field) => (
                <Grid key={field.label} size={{ xs: 12, sm: 6 }}>
                  {field.type === 'switch' ? (
                    <FormControlLabel
                      control={<Switch defaultChecked={!!field.defaultValue} />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {field.label}
                          {field.added && <Chip label="New" size="small" color="success" />}
                        </Box>
                      }
                    />
                  ) : (
                    <TextField
                      fullWidth
                      size="small"
                      select={field.type === 'select'}
                      type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                      label={field.label}
                      defaultValue={field.defaultValue ?? ''}
                      helperText={field.helper}
                      InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                      InputProps={
                        field.added
                          ? {
                              endAdornment: <Chip label="New" size="small" color="success" />,
                            }
                          : undefined
                      }
                    >
                      {field.type === 'select' &&
                        field.options?.map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        ))}
                    </TextField>
                  )}
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}

        {config.removed.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Removed from the current app
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {config.removed.map((r) => (
                <Chip
                  key={r}
                  label={r}
                  size="small"
                  variant="outlined"
                  color="error"
                  sx={{ textDecoration: 'line-through' }}
                />
              ))}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Box>
          {mode === 'edit' && config.convertLabel && (
            <Button color="secondary" onClick={onClose}>
              {config.convertLabel}
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={onClose} sx={{ ml: 1 }}>
            Save (mock)
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
