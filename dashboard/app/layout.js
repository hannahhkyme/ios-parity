import "./globals.css";

export const metadata = { title: "Parity Studio", description: "Generated iOS + Android customer apps with component-by-component parity proof" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
