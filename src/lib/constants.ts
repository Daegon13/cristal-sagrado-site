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
  { key: "blanca", label: "Magia Blanca", description: "Trabajos de limpieza, protección y armonización.", href: "magia-blanca/", cta: "Explorar Magia Blanca" },
  { key: "roja", label: "Magia Roja", description: "Trabajos para vínculos, amor y armonización afectiva.", href: "magia-roja/", cta: "Explorar Magia Roja" },
  { key: "negra", label: "Magia Negra", description: "Trabajos para situaciones complejas, con orientación previa.", href: "magia-negra/", cta: "Explorar Magia Negra" },
  { key: "verde", label: "Magia Verde", description: "Trabajos vinculados con la naturaleza y la armonización.", href: "magia-verde/", cta: "Explorar Magia Verde" },
  { key: "tarot", label: "Tarot", description: "Lecturas para explorar preguntas y mirar tu situación.", href: "tarot/", cta: "Explorar lecturas de Tarot" }
] as const;
export const faqItems = [
  { question: "¿Cómo sé qué trabajo necesito?", answer: "No tenés que elegirlo antes de consultar. Contame brevemente tu situación por WhatsApp y te oriento sobre las opciones que pueden tener sentido para vos." },
  { question: "¿Qué tengo que enviar para consultar?", answer: "Al tocar un botón de WhatsApp, primero aparece un espacio para contarme brevemente qué estás viviendo. Después se abre WhatsApp con tu mensaje preparado." },
  { question: "¿Cómo reservo un turno?", answer: "Escribime por WhatsApp y coordinamos día y hora. Si es online, te envío el enlace de la videollamada." },
  { question: "¿Atendés online?", answer: "Sí, por videollamada. Podés pedir un resumen escrito o un registro del tiraje o trabajo cuando corresponda." },
  { question: "¿Cuánto dura una sesión?", answer: "La lectura completa dura 45 minutos a una hora; la consulta express, 30 minutos." },
  { question: "¿Qué no hacés en lectura?", answer: "Trabajo con ética: no realizo fatalismos, no diagnostico salud ni reemplazo asesoría legal o médica." },
  { question: "¿Puedo reprogramar?", answer: "Sí, avisando con al menos 24 h de anticipación para mantener tu seña." },
  { question: "¿Las sesiones son confidenciales?", answer: "Sí, la información que compartís se trata con reserva." }
] as const;
export const faqSchemaItems = faqItems;
export const processSteps = [
  { title: "Me contás tu situación", text: "Escribime brevemente por WhatsApp. Si preferís, usá el formulario de contacto." },
  { title: "Vemos las opciones", text: "Te oriento sobre la lectura o el trabajo que puede tener sentido para vos." },
  { title: "Te explico antes de avanzar", text: "Conversamos sobre el enfoque, los tiempos y tus dudas." },
  { title: "Hacemos la lectura o el trabajo", text: "Te acompaño durante el proceso y, cuando corresponde, podés pedir un registro." }
] as const;
export const aboutSteps = [
  { title: "Me contás tu situación", text: "Escribime brevemente qué estás viviendo." },
  { title: "Vemos las opciones", text: "Te oriento sobre la lectura o el trabajo que puede tener sentido." },
  { title: "Te explico cómo seguimos", text: "Conversamos sobre el enfoque y tus dudas antes de avanzar." },
  { title: "Te acompaño en el proceso", text: "Realizo la lectura o el trabajo acordado y seguimos en contacto." }
] as const;
export const trustPoints = [
  { title: "Atención online", text: "Consultas desde Uruguay o desde cualquier lugar." },
  { title: "Consulta privada", text: "Tu situación se conversa con reserva y respeto." },
  { title: "Orientación personalizada", text: "Vemos qué lectura o trabajo tiene sentido para tu situación." },
  { title: "Comunicación clara", text: "Antes de avanzar, sabés qué se va a trabajar y cómo." }
] as const;
export const testimonials = [
  { quote: "La lectura me dio claridad y paz. Volví a dormir tranquila.", attribution: "M., Centro (Montevideo)" },
  { quote: "Súper ética y directa, sin vueltas. Recomendadísima.", attribution: "M.G., Sayago" },
  { quote: "La limpieza se sintió al instante. Gracias, Luz.", attribution: "M.A., La Teja" }
] as const;
