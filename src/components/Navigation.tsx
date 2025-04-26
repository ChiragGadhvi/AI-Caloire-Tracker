
import { NavLink } from "react-router-dom";
import { Home, Camera, History } from "lucide-react";

const Navigation = () => {
  return (
    <>
      {/* Top Navigation */}
      <header className="py-4 bg-white shadow-sm">
        <div className="container max-w-2xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
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
                ? 'text-blue-500' 
                : 'text-gray-500 hover:text-blue-400'}`
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
                ? 'text-blue-500' 
                : 'text-gray-500 hover:text-blue-400'}`
            }
          >
            <Camera className="w-6 h-6" />
            <span className="text-xs mt-1">Analyze</span>
          </NavLink>
          
          <NavLink 
            to="/history" 
            className={({ isActive }) => 
              `flex flex-col items-center py-3 px-6 ${isActive 
                ? 'text-blue-500' 
                : 'text-gray-500 hover:text-blue-400'}`
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
