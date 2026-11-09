/**
 * Utilidad para detectar y obtener los colores hexadecimales exactos
 * a partir del texto del uniforme (ej: "Azul Marino y Naranja", "Rojo Carmesí y Blanco", "Amarillo", etc.).
 */

interface ColorDefinition {
  key: string;
  hex: string;
}

const COLOR_DICTIONARY: ColorDefinition[] = [
  // Colores compuestos / específicos primero
  { key: 'azul marino', hex: '#1e3a8a' },
  { key: 'azul rey', hex: '#1d4ed8' },
  { key: 'azul cielo', hex: '#38bdf8' },
  { key: 'celeste', hex: '#38bdf8' },
  { key: 'rojo carmesí', hex: '#dc2626' },
  { key: 'carmesí', hex: '#dc2626' },
  { key: 'verde esmeralda', hex: '#059669' },
  { key: 'verde limón', hex: '#84cc16' },
  { key: 'amarillo oro', hex: '#eab308' },
  { key: 'oro', hex: '#eab308' },
  { key: 'dorado', hex: '#eab308' },
  
  // Colores primarios y secundarios
  { key: 'azul', hex: '#2563eb' },
  { key: 'rojo', hex: '#ef4444' },
  { key: 'verde', hex: '#16a34a' },
  { key: 'amarillo', hex: '#facc15' },
  { key: 'naranja', hex: '#f97316' },
  { key: 'anaranjado', hex: '#f97316' },
  { key: 'negro', hex: '#09090b' },
  { key: 'blanco', hex: '#ffffff' },
  { key: 'morado', hex: '#9333ea' },
  { key: 'violeta', hex: '#9333ea' },
  { key: 'púrpura', hex: '#9333ea' },
  { key: 'rosa', hex: '#ec4899' },
  { key: 'rosado', hex: '#ec4899' },
  { key: 'fucsia', hex: '#ec4899' },
  { key: 'vino', hex: '#881337' },
  { key: 'guinda', hex: '#881337' },
  { key: 'tinto', hex: '#881337' },
  { key: 'gris', hex: '#64748b' },
  { key: 'plata', hex: '#94a3b8' },
  { key: 'turquesa', hex: '#14b8a6' },
  { key: 'café', hex: '#78350f' },
  { key: 'marrón', hex: '#78350f' },
];

export function getUniformColors(uniformColorText: string): string[] {
  if (!uniformColorText) return ['#f59e0b'];

  const normalized = uniformColorText.toLowerCase();
  const matched: string[] = [];
  let remaining = normalized;

  for (const { key, hex } of COLOR_DICTIONARY) {
    if (remaining.includes(key)) {
      matched.push(hex);
      // Reemplazar la coincidencia para evitar falsos positivos
      remaining = remaining.replace(key, '');
    }
  }

  // Si no se encontró ningún color conocido, retornar amarillo ámbar por defecto
  if (matched.length === 0) {
    return ['#f59e0b'];
  }

  return matched;
}
