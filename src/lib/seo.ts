import { SITE } from "./constants";
export const pageMetadata = {
  home: { title: "Cristal Sagrado | Tarot y trabajos espirituales en Uruguay", description: "Explorá tarot, limpiezas energéticas y trabajos espirituales de Cristal Sagrado. Consultá online desde Montevideo o Uruguay por WhatsApp." },
  blanca: { title: "Limpiezas y protección espiritual en Uruguay | Cristal Sagrado", description: "Conocé los trabajos de magia blanca, limpieza y protección publicados. Consultá online desde Uruguay y confirmá los detalles por WhatsApp." },
  roja: { title: "Magia roja y trabajos de amor en Uruguay | Cristal Sagrado", description: "Explorá trabajos de magia roja para preguntas sobre amor y vínculos. Consultá online desde Uruguay, sin promesas de resultados garantizados." },
  negra: { title: "Trabajos espirituales para casos complejos | Cristal Sagrado", description: "Acompañamiento espiritual reservado para situaciones complejas, protección y orientación personalizada con atención por WhatsApp." },
  verde: { title: "Magia verde, bienestar y energía | Cristal Sagrado", description: "Servicios espirituales vinculados a bienestar, energía, armonización y conexión natural con atención confidencial y personalizada." },
  tarot: { title: "Tarot online en Uruguay y Montevideo | Cristal Sagrado", description: "Lecturas de tarot online para explorar preguntas sobre vínculos, trabajo y decisiones. Consultá desde Montevideo u otra localidad de Uruguay." },
  montevideo: { title: "Trabajos espirituales y tarot en Montevideo | Cristal Sagrado", description: "Conocé el catálogo de trabajos espirituales y tarot de Cristal Sagrado. Consultas online desde Montevideo y Uruguay por WhatsApp." },
  faq: { title: "Preguntas frecuentes | Cristal Sagrado", description: "Respuestas sobre reservas, atención online, confidencialidad, tarot y acompañamiento espiritual en Cristal Sagrado." },
  process: { title: "Cómo trabajamos | Cristal Sagrado", description: "Conocé el proceso de consulta, orientación y acompañamiento de Cristal Sagrado para servicios espirituales y tarot." }
} as const;
export function canonical(path: string) { return new URL(path, SITE.origin).toString(); }

export const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${SITE.origin}/#organization`, name: SITE.name, url: `${SITE.origin}/` },
    { "@type": "WebSite", "@id": `${SITE.origin}/#website`, name: SITE.name, url: `${SITE.origin}/`, publisher: { "@id": `${SITE.origin}/#organization` }, inLanguage: "es-UY" },
    { "@type": "WebPage", "@id": `${SITE.origin}/#webpage`, name: pageMetadata.home.title, url: `${SITE.origin}/`, isPartOf: { "@id": `${SITE.origin}/#website` }, about: { "@id": `${SITE.origin}/#organization` }, inLanguage: "es-UY" }
  ]
};
