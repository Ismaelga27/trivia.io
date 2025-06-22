export interface Player {
  name: string;
  score: number;
  avatarId: string; // Emoji or ID for an image
}

export interface QuestionData {
  questionText: string;
  options: string[];
  correctAnswer: string;
  id: string;
}

export interface GeminiQuestionFormat {
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export enum GamePhase {
  SETUP = 'setup',
  LOADING_QUESTIONS = 'loading_questions',
  PLAYING = 'playing',
  SHOWING_ANSWER = 'showing_answer',
  RESULTS = 'results',
}

export enum Difficulty {
  EASY = 'Fácil',
  MEDIUM = 'Medio',
  HARD = 'Difícil',
}

export interface GameSettings {
  topics: string[]; // Cambiado de topic: string a topics: string[]
  numPlayers: number;
  numRounds: number; // Rounds per player
  difficulty: Difficulty;
}

export interface PlayerSetupData {
  name: string;
  avatarId: string;
}