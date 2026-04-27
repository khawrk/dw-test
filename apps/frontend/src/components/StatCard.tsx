interface StatCardProps {
  label: string;
  value: number;
  variant: "blue" | "teal" | "red";
  icon: React.ReactNode;
}

export default function StatCard({
  label,
  value,
  variant,
  icon,
}: StatCardProps) {
  return (
    <div className={`stat-card stat-${variant}`}>
      {icon}
      <span className="stat-card-label">{label}</span>
      <span className="stat-card-value">{value.toLocaleString()}</span>
    </div>
  );
}
