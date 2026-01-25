import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  TextField,
  CircularProgress,
  Tooltip,
  Divider,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { adminApi } from '../api/adminApi';
import { Order, type User } from '../api/orderApi';

// AdminUsers: mostra lista de clientes com busca, contagem e ações
export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const [orders,setOrders]=useState<Order[]>([]);
  const [openOrdersModal,setOpenOrdersModal]=useState(false);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const resp = await adminApi.getAllUsers();
      const raw = (resp && (resp as any).data) ? (resp as any).data : resp;
      setUsers(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }

  async function handleSeeUsersOrders(email:string){
    setOpenOrdersModal(true);
    try{
      const emailString=email||'';
      const resp = await adminApi.getOrderUserOrderDetails(emailString);
      const raw = resp && (resp as any).data ? (resp as any).data : resp;
      setOrders(Array.isArray(raw) ? raw : []);
      console.log('Orders do usuário:',raw);
    }
    catch(err){
      console.error('Erro ao buscar pedidos do usuário',err);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      return (
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      );
    });
  }, [users, query]);

  async function handleDelete(user: User) {
    try {
      await adminApi.deleteUser(user.email);
      setUsers((s) => s.filter((x) => x.email !== user.email));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Erro ao deletar usuário', err);
      // opcional: mostrar snackbar/toast
    }
  }

  // Função para calcular total da ordem
  const calculateOrderTotal = (order: any) => {
    if (!order.items || order.items.length === 0) return 0;
    
    return order.items.reduce((total, item) => {
      const price = item.priceAtPurchase || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5">Clientes</Typography>
          <Typography variant="body2" color="text.secondary">{users.length} usuário(s) no sistema</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Buscar por nome ou email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="outlined" onClick={fetchUsers}>Atualizar</Button>
        </Box>
      </Stack>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
      )}

      {!loading && filtered.length === 0 && (
        <Typography>Nenhum usuário encontrado.</Typography>
      )}

      <Grid container spacing={2}>
        {filtered.map((u) => (
          <Grid item xs={12} sm={6} md={4} key={u.id}>
            <Card>
              <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', maxHeight: 85, width: 250 }}>
                <Avatar sx={{ width: 56, height: 56 }}>
                  {u.name ? u.name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase() : (u.email || '?').slice(0,2).toUpperCase()}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1">{u.name || '—'}</Typography>
                  <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                  {u.role && <Typography variant="caption">{u.role}</Typography>}
                </Box>

                <Box>
                  <Tooltip title="Ver pedidos do usuário">
                    <IconButton size="small" onClick={() => handleSeeUsersOrders(u.email)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Deletar usuário">
                    <IconButton size="small" color="error" onClick={() => setConfirmDelete(u)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
              <Divider />
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="caption" color="text.secondary">Criado em: {u.createdAt ? new Date(u.createdAt).toLocaleString() : '—'}</Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      
      <Dialog open={openOrdersModal} onClose={() => setOpenOrdersModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Ordens do Usuário</DialogTitle>
        <DialogContent>
          {orders.length === 0 ? (
            <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
              Nenhuma ordem encontrada para este usuário.
            </Typography>
          ) : (
            orders.map((order) => (
              <Paper key={order.id} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Ordem #{order.id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status: {order.status}
                </Typography>
                
                {/* Lista de itens */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Itens ({order.items?.length || 0}):
                  </Typography>
                  
                  {order.items?.map((item, index) => (
                    <Box key={item.id || index} sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 1,
                      p: 1,
                      backgroundColor: 'background.default',
                      borderRadius: 1
                    }}>
                      {/* Verificando se product existe */}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {item.product?.name || 'Produto não encontrado'}
                        </Typography>
                        {item.product?.description && (
                          <Typography variant="caption" color="text.secondary">
                            {item.product.description}
                          </Typography>
                        )}
                      </Box>
                      
                      <Box sx={{ textAlign: 'right', ml: 2 }}>
                        <Typography variant="body2">
                          {item.quantity} x R$ {item.priceAtPurchase?.toFixed(2) || '0.00'}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          Total: R$ {(item.quantity * item.priceAtPurchase)?.toFixed(2) || '0.00'}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                  
                  {/* Total da ordem */}
                  <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Total da Ordem: R$ {calculateOrderTotal(order).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja excluir o usuário <strong>{confirmDelete?.email}</strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button color="error" onClick={() => confirmDelete && handleDelete(confirmDelete)}>Excluir</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
