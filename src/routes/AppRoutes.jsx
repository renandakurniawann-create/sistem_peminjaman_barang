import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import UserLayout from "../layouts/UserLayout.jsx";
import AdminApprovals from "../pages/admin/AdminApprovals.jsx";
import AdminBorrowingDetail from "../pages/admin/AdminBorrowingDetail.jsx";
import AdminBorrowings from "../pages/admin/AdminBorrowings.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import AdminItemDetail from "../pages/admin/AdminItemDetail.jsx";
import AdminItemForm from "../pages/admin/AdminItemForm.jsx";
import AdminItems from "../pages/admin/AdminItems.jsx";
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import NotFound from "../pages/NotFound.jsx";
import BorrowForm from "../pages/user/BorrowForm.jsx";
import MyBorrowings from "../pages/user/MyBorrowings.jsx";
import UserDashboard from "../pages/user/UserDashboard.jsx";
import UserItemDetail from "../pages/user/UserItemDetail.jsx";
import UserItems from "../pages/user/UserItems.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route element={<Login mode="user" />} path="/login" />
        <Route element={<Login mode="admin" />} path="/admin/login" />
        <Route element={<Register />} path="/register" />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
        <Route element={<UserLayout />}>
          <Route element={<UserDashboard />} index />
          <Route element={<UserItems />} path="/items" />
          <Route element={<UserItemDetail />} path="/items/:id" />
          <Route element={<BorrowForm />} path="/items/:id/borrow" />
          <Route element={<MyBorrowings />} path="/my-borrowings" />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} loginPath="/admin/login" />}>
        <Route element={<AdminLayout />} path="/admin">
          <Route element={<AdminDashboard />} index />
          <Route element={<AdminItems />} path="items" />
          <Route element={<AdminItemForm />} path="items/new" />
          <Route element={<AdminItemDetail />} path="items/:id" />
          <Route element={<AdminItemForm />} path="items/:id/edit" />
          <Route element={<AdminBorrowings />} path="borrowings" />
          <Route element={<AdminBorrowingDetail />} path="borrowings/:id" />
          <Route element={<AdminApprovals />} path="approvals" />
        </Route>
      </Route>

      <Route element={<NotFound />} path="/404" />
      <Route element={<Navigate replace to="/404" />} path="*" />
    </Routes>
  );
}
