import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
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

  return (
    <Card className="overflow-hidden">
      {data.image_url && (
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={data.image_url} 
            alt={data.name} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold">{data.name}</h3>
        
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="min-h-[100px]"
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
            <div className="relative group">
              <p className="text-sm text-muted-foreground pr-8">{data.description}</p>
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

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-500/10">
              <Flame className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Calories</p>
              <p className="font-medium text-sm">{data.calories}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-yellow-500/10">
              <Wheat className="w-4 h-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Carbs</p>
              <p className="font-medium text-sm">{data.carbs}g</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10">
              <div className="w-4 h-4 text-blue-500 font-medium flex items-center justify-center text-sm">P</div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Protein</p>
              <p className="font-medium text-sm">{data.protein}g</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10">
              <Droplet className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fats</p>
              <p className="font-medium text-sm">{data.fats}g</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-500/10">
                <Heart className="w-4 h-4 text-red-500" />
              </div>
              <span className="text-xs text-muted-foreground">Health score</span>
            </div>
            <span className="font-medium text-sm">{data.healthScore}/10</span>
          </div>
          <Progress 
            value={data.healthScore * 10} 
            className={cn(
              "h-1.5",
              data.healthScore >= 7 ? "bg-emerald-950 [&>div]:bg-emerald-500" :
              data.healthScore >= 4 ? "bg-yellow-950 [&>div]:bg-yellow-500" :
              "bg-red-950 [&>div]:bg-red-500"
            )}
          />
        </div>

        {data.created_at && (
          <p className="text-xs text-muted-foreground mt-4">
            {new Date(data.created_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </Card>
  );
};

export default MealAnalysis;
