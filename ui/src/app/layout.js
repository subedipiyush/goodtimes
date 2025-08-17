import { Inter } from 'next/font/google'; // Next.js font optimization
import './global.css'; // Global Tailwind CSS directives

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Good Times',
  description: 'Your personalized dose of positive news.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 flex items-center justify-center min-h-screen p-4`}>
        {children}
      </body>
    </html>
  );
}
