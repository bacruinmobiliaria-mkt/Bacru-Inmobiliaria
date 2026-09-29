// Admin pages are isolated from the site Header/Footer via SiteWrapper in root layout
// This layout just passes children through
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
