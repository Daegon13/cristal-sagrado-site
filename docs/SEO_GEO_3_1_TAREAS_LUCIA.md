# Decisiones e intervención de Lucía para 3.1

1. Confirmar si todos los trabajos del catálogo pueden iniciarse mediante consulta online desde Montevideo y otras localidades de Uruguay, y qué modalidades concretas corresponden a cada tipo. La landing actual solo afirma el inicio de la consulta online, ya descrito en el sitio; no anuncia atención presencial.
2. Confirmar que los enlaces de Instagram y TikTok del footer son los perfiles oficiales vigentes y, si lo son, enlazar desde sus biografías `https://cristal-sagrado.com/`. Solo después considerar `sameAs`.
3. Confirmar si existe atención presencial real que cumpla los requisitos de Google Business Profile. Sin esa información no crear ficha, dirección, horario ni `LocalBusiness`.
4. Revisar el PR y la preview en un móvil real, Safari iOS e Instagram WebView; probar navegación, WhatsApp y el formulario sin compartir casos privados en capturas. Aprobar el merge solo después de la revisión; el merge publica automáticamente.
5. Indicar si ya existe acceso autorizado a Google Search Console y Bing Webmaster Tools. Si no, verificar propiedad por sus flujos oficiales; compartir acceso mediante la interfaz de cada servicio, sin pegar credenciales ni tokens en Git. Después del despliegue, registrar la fecha real y revisar indexación y consultas.
6. Decidir una política específica para `Google-Extended` si se quiere restringir usos de IA de Google: el control puede afectar también experiencias de Gemini. La rama actual separa GPTBot y ClaudeBot, y deja accesibles los bots de búsqueda y acceso solicitado por usuarios.
7. Mantener por separado, en el registro privado existente, mensajes de WhatsApp recibidos y ventas confirmadas para contrastarlos con visitas y clics. No enviar esos datos a Umami ni al repositorio.
