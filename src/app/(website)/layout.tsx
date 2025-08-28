// File: app/(website)/layout.tsx
// Layout ini HANYA berlaku untuk halaman website utama.

import Header from "@/app/components/header";
import Footer from "@/app/components/footer";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-[132px]">{children}</main>
      <Footer />
    </div>
  );
}
