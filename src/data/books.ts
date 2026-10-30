export type BookStatus = "draft" | "upcoming" | "available";
export type BookFormat = "pdf" | "epub" | "physical";
export type Distribution = "none" | "free" | "manual" | "external";

export interface Book {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  primaryCategory: string;
  topics: string[];
  shortSynopsis: string;
  status: BookStatus;
  formats: BookFormat[];
  distribution: Distribution;
  price?: string;
  cover?: string;
  synopsis?: string;
  highlights?: string[];
  contents?: string[];
  sampleUrl?: string;
  purchaseUrl?: string;
  publicInquiry: boolean;
}

export const books: Book[] = [
  {
    id: "habitar-lo-posible", slug: "habitar-lo-posible", title: "Habitar lo posible", subtitle: "Manifestación consciente entre la mente, el símbolo y la acción.", author: "Lucía Mayada",
    primaryCategory: "Manifestación consciente", topics: ["Desarrollo personal", "Símbolos y sigilos", "Autoconocimiento"],
    shortSynopsis: "Un recorrido para pensar la manifestación desde la atención, la imaginación, los símbolos y las decisiones de cada día.",
    synopsis: "Lucía Mayada propone acercarse a la manifestación sin separar los deseos de las acciones que pueden acercarnos a ellos. En cuatro partes —comprender, crear, encarnar y practicar— explora creencias, atención, imaginación, escritura, rituales y sigilos. El recorrido termina con el Método Cristal Sagrado y una práctica de treinta días.",
    highlights: ["Reflexiones sobre mente y creencias", "Símbolos, escritura y sigilos", "Acciones sostenidas y hábitos", "Un recorrido de treinta días"],
    contents: ["Lo que creo que era manifestar", "Nombrar el deseo", "El arte del sigilo", "El Método Cristal Sagrado: las diez facetas", "Treinta días para habitar lo posible"],
    cover: "images/libros/habitar-lo-posible-portada.webp", sampleUrl: "muestras/habitar-lo-posible-muestra.pdf",
    status: "upcoming", formats: [], distribution: "none", publicInquiry: true
  },
  {
    id: "brujeria-para-principiantes", slug: "brujeria-para-principiantes", title: "Brujería para principiantes", subtitle: "El arte de despertar la magia, descubrir tu sendero y transformar lo cotidiano en sagrado.", author: "Lucía Mayada",
    primaryCategory: "Brujería práctica", topics: ["Iniciación", "Herramientas espirituales", "Rituales cotidianos"],
    shortSynopsis: "Una guía de iniciación a la brujería, sus tradiciones, herramientas y prácticas, con ejercicios para explorar un camino propio.",
    synopsis: "Pensado para quienes sienten curiosidad por la brujería, este libro reúne historia y tradiciones con propuestas de práctica. Recorre la preparación de un espacio, las herramientas, los símbolos y sigilos, y las correspondencias de la Luna, los elementos y las plantas. También propone rituales cotidianos y un itinerario inicial de treinta días.",
    highlights: ["Historia y distintas tradiciones", "Herramientas, altares y elementos de práctica", "Símbolos y correspondencias", "Rituales cotidianos e itinerario inicial"],
    contents: ["El llamado de la magia", "Breve historia de la brujería", "Herramientas mágicas", "Altares: desde lo sencillo hasta lo ceremonial", "El arte de crear sigilos", "Cómo diseñar un ritual desde cero"],
    cover: "images/libros/brujeria-para-principiantes-portada.webp", sampleUrl: "muestras/brujeria-para-principiantes-muestra.pdf",
    status: "upcoming", formats: [], distribution: "none", publicInquiry: true
  },
  {
    id: "el-umbral-de-cristal", slug: "el-umbral-de-cristal", title: "El Umbral de Cristal", subtitle: "Alquimia, intención y el arte de manifestar tu realidad.", author: "Lucía Mayada",
    primaryCategory: "Alquimia y autoconocimiento", topics: ["Manifestación", "Imaginación", "Ejercicios guiados"],
    shortSynopsis: "Diez etapas de reflexión y práctica para explorar intención, imaginación, emociones y transformación personal.",
    synopsis: "El Umbral de Cristal invita a atravesar diez umbrales de reflexión y práctica. Cada etapa combina lenguaje simbólico, escritura personal y ejercicios de autoconocimiento para explorar creencias, imaginación, emociones y acciones. El libro incluye un diario de práctica y un plan de veintiún días.",
    highlights: ["Diez umbrales de reflexión", "Ejercicios de escritura e intención", "Trabajo simbólico con sigilos", "Un plan de veintiún días"],
    contents: ["Antes de cruzar el umbral", "Cómo usar este libro", "El Primer Umbral: ¿Qué es realmente la manifestación?", "El Tercer Umbral: Tu mente como campo de creación", "Plan de 21 días"],
    cover: "images/libros/el-umbral-de-cristal-portada.webp", sampleUrl: "muestras/el-umbral-de-cristal-muestra.pdf",
    status: "upcoming", formats: [], distribution: "none", publicInquiry: true
  }
];
