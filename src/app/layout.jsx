import "./globals.css";

export const metadata = {
  title: "Live Chat",
  description: "Simple live chat",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
