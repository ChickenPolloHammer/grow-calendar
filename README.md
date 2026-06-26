# 🌱 Grow Calendar

Calendario de cultivo con sincronización en la nube. Los datos se guardan en Supabase y persisten año tras año, desde cualquier dispositivo.

## Características

- Calendario mensual tipo papel — cuadrículas por día con notas
- Registro de riegos: agua, fertilizante, lluvia (con litros)
- Programa de fertilización escalado automáticamente a tu ciclo real
- Fases de cultivo con franja visual lateral
- Estadísticas mensuales
- **Datos sincronizados en la nube con Supabase** — persisten indefinidamente
- Fallback a localStorage si no hay conexión

---

## 1. Crear la base de datos en Supabase

1. Ve a [supabase.com](https://supabase.com) → New project (gratis)
2. Una vez creado, abre **SQL Editor → New query**
3. Pega el contenido de `supabase_setup.sql` y ejecuta ▶

---

## 2. Obtener las credenciales

En tu proyecto Supabase: **Settings → API**

Copia:
- `Project URL` → es tu `SUPABASE_URL`
- `anon public key` → es tu `SUPABASE_ANON_KEY`

---

## 3. Configurar variables de entorno

```bash
cp .env.example .env
# Edita .env con tus credenciales reales
```

El fichero `.env` ya está en `.gitignore` — nunca se subirá a Git.

---

## 4. Instalar y arrancar

```bash
npm install
npm start
```

---

## 5. Deploy en Vercel

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/TU_USUARIO/grow-calendar.git
git push -u origin main
```

En [vercel.com](https://vercel.com) → importa el repo → antes de hacer Deploy:

**Settings → Environment Variables**, añade:
```
REACT_APP_SUPABASE_URL        = https://xxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY   = eyJ...
```

Luego Deploy ✅

---

## Cómo funciona la sincronización

- Cada dispositivo/navegador tiene un ID único (guardado en localStorage)
- Al arrancar, descarga los datos de Supabase si son más recientes que los locales
- Cada cambio se guarda en local inmediatamente y se sube a Supabase 1.2 segundos después
- El indicador ☁ / 💾 en la cabecera muestra el estado de sincronización
- Si no hay credenciales configuradas, funciona solo con localStorage (como antes)

---

## Estructura

```
src/
├── App.jsx
├── supabase.js          ← cliente Supabase
├── useGrowData.js       ← hook principal con sync
├── fertSchedule.js
└── components/
    ├── MonthCalendar.jsx
    ├── DayCell.jsx
    ├── StatsBar.jsx
    ├── PhaseLegend.jsx
    └── ScheduleEditor.jsx
```
