# 🌱 Grow Calendar

Calendario de cultivo para seguimiento de riegos, lluvia y fertilización semana a semana desde la germinación.

## Características

- **Calendario mensual** tipo papel — un recuadro por día con espacio para notas
- **Registro de riegos**: agua, fertilizante o lluvia, con litros opcionales
- **Programa de fertilización** personalizable por semana (desde germinación)
- **Fases de cultivo**: plántula → vegetativo → floración → lavado
- **Estadísticas mensuales**: cuántas veces y cuántos litros de cada tipo
- **Countdown a la cosecha**
- Datos guardados en el navegador (localStorage) — sin cuenta, sin servidor

## Instalación local

```bash
npm install
npm start
```

Abre [http://localhost:3000](http://localhost:3000)

## Deploy en Vercel

1. Sube este proyecto a GitHub:
```bash
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/TU_USUARIO/grow-calendar.git
git push -u origin main
```

2. Ve a [vercel.com](https://vercel.com), conecta tu cuenta de GitHub
3. Importa el repositorio → Vercel lo detecta como Create React App automáticamente
4. Click en **Deploy** — listo ✅

## Uso

1. Abre ⚙ Config → introduce la fecha de germinación y el nombre de la variedad
2. Navega por meses con las flechas
3. Click en el `+` de cualquier día para registrar agua, fertilizante o lluvia
4. Edita el programa de fertilización en **Programa** (puedes poner tus productos reales y dosis)
5. Los datos se guardan automáticamente en el navegador

## Estructura

```
src/
├── App.jsx              # Raíz
├── fertSchedule.js      # Programa base + fases
├── useStorage.js        # Hook localStorage
└── components/
    ├── MonthCalendar.jsx  # Grid mensual
    ├── DayCell.jsx        # Celda de día + modal
    ├── StatsBar.jsx       # Resumen del mes
    ├── PhaseLegend.jsx    # Leyenda de fases
    └── ScheduleEditor.jsx # Editor del programa
```
