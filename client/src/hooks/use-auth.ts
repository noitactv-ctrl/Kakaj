import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading, isError, error, refetch } = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 15_000);
      let res: Response;
      try {
        res = await fetch(api.auth.me.path, {
          credentials: "include",
          signal: controller.signal,
        });
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === "AbortError") {
          throw new Error("The server did not respond within 15 seconds.");
        }
        throw cause;
      } finally {
        window.clearTimeout(timeout);
      }
      if (res.status === 401) return null;
      if (!res.ok) {
        const body = await res.json().catch(() => null) as { message?: unknown } | null;
        throw new Error(typeof body?.message === "string" ? body.message : `The server returned HTTP ${res.status}.`);
      }
      return api.auth.me.responses[200].parse(await res.json());
    },
    retry: false,
    // Always re-fetch the current user on mount so role/ban changes
    // take effect without requiring a full logout/login cycle.
    staleTime: 0,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string; captcha: string }) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Invalid email or password");
      }
      return res.json() as Promise<User>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.auth.me.path], data);
      toast({ title: "Welcome back!" });
    },
    onError: (error: Error) => {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Registration failed");
      }
      return res.json() as Promise<User>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.auth.me.path], data);
    },
    onError: (error: Error) => {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(api.auth.logout.path, { method: api.auth.logout.method });
      if (!res.ok) throw new Error("Logout failed");
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.me.path], null);
      queryClient.clear();
      toast({ title: "Logged out" });
    },
  });

  return {
    user,
    isLoading,
    isError,
    error,
    refetch,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
