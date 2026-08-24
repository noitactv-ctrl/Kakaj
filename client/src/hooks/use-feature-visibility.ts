import { useQuery } from "@tanstack/react-query";

export type FeatureVisibility = {
  reseller: boolean;
  ranks: boolean;
  logs: boolean;
  cards: boolean;
};

const defaultFeatures: FeatureVisibility = {
  reseller: true,
  ranks: true,
  logs: true,
  cards: true,
};

export function useFeatureVisibility() {
  const query = useQuery<FeatureVisibility>({
    queryKey: ["/api/settings/features"],
  });

  return {
    ...query,
    features: { ...defaultFeatures, ...query.data },
  };
}