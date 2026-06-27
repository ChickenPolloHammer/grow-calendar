# 🌱 Grow Calendar

Calendario de cultivo con login y sincronización en la nube. Los datos se guardan vinculados a tu cuenta y están disponibles desde cualquier dispositivo.

---

## Configuración inicial

### 1. Crear la tabla en Supabase

Ve a tu proyecto en [supabase.com](https://supabase.com) → **SQL Editor → New query**, pega el contenido de `supabase_setup.sql` y ejecuta ▶.

> Si ya tenías la tabla antigua (con `device_id`), sigue las instrucciones del bloque "Migración" al final del SQL.

### 2. Activar Auth por email en Supabase

Ve a **Authentication → Providers → Email** y asegúrate de que está activado.

Opcional pero recomendado: en **Authentication → Email Templates** puedes personalizar el email de confirmación de cuenta.

### 3. Variables de entorno

```bash
cp .env.example .env
# Edita .env con tus credenciales (Settings → API en Supabase)
```

### 4. Instalar y arrancar

```bash
npm install
npm start
```

---

## Deploy en Vercel

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/TU_USUARIO/grow-calendar.git
git push -u origin main
```

En Vercel → importa el repo → **Settings → Environment Variables**:
```
REACT_APP_SUPABASE_URL       = https://xxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY  = eyJ...
```

→ Deploy ✅

---

## Cómo funciona

- Registro/login con email y contraseña (gestionado por Supabase Auth)
- Los datos están vinculados a tu `user_id` — mismos datos en cualquier dispositivo donde te loguees
- Cada cambio se guarda en local al instante y sube a Supabase 1.2 s después
- Row Level Security en Supabase: nadie puede leer tus datos salvo tú
- El indicador ☁ HH:MM en la cabecera confirma la última sincronización

---

## Estructura

```
src/
├── App.jsx
├── supabase.js
├── useAuth.js           ← sesión Supabase Auth
├── useGrowData.js       ← datos sincronizados por user_id
├── fertSchedule.js
└── components/
    ├── AuthScreen.jsx   ← login / registro / recuperar contraseña
    ├── MonthCalendar.jsx
    ├── DayCell.jsx
    ├── StatsBar.jsx
    ├── PhaseLegend.jsx
    └── ScheduleEditor.jsx
```
