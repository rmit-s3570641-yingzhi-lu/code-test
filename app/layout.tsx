import NavBar from "@/components/NavBar"
import Providers from "@/components/Providers";

import "./globals.css";

export const metadata = {
  title: "Code Test",
  description: "Code Test",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}