
import "./globals.css";

export const metadata = {
  title: "Smart Bookmark Premium",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-[#0f172a] via-[#111827] to-black text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
