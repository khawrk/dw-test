"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import AuthLayout from "@/components/AuthLayout";
import RegisterForm from "@/components/RegisterForm";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register/admin", { email, password });
      const { access_token } = res.data as { access_token: string };
      localStorage.setItem("token", access_token);
      router.push("/admin/home");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout quote="Your digital workspace, simplified.">
      <h1>Sign Up</h1>
      <RegisterForm
        loading={loading}
        onSubmit={handleSubmit}
        footer={
          <>
            Already have an account?{" "}
            <Link href="/admin/login" className="auth-link">
              Login
            </Link>
          </>
        }
      />
    </AuthLayout>
  );
}
