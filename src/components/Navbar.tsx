import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptIcon from '@mui/icons-material/Receipt';
import Badge from "@mui/material/Badge";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Box from "@mui/material/Box";
import LogoutIcon from '@mui/icons-material/Logout';
import { Link as RouterLink } from "react-router-dom";
import { Button } from "@mui/material";

export default function Navbar() {
  const navigate = useNavigate();
  const { getTotalItems } = useCart();

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Box sx={{ flexGrow: 1, cursor: "pointer" }} onClick={() => navigate("/")}>
          <Typography variant="h6">MeuCommerce</Typography>
        </Box>

        <IconButton color="inherit" onClick={() => navigate("/cart")}>
          <Badge badgeContent={getTotalItems()} color="secondary">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
        <IconButton color="inherit" onClick={() => navigate("/my-orders")}>
            <ReceiptIcon />
        </IconButton>
        <IconButton>
          <LogoutIcon onClick={() => navigate("/signin")} style={{color:"white"}} />
        </IconButton>
        
      </Toolbar>
    </AppBar>
  );
}
