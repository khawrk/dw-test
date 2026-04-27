"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import { type Reservation, ROLE } from "@/types";

export default function UserHistoryPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const fetchReservations = useCallback(async () => {
    try {
      const res = await api.get("/reservations/my");
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
      <Sidebar role={ROLE.user} />

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
                <th>Concert name</th>
                <th>Total seats</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td>{formatDate(r.createdAt)}</td>
                  <td>{r.concert?.name ?? "-"}</td>
                  <td>{r.concert?.totalSeats?.toLocaleString() ?? "-"}</td>
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
