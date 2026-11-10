import { Team } from '../types/tournament';
import { getUniformColors } from './colorHelper';

/**
 * Genera una imagen PNG en alta resolución (1080x1520) con diseño estilo póster oficial
 * del Torneo Relámpago, conteniendo el nombre del equipo, folio, capitán y los 6 jugadores
 * clasificados por grado escolar (3º, 2º y 1º Año).
 */
export function generateTeamPosterDataUrl(team: Team): string {
  if (typeof document === 'undefined') return '';

  const width = 1080;
  const height = 1520;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Fondo: Degradado azul marino profundo atlético a medianoche
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, '#031738');
  bgGradient.addColorStop(0.35, '#021028');
  bgGradient.addColorStop(0.75, '#010918');
  bgGradient.addColorStop(1, '#00040a');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Destellos de luz de estadio / ambient glow
  const topGlow = ctx.createRadialGradient(width / 2, 80, 20, width / 2, 80, 500);
  topGlow.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
  topGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.08)');
  topGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, width, 600);

  // 3. Franjas deportivas diagonales sutiles
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
  ctx.lineWidth = 14;
  for (let x = -width; x < width * 2; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + height * 0.7, height);
    ctx.stroke();
  }
  ctx.restore();

  // 4. Borde perimetral dorado elegante
  ctx.save();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(40, 40, width - 80, height - 80);
  ctx.restore();

  // 5. Encabezado Oficial del Torneo
  // Pill superior
  ctx.save();
  ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
  ctx.lineWidth = 2;
  roundRect(ctx, width / 2 - 240, 60, 480, 44, 22);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 18px "Inter", system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚽ COPA ESCOLAR OFICIAL 2026 · 6 VS 6 ⚽', width / 2, 82);
  ctx.restore();

  // Título Principal
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 62px "Inter", "Impact", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 12;
  ctx.fillText('TORNEO RELÁMPAGO', width / 2, 175);

  ctx.fillStyle = '#f59e0b';
  ctx.font = '900 42px "Inter", system-ui, sans-serif';
  ctx.fillText('DE FÚTBOL · REGLA 2-2-2', width / 2, 230);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 20px system-ui, sans-serif';
  ctx.fillText('JUEVES 12 DE NOVIEMBRE · SECUNDARIA', width / 2, 268);
  ctx.restore();

  // 6. Tarjeta Principal del Equipo (Hero Box)
  const cardY = 300;
  const cardH = 260;
  ctx.save();
  // Fondo de la tarjeta con brillo
  const cardGrad = ctx.createLinearGradient(0, cardY, 0, cardY + cardH);
  cardGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
  cardGrad.addColorStop(1, 'rgba(30, 41, 59, 0.85)');
  ctx.fillStyle = cardGrad;
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
  ctx.lineWidth = 3;
  roundRect(ctx, 70, cardY, width - 140, cardH, 24);
  ctx.fill();
  ctx.stroke();

  // Folio Badge
  ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.5;
  roundRect(ctx, width / 2 - 130, cardY + 22, 260, 34, 17);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`FOLIO: ${team.folio}`, width / 2, cardY + 39);

  // Nombre del Equipo
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 52px "Inter", system-ui, sans-serif';
  ctx.textAlign = 'center';
  // Ajustar tamaño si es muy largo
  let teamFontSize = 52;
  while (ctx.measureText(team.name).width > width - 220 && teamFontSize > 28) {
    teamFontSize -= 4;
    ctx.font = `900 ${teamFontSize}px "Inter", system-ui, sans-serif`;
  }
  ctx.fillText(team.name, width / 2, cardY + 115);

  // Color de uniforme
  const colors = getUniformColors(team.uniformColor);
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillStyle = '#f59e0b';
  ctx.textAlign = 'center';
  ctx.fillText(`👕 Uniforme: ${team.uniformColor}`, width / 2, cardY + 165);

  // Capitán y contacto
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`👑 Capitán: ${team.captain.fullName}  ·  📱 ${team.captain.phone}`, width / 2, cardY + 208);
  ctx.restore();

  // 7. Sección: Plantilla Oficial de Jugadores (6 Jugadores)
  const rosterY = 590;
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 28px "Inter", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PLANTILLA OFICIAL · 6 JUGADORES', width / 2, rosterY);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 17px system-ui, sans-serif';
  ctx.fillText('2 Alumnos de 3er Año · 2 Alumnos de 2do Año · 2 Alumnos de 1er Año', width / 2, rosterY + 30);
  ctx.restore();

  // Separar jugadores por grado
  const g3 = team.players.filter((p) => p.grade === 3);
  const g2 = team.players.filter((p) => p.grade === 2);
  const g1 = team.players.filter((p) => p.grade === 1);

  const sections = [
    {
      title: 'ALUMNOS DE 3er AÑO (DELANTERA / ATAQUE)',
      badgeColor: '#f59e0b',
      badgeBg: 'rgba(245, 158, 11, 0.15)',
      borderColor: 'rgba(245, 158, 11, 0.4)',
      players: g3,
      startY: 650,
    },
    {
      title: 'ALUMNOS DE 2do AÑO (MEDIO CAMPO)',
      badgeColor: '#38bdf8',
      badgeBg: 'rgba(56, 189, 248, 0.15)',
      borderColor: 'rgba(56, 189, 248, 0.4)',
      players: g2,
      startY: 870,
    },
    {
      title: 'ALUMNOS DE 1er AÑO (DEFENSA Y PORTERÍA)',
      badgeColor: '#c084fc',
      badgeBg: 'rgba(192, 132, 252, 0.15)',
      borderColor: 'rgba(192, 132, 252, 0.4)',
      players: g1,
      startY: 1090,
    },
  ];

  let playerOverallIndex = 1;

  sections.forEach((sec) => {
    // Encabezado del grado
    ctx.save();
    ctx.fillStyle = sec.badgeBg;
    ctx.strokeStyle = sec.borderColor;
    ctx.lineWidth = 1.5;
    roundRect(ctx, 70, sec.startY, width - 140, 36, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = sec.badgeColor;
    ctx.font = '900 15px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🎓 ${sec.title}`, 90, sec.startY + 18);
    ctx.restore();

    // 2 jugadores en este grado (2 tarjetas de lado a lado o apiladas)
    sec.players.forEach((player, pIdx) => {
      const pBoxY = sec.startY + 48 + pIdx * 72;
      const isCaptain = player.fullName.trim().toLowerCase() === team.captain.fullName.trim().toLowerCase();

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.strokeStyle = isCaptain ? 'rgba(245, 158, 11, 0.6)' : 'rgba(51, 65, 85, 0.7)';
      ctx.lineWidth = isCaptain ? 2.5 : 1.5;
      roundRect(ctx, 70, pBoxY, width - 140, 62, 14);
      ctx.fill();
      ctx.stroke();

      // Número de jugador
      ctx.fillStyle = isCaptain ? '#f59e0b' : '#64748b';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`#${playerOverallIndex}`, 115, pBoxY + 31);

      // Nombre del jugador
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 23px "Inter", system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(player.fullName || 'Jugador Registrado', 165, pBoxY + 31);

      // Badge de Grado / Capitán a la derecha
      if (isCaptain) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        roundRect(ctx, width - 230, pBoxY + 14, 140, 34, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = '900 14px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👑 CAPITÁN', width - 160, pBoxY + 31);
      } else {
        ctx.fillStyle = sec.badgeColor;
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${player.grade}º AÑO`, width - 100, pBoxY + 31);
      }

      ctx.restore();
      playerOverallIndex++;
    });
  });

  // 8. Pie de Ficha Oficial (Organizador, WhatsApp y Garantía)
  const footerY = 1330;
  ctx.save();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, footerY);
  ctx.lineTo(width - 80, footerY);
  ctx.stroke();

  // Sello
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✓ FICHA OFICIAL GENERADA · REGISTRO AUTORIZADO', width / 2, footerY + 36);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '600 20px system-ui, sans-serif';
  ctx.fillText('Organizador: Axel Javier González Salas  ·  WhatsApp: 311 521 9149', width / 2, footerY + 70);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillText('Presenta esta imagen digital el día del torneo o envíala a Axel para validar tu escuadra.', width / 2, footerY + 102);
  ctx.restore();

  return canvas.toDataURL('image/png');
}

/**
 * Función auxiliar para dibujar rectángulos redondeados compatibles con cualquier navegador
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
