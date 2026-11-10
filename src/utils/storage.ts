import { Team, TournamentMatch } from '../types/tournament';
import { INITIAL_TEAMS } from '../data/initialTeams';

const STORAGE_KEY = 'torneo_relampago_real_teams_v2';
const FIXTURE_STORAGE_KEY = 'torneo_relampago_fixture_v2';

export function loadTeamsFromStorage(): Team[] {
  if (typeof window === 'undefined') return INITIAL_TEAMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TEAMS));
      return INITIAL_TEAMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_TEAMS;
  } catch (e) {
    console.error('Error loading teams from storage:', e);
    return INITIAL_TEAMS;
  }
}

export function saveTeamsToStorage(teams: Team[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  } catch (e) {
    console.error('Error saving teams to storage:', e);
  }
}

export function resetTeamsToDefault(): Team[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
  return [];
}

export function loadFixtureFromStorage(): TournamentMatch[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FIXTURE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading fixture:', e);
    return [];
  }
}

export function saveFixtureToStorage(matches: TournamentMatch[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FIXTURE_STORAGE_KEY, JSON.stringify(matches));
  } catch (e) {
    console.error('Error saving fixture:', e);
  }
}

export function exportTeamsToCSV(teams: Team[]): string {
  const headers = [
    'Folio',
    'Equipo',
    'Color',
    'Estatus Equipo',
    'Capitan',
    'Telefono',
    'Email',
    'Jugador',
    'Grado Escolar',
    'Posicion',
    'Dorsal',
    'Estatus Registro',
    'Jugador Activo'
  ];

  const rows: string[] = [headers.join(',')];

  teams.forEach((team) => {
    team.players.forEach((player) => {
      rows.push(
        [
          `"${team.folio}"`,
          `"${team.name}"`,
          `"${team.uniformColor}"`,
          `"${team.status}"`,
          `"${team.captain.fullName}"`,
          `"${team.captain.phone}"`,
          `"${team.captain.email || ''}"`,
          `"${player.fullName}"`,
          `"${player.grade}º Año"`,
          `"${player.position || 'Jugador'}"`,
          `"${player.jerseyNumber || ''}"`,
          `"${player.document?.status || 'pending'}"`,
          `"${player.isActive ? 'Activo' : 'Baja'}"`,
        ].join(',')
      );
    });
  });

  return rows.join('\n');
}
