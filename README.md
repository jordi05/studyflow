# StudyFlow

Organiza tu **horario**, tus **apuntes** y tus **pomodoros** en un solo sitio.
Tema oscuro o claro con acentos personalizables, funciona en móvil y ordenador, y se puede instalar como app (PWA).

**Web:** https://jordi05.github.io/studyflow/

## Qué hace (fase 2, beta)

- **Cuentas reales con email**: registro e inicio de sesión con email y contraseña (Supabase Auth). Tus datos se sincronizan con tu cuenta y los tienes en todos tus dispositivos.
- **Sincronización automática**: cada cambio se guarda primero en el navegador (funciona sin conexión) y se sube a la nube en segundo plano. Al entrar desde otro dispositivo se descarga tu versión de la nube.
- **Migración desde la fase 1**: si tenías datos locales de antes, la app te ofrece subirlos a tu cuenta la primera vez que entras.
- **Guía de primera visita**: la primera vez que entras con tu cuenta, un tour guiado te enseña el menú, el horario, las entregas, los apuntes, el pomodoro y la personalización. Puedes saltarlo y no vuelve a aparecer (hecho con [driver.js](https://driverjs.com/), licencia MIT, copia local en este repo).
- **Horario semanal**: añade clases con día, hora y color. Toca un bloque para editarlo o borrarlo. En móvil se ve día a día.
- **Entregas**: con cuenta atrás (quedan 2d 4h), marcar como hechas y aviso en rojo si queda menos de un día.
- **Apuntes**: crea, busca, edita y borra notas. Se guardan solas mientras escribes.
- **Pomodoro**: enfoque y descansos configurables, contador de sesiones y minutos de enfoque de hoy y de la semana.
- **Avisos**: notificación al terminar el pomodoro y recordatorios de entregas (10 min, 1 h, 1 día antes o personalizado). Llegan con la app abierta; con la app cerrada solo si la instalas en pantalla de inicio (iPhone: iOS 16.4+), y sin servidor no están garantizados.
- **Selector de fecha y hora propio**: mini calendario y hora con botones −/+, en tema oscuro, sin los selectores blancos del navegador.
- **Personalización**: modo oscuro/claro y color de acento desde la pantalla de entrada (o el icono de la paleta, arriba a la derecha). Sección **Pro** (gratis en beta): más acentos y color personalizado en hex.
- **Exportar / importar** tus datos en JSON (tocando tu avatar), para cambiar de dispositivo.
- **Datos de ejemplo** con un botón, para probarla rápido.

## Seguridad

- Backend gestionado con **Supabase** (servidores en la UE, Irlanda). La app solo habla con Supabase; nada va a otros terceros.
- **Row Level Security** en todas las tablas: cada usuario solo puede leer y escribir sus propios datos. La marca Pro solo la puede cambiar el servidor, nunca el cliente.
- El repo solo contiene la **clave publicable** de Supabase, pensada para ir en el frontend. La clave secreta no está en el repo ni se usa en la app.
- Contraseñas gestionadas por Supabase Auth (hash en servidor); nunca pasan por el repo ni se guardan en claro.
- Content Security Policy (`script-src 'self'`), sin dependencias externas servidas desde terceros: todo el JavaScript se sirve desde este repo (propio, más una copia local de driver.js, licencia MIT).
- La importación de JSON valida y sanea todos los campos.

## Roadmap

- ~~**Fase 2**: cuentas reales con backend y sincronización entre dispositivos.~~ (hecho, en beta)
- **Fase 3**: suscripción Pro con Stripe (la marca `pro` ya existe en la base de datos).
- **Fase 3**: IA conectada que te propone y te arregla el horario (el hueco ya está previsto en la interfaz).

## Tech

HTML + CSS + JavaScript vanilla. Sin build, sin dependencias de código. Servida con GitHub Pages. Backend: Supabase (Auth + Postgres con RLS), con un cliente propio mínimo en `sb.js` que habla directo con la API REST.

## Privacidad

Solo se guarda lo necesario para que la app funcione: tu email (para la cuenta) y tus datos de la app (horario, apuntes, entregas y pomodoros). Nada más. Los datos viven en servidores de Supabase en la UE y solo tú puedes leerlos (RLS). Analítica de visitas con GoatCounter, sin cookies ni datos personales.

## Licencia

MIT
