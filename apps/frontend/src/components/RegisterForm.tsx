"use client";

import { useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";

interface RegisterFormProps {
  loading: boolean;
  onSubmit: (email: string, password: string, fullName: string) => void;
  footer?: React.ReactNode;
}

export default function RegisterForm({
  loading,
  onSubmit,
  footer,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    onSubmit(form.email, form.password, form.fullName);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullname">Full name</label>
          <div className="input-wrapper">
            <User size={16} />
            <input
              name="fullname"
              type="text"
              placeholder="Enter your Full Name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <div className="input-wrapper">
            <User size={16} />
            <input
              name="email"
              type="email"
              placeholder="Enter your Email Address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-wrapper">
            <Lock size={16} />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              className="input-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="cf-password">Confirm Password</label>
          <div className="input-wrapper">
            <Lock size={16} />
            <input
              name="cf-password"
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter your Password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              required
            />
            <button
              type="button"
              className="input-eye"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Creating account..." : "Create an account"}
        </button>
      </form>

      {footer && <div className="auth-link-row">{footer}</div>}
    </>
  );
}
