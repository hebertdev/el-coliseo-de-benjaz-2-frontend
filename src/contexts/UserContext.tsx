"use client";

import { useState, ReactNode, createContext, useEffect, useContext } from "react";
import { axiosInstanceApi } from "helpers/axios";
import type { AxiosRequestConfig } from "axios";

// services
import { whoAmIAPI } from "services/users";
import { UserData } from "interfaces/users";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

export interface UserContextProps {
  user: UserData | null | undefined;
  logout: () => void;
  loadingUser: boolean;
  toggleLoadingUser: (value: boolean) => void;
  handleGetUser: () => Promise<void>;
}

interface UserProviderProps {
  children: ReactNode;
}

export const UserContext = createContext({} as UserContextProps);

export function UserContextProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<UserData | null | undefined>(undefined);
  const [loadingUser, setLoadingUser] = useState(true);

  const logout = async () => {
    try {
      await axiosInstanceApi.post("/api/auth/logout", null, { skipAuthRedirect: true } as AxiosRequestConfig);
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setUser(null);
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/";
    }
  };

  const toggleLoadingUser = (value: boolean) => {
    setLoadingUser(value);
  };

  const handleGetUser = async () => {
    try {
      setLoadingUser(true);
      const data = await whoAmIAPI();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    // Intentar obtener el usuario al montar el contexto
    // Verificamos si existe la cookie "ps_user" antes de hacer la petición
    // para evitar el estado de "Cargando..." innecesario en usuarios no autenticados.
    const hasUserCookie = !!getCookie("ps_user");
    Promise.resolve().then(() => {
      if (hasUserCookie) {
        handleGetUser();
      } else {
        setLoadingUser(false);
        setUser(null);
      }
    });
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        logout,
        loadingUser,
        toggleLoadingUser,
        handleGetUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
