import './globals.css';

export const metadata = {
  title: "Chat-Bot",
  description: "Local ChatGPT-style Chat App with Ollama",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="h-screen bg-white">
        {children}
      </body>
    </html>
  );
}