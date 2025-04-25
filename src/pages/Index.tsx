
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ImageCapture from '../components/ImageCapture';
import MealAnalysis from '../components/MealAnalysis';
import { toast } from 'sonner';
import { Loader2, History, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MealAnalysisData } from '@/types/meal';

const Index = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
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
      
      const transformedData: MealAnalysisData[] = data?.map(item => ({
        ...item,
        healthScore: item.health_score,
      })) || [];
      
      setMealHistory(transformedData);
    } catch (error) {
      console.error('Error fetching meal history:', error);
      toast.error('Failed to load meal history');
    } finally {
      setLoading(false);
    }
  };

  const handleImageCapture = (file: File) => {
    setSelectedImage(file);
    setAnalysisData(null);
  };

  const handleAnalyze = async (imageData: string) => {
    if (!imageData) {
      toast.error('No image selected');
      return;
    }

    setAnalyzing(true);
    try {
      console.log("Sending image for analysis...");
      const { data, error } = await supabase.functions.invoke('analyze-meal', {
        body: { image: imageData }
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }

      console.log("Analysis data received:", data);

      if (!data) {
        throw new Error("No analysis data returned");
      }

      const transformedData = {
        ...data,
        healthScore: data.health_score || data.healthScore,
      };

      // Store the analysis in the database
      const { error: dbError } = await supabase
        .from('meal_analyses')
        .insert([{
          ...data,
          health_score: data.health_score || data.healthScore,
          image_url: imageData
        }]);

      if (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }

      setAnalysisData(transformedData);
      fetchMealHistory();
      toast.success('Meal analyzed successfully!');
    } catch (error) {
      console.error('Error analyzing meal:', error);
      toast.error('Failed to analyze image');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen p-4 space-y-6 max-w-xl mx-auto">
      <div className="text-center space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold">Meal Snap AI</h1>
        <p className="text-muted-foreground">Analyze your meals with AI</p>
      </div>
      
      <ImageCapture 
        onImageCapture={handleImageCapture} 
        onAnalyze={handleAnalyze}
        isLoading={analyzing} 
      />
      
      {analysisData && !analyzing && (
        <div className="border-t pt-4">
          <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
          <MealAnalysis data={analysisData} />
        </div>
      )}

      {/* Meal History Section */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Meal History</h2>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-4">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            <p className="text-muted-foreground mt-2">Loading meal history...</p>
          </div>
        ) : mealHistory.length > 0 ? (
          <div className="grid gap-4">
            {mealHistory.map((meal, index) => (
              <MealAnalysis key={meal.id || index} data={meal} />
            ))}
          </div>
        ) : (
          <div className="text-center border rounded-lg p-8 bg-muted/20">
            <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              No meal analyses yet. Take a picture or upload an image to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
