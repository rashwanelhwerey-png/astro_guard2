import "./globals.css";

/**
 * AstroGuard root layout.
 * The space backdrop is mounted once here so every surface (landing + dashboard)
 * shares the same fixed, cover-positioned astronaut image.
 */
export const metadata = {
  title: "AstroGuard // Bio-Neural Space OS",
  description:
    "Mission secure access and dual-view orbital operations console — Astronaut HUD and NASA Ground Control.",
  applicationName: "AstroGuard",
};

export const viewport = {
  themeColor: "#060B19",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Progressive-enhancement display faces; app is fully styled without them. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
