export const metadata = {
  title: 'SantiagoWays API',
  description: 'Backend for the SantiagoWays Camino de Santiago app.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
