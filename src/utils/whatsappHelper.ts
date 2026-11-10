import { Team, TournamentMatch } from '../types/tournament';

export function formatPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';

  // If 10 digits (Mexican local cell), prepend country code 52
  if (digits.length === 10) {
    return `52${digits}`;
  }
  // If starts with 52 and has 12 digits, return as is
  if (digits.startsWith('52') && digits.length >= 12) {
    return digits;
  }
  return digits;
}

/**
 * Mensaje prediseñado para Axel: Notificar al capitán que su equipo fue aprobado
 * y que espere el sorteo oficial.
 */
export function generateWhatsAppApprovalLink(team: Team): string {
  const phone = formatPhoneForWhatsApp(team.captain.phone);
  const message = `¡Hola ${team.captain.fullName}! ⚽🏆 Te saluda Axel Javier González Salas, organizador del Torneo Relámpago de Fútbol del Jueves 12 de Noviembre.

Te confirmo que tu equipo *${team.name}* (Folio: *${team.folio}*) ha sido REGISTRADO Y APROBADO OFICIALMENTE por el comité organizador con uniforme ${team.uniformColor} y plantilla reglamentaria 2-2-2.

Tu lugar en el torneo está 100% asegurado. Mantente atento, ya que en breve realizaremos el sorteo oficial para definir los enfrentamientos y horarios. ¡Mucho éxito a tu equipo! 🎉⚽`;

  const phoneParam = phone ? `${phone}` : '';
  return `https://wa.me/${phoneParam}?text=${encodeURIComponent(message)}`;
}

/**
 * Mensaje prediseñado para Axel: Notificar que un jugador ya está registrado en otro equipo.
 */
export function generateWhatsAppDuplicatePlayerLink(
  team: Team,
  playerName: string,
  otherTeamName: string,
  grade: number
): string {
  const phone = formatPhoneForWhatsApp(team.captain.phone);
  const message = `¡Hola ${team.captain.fullName}! ⚽ Te saluda Axel Javier González Salas, organizador del Torneo Relámpago del Jueves 12 de Noviembre.

Al revisar el registro de tu equipo *${team.name}* (Folio: *${team.folio}*), detectamos que el jugador *${playerName}* (${grade}º año) ya está registrado en el equipo *${otherTeamName}*.

Por reglamento oficial ningún alumno puede estar registrado en dos equipos. Por favor realiza la sustitución de tu jugador de ${grade}º año a la brevedad para poder autorizar oficialmente a tu escuadra. ¡Saludos!`;

  const phoneParam = phone ? `${phone}` : '';
  return `https://wa.me/${phoneParam}?text=${encodeURIComponent(message)}`;
}

/**
 * Mensaje prediseñado para Axel: Enviar observaciones generales
 */
export function generateWhatsAppObservationsLink(team: Team, issues: string[]): string {
  const phone = formatPhoneForWhatsApp(team.captain.phone);
  const issuesText = issues.length > 0 ? issues.map((i) => `· ${i}`).join('\n') : 'Falta cotejar credenciales escolares.';

  const message = `¡Hola ${team.captain.fullName}! ⚽ Te saluda Axel Javier González Salas, organizador del Torneo Relámpago.

Revisé el registro de tu equipo *${team.name}* (Folio: *${team.folio}*) y necesitamos atender lo siguiente antes del miércoles para que queden oficialmente aceptados:

${issuesText}

Por favor responde a este mensaje para ayudarte a corregirlo. ¡Saludos!`;

  const phoneParam = phone ? `${phone}` : '';
  return `https://wa.me/${phoneParam}?text=${encodeURIComponent(message)}`;
}

export const ORGANIZER_PHONE = '523115219149'; // Axel Javier González Salas: 311 521 9149

/**
 * Mensaje del capitán hacia Axel al terminar de registrarse
 */
export function generateCaptainToAxelLink(team: Team): string {
  const message = `¡Hola Axel Javier! ⚽🏆 Te comparto la ficha de registro de mi equipo *${team.name}* para el Torneo Relámpago de Fútbol del Jueves 12 de Noviembre.

📋 *Folio Oficial:* ${team.folio}
👑 *Capitán:* ${team.captain.fullName}
📱 *WhatsApp de contacto:* ${team.captain.phone}
👕 *Uniforme:* ${team.uniformColor}

👥 *Plantilla Oficial (Regla 2-2-2):*
${team.players.map((p, idx) => `· ${idx + 1}. ${p.fullName} (${p.grade}º Año)`).join('\n')}

¡Ya descargamos nuestra imagen oficial del equipo y quedamos a la espera del sorteo! 🎉`;

  return `https://wa.me/${ORGANIZER_PHONE}?text=${encodeURIComponent(message)}`;
}

/**
 * Mensaje para difundir el rol oficial de juegos en grupos de WhatsApp o a los capitanes
 */
export function generateWhatsAppFixtureBroadcastLink(matches: TournamentMatch[], teams: Team[]): string {
  const getTeamName = (id: string) => teams.find((t) => t.id === id)?.name || id;
  const matchLines = matches
    .filter((m) => m.teamAId && m.teamBId)
    .map((m) => `⚽ *${m.round}* (Partido #${m.matchNumber}):\n   ${getTeamName(m.teamAId)} vs ${getTeamName(m.teamBId)}\n   ⏰ Horario: *${m.timeSlot}*`)
    .join('\n\n');

  const message = `⚽🏆 *TORNEO RELÁMPAGO DE FÚTBOL · ROL OFICIAL DE JUEGOS* 🏆⚽

Organizador: Axel Javier González Salas
Fecha: Jueves 12 de Noviembre

🔥 *ENFRENTAMIENTOS DEFINIDOS TRAS EL SORTEO OFICIAL:*

${matchLines}

⚠️ *Recordatorios importantes:*
1. Cada equipo debe presentarse 10 minutos antes de su horario con su uniforme completo.
2. Formato 6 vs 6 en cancha con regla reglamentaria 2-2-2 activa.
3. Consulta el rol interactivo y el póster oficial en: https://t-fut-oficial.vercel.app/

¡Mucho éxito a todas las escuadras participantes! 🎉⚡`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
