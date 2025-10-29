import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductoForm {
    nombre: string;
    descripcion: string;
    precio: number;
    cantidad: number;
    imagen?: string;
    categoria?: string; // Campo opcional (no existe en BD aún)
    edad?: string; // Campo opcional (no existe en BD aún)
}

@Injectable({
    providedIn: 'root'
})
export class InventarioService {
    private apiUrl = 'http://localhost:4000/api/catalogo';

    constructor(private http: HttpClient) {}

    /**
     * Agrega un nuevo producto al inventario
     */
    agregarProducto(producto: ProductoForm): Observable<any> {
        return this.http.post(`${this.apiUrl}/productos`, producto);
    }

    /**
     * Actualiza un producto existente
     */
    actualizarProducto(id_producto: number, producto: Partial<ProductoForm>): Observable<any> {
        return this.http.put(`${this.apiUrl}/productos/${id_producto}`, producto);
    }

    /**
     * Elimina un producto del inventario
     */
    eliminarProducto(id_producto: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/productos/${id_producto}`);
    }

    /**
     * Obtiene un producto por su ID
     */
    obtenerProductoPorId(id_producto: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/productos/${id_producto}`);
    }
}
