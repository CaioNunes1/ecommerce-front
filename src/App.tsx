// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          <Route
            path="/"
            element={
              <RequireAuth>
                <Home />
              </RequireAuth>
            }
          />

          <Route path="/product/:id" element={<RequireAuth><ProductDetail/></RequireAuth>} />
          <Route path="/cart" element={<RequireAuth><Cart/></RequireAuth>} />
          <Route path="/checkout" element={<RequireAuth><Checkout/></RequireAuth>} />
          <Route path="/my-orders" element={<RequireAuth><MyOrders/></RequireAuth>} />

          <Route path="/admin" element={<RequireAdmin><AdminLayout/></RequireAdmin>}>
            <Route path="products" element={<RequireAdmin><AdminProducts/></RequireAdmin>} />
            <Route path="orders" element={<RequireAdmin><AdminOrders/></RequireAdmin>} />
            <Route path="users" element={<RequireAdmin><AdminUsers/></RequireAdmin>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
