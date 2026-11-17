# StudyFlow

Organiza tu **horario**, tus **apuntes** y tus **pomodoros** en un solo sitio.
Tema oscuro, funciona en móvil y ordenador, y se puede instalar como app (PWA).

**Demo:** https://jordi05.github.io/studyflow/

## Qué hace (fase 1)

- **Cuentas locales**: cada usuario crea su cuenta y sus datos se guardan en su propio navegador (localStorage). No hay servidor.
- **Horario semanal**: añade clases con día, hora y color. Toca un bloque para editarlo o borrarlo.
- **Entregas**: con cuenta atrás (quedan 2d 4h), marcar como hechas y aviso en rojo si queda menos de un día.
- **Apuntes**: crea, busca, edita y borra notas. Se guardan solas mientras escribes.
- **Pomodoro**: enfoque y descansos configurables, contador de sesiones y minutos de enfoque de hoy y de la semana.
- **Avisos**: notificación al terminar el pomodoro y recordatorios de entregas (10 min, 1 h, 1 día antes o personalizado). Llegan con la app abierta; con la app cerrada solo si la instalas en pantalla de inicio (iPhone: iOS 16.4+), y sin servidor no están garantizados.
- **Selector de fecha y hora propio**: mini calendario y hora con botones −/+, en tema oscuro, sin los selectores blancos del navegador.
- **Exportar / importar** tus datos en JSON (tocando tu avatar), para cambiar de dispositivo.
- **Cuenta demo** de un toque en la pantalla de entrada.
- **Datos de ejemplo** con un botón, para probarla rápido.

## Roadmap

- **Fase 2**: cuentas reales con backend y sincronización entre dispositivos.
- **Fase 2**: IA conectada que te propone y te arregla el horario (el hueco ya está previsto en la interfaz).

## Tech

HTML + CSS + JavaScript vanilla en un solo archivo. Sin build, sin dependencias. Servida con GitHub Pages.

## Privacidad

En esta fase todo se guarda en el navegador de cada usuario. Nada sale del dispositivo.

## Licencia

MIT
