import { Team } from '../types/tournament';

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

Te confirmo que tu equipo *${team.name}* (Folio: *${team.folio}*) quedó REGISTRADO Y VALIDADO OFICIALMENTE con uniforme ${team.uniformColor} y plantilla 2-2-2.

Tu lugar está asegurado. Espera el sorteo oficial para saber contra quién te enfrentarás en tu primer partido. ¡Mucho éxito! 🎉`;

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

/**
 * Mensaje del capitán hacia Axel al terminar de registrarse
 */
export function generateCaptainToAxelLink(team: Team): string {
  const message = `¡Hola Axel Javier! ⚽ Te comparto el registro de mi equipo *${team.name}* para el Torneo Relámpago de Fútbol del Jueves 12 de Noviembre.

Folio oficial: *${team.folio}*
Capitán: *${team.captain.fullName}*
Uniforme: *${team.uniformColor}*
Plantilla: 6 jugadores listos (2 de 3º, 2 de 2º y 2 de 1er año).

¡Ya tenemos lista la cédula de juego para cotejarla contigo!`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
