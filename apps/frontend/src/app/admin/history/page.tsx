"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import { Reservation, ROLE } from "@/types";

export default function AdminHistoryPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const fetchReservations = useCallback(async () => {
    try {
      const res = await api.get("/reservations/all");
      setReservations(res.data as Reservation[]);
    } catch {
      toast.error("Failed to load history");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchReservations();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchReservations]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="main-layout">
      <Sidebar role={ROLE.admin} />

      <main className="main-content">
        {reservations.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>
            No reservation history yet.
          </p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Date time</th>
                <th>Username</th>
                <th>Concert name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td>{formatDate(r.createdAt)}</td>
                  <td>{r.user?.email ?? "-"}</td>
                  <td>{r.concert?.name ?? "-"}</td>
                  <td>{r.status === "ACTIVE" ? "Reserve" : "Cancel"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
