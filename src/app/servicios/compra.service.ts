import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class CompraService {
    private api = 'http://localhost:4000/api/compra';
    constructor(private http: HttpClient, private auth: AuthService) {}
    async checkout(items: any[]) {
        const user = this.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');
        let cliente = user.id_cliente;
        if (!cliente) {
            cliente = user.id;
        }
        if (!cliente) throw new Error('Usuario invalido (no tiene id)');
        const itemsWithDefaults = items.map(i => {
            const cantidad = i.cantidad || 1;
            return {producto: i.producto, cantidad};
        });
        const payload = {cliente, items: itemsWithDefaults};
        return firstValueFrom(this.http.post(`${this.api}/checkout`, payload));
    }
    async createPayPalOrder(amount: string, currency: string, items: any[]): Promise<any> {
        const user = this.auth.getUser();
        let cliente = null;
        if (user) {
            cliente = user.id_cliente || user.id || null;
        }
        const payload = {amount, currency, cliente, items};
        return firstValueFrom(this.http.post(`${this.api}/paypal/create-order`, payload));
    }
    async capturePayPalOrder(orderId: string, productos: any[]): Promise<any> {
        const user = this.auth.getUser();
        let cliente = null;
        if (user) {
            cliente = user.id_cliente || user.id || null;
        }
        const groupedItems = new Map<number, number>();
        for (const p of productos) {
            const id = p.id_producto || p.producto;
            const cantidadActual = groupedItems.get(id) || 0;
            groupedItems.set(id, cantidadActual + 1);
        }
        const items = Array.from(groupedItems.entries()).map(([productoId, cantidad]) => ({
            producto: productoId,
            cantidad: cantidad
        }));
        const payload = {cliente, items};
        return firstValueFrom(this.http.post(`${this.api}/paypal/capture-order/${orderId}`, payload));
    }
}