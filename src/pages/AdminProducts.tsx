import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

type Product = { id: number; name: string; sku?: string; price?: number; description?: string };

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [description, setDescription] = useState('');
  
  // Estados para o menu de opções
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Estados para o diálogo de edição
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState<number | string>('');
  const [editDescription, setEditDescription] = useState('');

  async function load() {
    setLoading(true);
    try {
      const resp = await adminApi.getProducts();
      const raw = resp.data || resp;
      setProducts(Array.isArray(raw) ? raw : raw.data || []);
      console.log(raw);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    load(); 
  }, []);

  async function handleAdd() {
    const payload = { 
      name, 
      price: Number(price), 
      description 
    };
    await adminApi.createProduct(payload);
    setName(''); 
    setPrice('');
    setDescription('');
    load();
  }

  // Funções para o menu de opções
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, product: Product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  // Função para abrir o diálogo de edição
  const handleEditClick = () => {
    if (selectedProduct) {
      setEditingProduct(selectedProduct);
      setEditName(selectedProduct.name);
      setEditPrice(selectedProduct.price || '');
      setEditDescription(selectedProduct.description || '');
      setEditDialogOpen(true);
      handleMenuClose();
    }
  };

  // Função para salvar a edição
  const handleSaveEdit = async () => {
    if (editingProduct) {
      const payload = {
        name: editName,
        price: Number(editPrice),
        description: editDescription
      };
      await adminApi.updateProduct(editingProduct.id, payload);
      setEditDialogOpen(false);
      load();
    }
  };

  // Função para deletar produto
  const handleDeleteClick = async () => {
    if (selectedProduct && window.confirm(`Tem certeza que deseja excluir o produto "${selectedProduct.name}"?`)) {
      await adminApi.deleteProduct(selectedProduct.id);
      handleMenuClose();
      load();
    }
  };

  // Função para cancelar edição
  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setEditingProduct(null);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Produtos</Typography>

      {/* Formulário para adicionar produto */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>Adicionar produto</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <TextField 
                label="Nome" 
                fullWidth 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField 
                label="Preço" 
                type="number"
                fullWidth 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField 
                label="Descrição" 
                fullWidth 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <Button 
                variant="contained" 
                onClick={handleAdd}
                fullWidth
                sx={{ height: '56px' }}
              >
                Adicionar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lista de produtos */}
      <Grid container spacing={2}>
        {products.map(p => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, width:200 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" gutterBottom>
                    {p.name}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={(e) => handleMenuOpen(e, p)}
                    aria-label="opções"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  R$ {p.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {p.description || 'Sem descrição'}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                <Button 
                  size="small" 
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setEditingProduct(p);
                    setEditName(p.name);
                    setEditPrice(p.price || '');
                    setEditDescription(p.description || '');
                    setEditDialogOpen(true);
                  }}
                >
                  Editar
                </Button>
                <Button 
                  size="small" 
                  color="error" 
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    if (window.confirm(`Excluir "${p.name}"?`)) {
                      adminApi.deleteProduct(p.id).then(() => load());
                    }
                  }}
                >
                  Excluir
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Menu de opções (alternativa aos botões) */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Excluir</ListItemText>
        </MenuItem>
      </Menu>

      {/* Diálogo de edição */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCancelEdit}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Editar Produto
          <IconButton
            aria-label="close"
            onClick={handleCancelEdit}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField 
                label="Nome" 
                fullWidth 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                label="Preço" 
                type="number"
                fullWidth 
                value={editPrice} 
                onChange={(e) => setEditPrice(e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                label="Descrição" 
                fullWidth 
                multiline
                rows={3}
                value={editDescription} 
                onChange={(e) => setEditDescription(e.target.value)}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancelar</Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained" 
            startIcon={<SaveIcon />}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mensagem quando não há produtos */}
      {products.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Nenhum produto encontrado.
          </Typography>
        </Box>
      )}

      {/* Indicador de carregamento */}
      {loading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body1">Carregando produtos...</Typography>
        </Box>
      )}
    </Box>
  );
}