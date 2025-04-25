
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ImageCapture from '../components/ImageCapture';
import MealAnalysis from '../components/MealAnalysis';
import { toast } from 'sonner';
import { Loader2, History } from 'lucide-react';
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
      
      // Transform the data to match our MealAnalysisData interface
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
    setAnalysisData(null); // Reset previous analysis
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.error('Please select or capture an image first');
      return;
    }

    setAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      reader.onload = async () => {
        const base64Image = reader.result as string;
        
        const { data, error } = await supabase.functions.invoke('analyze-meal', {
          body: { image: base64Image }
        });

        if (error) throw error;

        // Transform health_score to healthScore for consistency
        const transformedData = {
          ...data,
          healthScore: data.health_score,
        };

        const { error: dbError } = await supabase
          .from('meal_analyses')
          .insert([{
            ...transformedData,
            health_score: transformedData.healthScore,
            image_url: base64Image
          }]);

        if (dbError) throw dbError;

        setAnalysisData(transformedData);
        fetchMealHistory();
        toast.success('Meal analyzed successfully!');
      };
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to analyze image');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen p-4 space-y-6 max-w-xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">Meal Snap AI</h1>
        <p className="text-muted-foreground">Analyze your meals with AI</p>
      </div>
      
      <ImageCapture 
        onImageCapture={handleImageCapture} 
        isLoading={analyzing} 
      />
      
      {selectedImage && !analyzing && !analysisData && (
        <div className="flex justify-center">
          <Button 
            onClick={handleAnalyze} 
            className="w-full max-w-sm"
            size="lg"
          >
            Analyze Meal
          </Button>
        </div>
      )}
      
      {analyzing && (
        <div className="text-center py-4">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          <p className="text-muted-foreground mt-2">
            Analyzing your meal...
          </p>
        </div>
      )}
      
      {analysisData && !analyzing && (
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
          <MealAnalysis data={analysisData} />
        </div>
      )}

      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Meal History</h2>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
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
          <p className="text-center text-muted-foreground py-8">
            No meal analyses yet. Take a picture or upload an image to get started!
          </p>
        )}
      </div>
    </div>
  );
};

export default Index;
