export interface User {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface Concert {
  id: string;
  name: string;
  description: string;
  totalSeats: number;
  reservedSeats: number;
}

export interface Reservation {
  id: string;
  status: "ACTIVE" | "CANCELLED";
  createdAt: string;
  concert: Concert;
  user?: {
    id: string;
    email: string;
  };
}
