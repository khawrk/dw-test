"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import api from "@/lib/api";
import AuthLayout from "@/components/AuthLayout";
import LoginForm from "@/components/LoginForm";
import { ROLE, type Role } from "@/types";

interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

export default function UserLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { access_token } = res.data as { access_token: string };

      const decoded = jwtDecode<JwtPayload>(access_token);
      if (decoded.role !== ROLE.user) {
        toast.error("This account does not have user privileges");
        return;
      }

      localStorage.setItem("token", access_token);
      router.push("/user/home");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout quote="Your digital workspace, simplified.">
      <h1>Login</h1>
      <LoginForm
        buttonText="Login as User"
        loading={loading}
        onSubmit={handleSubmit}
        footer={
          <>
            Don&apos;t have an account?{" "}
            <Link href="/user/register" className="auth-link">
              Create an account
            </Link>
          </>
        }
      />
    </AuthLayout>
  );
}
