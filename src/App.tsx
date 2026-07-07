import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar as ToolbarSpacer,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
  Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import BusinessIcon from '@mui/icons-material/Business';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RoofingIcon from '@mui/icons-material/Roofing';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import ProspectsView from './pages/ProspectsView';
import CustomersView from './pages/CustomersView';
import AccountsPage from './pages/AccountsPage';
import ContactsPage from './pages/ContactsPage';
import SalesProjectsPage from './pages/SalesProjectsPage';
import FieldProjectsPage from './pages/FieldProjectsPage';

const DRAWER_WIDTH = 240;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const VIEWS: NavItem[] = [
  { label: 'Prospects', path: '/views/prospects', icon: <EmojiPeopleIcon /> },
  { label: 'Customers', path: '/views/customers', icon: <PeopleIcon /> },
];
const RECORDS: NavItem[] = [
  { label: 'Accounts', path: '/records/accounts', icon: <BusinessIcon /> },
  { label: 'Contacts', path: '/records/contacts', icon: <ContactPageIcon /> },
  { label: 'Sales Projects', path: '/records/sales-projects', icon: <TrendingUpIcon /> },
  { label: 'Field Projects', path: '/records/field-projects', icon: <RoofingIcon /> },
];

function NavSection({
  title,
  items,
  onNavigate,
  currentPath,
}: {
  title: string;
  items: NavItem[];
  onNavigate: (path: string) => void;
  currentPath: string;
}) {
  return (
    <>
      <Typography
        variant="caption"
        sx={{ px: 2, pt: 2, pb: 0.5, display: 'block', fontWeight: 700, color: 'text.secondary' }}
      >
        {title}
      </Typography>
      <List dense>
        {items.map((item) => {
          const selected = currentPath === item.path;
          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => onNavigate(item.path)}
              sx={{ '&.Mui-selected': { bgcolor: '#e3f2fd' }, '&.Mui-selected:hover': { bgcolor: '#d6ebfd' } }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: selected ? 'primary.main' : undefined }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </>
  );
}

export default function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawerContent = (
    <Box>
      <ToolbarSpacer />
      <NavSection title="VIEWS" items={VIEWS} onNavigate={handleNavigate} currentPath={location.pathname} />
      <Divider />
      <NavSection title="RECORDS" items={RECORDS} onNavigate={handleNavigate} currentPath={location.pathname} />
      <Divider sx={{ mt: 1 }} />
      <Typography variant="caption" sx={{ px: 2, py: 1.5, display: 'block', color: 'text.secondary' }}>
        Prototype — mock data for review only.
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <RoofingIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            RoofingSuite
          </Typography>
          <Chip
            label="Views Prototype"
            size="small"
            sx={{ ml: 1.5, bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' }}
          />
          <Box sx={{ flex: 1 }} />
          <Typography variant="body2" sx={{ opacity: 0.7, display: { xs: 'none', sm: 'block' } }}>
            North Slope Roofing
          </Typography>
        </Toolbar>
      </AppBar>

      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: '1px solid #e0e0e0',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 3 } }}>
        <ToolbarSpacer />
        <Routes>
          <Route path="/" element={<Navigate to="/views/prospects" replace />} />
          <Route path="/views/prospects" element={<ProspectsView />} />
          <Route path="/views/customers" element={<CustomersView />} />
          <Route path="/records/accounts" element={<AccountsPage />} />
          <Route path="/records/contacts" element={<ContactsPage />} />
          <Route path="/records/sales-projects" element={<SalesProjectsPage />} />
          <Route path="/records/field-projects" element={<FieldProjectsPage />} />
          <Route path="*" element={<Navigate to="/views/prospects" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}
