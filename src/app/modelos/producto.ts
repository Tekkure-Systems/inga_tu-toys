export interface Producto {
    id_producto: number;
    nombre: string;
    descripcion: string;
    cantidad: number;
    precio: number;
    imagen: string;
    categoria?: string; // Opcional - no existe en BD actual
    edad?: string; // Opcional - no existe en BD actual
}