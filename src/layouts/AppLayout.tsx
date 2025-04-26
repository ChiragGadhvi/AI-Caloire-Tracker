
import { Outlet } from "react-router-dom";
import Navigation from "../components/Navigation";

const AppLayout = () => {
  // Force dark mode
  if (!document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.add('dark');
  }

  return (
    <div className="min-h-screen bg-background dark:bg-[#1A1F2C]">
      <Navigation />
      <main className="container max-w-2xl mx-auto p-4 pb-20">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
