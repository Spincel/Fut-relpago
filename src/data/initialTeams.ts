import { Team } from '../types/tournament';

// Generador de credencial SVG si se necesita para previsualización
export function createMockCredential(name: string, grade: number, studentId: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <rect width="600" height="380" rx="16" fill="#0f172a" stroke="#334155" stroke-width="3"/>
    <rect x="0" y="0" width="600" height="64" rx="16" fill="#1e293b"/>
    <text x="28" y="42" fill="#f59e0b" font-family="sans-serif" font-size="20" font-weight="bold">CREDENCIAL ESTUDIANTIL OFICIAL</text>
    <text x="500" y="42" fill="#94a3b8" font-family="monospace" font-size="14">2026-2027</text>
    <rect x="28" y="90" width="140" height="170" rx="10" fill="#1e293b" stroke="#475569" stroke-width="2"/>
    <circle cx="98" cy="150" r="38" fill="#475569"/>
    <path d="M50 240 C50 190, 146 190, 146 240 Z" fill="#334155"/>
    <text x="98" y="278" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="middle">FOTO</text>
    <text x="190" y="115" fill="#94a3b8" font-family="sans-serif" font-size="12">ALUMNO ACREDITADO:</text>
    <text x="190" y="142" fill="#ffffff" font-family="sans-serif" font-size="20" font-weight="bold">${name.toUpperCase()}</text>
    <text x="190" y="180" fill="#94a3b8" font-family="sans-serif" font-size="12">GRADO ESCOLAR:</text>
    <text x="190" y="208" fill="#38bdf8" font-family="sans-serif" font-size="22" font-weight="bold">${grade}º AÑO</text>
    <text x="190" y="246" fill="#94a3b8" font-family="sans-serif" font-size="12">MATRÍCULA / CURP:</text>
    <text x="190" y="270" fill="#f8fafc" font-family="monospace" font-size="16" font-weight="bold">${studentId}</text>
    <line x1="28" y1="305" x2="572" y2="305" stroke="#334155" stroke-width="1"/>
    <text x="28" y="345" fill="#22c55e" font-family="sans-serif" font-size="13" font-weight="bold">✓ CONSTANCIA ESCOLAR VIGENTE</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Sin datos ficticios de prueba: solo los equipos reales registrados
export const INITIAL_TEAMS: Team[] = [];
