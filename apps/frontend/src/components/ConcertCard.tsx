import { User, Trash2 } from "lucide-react";
import { ROLE, type Concert, type Role } from "@/types";

interface ConcertCardProps {
  concert: Concert;
  role: Role;
  isReserved?: boolean;
  onDelete?: (concert: Concert) => void;
  onReserve?: (concertId: string) => void;
  onCancel?: (concertId: string) => void;
}

export default function ConcertCard({
  concert,
  role,
  isReserved,
  onDelete,
  onReserve,
  onCancel,
}: ConcertCardProps) {
  return (
    <div className="concert-card">
      <h3 className="concert-card-title">{concert.name}</h3>
      <hr className="concert-card-divider" />
      <p className="concert-card-description">{concert.description}</p>
      <div className="concert-card-footer">
        <span className="concert-card-seats">
          <User size={16} />
          {concert.totalSeats.toLocaleString()}
        </span>

        {role === ROLE.admin && (
          <button
            type="button"
            className="btn btn-red btn-sm"
            onClick={() => onDelete?.(concert)}
          >
            <Trash2 size={14} />
            Delete
          </button>
        )}

        {role === ROLE.user &&
          (isReserved ? (
            <button
              type="button"
              className="btn btn-red btn-sm"
              onClick={() => onCancel?.(concert.id)}
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ width: "auto" }}
              onClick={() => onReserve?.(concert.id)}
            >
              Reserve
            </button>
          ))}
      </div>
    </div>
  );
}
