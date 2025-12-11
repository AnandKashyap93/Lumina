export enum AppView {
  LANDING = 'LANDING',
  CALIBRATION = 'CALIBRATION',
  DASHBOARD = 'DASHBOARD'
}

export interface CalibrationData {
  mood: number;
  energy: number;
  description?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface MicroHabit {
  id: string;
  text: string;
  completed: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface HelpResult {
  title: string;
  uri: string;
}
