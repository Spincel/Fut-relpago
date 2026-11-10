import { Team, TournamentMatch, TeamBadgeConfig } from '../types/tournament';
import { getUniformColors } from './colorHelper';

/**
 * Dibuja un pseudo-escudo deportivo en un contexto Canvas 2D
 */
export function drawBadgeOnCanvas(
  ctx: CanvasRenderingContext2D,
  badge: TeamBadgeConfig | undefined,
  centerX: number,
  centerY: number,
  radius: number,
  teamName: string = 'E'
) {
  const shape = badge?.shape || 'shield';
  const pattern = badge?.pattern || 'solid';
  const primary = badge?.primaryColor || '#ef4444';
  const secondary = badge?.secondaryColor || '#ffffff';
  const accent = badge?.accentColor || '#000000';
  const initial = (teamName.trim().charAt(0) || 'E').toUpperCase();

  ctx.save();
  ctx.translate(centerX, centerY);

  // Generar el path según la forma
  ctx.beginPath();
  if (shape === 'circle') {
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
  } else if (shape === 'oval') {
    ctx.ellipse(0, 0, radius * 0.85, radius * 1.05, 0, 0, Math.PI * 2);
  } else if (shape === 'square') {
    // Diamante / Escudo angular
    const r = radius * 1.05;
    ctx.moveTo(0, -r);
    ctx.lineTo(r, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(-r, 0);
    ctx.closePath();
  } else {
    // Escudo clásico de fútbol
    const w = radius * 0.9;
    const h = radius * 1.05;
    ctx.moveTo(-w, -h * 0.9);
    ctx.lineTo(w, -h * 0.9);
    ctx.lineTo(w, 0);
    ctx.bezierCurveTo(w, h * 0.6, 0, h, 0, h);
    ctx.bezierCurveTo(0, h, -w, h * 0.6, -w, 0);
    ctx.closePath();
  }

  // Sombra base
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#020617';
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Recorte (clip) para pintar los patrones interiores
  ctx.save();
  ctx.clip();

  // Color primario base
  ctx.fillStyle = primary;
  ctx.fillRect(-radius * 1.5, -radius * 1.5, radius * 3, radius * 3);

  // Patrón Bicolor (dividido a la mitad)
  if (pattern === 'bicolor') {
    ctx.fillStyle = secondary;
    ctx.fillRect(0, -radius * 1.5, radius * 1.5, radius * 3);
  }

  // Patrón Franja (franja diagonal)
  if (pattern === 'striped') {
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.moveTo(-radius * 1.5, -radius * 0.3);
    ctx.lineTo(-radius * 0.3, -radius * 1.5);
    ctx.lineTo(radius * 1.5, radius * 0.3);
    ctx.lineTo(radius * 0.3, radius * 1.5);
    ctx.closePath();
    ctx.fill();
  }

  // Patrón Tricolor (3 franjas verticales)
  if (pattern === 'tricolor') {
    const wThird = (radius * 2) / 3;
    ctx.fillStyle = primary;
    ctx.fillRect(-radius, -radius * 1.5, wThird, radius * 3);
    ctx.fillStyle = secondary;
    ctx.fillRect(-radius + wThird, -radius * 1.5, wThird, radius * 3);
    ctx.fillStyle = accent;
    ctx.fillRect(-radius + wThird * 2, -radius * 1.5, wThird, radius * 3);
  }

  // Brillo superior degradado
  const gloss = ctx.createLinearGradient(0, -radius, 0, radius);
  gloss.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  gloss.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
  gloss.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
  ctx.fillStyle = gloss;
  ctx.fillRect(-radius * 1.5, -radius * 1.5, radius * 3, radius * 3);

  // Emblema central circular con inicial
  const innerR = radius * 0.38;
  ctx.beginPath();
  ctx.arc(0, 0, innerR, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Letra inicial
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${Math.round(innerR * 1.2)}px "Inter", system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initial, 0, 2);

  ctx.restore(); // Deshacer clip

  // Borde exterior metálico dorado
  const borderGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
  borderGrad.addColorStop(0, '#fef08a');
  borderGrad.addColorStop(0.4, '#f59e0b');
  borderGrad.addColorStop(0.8, '#b45309');
  borderGrad.addColorStop(1, '#fde047');
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.restore();
}

/**
 * Genera una imagen PNG en alta resolución (1080x1520) con diseño estilo póster oficial
 * del Torneo Relámpago, conteniendo el pseudo-escudo, nombre del equipo, folio, capitán
 * y los 6 jugadores clasificados por grado escolar (3º, 2º y 1º Año).
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
  ctx.font = '900 40px "Inter", system-ui, sans-serif';
  ctx.fillText('DE FÚTBOL · REGLA 2-2-2', width / 2, 228);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 20px system-ui, sans-serif';
  ctx.fillText('JUEVES 12 DE NOVIEMBRE · SECUNDARIA', width / 2, 265);
  ctx.restore();

  // 6. Tarjeta Principal del Equipo (Hero Box con Escudo)
  const cardY = 295;
  const cardH = 270;
  ctx.save();
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
  roundRect(ctx, width / 2 - 130, cardY + 16, 260, 32, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`FOLIO: ${team.folio}`, width / 2, cardY + 32);

  // Dibujar el Escudo personalizado en la tarjeta
  const badgeSize = 58;
  drawBadgeOnCanvas(ctx, team.badge, 170, cardY + 140, badgeSize, team.name);

  // Nombre del Equipo
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 48px "Inter", system-ui, sans-serif';
  ctx.textAlign = 'left';
  let teamFontSize = 48;
  while (ctx.measureText(team.name).width > width - 360 && teamFontSize > 26) {
    teamFontSize -= 4;
    ctx.font = `900 ${teamFontSize}px "Inter", system-ui, sans-serif`;
  }
  ctx.fillText(team.name, 260, cardY + 120);

  // Color de uniforme
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillStyle = '#f59e0b';
  ctx.textAlign = 'left';
  ctx.fillText(`👕 Uniforme: ${team.uniformColor}`, 260, cardY + 165);

  // Capitán y contacto
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`👑 Capitán: ${team.captain.fullName} · 📱 ${team.captain.phone}`, 260, cardY + 208);
  ctx.restore();

  // 7. Sección: Plantilla Oficial de Jugadores (6 Jugadores)
  const rosterY = 595;
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 28px "Inter", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PLANTILLA OFICIAL · 6 JUGADORES', width / 2, rosterY);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 17px system-ui, sans-serif';
  ctx.fillText('2 Alumnos de 3er Año · 2 Alumnos de 2do Año · 2 Alumnos de 1er Año', width / 2, rosterY + 30);
  ctx.restore();

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

      // Badge de Capitán o Grado
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

  // 8. Pie de Ficha Oficial
  const footerY = 1330;
  ctx.save();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, footerY);
  ctx.lineTo(width - 80, footerY);
  ctx.stroke();

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
 * Genera una imagen PNG en alta resolución (1080px de ancho) con diseño estilo póster oficial
 * de los ENFRENTAMIENTOS (Rol de Juegos), incluyendo los escudos, nombres y horarios de los partidos.
 */
export function generateFixturePosterDataUrl(matches: TournamentMatch[], teams: Team[]): string {
  if (typeof document === 'undefined' || matches.length === 0) return '';

  const width = 1080;
  // Altura dinámica según la cantidad de partidos
  const matchCardH = 140;
  const matchGap = 20;
  const headerH = 340;
  const footerH = 180;
  const height = Math.max(1400, headerH + matches.length * (matchCardH + matchGap) + footerH);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const getTeam = (id: string) => teams.find((t) => t.id === id);

  // 1. Fondo de estadio medianoche
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, '#031738');
  bg.addColorStop(0.4, '#020d20');
  bg.addColorStop(0.8, '#010712');
  bg.addColorStop(1, '#000308');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // 2. Destellos y franjas
  const topGlow = ctx.createRadialGradient(width / 2, 90, 20, width / 2, 90, 500);
  topGlow.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
  topGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.08)');
  topGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, width, 550);

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

  // Borde exterior
  ctx.save();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, width - 60, height - 60);
  ctx.restore();

  // 3. Encabezado Oficial
  ctx.save();
  ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
  ctx.lineWidth = 2;
  roundRect(ctx, width / 2 - 250, 55, 500, 44, 22);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 18px "Inter", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚽ COPA ESCOLAR OFICIAL 2026 · FORMATO 6 VS 6 ⚽', width / 2, 77);

  // Título
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 58px "Inter", "Impact", system-ui, sans-serif';
  ctx.fillText('ROL OFICIAL DE JUEGOS', width / 2, 165);

  ctx.fillStyle = '#f59e0b';
  ctx.font = '900 38px "Inter", system-ui, sans-serif';
  ctx.fillText('TORNEO RELÁMPAGO DE FÚTBOL', width / 2, 218);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 22px system-ui, sans-serif';
  ctx.fillText('JUEVES 12 DE NOVIEMBRE · REGLA OFICIAL 2-2-2', width / 2, 260);
  ctx.restore();

  // 4. Lista de Enfrentamientos
  let currentY = headerH;

  matches.forEach((m) => {
    const teamA = getTeam(m.teamAId);
    const teamB = getTeam(m.teamBId);
    const nameA = teamA ? teamA.name : m.teamAId;
    const nameB = teamB ? teamB.name : m.teamBId;

    ctx.save();
    // Card container
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 2;
    roundRect(ctx, 60, currentY, width - 120, matchCardH, 20);
    ctx.fill();
    ctx.stroke();

    // Barra superior del partido (Ronda y Horario)
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    roundRect(ctx, 60, currentY, width - 120, 36, 12);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 15px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      `🏆 ${m.round.toUpperCase()} ${m.groupName ? `· ${m.groupName}` : ''} · PARTIDO #${m.matchNumber}`,
      85,
      currentY + 18
    );

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`⏰ ${m.timeSlot}`, width - 85, currentY + 18);

    // Contenido del Match (Team A vs Team B)
    const midY = currentY + 88;

    // Team A (Izquierda)
    drawBadgeOnCanvas(ctx, teamA?.badge, 120, midY, 34, nameA);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(nameA, 175, midY - 10);

    if (teamA) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillText(`Uniforme: ${teamA.uniformColor}`, 175, midY + 16);
    }

    // VS Central
    ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    roundRect(ctx, width / 2 - 32, midY - 22, 64, 44, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = '900 18px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VS', width / 2, midY);

    // Team B (Derecha)
    drawBadgeOnCanvas(ctx, teamB?.badge, width - 120, midY, 34, nameB);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(nameB, width - 175, midY - 10);

    if (teamB) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillText(`Uniforme: ${teamB.uniformColor}`, width - 175, midY + 16);
    }

    ctx.restore();
    currentY += matchCardH + matchGap;
  });

  // 5. Pie del Rol de Juegos
  const footerY = height - 120;
  ctx.save();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, footerY);
  ctx.lineTo(width - 80, footerY);
  ctx.stroke();

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✓ CRUCES Y HORARIOS ASIGNADOS OFICIALMENTE', width / 2, footerY + 30);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText('Organizador: Axel Javier González Salas  ·  WhatsApp: 311 521 9149', width / 2, footerY + 62);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText('Cada equipo debe presentarse con 10 minutos de anticipación con su uniforme completo.', width / 2, footerY + 90);
  ctx.restore();

  return canvas.toDataURL('image/png');
}

/**
 * Función auxiliar para rectángulos redondeados
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
