
import { NavLink } from "react-router-dom";
import { Home, Camera, History } from "lucide-react";

const Navigation = () => {
  return (
    <>
      {/* Top Navigation */}
      <header className="py-4 bg-white shadow-sm">
        <div className="container max-w-2xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">
            <span className="bg-gradient-to-r from-[#9d4edd] to-[#c77dff] bg-clip-text text-transparent">
              Caloire Tracker
            </span>
          </h1>
        </div>
      </header>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-10">
        <div className="container max-w-2xl mx-auto flex justify-around">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `flex flex-col items-center py-3 px-6 ${isActive 
                ? 'text-[#9d4edd]' 
                : 'text-gray-500 hover:text-[#e0aaff]'}`
            }
            end
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </NavLink>
          
          <NavLink 
            to="/analyze" 
            className={({ isActive }) => 
              `flex flex-col items-center py-3 px-6 ${isActive 
                ? 'text-[#9d4edd]' 
                : 'text-gray-500 hover:text-[#e0aaff]'}`
            }
          >
            <Camera className="w-6 h-6" />
            <span className="text-xs mt-1">Analyze</span>
          </NavLink>
          
          <NavLink 
            to="/history" 
            className={({ isActive }) => 
              `flex flex-col items-center py-3 px-6 ${isActive 
                ? 'text-[#9d4edd]' 
                : 'text-gray-500 hover:text-[#e0aaff]'}`
            }
          >
            <History className="w-6 h-6" />
            <span className="text-xs mt-1">History</span>
          </NavLink>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
