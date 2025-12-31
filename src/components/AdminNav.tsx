// src/components/AdminNav.tsx
import React from "react";
import { Drawer, List, ListItemButton, ListItemText, Toolbar, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const drawerWidth = 240;

export default function AdminNav() {
  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar /> {/* mantem o espaço igual ao AppBar caso exista */}
      <Box sx={{ overflow: "auto" }}>
        <List>
          <ListItemButton component={RouterLink} to="/admin/products">
            <ListItemText primary="Produtos" />
          </ListItemButton>
          <ListItemButton component={RouterLink} to="/admin/orders">
            <ListItemText primary="Pedidos" />
          </ListItemButton>
          <ListItemButton component={RouterLink} to="/admin/users">
            <ListItemText primary="Usuários" />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
}

export { drawerWidth };
