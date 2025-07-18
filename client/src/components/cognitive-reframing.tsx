import { Lightbulb, Edit, ArrowDown, CloudRain, Sun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CognitiveReframe } from "@shared/schema";

export default function CognitiveReframing() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [negativeThought, setNegativeThought] = useState("");
  const [balancedThought, setBalancedThought] = useState("");
  const [situation, setSituation] = useState("");
  const [emotionBefore, setEmotionBefore] = useState("");
  const [emotionAfter, setEmotionAfter] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: reframes } = useQuery<CognitiveReframe[]>({
    queryKey: ["/api/cognitive-reframes"],
  });

  const createReframeMutation = useMutation({
    mutationFn: async (reframeData: any) => {
      const response = await apiRequest("POST", "/api/cognitive-reframes", reframeData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cognitive-reframes"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Reestructuración guardada",
        description: "Tu nuevo patrón de pensamiento ha sido registrado",
      });
    },
  });

  const resetForm = () => {
    setNegativeThought("");
    setBalancedThought("");
    setSituation("");
    setEmotionBefore("");
    setEmotionAfter("");
  };

  const handleCreateReframe = () => {
    if (!negativeThought.trim() || !balancedThought.trim()) return;

    createReframeMutation.mutate({
      negativeThought,
      balancedThought,
      situation,
      emotionBefore,
      emotionAfter,
    });
  };

  const latestReframe = reframes?.[0];

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <span>Reestructuración Cognitiva</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {latestReframe ? (
          <>
            <div className="bg-error-light rounded-lg p-4">
              <h3 className="font-medium text-destructive mb-2 text-sm flex items-center">
                <CloudRain className="h-4 w-4 mr-1" />
                Pensamiento Negativo
              </h3>
              <p className="text-sm text-gray-700 italic">
                "{latestReframe.negativeThought}"
              </p>
              {latestReframe.emotionBefore && (
                <p className="text-xs text-destructive mt-1">
                  Emoción: {latestReframe.emotionBefore}
                </p>
              )}
            </div>
            
            <div className="flex justify-center">
              <ArrowDown className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="bg-success-light rounded-lg p-4">
              <h3 className="font-medium text-secondary mb-2 text-sm flex items-center">
                <Sun className="h-4 w-4 mr-1" />
                Pensamiento Equilibrado
              </h3>
              <p className="text-sm text-gray-700">
                "{latestReframe.balancedThought}"
              </p>
              {latestReframe.emotionAfter && (
                <p className="text-xs text-secondary mt-1">
                  Nueva emoción: {latestReframe.emotionAfter}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 mb-4">
              Crea tu primera reestructuración cognitiva
            </p>
          </div>
        )}
        
        <div className="pt-4 border-t border-gray-200">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-primary text-white hover:bg-blue-600">
                <Edit className="h-4 w-4 mr-2" />
                Crear nueva reestructuración
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nueva Reestructuración Cognitiva</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="negative-thought">Pensamiento Negativo</Label>
                  <Textarea
                    id="negative-thought"
                    placeholder="Ej: Nunca termino nada a tiempo"
                    value={negativeThought}
                    onChange={(e) => setNegativeThought(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="emotion-before">¿Cómo te hace sentir?</Label>
                  <Input
                    id="emotion-before"
                    placeholder="Ej: Frustrado, ansioso"
                    value={emotionBefore}
                    onChange={(e) => setEmotionBefore(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="balanced-thought">Pensamiento Equilibrado</Label>
                  <Textarea
                    id="balanced-thought"
                    placeholder="Ej: A veces me toma más tiempo, pero he completado muchas tareas exitosamente"
                    value={balancedThought}
                    onChange={(e) => setBalancedThought(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="emotion-after">¿Cómo te sientes ahora?</Label>
                  <Input
                    id="emotion-after"
                    placeholder="Ej: Más calmado, esperanzado"
                    value={emotionAfter}
                    onChange={(e) => setEmotionAfter(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="situation">Situación (opcional)</Label>
                  <Input
                    id="situation"
                    placeholder="¿Cuándo surge este pensamiento?"
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                  />
                </div>
                
                <Button
                  onClick={handleCreateReframe}
                  disabled={!negativeThought.trim() || !balancedThought.trim()}
                  className="w-full"
                >
                  Guardar Reestructuración
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
