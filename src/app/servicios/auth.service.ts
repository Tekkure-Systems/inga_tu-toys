import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, tap, of, throwError} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';

function hasLocalStorage(): boolean {
    try {
        return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    } catch {
        return false;
    }
}
@Injectable({providedIn: 'root'})
export class AuthService {
    private api = 'http://localhost:4000/api/auth';
    constructor(private http: HttpClient) {}
    login(correo: string, password: string): Observable<any> {
        return this.http.post(`/api/auth/login`, {correo, password}).pipe(
            catchError(err => {
                console.warn('AuthService.login: relative request failed, trying absolute', err);
                return this.http.post(`${this.api}/login`, {correo, password}).pipe(
                    catchError(err2 => {
                        console.error('AuthService.login: absolute fallback also failed', err2);
                        return throwError(() => err2);
                    })
                );
            }),
            tap((res: any) => {
                if (res && res.user && hasLocalStorage()) {
                    window.localStorage.setItem('user', JSON.stringify(res.user));
                }
            })
        );
    }
    logout() {
        if (hasLocalStorage()) {
            window.localStorage.removeItem('user');
        }
    }
    getUser() {
        if (!hasLocalStorage()) return null;
        const raw = window.localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    }
    isLoggedIn() {
        return !!this.getUser();
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
    }): Observable<any> {
        return this.http.post(`/api/auth/register`, payload).pipe(
            catchError(err => {
                return this.http.post(`${this.api}/register`, payload).pipe(
                    catchError(err2 => {
                        return throwError(() => err2);
                    })
                );
            })
        );
    }
}