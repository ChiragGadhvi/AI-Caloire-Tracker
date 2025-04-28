import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Camera, History } from 'lucide-react';
const HomePage = () => {
  const navigate = useNavigate();
  return <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-fade-in">
      <div className="text-center mb-10">
        <div className="text-9xl mb-5">🥗</div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#9d4edd] to-[#c77dff] bg-clip-text text-transparent mb-4">AI Caloire Tracker</h1>
        <p className="text-muted-foreground dark:text-gray-300 max-w-md mx-auto">
          Snap a photo of your food to instantly analyze its nutritional content and keep track of your daily intake.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button onClick={() => navigate('/analyze')} className="h-14 flex-1 bg-gradient-to-r from-[#9d4edd] to-[#c77dff] hover:opacity-90 text-white">
          <Camera className="mr-2 h-5 w-5" />
          Analyze a Meal
        </Button>
        <Button onClick={() => navigate('/history')} variant="outline" className="h-14 flex-1 border-[#e0aaff] text-[#9d4edd] hover:bg-[#e0aaff]/10 dark:text-[#e0aaff] dark:border-[#9d4edd] dark:hover:bg-[#9d4edd]/10">
          <History className="mr-2 h-5 w-5" />
          View History
        </Button>
      </div>
    </div>;
};
export default HomePage;