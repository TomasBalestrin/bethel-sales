export interface Question {
  id: number;
  text: string;
  options: string[];
}

export interface ArchetypeResult {
  primary: {
    name: string;
    emoji: string;
    description: string;
  };
  secondary: {
    name: string;
    emoji: string;
    description: string;
  };
  combined_insight: string;
}

export interface OpenAnswers {
  biggest_challenge: string;
  desired_change: string;
}

export type ScreenType = 'welcome' | 'questions' | 'open' | 'loading' | 'result' | 'error';
