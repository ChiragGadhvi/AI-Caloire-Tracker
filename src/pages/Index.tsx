
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ImageCapture from '../components/ImageCapture';
import MealAnalysis from '../components/MealAnalysis';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Define the MealAnalysisData type locally
interface MealAnalysisData {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fats: number;
  healthScore: number;
  description?: string;
  image_url?: string;
}

const Index = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<MealAnalysisData | null>(null);
  const [mealHistory, setMealHistory] = useState<MealAnalysisData[]>([]);
  const [loading, setLoading] = useState(true);

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
      setMealHistory(data || []);
    } catch (error) {
      console.error('Error fetching meal history:', error);
      toast.error('Failed to load meal history');
    } finally {
      setLoading(false);
    }
  };

  const handleImageCapture = async (file: File) => {
    setAnalyzing(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result as string;
        
        // Call the analyze-meal function
        const { data, error } = await supabase.functions.invoke('analyze-meal', {
          body: { image: base64Image }
        });

        if (error) throw error;

        // Store analysis in database
        const { error: dbError } = await supabase
          .from('meal_analyses')
          .insert([{
            ...data,
            image_url: base64Image
          }]);

        if (dbError) throw dbError;

        setAnalysisData(data);
        // Refresh meal history after new analysis
        fetchMealHistory();
      };
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to analyze image");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen p-4 space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-center">Meal Snap AI</h1>
        <p className="text-muted-foreground">Analyze your meals with AI</p>
      </div>
      
      <ImageCapture onImageCapture={handleImageCapture} isLoading={analyzing} />
      
      {analyzing && (
        <div className="text-center py-4">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          <p className="text-muted-foreground mt-2">
            Analyzing your meal...
          </p>
        </div>
      )}
      
      {analysisData && !analyzing && (
        <div className="border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">Latest Analysis</h2>
          <MealAnalysis data={analysisData} />
        </div>
      )}

      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">Your Meal History</h2>
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            <p className="text-muted-foreground mt-2">Loading meal history...</p>
          </div>
        ) : mealHistory.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {mealHistory.map((meal) => (
              <MealAnalysis key={meal.name + meal.calories} data={meal} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No meal analyses yet. Take a picture or upload an image to get started!
          </p>
        )}
      </div>
    </div>
  );
};

export default Index;
