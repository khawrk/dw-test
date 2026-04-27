"use client";

import Link from "next/link";
import { Users, Settings } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="role-select-page">
      <header className="role-select-header">
        <div
          className="auth-brand-dot"
          style={{ background: "var(--primary)" }}
        />
        <span style={{ fontWeight: 700, color: "var(--primary)" }}>BRAND</span>
      </header>

      <div className="role-select-body">
        <h1 className="role-select-title">Select Access Level</h1>
        <p className="role-select-subtitle">
          Lorem ipsum dolor sit amet consectetur. Elit purus nam.
        </p>

        <div className="role-cards">
          {/* User Card */}
          <div className="role-card">
            <div className="role-card-icon">
              <Users size={40} />
            </div>
            <div className="role-card-name">User</div>
            <p className="role-card-desc">
              Lorem ipsum dolor sit amet consectetur. Elit purus nam gravida
              porttitor nibh urna sit ornare a. Proin dolor morbi id ornare
              aenean non
            </p>
            <Link href="/user/login">
              <button type="button" className="role-card-btn user-btn">
                Enter Workspace →
              </button>
            </Link>
          </div>

          {/* Admin Card */}
          <div className="role-card admin">
            <div className="role-card-icon">
              <Settings size={40} />
            </div>
            <div className="role-card-name">Administrator</div>
            <p className="role-card-desc">
              Lorem ipsum dolor sit amet consectetur. Elit purus nam gravida
              porttitor nibh urna sit ornare a. Proin dolor morbi id ornare
              aenean non
            </p>
            <Link href="/admin/login">
              <button type="button" className="role-card-btn admin-btn">
                Enter Portal →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
