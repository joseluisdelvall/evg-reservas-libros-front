import { Libro } from "./libro.model";
import { Editorial } from "./editorial.model";

export interface PedidoResponse {
    status: string;
    message: string;
    data: Pedido[];
}

export interface Pedido {
    id?: string;
    fecha?: string;
    estado?: boolean;
    libros?: LibroPedido[];
    editorial?: Editorial;
}

export interface LibroPedido {
    id?: number;
    libro?: Libro;
    cantidad?: number;
} 