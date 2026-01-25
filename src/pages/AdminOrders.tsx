// src/pages/AdminOrders.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import { adminApi } from '../api/adminApi';

type OrderItem = {
  id: number;
  quantity: number;
  product?: { id?: number; name?: string };
};

type Order = {
  id: number;
  status: string;
  user?: { email?: string };
  items?: OrderItem[];
};

const STATUS_OPTIONS = [
  { key: 'PENDING', label: 'Pending', icon: <HourglassTopIcon fontSize="small" /> },
  { key: 'CANCELLED', label: 'Cancelled', icon: <CancelIcon fontSize="small" /> },
  { key: 'DONE', label: 'Done', icon: <DoneAllIcon fontSize="small" /> },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // menu state (anchor per order)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const [snackMsg, setSnackMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const resp = await adminApi.getAllOrders();
      const raw = resp.data || resp;
      setOrders(Array.isArray(raw) ? raw : raw.data || []);
    } catch (err) {
      console.error('Erro ao carregar pedidos', err);
      setSnackMsg('Erro ao carregar pedidos (veja console).');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleMenuOpen(e: React.MouseEvent<HTMLElement>, orderId: number) {
    setAnchorEl(e.currentTarget);
    setSelectedOrderId(orderId);
  }

  function handleMenuClose() {
    setAnchorEl(null);
    setSelectedOrderId(null);
  }

  async function handleChangeStatus(newStatus: string) {
    if (!selectedOrderId) return;
    try {
      // supondo adminApi.updateOrderStatus(id, status)
      await adminApi.updateOrderStatus(selectedOrderId, newStatus);
      setSnackMsg(`Pedido ${selectedOrderId} atualizado para ${newStatus}`);
      handleMenuClose();
      // recarrega
      await load();
    } catch (err) {
      console.error('Erro ao atualizar status', err);
      setSnackMsg('Erro ao atualizar status (veja console).');
    }
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Pedidos</Typography>

      {loading && <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {STATUS_OPTIONS.map(opt => (
          <MenuItem
            key={opt.key}
            onClick={() => handleChangeStatus(opt.key)}
          >
            <ListItemIcon>{opt.icon}</ListItemIcon>
            <ListItemText>{opt.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      <Grid container spacing={2}>
        {orders.map(o => (
          <Grid item xs={12} md={6} key={o.id}>
            <Card>
              <CardContent sx={{ position: 'relative', width: 250 }}>
                <Box sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, o.id)}
                    aria-label={`actions-${o.id}`}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <Typography variant="subtitle1">Pedido #{o.id} — {o.status}</Typography>
                <Typography variant="body2" color="text.secondary">Usuário: {o.user?.email || '—'}</Typography>

                <Typography sx={{ mt: 1 }}>Itens:</Typography>
                <ul>
                  {o.items?.map((it) => (
                    <li key={it.id}>
                      {it.product?.name ?? 'Produto removido'} x {it.quantity}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={!!snackMsg}
        onClose={() => setSnackMsg(null)}
        message={snackMsg}
        autoHideDuration={3000}
      />
    </Box>
  );
}
