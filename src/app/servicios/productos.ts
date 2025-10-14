import { Injectable } from '@angular/core';
import { Producto } from '../modelos/producto';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class Productos {
    private apiUrl = 'http://localhost:4000/api/catalogo/productos';
    constructor(private http: HttpClient) {}
    async getProductos(): Promise<Producto[]> {
        const request$ = this.http.get<Producto[]>(this.apiUrl);
        return lastValueFrom(request$);
    }
}