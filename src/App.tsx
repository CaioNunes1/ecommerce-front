// src/App.tsx (exemplo mínimo)
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProductDetail from "./pages/ProductDetail";
import Navbar from "./components/Navbar";
import MyOrders from "./pages/MyOrders";
import AdminLayout from './pages/AdminLayout';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import { AuthProvider } from "./context/AuthContext";
import AdminUsers from "./pages/AdminUsers";

function App() {
  const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          {/* rota raiz: se não autenticado, redireciona para signin */}
          <Route path="/" element={user ? <Home /> : <Navigate to="/signin" replace />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
          {/* outras rotas */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
