"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/trpc";
import { User } from "@/types";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated (from localStorage)
    const savedAuth = localStorage.getItem("flasharb-auth");
    if (savedAuth) {
      setIsAuthenticated(true);
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userData = await api.user.getProfile();
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      const result = await api.auth.verifyWorldID();
      if (result.success) {
        setIsAuthenticated(true);
        localStorage.setItem("flasharb-auth", "true");
        await fetchUserProfile();
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("flasharb-auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
  };
}
