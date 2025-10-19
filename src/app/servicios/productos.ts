import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
@Injectable({
    providedIn: 'root'
})
export class Productos {
    private apiUrl = 'http://localhost:4000/api/catalogo';
    constructor(private http: HttpClient) {}
    getProductos():Observable<any>{
        return this.http.get(`${this.apiUrl}/productos`).pipe(
            catchError(err => {
                return this.http.get(`/api/catalogo/productos`).pipe(
                    catchError(err2 => {
                        return of([]);
                    })
                );
            })
        );
    }
}