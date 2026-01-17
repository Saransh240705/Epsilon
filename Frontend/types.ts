export enum ViewType {
  WORKFLOW_SELECTOR = "WORKFLOW_SELECTOR",
  COMPARISON = "COMPARISON",
  BRAND_COMPLIANCE = "BRAND_COMPLIANCE",
  LOGIN = "LOGIN",
}

export interface BrandAsset {
  type: string;
  name: string;
  value: string;
  matchPercentage?: number;
}

export interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendType?: "up" | "down";
  icon: string;
}

export interface Violation {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  suggestion?: string;
}
