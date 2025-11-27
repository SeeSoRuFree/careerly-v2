export interface JobData {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  tags: string[];
  postedAt: string;
  deadline?: string;
  logoUrl?: string;
}

export interface JobWidgetConfig {
  category?: string;
  limit?: number;
}
