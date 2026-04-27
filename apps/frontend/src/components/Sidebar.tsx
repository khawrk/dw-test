"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Home, Inbox, RefreshCw, LogOut } from "lucide-react";
import { ROLE, type Role } from "@/types";

interface SidebarProps {
  role: Role;
}

export default function Sidebar({ role }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleSwitch = () => {
    if (role === ROLE.admin) {
      router.push("/user/home");
    } else {
      router.push("/admin/home");
    }
  };

  const adminLinks = [
    { label: "Home", icon: <Home size={16} />, href: "/admin/home" },
    { label: "History", icon: <Inbox size={16} />, href: "/admin/history" },
  ];

  const userLinks = [
    { label: "Home", icon: <Home size={16} />, href: "/user/home" },
  ];

  const links = role === ROLE.admin ? adminLinks : userLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-title">{role === ROLE.admin ? "Admin" : "User"}</div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`sidebar-link ${pathname === link.href ? "active" : ""}`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}

        <button type="button" className="sidebar-link" onClick={handleSwitch}>
          <RefreshCw size={16} />
          {role === ROLE.admin ? "Switch to user" : "Switch to Admin"}
        </button>
      </nav>

      <div className="sidebar-logout">
        <button type="button" className="sidebar-link" onClick={handleLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
