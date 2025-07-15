import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privy Auth Demo",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main>{children}</main>
    </>
  );
}
