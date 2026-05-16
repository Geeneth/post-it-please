import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Post It Please',
  description: 'Upload once. Post everywhere.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
