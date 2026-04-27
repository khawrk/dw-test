"use client";

import { useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  buttonText: string;
  loading: boolean;
  onSubmit: (email: string, password: string) => void;
  footer?: React.ReactNode;
}

export default function LoginForm({
  buttonText,
  loading,
  onSubmit,
  footer,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form.email, form.password);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
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
              placeholder="Enter your Password"
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

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Logging in..." : buttonText}
        </button>
      </form>

      {footer && <div className="auth-link-row">{footer}</div>}
    </>
  );
}
