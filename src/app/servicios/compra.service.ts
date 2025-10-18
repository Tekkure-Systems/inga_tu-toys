import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthService} from './auth.service';
import {firstValueFrom} from 'rxjs';
@Injectable({providedIn: 'root'})
export class CompraService {
    private api = 'http://localhost:4000/api/compra';
    constructor(private http: HttpClient, private auth: AuthService) {}
    async checkout(items: any[]) {
        const user = this.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');
        const cliente = user.id_cliente ?? user.id ?? null;
        if (!cliente) throw new Error('Usuario inválido (no tiene id)');
        const payload = {
            cliente,
            items: items.map(i => ({producto: i.producto, cantidad: i.cantidad ?? 1}))
        };
        return firstValueFrom(this.http.post(`${this.api}/checkout`, payload));
    }
}