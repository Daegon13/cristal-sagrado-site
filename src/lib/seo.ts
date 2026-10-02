import { SITE } from "./constants";
export const pageMetadata = {
  home: { title: "Cristal Sagrado | Tarot, limpiezas y orientación espiritual", description: "Consultas de tarot, limpiezas energéticas y trabajos espirituales con reserva por WhatsApp, atención confidencial y acompañamiento personalizado." },
  blanca: { title: "Magia blanca y limpiezas energéticas | Cristal Sagrado", description: "Servicios de magia blanca, protección, armonización y limpiezas energéticas con orientación confidencial y consulta personalizada." },
  roja: { title: "Magia roja para amor y vínculos | Cristal Sagrado", description: "Orientación espiritual para amor, vínculos y situaciones afectivas desde un enfoque reservado, personalizado y sin promesas garantizadas." },
  negra: { title: "Trabajos espirituales para casos complejos | Cristal Sagrado", description: "Acompañamiento espiritual reservado para situaciones complejas, protección y orientación personalizada con atención por WhatsApp." },
  verde: { title: "Magia verde, bienestar y energía | Cristal Sagrado", description: "Servicios espirituales vinculados a bienestar, energía, armonización y conexión natural con atención confidencial y personalizada." },
  tarot: { title: "Lecturas de tarot online | Cristal Sagrado", description: "Lecturas de tarot para claridad emocional, vínculos, trabajo y decisiones importantes con atención online y confidencial." },
  faq: { title: "Preguntas frecuentes | Cristal Sagrado", description: "Respuestas sobre reservas, atención online, confidencialidad, tarot y acompañamiento espiritual en Cristal Sagrado." },
  process: { title: "Cómo trabajamos | Cristal Sagrado", description: "Conocé el proceso de consulta, orientación y acompañamiento de Cristal Sagrado para servicios espirituales y tarot." }
} as const;
export function canonical(path: string) { return new URL(path, SITE.origin).toString(); }
