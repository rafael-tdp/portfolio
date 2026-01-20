"use client";

import React from "react";
import { toast } from "sonner";
import * as api from "@/lib/api";
import { LuBrain } from "react-icons/lu";

interface ModelSelectorProps {
  onModelChange?: () => void;
}

export default function ModelSelector({ onModelChange }: ModelSelectorProps) {
  const [models, setModels] = React.useState<{
    available: string[];
    current: string;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [changing, setChanging] = React.useState(false);

  React.useEffect(() => {
    const loadModels = async () => {
      try {
        const data = await api.getAvailableModels();
        if (data) {
          setModels(data);
        }
      } catch (err) {
        console.error("Failed to load models", err);
      } finally {
        setLoading(false);
      }
    };
    loadModels();
  }, []);

  const handleModelChange = async (newModel: string) => {
    if (newModel === models?.current) return;

    setChanging(true);
    try {
      const result = await api.setGeminiModel(newModel);
      if (result) {
        setModels({ ...models!, current: newModel });
        toast.success(`Modèle changé vers ${newModel}`);
        onModelChange?.();
      } else {
        toast.error("Erreur lors du changement de modèle");
      }
    } catch (err) {
      console.error("Failed to change model", err);
      toast.error("Erreur lors du changement de modèle");
    } finally {
      setChanging(false);
    }
  };

  if (loading || !models) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
          <LuBrain className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
            Modèle Gemini
          </h3>
          <p className="text-xs text-gray-500">
            Sélectionnez le modèle IA à utiliser
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {models.available.map((model) => (
          <button
            key={model}
            onClick={() => handleModelChange(model)}
            disabled={changing}
            className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
              models.current === model
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
            } ${changing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {model}
            {models.current === model && (
              <span className="ml-2 text-xs">✓ Actif</span>
            )}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Changez de modèle si vous avez atteint la limite de quota. Les modèles
        plus récents (gemini-2.5, gemini-2.0) sont plus performants mais
        utilisent plus de quota.
      </p>
    </div>
  );
}
