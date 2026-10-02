export const SITE = {
  name: "Cristal Sagrado", origin: "https://cristal-sagrado.com", whatsappNumber: "59896106373",
  whatsappDefaultMessage: "Hola Luz, quiero un turno",
  instagram: "https://www.instagram.com/cristal.sagrado.uy?utm_source=qr&igsh=MXhlYWJybGNsNHg3eA==/",
  tiktok: "https://www.tiktok.com/@luci..ffer?_t=ZM-905gO5jqnue&_r=1"
} as const;
export const navigation = [
  { label: "Magia roja", href: "magia-roja/" }, { label: "Magia blanca", href: "magia-blanca/" },
  { label: "Magia verde", href: "magia-verde/" }, { label: "Magia negra", href: "magia-negra/" },
  { label: "Tarot", href: "tarot/" }, { label: "Preguntas frecuentes", href: "faq/" },
  { label: "¿Cómo trabajamos?", href: "como-trabajamos/" }
] as const;
export const categories = [
  { label: "Magia Blanca", description: "Rituales para protección, amor y prosperidad.", href: "magia-blanca/" },
  { label: "Magia Negra", description: "Soluciones para situaciones complejas y desafiantes.", href: "magia-negra/" },
  { label: "Magia Roja", description: "Rituales para el amor, amarres y endulzamientos.", href: "magia-roja/" },
  { label: "Magia Verde", description: "Conexión con la naturaleza y sanación.", href: "magia-verde/" },
  { label: "Tarot", description: "Lecturas precisas para guiar tu camino.", href: "tarot/" }
] as const;
export const faqItems = [
  { question: "¿Cómo reservo un turno?", answer: "Escribime por WhatsApp y coordinamos día y hora. Si es online, te envío el enlace de la videollamada." },
  { question: "¿Atendés online?", answer: "Sí, por videollamada. Podés pedir resumen escrito o foto y videos del tiraje o trabajos cuando corresponda." },
  { question: "¿Cuánto dura una sesión?", answer: "La lectura completa dura 45 minutos a una hora; la consulta express, 30 minutos." },
  { question: "¿Qué no hacés en lectura?", answer: "Trabajo con ética: no realizo fatalismos, no diagnostico salud ni reemplazo asesoría legal o médica." },
  { question: "¿Puedo reprogramar?", answer: "Sí, avisando con al menos 24 h de anticipación para mantener tu seña." },
  { question: "¿Las sesiones son confidenciales?", answer: "Sí, toda la información que compartís se maneja con reserva." }
] as const;
export const faqSchemaItems = [
  { question: "¿Cómo reservo un turno?", answer: "Escribime por WhatsApp y coordinamos día y hora. Si es online, te envío el enlace de la videollamada." },
  { question: "¿Atendés online?", answer: "Sí, por videollamada. Podés pedir resumen escrito o foto del tiraje." },
  { question: "¿Cuánto dura una sesión?", answer: "La lectura completa dura 60 minutos; la consulta express, 30 minutos." },
  { question: "¿Qué no hacés en lectura?", answer: "Trabajo con ética: no realizo fatalismos, no diagnostico salud ni reemplazo asesoría legal o médica." },
  { question: "¿Puedo reprogramar?", answer: "Sí, avisando con al menos 24 h de anticipación para mantener tu seña." }
] as const;
export const processSteps = [
  { title: "Me contás tu caso", text: "Podés escribirme por WhatsApp o por el formulario de la web." },
  { title: "Ordenamos la situación", text: "Te ayudo a entender qué tipo de consulta o trabajo puede tener más sentido." },
  { title: "Te explico las opciones", text: "Hablamos de tiempos, enfoque y recomendaciones antes de comenzar." },
  { title: "Avanzamos con reserva", text: "Cada caso se trata de forma personalizada, cuidada y confidencial." }
] as const;
export const aboutSteps = [
  { title: "Escuchamos tu caso y resolvemos tus dudas.", text: "" },
  { title: "Te recomendamos el servicio más adecuado.", text: "" },
  { title: "Realizamos el ritual o lectura de tarot.", text: "" },
  { title: "Te acompañamos durante el proceso y resolvemos tus inquietudes.", text: "" }
] as const;
export const trustPoints = [
  { title: "Atención online", text: "Consultas desde Uruguay o desde cualquier lugar." },
  { title: "Reserva total", text: "Tu situación se conversa de forma privada y respetuosa." },
  { title: "Orientación personalizada", text: "Cada lectura o trabajo se adapta al caso." },
  { title: "Comunicación clara", text: "Antes de avanzar, sabés qué se va a trabajar y cómo." }
] as const;
export const testimonials = [
  { quote: "La lectura me dio claridad y paz. Volví a dormir tranquila.", attribution: "M., Centro (Montevideo)" },
  { quote: "Súper ética y directa, sin vueltas. Recomendadísima.", attribution: "M.G., Sayago" },
  { quote: "La limpieza se sintió al instante. Gracias, Luz.", attribution: "M.A., La Teja" }
] as const;
