import { Team, TournamentRulesCheck, Player } from '../types/tournament';

export const REQUIRED_TOTAL_PLAYERS = 6;
export const REQUIRED_PER_GRADE = {
  3: 2, // 2 jugadores de 3er año
  2: 2, // 2 jugadores de 2do año
  1: 2, // 2 jugadores de 1er año
} as const;

export function evaluateTeamRules(team: Team): TournamentRulesCheck {
  const activePlayers = team.players.filter((p) => p.isActive);

  const grade3Count = activePlayers.filter((p) => p.grade === 3).length;
  const grade2Count = activePlayers.filter((p) => p.grade === 2).length;
  const grade1Count = activePlayers.filter((p) => p.grade === 1).length;

  const totalPlayers = activePlayers.length;
  const isTotalCountValid = totalPlayers === REQUIRED_TOTAL_PLAYERS;
  const isGradeDistributionValid =
    grade3Count === REQUIRED_PER_GRADE[3] &&
    grade2Count === REQUIRED_PER_GRADE[2] &&
    grade1Count === REQUIRED_PER_GRADE[1];

  let pendingDocumentsCount = 0;
  let rejectedDocumentsCount = 0;

  activePlayers.forEach((p) => {
    if (p.document?.status === 'pending') pendingDocumentsCount++;
    if (p.document?.status === 'rejected') rejectedDocumentsCount++;
  });

  const areAllDocumentsApproved =
    totalPlayers === REQUIRED_TOTAL_PLAYERS &&
    rejectedDocumentsCount === 0;

  const issues: string[] = [];

  if (totalPlayers < REQUIRED_TOTAL_PLAYERS) {
    issues.push(`Faltan ${REQUIRED_TOTAL_PLAYERS - totalPlayers} jugador(es) (Plantilla de ${totalPlayers}/${REQUIRED_TOTAL_PLAYERS}).`);
  } else if (totalPlayers > REQUIRED_TOTAL_PLAYERS) {
    issues.push(`Excede el límite: tiene ${totalPlayers} jugadores, la base exige exactamente 6.`);
  }

  if (grade3Count !== 2) {
    issues.push(`3er año: Tiene ${grade3Count} jugador(es), la regla exige exactamente 2.`);
  }
  if (grade2Count !== 2) {
    issues.push(`2do año: Tiene ${grade2Count} jugador(es), la regla exige exactamente 2.`);
  }
  if (grade1Count !== 2) {
    issues.push(`1er año: Tiene ${grade1Count} jugador(es), la regla exige exactamente 2.`);
  }

  if (rejectedDocumentsCount > 0) {
    issues.push(`Tiene ${rejectedDocumentsCount} documento(s) rechazado(s) que requieren corrección.`);
  }
  if (pendingDocumentsCount > 0) {
    issues.push(`Tiene ${pendingDocumentsCount} documento(s) pendiente(s) de validación por Axel Javier.`);
  }

  const isFullyCompliant =
    isTotalCountValid &&
    isGradeDistributionValid &&
    areAllDocumentsApproved &&
    team.status !== 'disqualified';

  return {
    totalPlayers,
    grade3Count,
    grade2Count,
    grade1Count,
    isTotalCountValid,
    isGradeDistributionValid,
    areAllDocumentsApproved,
    pendingDocumentsCount,
    rejectedDocumentsCount,
    isFullyCompliant,
    issues,
  };
}

export function isTeamNameTaken(teamName: string, existingTeams: Team[], currentTeamId?: string): boolean {
  const normalized = teamName.trim().toLowerCase();
  if (!normalized) return false;
  return existingTeams.some(
    (t) => t.id !== currentTeamId && t.name.trim().toLowerCase() === normalized
  );
}

export function findDuplicatePlayersInOtherTeams(
  newPlayerNamesOrIds: { name: string; curpOrId: string }[],
  existingTeams: Team[],
  currentTeamId?: string
): { isDuplicate: boolean; message?: string } {
  for (const newP of newPlayerNamesOrIds) {
    const cleanName = newP.name.trim().toLowerCase();
    const cleanId = newP.curpOrId.trim().toLowerCase();

    if (!cleanName && !cleanId) continue;

    for (const team of existingTeams) {
      if (team.id === currentTeamId) continue;

      for (const existingP of team.players) {
        if (!existingP.isActive) continue;

        const existingName = existingP.fullName.trim().toLowerCase();
        const existingCurp = (existingP.studentIdOrCurp || '').trim().toLowerCase();

        if (cleanId && existingCurp && cleanId === existingCurp) {
          return {
            isDuplicate: true,
            message: `La matrícula o CURP "${newP.curpOrId}" ya está registrada en el equipo "${team.name}" con el jugador ${existingP.fullName}. Un alumno no puede jugar en dos equipos.`,
          };
        }

        if (cleanName && cleanName.length > 5 && cleanName === existingName) {
          return {
            isDuplicate: true,
            message: `El jugador "${existingP.fullName}" ya fue registrado en el equipo "${team.name}". Un alumno no puede estar en dos equipos.`,
          };
        }
      }
    }
  }

  return { isDuplicate: false };
}

export function canSubstitutePlayer(
  outgoingPlayer: Player,
  incomingGrade: 1 | 2 | 3
): { allowed: boolean; reason?: string } {
  if (outgoingPlayer.grade !== incomingGrade) {
    return {
      allowed: false,
      reason: `El jugador saliente era de ${outgoingPlayer.grade}º año. Para mantener la regla oficial de 2-2-2, el sustituto debe ser obligatoriamente de ${outgoingPlayer.grade}º año (se intentó registrar de ${incomingGrade}º año).`,
    };
  }
  return { allowed: true };
}

/**
 * Encuentra si algún jugador del equipo objetivo ya está registrado en otro equipo del torneo.
 */
export function findTeamDuplicatePlayers(
  targetTeam: Team,
  allTeams: Team[]
): Array<{ player: Player; otherTeam: Team }> {
  const duplicates: Array<{ player: Player; otherTeam: Team }> = [];

  for (const player of targetTeam.players) {
    if (!player.isActive) continue;
    const cleanName = player.fullName.trim().toLowerCase();
    const cleanCurp = (player.studentIdOrCurp || '').trim().toLowerCase();

    if (!cleanName && !cleanCurp) continue;

    for (const otherTeam of allTeams) {
      if (otherTeam.id === targetTeam.id) continue;

      for (const otherPlayer of otherTeam.players) {
        if (!otherPlayer.isActive) continue;
        const otherName = otherPlayer.fullName.trim().toLowerCase();
        const otherCurp = (otherPlayer.studentIdOrCurp || '').trim().toLowerCase();

        const isNameMatch = cleanName.length >= 4 && cleanName === otherName;
        const isCurpMatch = cleanCurp && otherCurp && cleanCurp === otherCurp;

        if (isNameMatch || isCurpMatch) {
          duplicates.push({ player, otherTeam });
        }
      }
    }
  }

  return duplicates;
}


