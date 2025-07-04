// Shared types
export interface Strategy {
  id: string;
  name: string;
  title: string;
  description: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  titleColor: string;
}

export interface IndexOption {
  value: string;
  label: string;
  maxStocks: number;
}

export interface TimeframeOption {
  value: string;
  label: string;
}

export interface SourceOption {
  value: string;
  label: string;
}

export type FormStep = number;

// Strategy-specific types
export * from './maModal';
export * from './hammerModal';
