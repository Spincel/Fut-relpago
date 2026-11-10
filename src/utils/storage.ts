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
    // Sincronizar automáticamente en la nube (Vercel KV)
    saveTeamsToCloud(teams).catch(() => {});
  } catch (e) {
    console.error('Error saving teams to storage:', e);
  }
}

export async function fetchTeamsFromCloud(): Promise<Team[] | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/api/teams', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.configured && Array.isArray(data.teams)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.teams));
      return data.teams;
    }
    return null;
  } catch (err) {
    return null;
  }
}

export async function saveTeamsToCloud(teams: Team[]): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teams }),
    });
    const data = await res.json();
    return !!data.configured;
  } catch (err) {
    return false;
  }
}

export function resetTeamsToDefault(): Team[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    saveTeamsToCloud([]).catch(() => {});
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

export async function fetchMatchesFromCloud(): Promise<TournamentMatch[] | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/api/matches', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.configured && Array.isArray(data.matches)) {
      localStorage.setItem(FIXTURE_STORAGE_KEY, JSON.stringify(data.matches));
      return data.matches;
    }
    return null;
  } catch (err) {
    return null;
  }
}

export async function saveMatchesToCloud(matches: TournamentMatch[]): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const res = await fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matches }),
    });
    const data = await res.json();
    return !!data.configured;
  } catch (err) {
    return false;
  }
}

export function saveFixtureToStorage(matches: TournamentMatch[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FIXTURE_STORAGE_KEY, JSON.stringify(matches));
    // Sincronizar automáticamente en la nube (Vercel KV)
    saveMatchesToCloud(matches).catch(() => {});
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
