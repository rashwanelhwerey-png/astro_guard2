export const metadata = {
  title: "Mission Surface · AstroGuard",
};

/**
 * The dashboard is fully client-driven (session gate + telemetry poll), so this
 * layout only contributes metadata.
 */
export default function DashboardLayout({ children }) {
  return children;
}
