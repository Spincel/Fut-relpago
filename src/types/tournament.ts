export type GradeYear = 1 | 2 | 3;

export type PlayerPosition = 'Portero' | 'Defensa' | 'Medio' | 'Delantero';

export type DocumentStatus = 'pending' | 'approved' | 'rejected';

export interface PlayerDocument {
  id?: string;
  name?: string;
  type?: 'credencial' | 'constancia' | 'boleta' | 'responsiva';
  fileUrl?: string;
  status: DocumentStatus;
  rejectionReason?: string;
  uploadedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface Player {
  id: string;
  fullName: string;
  grade: GradeYear;
  studentIdOrCurp?: string;
  position?: PlayerPosition;
  jerseyNumber?: number;
  document?: PlayerDocument;
  isActive: boolean;
  deactivationReason?: string;
}

export interface CaptainContact {
  fullName: string;
  phone: string;
  email?: string;
  groupOrClass?: string;
}

export type TeamStatus = 'approved' | 'in_review' | 'irregular' | 'disqualified';

export interface Team {
  id: string;
  folio: string;
  name: string;
  uniformColor: string;
  captain: CaptainContact;
  players: Player[];
  status: TeamStatus;
  disqualificationReason?: string;
  createdAt: string;
  updatedAt: string;
  registeredBy: 'public_portal' | 'admin_desk';
  notes?: string;
}

export interface TournamentRulesCheck {
  totalPlayers: number;
  grade3Count: number;
  grade2Count: number;
  grade1Count: number;
  isTotalCountValid: boolean;
  isGradeDistributionValid: boolean;
  areAllDocumentsApproved: boolean;
  pendingDocumentsCount: number;
  rejectedDocumentsCount: number;
  isFullyCompliant: boolean;
  issues: string[];
}

export interface TournamentMatch {
  id: string;
  matchNumber: number;
  round: string;
  groupName?: string;
  teamAId: string;
  teamBId: string;
  scoreA?: number;
  scoreB?: number;
  timeSlot: string;
  pitch?: string;
  status: 'programado' | 'en_curso' | 'finalizado';
  winnerTeamId?: string;
}
