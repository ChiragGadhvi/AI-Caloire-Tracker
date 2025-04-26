
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Wheat, Droplet, Heart, Check, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import { MealAnalysisData } from '@/types/meal';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MealAnalysisProps {
  data: MealAnalysisData;
  onUpdate?: (updatedData: MealAnalysisData) => void;
}

const MealAnalysis = ({ data, onUpdate }: MealAnalysisProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(data.description || '');

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('meal_analyses')
        .update({ description: editedDescription })
        .eq('id', data.id);

      if (error) throw error;

      setIsEditing(false);
      if (onUpdate) {
        onUpdate({ ...data, description: editedDescription });
      }
      toast.success('Description updated successfully');
    } catch (error) {
      console.error('Error updating description:', error);
      toast.error('Failed to update description');
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 7) return 'text-emerald-500';
    if (score >= 4) return 'text-amber-500';
    return 'text-red-500';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="overflow-hidden shadow-sm bg-white border-gray-100">
      {data.image_url && (
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={data.image_url} 
            alt={data.name} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardContent className="p-5">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{data.name}</h3>
          {data.created_at && (
            <p className="text-xs text-muted-foreground">{formatDate(data.created_at)}</p>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-2 mb-4">
            <Textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="min-h-[100px] resize-none"
              placeholder="Enter meal description..."
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                <Check className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setEditedDescription(data.description || '');
                }}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          data.description && (
            <div className="relative group mb-4">
              <p className="text-sm text-gray-600 pr-8 leading-relaxed">{data.description}</p>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            </div>
          )
        )}

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="p-1.5 rounded-lg bg-red-500/10 mr-2">
                <Heart className={cn("w-4 h-4", getHealthScoreColor(data.healthScore))} />
              </div>
              <span className="text-sm font-medium">Health score</span>
            </div>
            <span className={cn("font-bold text-lg", getHealthScoreColor(data.healthScore))}>
              {data.healthScore}/10
            </span>
          </div>
          <Progress 
            value={data.healthScore * 10} 
            className={cn(
              "h-2 rounded-full",
              data.healthScore >= 7 ? "bg-emerald-100 [&>div]:bg-emerald-500" :
              data.healthScore >= 4 ? "bg-amber-100 [&>div]:bg-amber-500" :
              "bg-red-100 [&>div]:bg-red-500"
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-red-50 to-orange-50">
            <div className="p-2 rounded-full bg-red-500/10">
              <Flame className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Calories</p>
              <p className="font-bold text-lg text-gray-800">{data.calories}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50">
            <div className="p-2 rounded-full bg-amber-500/10">
              <Wheat className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Carbs</p>
              <p className="font-bold text-lg text-gray-800">{data.carbs}g</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="p-2 rounded-full bg-blue-500/10">
              <div className="w-5 h-5 text-blue-500 font-semibold flex items-center justify-center text-base">P</div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Protein</p>
              <p className="font-bold text-lg text-gray-800">{data.protein}g</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50">
            <div className="p-2 rounded-full bg-purple-500/10">
              <Droplet className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Fats</p>
              <p className="font-bold text-lg text-gray-800">{data.fats}g</p>
            </div>
          </div>
        </div>
        
        {!data.description && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-4 text-blue-500 hover:text-blue-600"
            onClick={() => setIsEditing(true)}
          >
            + Add notes
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MealAnalysis;
