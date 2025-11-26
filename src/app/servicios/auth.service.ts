import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
function hasLocalStorage(): boolean {
    try {
        const hasWindow = typeof window !== 'undefined';
        const hasStorage = typeof window.localStorage !== 'undefined';
        return hasWindow && hasStorage;
    } catch {
        return false;
    }
}
@Injectable({ providedIn: 'root' })
export class AuthService {
    private api = 'http://localhost:4000/api/auth';
    constructor(private http: HttpClient) {}
    login(correo: string, password: string): Observable<any> {
        return this.http.post(`${this.api}/login`, { correo, password }).pipe(
            tap((res: any) => {
                if (res && res.user && hasLocalStorage()) {
                    window.localStorage.setItem('user', JSON.stringify(res.user));
                }
            }),
            catchError(err => {
                console.error('AuthService.login: error en peticion', err);
                return throwError(() => err);
            })
        );
    }
    logout() {
        if (hasLocalStorage()) {
            window.localStorage.removeItem('user');
        }
    }
    getUser() {
        if (!hasLocalStorage()) {
            return null;
        }
        const raw = window.localStorage.getItem('user');
        if (raw) {
            return JSON.parse(raw);
        }
        return null;
    }
    isLoggedIn() {
        const user = this.getUser();
        return user !== null;
    }
    
    isAdmin() {
        const user = this.getUser();
        return user !== null && user.tipo === 'admin';
    }
    register(payload: {
        nombre: string;
        apellidos?: string;
        correo: string;
        password: string;
        fecha_nacimiento?: string;
        calle?: string;
        municipio?: string;
        estado?: string;
        cp?: string;
        no_exterior?: number;
        tipo_usuario?: string;
    }): Observable<any> {
        console.log('AuthService.register: enviando peticion con payload:', payload);
        return this.http.post(`${this.api}/register`, payload).pipe(
            tap((response) => {
                console.log('AuthService.register: respuesta exitosa:', response);
            }),
            catchError(err => {
                console.error('AuthService.register: error en peticion', err);
                return throwError(() => err);
            })
        );
    }

    forgotPassword(correo: string): Observable<any> {
        return this.http.post(`${this.api}/forgot-password`, { correo }).pipe(
            catchError(err => {
                console.error('AuthService.forgotPassword: error en peticion', err);
                return throwError(() => err);
            })
        );
    }

    resetPassword(id_cliente: string, token: string, password: string): Observable<any> {
        return this.http.post(`${this.api}/reset-password`, { id_cliente, token, password }).pipe(
            catchError(err => {
                console.error('AuthService.resetPassword: error en peticion', err);
                return throwError(() => err);
            })
        );
    }
}