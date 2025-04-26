
import { Outlet } from "react-router-dom";
import Navigation from "../components/Navigation";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-[#f8f7ff]">
      <Navigation />
      <main className="container max-w-2xl mx-auto p-4 pb-20">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
