"use client";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Toaster, toast } from "sonner";
import { api, ApiError, clearClientAuth, ensureCsrf } from "@/lib/api";
import type { Resource, User } from "@/lib/types";
import { CartProvider } from "@/components/cart-provider";

const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  can: (permission: string) => boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (values: {name:string;email:string;password:string;password_confirmation:string}) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<unknown>;
} | null>(null);

/** Keep the observed auth query attached while removing data from the previous account. */
function clearAccountData(queryClient: QueryClient) {
  queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== "me" });
  queryClient.getMutationCache().clear();
}

function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["me"],
    queryFn: ({ signal }) => api<Resource<User>>("/auth/me", { signal }),
    retry: false,
    staleTime: 60_000,
  });
  const user = query.data?.data ?? null;
  useEffect(() => {
    const expired = () => {
      clearAccountData(queryClient);
      queryClient.setQueryData(["me"], null);
    };
    window.addEventListener("auth:expired", expired);
    return () => window.removeEventListener("auth:expired", expired);
  }, [queryClient]);
  const value = useMemo(
    () => ({
      user,
      loading: query.isLoading,
      can: (permission: string) =>
        Boolean(user?.permissions.includes(permission)),
      login: async (email: string, password: string) => {
        await queryClient.cancelQueries();
        await ensureCsrf();
        const result = await api<Resource<User>>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        clearAccountData(queryClient);
        queryClient.setQueryData(["me"], result);
      },
      logout: async () => {
        try {
          await api("/auth/logout", { method: "POST" });
        } catch (error) {
          if (!(error instanceof ApiError && error.status === 401)) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Sign out failed. Please try again.",
            );
            return;
          }
        }
        clearClientAuth();
        queryClient.clear();
        window.location.assign("/login");
      },
      register: async (values: {name:string;email:string;password:string;password_confirmation:string}) => {
        await queryClient.cancelQueries();
        await ensureCsrf();
        const result = await api<Resource<User>>("/auth/register", {method:"POST", body:JSON.stringify(values)});
        clearAccountData(queryClient);
        queryClient.setQueryData(["me"], result);
      },
      refreshUser: () => query.refetch(),
    }),
    [user, query.isLoading, query.refetch, queryClient],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, refetchOnWindowFocus: false },
          mutations: { retry: false },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <AuthProvider><CartProvider>{children}</CartProvider></AuthProvider>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider is missing");
  return value;
}
