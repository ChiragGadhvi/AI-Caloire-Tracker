
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import MealAnalysis from '../components/MealAnalysis';
import { toast } from 'sonner';
import { Loader2, History, Camera } from 'lucide-react';
import { MealAnalysisData } from '@/types/meal';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HistoryPage = () => {
  const [mealHistory, setMealHistory] = useState<MealAnalysisData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMealHistory();
  }, []);

  const fetchMealHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData: MealAnalysisData[] = data?.map(item => ({
        id: item.id,
        name: item.name,
        calories: item.calories,
        carbs: item.carbs,
        protein: item.protein,
        fats: item.fats,
        healthScore: item.health_score,
        description: item.description || '',
        image_url: item.image_url,
        created_at: item.created_at
      })) || [];
      
      setMealHistory(transformedData);
    } catch (error) {
      console.error('Error fetching meal history:', error);
      toast.error('Failed to load meal history');
    } finally {
      setLoading(false);
    }
  };

  const handleMealUpdate = (updatedMeal: MealAnalysisData) => {
    setMealHistory(prevHistory =>
      prevHistory.map(meal =>
        meal.id === updatedMeal.id ? updatedMeal : meal
      )
    );
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Meal History</h2>
          <p className="text-muted-foreground dark:text-gray-300 text-sm">Track your nutritional intake over time</p>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#9d4edd]" />
          <p className="text-muted-foreground dark:text-gray-300 mt-4">Loading your meal history...</p>
        </div>
      ) : mealHistory.length > 0 ? (
        <div className="grid gap-6">
          {mealHistory.map((meal) => (
            <MealAnalysis 
              key={meal.id} 
              data={meal}
              onUpdate={handleMealUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-xl border dark:border-gray-700 bg-gradient-to-br from-purple-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900">
          <Camera className="w-14 h-14 mx-auto text-[#9d4edd] dark:text-[#e0aaff] mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">No meal history yet</h3>
          <p className="text-muted-foreground dark:text-gray-400 mb-6 max-w-md mx-auto">
            You haven't analyzed any meals yet. Take a picture or upload an image to get started!
          </p>
          <Button 
            onClick={() => navigate('/analyze')}
            className="bg-gradient-to-r from-[#9d4edd] to-[#c77dff] hover:opacity-90 text-white"
          >
            <Camera className="w-4 h-4 mr-2" /> 
            Analyze a Meal
          </Button>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
