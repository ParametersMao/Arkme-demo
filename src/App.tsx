import { useState } from "react";
import AdminMessageConsole from "@/pages/AdminMessageConsole";
import Home from "@/pages/Home";
import { PreferencesProvider } from "@/settings/preferences";

export type PageType = "records" | "arrangements" | "insight" | "mine";

function getInitialPage(): PageType {
  if (typeof window === "undefined") return "records";

  const page = new URLSearchParams(window.location.search).get("page");
  if (
    page === "records" ||
    page === "arrangements" ||
    page === "insight" ||
    page === "mine"
  ) {
    return page;
  }

  return "records";
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>(getInitialPage);
  const isAdminConsole =
    typeof window !== "undefined" && window.location.pathname === "/sendtest";

  return (
    <PreferencesProvider>
      {isAdminConsole ? (
        <AdminMessageConsole />
      ) : (
        <Home currentPage={currentPage} onNavigate={setCurrentPage} />
      )}
    </PreferencesProvider>
  );
}
