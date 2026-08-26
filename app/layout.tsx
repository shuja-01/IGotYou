import type { Metadata } from 'next';
import './globals.css';
import { ProfileProvider } from '@/context/ProfileContext';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'I Got You! — Smart Food Suitability & Health Advisor',
  description:
    'Instant evaluation of commercial food items tailored to your specific health conditions (Diabetes, Hypertension, Cholesterol, Lactose, Gout & Celiac).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('igotyou_theme_v1');
                  var theme = (saved === 'light' || saved === 'dark') ? saved : 'dark';
                  var root = document.documentElement;
                  if (theme === 'dark') {
                    root.classList.add('dark');
                    root.classList.remove('light');
                  } else {
                    root.classList.remove('dark');
                    root.classList.add('light');
                  }
                  root.style.colorScheme = theme;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950 transition-colors duration-200">
        <ThemeProvider>
          <ProfileProvider>{children}</ProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

