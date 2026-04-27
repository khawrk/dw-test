interface AuthLayoutProps {
  quote: string;
  children: React.ReactNode;
}

export default function AuthLayout({ quote, children }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <div className="auth-panel-left">
        <div className="auth-brand">
          <div className="auth-brand-dot" />
          BRAND
        </div>
        <div className="auth-quote">
          <h2>&quot;{quote}&quot;</h2>
          <p>
            Lorem ipsum dolor sit amet consectetur. Elit purus nam gravida
            porttitor nibh urna sit ornare a. Proin dolor morbi id ornare aenean
            non!
          </p>
        </div>
      </div>

      <div className="auth-panel-right">
        <div className="auth-form-container">{children}</div>
      </div>
    </div>
  );
}
