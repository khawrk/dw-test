"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Users } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import ConcertCard from "@/components/ConcertCard";
import DeleteModal from "@/components/DeleteModal";
import { ROLE, type Concert, type Reservation } from "@/types";

export default function AdminHomePage() {
  const [tab, setTab] = useState<"overview" | "create">("overview");
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Concert | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    totalSeats: "",
  });

  const fetchData = useCallback(async () => {
    try {
      const [concertsRes, reservationsRes] = await Promise.all([
        api.get("/concerts"),
        api.get("/reservations/all"),
      ]);
      setConcerts(concertsRes.data as Concert[]);
      setReservations(reservationsRes.data as Reservation[]);
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/concerts", {
        name: form.name,
        description: form.description,
        totalSeats: +form.totalSeats,
      });
      toast.success("Create successfully");
      setForm({ name: "", description: "", totalSeats: "" });
      setTab("overview");
      void fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message ?? "Failed to create concert");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/concerts/${deleteTarget.id}`);
      toast.success("Delete successfully");
      setDeleteTarget(null);
      void fetchData();
    } catch {
      toast.error("Failed to delete concert");
    }
  };

  // Stat calculations
  const totalSeats = concerts.reduce((sum, c) => sum + c.totalSeats, 0);
  const totalReserved = reservations.filter(
    (r) => r.status === "ACTIVE",
  ).length;
  const totalCancelled = reservations.filter(
    (r) => r.status === "CANCELLED",
  ).length;

  return (
    <div className="main-layout">
      <Sidebar role={ROLE.admin} />

      <main className="main-content">
        {/* Stat Cards */}
        <div className="stat-cards">
          <StatCard
            label="Total of seats"
            value={totalSeats}
            variant="blue"
            icon={<Users size={28} />}
          />
          <StatCard
            label="Reserve"
            value={totalReserved}
            variant="teal"
            icon={
              <svg
                width="28"
                height="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <title>Reserve icon</title>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            }
          />
          <StatCard
            label="Cancel"
            value={totalCancelled}
            variant="red"
            icon={
              <svg
                width="28"
                height="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <title>Cancel icon</title>
                <circle cx="12" cy="12" r="9" />
                <path d="M15 9l-6 6M9 9l6 6" />
              </svg>
            }
          />
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            type="button"
            className={`tab ${tab === "overview" ? "active" : ""}`}
            onClick={() => setTab("overview")}
          >
            Overview
          </button>
          <button
            type="button"
            className={`tab ${tab === "create" ? "active" : ""}`}
            onClick={() => setTab("create")}
          >
            Create
          </button>
        </div>

        {/* Overview Tab */}
        {tab === "overview" && (
          <div>
            {concerts.length === 0 ? (
              <p style={{ color: "var(--text-secondary)" }}>
                No concerts yet. Create one first.
              </p>
            ) : (
              concerts.map((concert) => (
                <ConcertCard
                  key={concert.id}
                  concert={concert}
                  role={ROLE.admin}
                  onDelete={setDeleteTarget}
                />
              ))
            )}
          </div>
        )}

        {/* Create Tab */}
        {tab === "create" && (
          <div className="create-form-card">
            <h2 className="create-form-title">Create</h2>
            <hr className="create-form-divider" />

            <form onSubmit={handleCreate}>
              <div className="create-form-row">
                <div className="form-group">
                  <label htmlFor="concertName">Concert Name</label>
                  <input
                    name="concertName"
                    className="create-form-input"
                    placeholder="Please input concert name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="totalSeat">Total of seat</label>
                  <input
                    name="totalSeat"
                    className="create-form-input"
                    type="number"
                    placeholder="500"
                    min={1}
                    value={form.totalSeats}
                    onChange={(e) =>
                      setForm({ ...form, totalSeats: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  name="description"
                  className="create-form-textarea"
                  placeholder="Please input description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="create-form-footer">
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "auto" }}
                  disabled={loading}
                >
                  <Save size={16} />
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal
          concertName={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
