export const metadata = { title: 'OWASP Next.js Lab' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 760, margin: '40px auto', padding: '0 16px', lineHeight: 1.5 }}>
        {children}
      </body>
    </html>
  );
}
