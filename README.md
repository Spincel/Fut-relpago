# Torneo Relámpago de Fútbol ⚡🏆

Sistema web integral de registro, altas, bajas, validación de documentos y panel de administración oficial para el **Torneo Relámpago de Fútbol**, desarrollado con apego estricto a las bases de la convocatoria oficial.

Repositorio: **[https://github.com/Spincel/torneo-fut](https://github.com/Spincel/torneo-fut)**

---

## 📋 Bases y Reglamento Oficial del Torneo

De acuerdo con la convocatoria oficial:

1. **Tamaño de Plantilla**:
   - Cada equipo se compone de **exactamente 6 jugadores**.
2. **Distribución Obligatoria por Grado Escolar (Regla 2-2-2)**:
   - 🎓 **2 jugadores de 3er año**
   - 🎓 **2 jugadores de 2do año**
   - 🎓 **2 jugadores de 1er año**
3. **Fechas Clave**:
   - 📅 **Día del Torneo**: **JUEVES 12 DE NOVIEMBRE**
   - ⏱️ **Periodo de Inscripciones**: **DE LUNES A MIÉRCOLES**
4. **Comité Organizador**:
   - Coordinador General: **Axel Javier González Salas**
5. **Premiación**:
   - 🎁 **¡El equipo ganador tendrá un PREMIO SORPRESA!** (Se dará a conocer el día del torneo).

---

## 🚀 Características del Sistema

### 1. Portal de Registro Público
- **Validación en Tiempo Real**: El formulario impide registros con plantillas incompletas o que violen la distribución 2-2-2.
- **Carga de Documentación Escolar**: Captura de credenciales estudiantiles o constancias oficiales con vista previa inmediata.
- **Generación de Folio y Cédula**: Emisión inmediata de folio único (ej. `TRF-12NOV-01`) y confirmación para acudir a mesa de control.

### 2. Panel de Administración (Axel Javier González Salas)
- **Diagnóstico Automático de Cumplimiento**: Monitoreo en vivo de los equipos que cumplen 100% con las bases vs. equipos irregulares.
- **Módulo de Altas**: Registro directo de equipos en ventanilla física.
- **Módulo de Bajas**: Descalificación o baja con registro de motivo (conducta, bajas voluntarias, incumplimiento).
- **Módulo de Sustituciones Protegido**: Al dar de baja a un jugador, el sistema exige que el sustituto sea **del mismo año escolar** para mantener intacta la regla 2-2-2.
- **Validación de Documentos con Zoom**: Visor interactivo para inspeccionar credenciales escolares, con aprobación y rechazo justificado.
- **Cédula Oficial de Partido Imprimible**: Hoja de juego para árbitros con espacios de firmas, dorsales, tarjetas y visto bueno del organizador.
- **Rol de Juegos (Fixture)**: Programación de partidos relámpago con canchas, horarios y captura de marcadores.
- **Exportación de Datos**: Descarga de padrón a Excel (formato CSV) y respaldo en JSON.

---

## 🛠️ Tecnologías Utilizadas

- **React 19** + **TypeScript**
- **Vite 8**
- **Tailwind CSS v4** con `@custom-variant dark`
- **Lucide React** (Iconografía deportiva y administrativa)
- **LocalStorage API** (Persistencia local automática)

---

## 💻 Instalación y Ejecución Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/Spincel/torneo-fut.git
cd torneo-fut

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

El servidor estará disponible en `http://localhost:3000`.

---

## 📱 App instalable (PWA) y móvil

La app es instalable en el celular como acceso directo:

- **Android (Chrome):** abre la app, toca el banner **“Instalar app”** o el menú ⋮ → **Instalar app / Agregar a pantalla de inicio**.
- **iPhone (Safari):** toca **Compartir** → **Agregar a inicio**. iOS no muestra el banner automático; la app trae las instrucciones en el mismo aviso.
- Una vez instalada abre a pantalla completa (`display: standalone`), con icono propio y funciona sin conexión para el shell de la app (los datos de equipos viven en `localStorage` del dispositivo).

Detalles técnicos: `public/manifest.webmanifest`, iconos en `public/icons/` (192, 512, maskable y `apple-touch-icon`), service worker manual en `public/sw.js` registrado desde `src/main.tsx` (solo en producción) y banner de instalación en `src/components/InstallBanner.tsx`.

---

## 📦 Sincronización con GitHub

Para subir las actualizaciones a tu repositorio oficial:

```bash
git remote add origin https://github.com/Spincel/torneo-fut.git
git branch -M main
git add .
git commit -m "feat: Sistema de registro y administración Torneo Relámpago con bases 2-2-2"
git push -u origin main
```

---

*Organizado por: **Axel Javier González Salas** · Torneo Relámpago de Fútbol*
