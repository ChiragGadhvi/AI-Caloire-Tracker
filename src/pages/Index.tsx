
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ImageCapture from '../components/ImageCapture';
import MealAnalysis from '../components/MealAnalysis';
import { toast } from 'sonner';
import { Loader2, History, Camera } from 'lucide-react';
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
      
      setMealHistory(data || []);
    } catch (error) {
      console.error('Error fetching meal history:', error);
      toast.error('Failed to load meal history');
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const filename = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('meal-images')
      .upload(filename, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('meal-images')
      .getPublicUrl(filename);

    return publicUrl;
  };

  const handleImageCapture = (file: File) => {
    setSelectedImage(file);
    setAnalysisData(null);
  };

  const handleAnalyze = async (imageData: string) => {
    if (!imageData || !selectedImage) {
      toast.error('No image selected');
      return;
    }

    setAnalyzing(true);
    try {
      // Upload image to storage first
      const imageUrl = await uploadImage(selectedImage);
      
      // Display loading toast
      const loadingToast = toast.loading('Analyzing your meal...');
      
      const { data, error } = await supabase.functions.invoke('analyze-meal', {
        body: { image: imageData }
      });

      toast.dismiss(loadingToast);

      if (error) throw error;
      if (!data) throw new Error("No analysis data returned");

      // Store the analysis in the database
      const { data: savedAnalysis, error: dbError } = await supabase
        .from('meal_analyses')
        .insert([{
          ...data,
          image_url: imageUrl
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      setAnalysisData(savedAnalysis);
      await fetchMealHistory();
      toast.success('Meal analyzed successfully!');
      
      // Scroll to results
      setTimeout(() => {
        const resultsElement = document.getElementById('analysis-results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
    } catch (error) {
      console.error('Error analyzing meal:', error);
      toast.error('Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
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
        <div id="analysis-results" className="border-t pt-4 animate-fade-in">
          <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
          <MealAnalysis 
            data={analysisData} 
            onUpdate={handleMealUpdate}
          />
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
            {mealHistory.map((meal) => (
              <MealAnalysis 
                key={meal.id} 
                data={meal}
                onUpdate={handleMealUpdate}
              />
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
