import '../dashboard.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* layout khusus untuk dashboard */}
      {children}
    </div>
  );
}
