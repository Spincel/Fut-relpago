import { Team } from '../types/tournament';

export function formatPhoneForWhatsApp(phone: string): string {
  // Strip all non-digit characters
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

export function generateWhatsAppApprovalLink(team: Team): string {
  const phone = formatPhoneForWhatsApp(team.captain.phone);
  const message = `¡Hola ${team.captain.fullName}! ⚽🏆 Te saluda Axel Javier González Salas, organizador del Torneo Relámpago de Fútbol del Jueves 12 de Noviembre.

Te confirmo con gusto que tu equipo *${team.name}* (Folio: *${team.folio}*) fue REVISADO y VALIDADO con éxito.

Cumplen con todas las bases oficiales:
- Plantilla de 6 jugadores
- 2 jugadores de 3er año
- 2 jugadores de 2do año
- 2 jugadores de 1er año
- Documentos escolares verificados

¡Tu equipo ya tiene su lugar asegurado en el Rol de Juegos! Recuerda presentarte el Jueves 12 de Noviembre con uniforme ${team.uniformColor}. ¡Mucha suerte por el Premio Sorpresa! 🎉`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function generateWhatsAppObservationsLink(team: Team, issues: string[]): string {
  const phone = formatPhoneForWhatsApp(team.captain.phone);
  const issuesText = issues.length > 0 ? issues.map((i) => `· ${i}`).join('\n') : 'Falta cotejar credenciales escolares.';

  const message = `¡Hola ${team.captain.fullName}! ⚽ Te saluda Axel Javier González Salas, organizador del Torneo Relámpago de Fútbol del Jueves 12 de Noviembre.

Revisé el registro de tu equipo *${team.name}* (Folio: *${team.folio}*) y necesitamos atender lo siguiente antes del miércoles para que queden oficialmente aceptados:

${issuesText}

Por favor responde a este mensaje para ayudarte a corregirlo. ¡Saludos!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function generateCaptainToAxelLink(team: Team): string {
  // Message for captain to send to Axel
  const message = `¡Hola Axel Javier! ⚽ Te comparto el registro de mi equipo *${team.name}* para el Torneo Relámpago de Fútbol del Jueves 12 de Noviembre.

Folio oficial: *${team.folio}*
Capitán: *${team.captain.fullName}*
Uniforme: *${team.uniformColor}*
Plantilla: 6 jugadores listos (2 de 3º, 2 de 2º y 2 de 1er año).

¡Ya tenemos lista la cédula de juego para cotejarla contigo!`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
