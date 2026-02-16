import "./globals.css";

export const metadata = {
  title: "ERP AI Assistant Demo",
  description: "AI assistant demo with analytics + drafting tools",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="appShell">
          <header className="topBar">
            <div className="brand">
              <div className="brandDot" />
              <div>
                <div className="brandTitle">ERP AI Assistant</div>
                <div className="brandSub">Analytics + Drafting • Gemini + Neon</div>
              </div>
            </div>
            <div className="topBarRight">Demo</div>
          </header>
          <main className="mainWrap">{children}</main>
        </div>
      </body>
    </html>
  );
}
