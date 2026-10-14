# AulaControl — Gestión Administrativa · Cádiz 2026/2027

Web estática para gestionar el horario de Grado Medio de Gestión Administrativa y controlar el umbral de faltas del 20 % por asignatura.

## Publicar gratis en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `aulacontrol`).
2. Sube `index.html` a la **raíz** del repositorio (y este README si quieres).
3. En **Settings → Pages → Build and deployment**, selecciona **Deploy from a branch**, rama **main**, carpeta **/(root)** y guarda.
4. GitHub te mostrará la dirección `https://TU-USUARIO.github.io/aulacontrol/` cuando termine el despliegue.

También puedes abrir `index.html` directamente en el navegador sin servidor.

## Funciones

- Horario interactivo por semanas, navegable, con nombre de asignatura, profesor/a y registro de falta con un clic.
- Calendario mensual con días lectivos, festivos, vacaciones y marcado de faltas por hora.
- Cálculo automático del total de horas de cada módulo y del máximo de faltas según la regla configurada.
- Registro de faltas, eliminación, copia de seguridad JSON e importación.
- Festivos locales y días no lectivos adicionales configurables.
- Almacenamiento local en el navegador. No requiere cuenta ni base de datos.

## Criterio de cálculo

El curso de FP va del **15 de septiembre de 2026 al 23 de junio de 2027** según el calendario de FSIE Cádiz. Se excluyen sábados, domingos, Navidad (23 diciembre–8 enero), Semana Santa (22–28 marzo), el día de la Comunidad Educativa (30 abril) y los festivos trasladados indicados en el PDF.

Cada bloque del horario equivale a una hora lectiva, seis bloques por día. Al sumar todas las fechas lectivas por día de la semana se obtienen las horas previstas de cada asignatura.

Para el modo por defecto **«al alcanzar el 20 %»**, el máximo de horas que se pueden faltar sin llegar al límite es `ceil(totalHoras × 0.20) - 1`. Para el modo **«al superar el 20 %»**, es `floor(totalHoras × 0.20)`. El contador resta las faltas registradas. Esto es orientativo: consulta con tu centro la regla exacta, cómo cuentan las faltas justificadas, y posibles cambios de calendario.

**Importante:** el calendario publicado deja **sin especificar los días no lectivos locales**. Añádelos en Ajustes. También conviene confirmar si tu instituto termina la docencia de algún módulo antes del 23 de junio.

Fuente: [Calendario escolar 2026/27, FSIE Cádiz](https://fsieandalucia.es/documentos/Noticias_provinciales/Cadiz/FSIE_CA%CC%81DIZ_CALENDARIO_ESCOLAR_2026_2027.pdf)