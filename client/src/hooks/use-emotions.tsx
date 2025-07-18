import { useQuery } from "@tanstack/react-query";
import type { MoodEntry } from "@shared/schema";

export function useEmotions() {
  const { data: moodEntries, isLoading, error } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood-entries"],
  });

  const latestMood = moodEntries?.[0];

  return {
    moodEntries,
    latestMood,
    isLoading,
    error,
  };
}
