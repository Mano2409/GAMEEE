export type Evidence = {
  id: string; title: string; source: string; timestamp?: string; location: string;
  content: string; metadata: Record<string, string>;
}
export type Puzzle = { id: string; title: string; question: string; label: string; requires: string[] }
export type Session = {
  id: string; team: string; round: number; startTime: number; deadline: number;
  discoveredEvidence: Evidence[]; completedPuzzles: string[]; unlockedObjects: string[];
  attempts: number; puzzleAttempts: number; hints: string[]; completed: boolean;
  completedAt: number | null; status: 'active' | 'expired' | 'locked' | 'complete';
  serverNow: number; puzzles: Puzzle[]; accessCode?: string;
}
export type Panel = null | 'evidence' | 'terminal' | 'cctv' | 'cabinet' | 'report' | 'hints' | 'pause' | 'inspect'
export type Interaction = {
  id: string; type: 'inspect' | 'terminal' | 'open' | 'submit'; interactionText: string;
  requirements: string[]; evidenceId?: string; panel?: Panel;
  position: [number, number, number]; size: [number, number, number];
}
export interface GameBackend {
  create(team: string): Promise<Session>;
  resume(): Promise<Session>;
  inspect(id: string): Promise<Session>;
  solve(id: string, answer: string): Promise<Session>;
  hint(): Promise<Session>;
  submit(answers: Record<string, string>): Promise<Session>;
}
