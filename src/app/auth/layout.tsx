export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="paper-grid min-h-screen bg-paper p-4 md:p-6">
      {children}
    </main>
  );
}
