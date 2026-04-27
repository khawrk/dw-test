"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import ConcertCard from "@/components/ConcertCard";
import { type Concert, type Reservation, ROLE } from "@/types";

export default function UserHomePage() {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [concertsRes, reservationsRes] = await Promise.all([
        api.get("/concerts"),
        api.get("/reservations/my"),
      ]);
      setConcerts(concertsRes.data as Concert[]);
      setMyReservations(reservationsRes.data as Reservation[]);
    } catch {
      toast.error("Failed to load data");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleReserve = async (concertId: string) => {
    try {
      await api.post("/reservations", { concertId });
      toast.success("Reserved successfully");
      void fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message ?? "Failed to reserve");
    }
  };

  const handleCancel = async (concertId: string) => {
    const reservation = myReservations.find(
      (r) => r.concert.id === concertId && r.status === "ACTIVE",
    );
    if (!reservation) return;

    try {
      await api.delete(`/reservations/${reservation.id}`);
      toast.success("Cancelled successfully");
      void fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message ?? "Failed to cancel");
    }
  };

  const isReserved = (concertId: string) =>
    myReservations.some(
      (r) => r.concert.id === concertId && r.status === "ACTIVE",
    );

  return (
    <div className="main-layout">
      <Sidebar role={ROLE.user} />

      <main className="main-content">
        {concerts.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>
            No concerts available.
          </p>
        ) : (
          concerts.map((concert) => (
            <ConcertCard
              key={concert.id}
              concert={concert}
              role={ROLE.user}
              isReserved={isReserved(concert.id)}
              onReserve={handleReserve}
              onCancel={handleCancel}
            />
          ))
        )}
      </main>
    </div>
  );
}
