export type BookStatus = "draft" | "upcoming" | "available";
export type BookFormat = "pdf" | "epub" | "physical";
export type Distribution = "none" | "free" | "manual" | "external";

export interface Book {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  status: BookStatus;
  formats: BookFormat[];
  distribution: Distribution;
  price?: string;
  cover?: string;
  synopsis?: string;
  highlights?: string[];
  sampleUrl?: string;
  purchaseUrl?: string;
  publicInquiry: boolean;
}

export const books: Book[] = [
  { id: "habitar-lo-posible", slug: "habitar-lo-posible", title: "Habitar lo posible", subtitle: "Manifestación consciente entre la mente, el símbolo y la acción.", author: "Lucía Mayada", status: "draft", formats: [], distribution: "none", publicInquiry: true },
  { id: "brujeria-para-principiantes", slug: "brujeria-para-principiantes", title: "Brujería para principiantes", subtitle: "El arte de despertar la magia, descubrir tu sendero y transformar lo cotidiano en sagrado.", author: "Lucía Mayada", status: "draft", formats: [], distribution: "none", publicInquiry: true },
  { id: "el-umbral-de-cristal", slug: "el-umbral-de-cristal", title: "El Umbral de Cristal", subtitle: "Alquimia, intención y el arte de manifestar tu realidad.", author: "Lucía Mayada", status: "draft", formats: [], distribution: "none", publicInquiry: true }
];
