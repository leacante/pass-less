import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pass-Less | Gestor de Contraseñas Seguro',
  description: 'Almacena y gestiona tus contraseñas de forma segura con encriptación AES-256'
  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
