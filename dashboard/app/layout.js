import "./globals.css";

export const metadata = { title: "Parity Studio", description: "Generated iOS + Android customer apps with component-by-component parity proof", appleWebApp: { title: "Parity Studio", capable: true } };
export const viewport = { themeColor: "#1c1b1f" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" />
      </head>
      <body>
        <header className="topnav">
          <a href="/" className="logo"><span>P</span>Parity Studio</a>
          <span className="tag">Internal</span>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
