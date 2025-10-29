import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface ProductoForm {
    nombre: string;
    descripcion: string;
    precio: number;
    cantidad: number;
    imagen?: string;
    categoria?: string;
    edad?: string;
}
@Injectable({
    providedIn: 'root'
})
export class InventarioService {
    private apiUrl = 'http://localhost:4000/api/catalogo';
    constructor(private http: HttpClient) {}
    agregarProducto(producto: ProductoForm): Observable<any> {
        return this.http.post(`${this.apiUrl}/productos`, producto);
    }
    actualizarProducto(id_producto: number, producto: Partial<ProductoForm>): Observable<any> {
        return this.http.put(`${this.apiUrl}/productos/${id_producto}`, producto);
    }
    eliminarProducto(id_producto: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/productos/${id_producto}`);
    }
    obtenerProductoPorId(id_producto: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/productos/${id_producto}`);
    }
}
