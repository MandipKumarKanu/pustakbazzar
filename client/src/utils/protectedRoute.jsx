import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

const ProtectedRoute = () => {
    const {token} = useAuthStore()

    return token ? <Outlet /> : <Navigate to="/auth" />
}

const AdminProtectedRoute = () => {
    const {token, user} = useAuthStore()

    return token && user?.profile?.role === "admin" ? <Outlet /> : <Navigate to="/auth" />
}

export  { ProtectedRoute, AdminProtectedRoute };