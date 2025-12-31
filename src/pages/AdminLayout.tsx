import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Box, Button } from '@mui/material';
import AdminNav from '../components/AdminNav';
import {useAuth} from '../context/AuthContext';


export default function AdminLayout() {
const { user, logout, isAdmin } = useAuth();
if (!isAdmin) return <Navigate to="/signin" replace />;


return (
<Box sx={{ display: 'flex' }}>
<AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
<Toolbar>
<Typography variant="h6" sx={{ flex: 1 }}>Admin Panel</Typography>
<Typography sx={{ mr: 2 }}>{user?.email}</Typography>
<Button color="inherit" onClick={logout}>Logout</Button>
</Toolbar>
</AppBar>
<AdminNav />
<Box component="main" sx={{ flexGrow: 1, p: 3 }}>
<Toolbar />
<Outlet />
</Box>
</Box>
);
}