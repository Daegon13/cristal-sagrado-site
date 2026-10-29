import { SITE } from "./constants";
import type { Book } from "../data/books";

export function bookInquiryUrl(book: Pick<Book, "title" | "author" | "status">) {
  const ending = book.status === "available" ? "Quisiera consultar cómo conseguirlo." : "Quisiera consultar novedades sobre su disponibilidad.";
  const message = `Hola, llego desde Cristal Sagrado y me interesa el libro ${book.title} de ${book.author}. ${ending}`;
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
