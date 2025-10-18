import {Component, computed, inject} from '@angular/core';
import {CarritoService} from '../servicios/carrito.service';
import {CurrencyPipe, CommonModule} from '@angular/common';
import { CompraService } from '../servicios/compra.service';
import { AuthService } from '../servicios/auth.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
@Component({
    selector: 'app-carrito',
    standalone: true,
    imports: [CurrencyPipe, CommonModule, FormsModule, RouterLink],
    templateUrl: './carrito.html',
    styleUrls: ['./carrito.css']
})
export class CarritoComponent {
    private carritoService = inject(CarritoService);
    private compraService = inject(CompraService);
    private auth = inject(AuthService);
    carrito = this.carritoService.productos;
    total = computed(() => this.carritoService.total());
    loading = false;
    mensaje: string | null = null;
    quitar(id: number) {
        this.carritoService.quitar(id);
    }
    vaciar() {
        this.carritoService.vaciar();
    }
    exportarXML() {
        this.carritoService.exportarXML();
    }
    trackById(index: number, producto: any): number {
        return producto.id_producto;
    }
    isLoggedIn(): boolean {
        return this.auth.isLoggedIn();
    }
    async checkout() {
        this.mensaje = null;
        if (!this.auth.isLoggedIn()) {
            this.mensaje = 'Debes iniciar sesión para completar la compra.';
            return;
        }
        const productos = this.carrito();
        if (!productos || productos.length === 0) {
            this.mensaje = 'El carrito está vacío.';
            return;
        }
        this.loading = true;
        try {
            const items = productos.map(p => ({ producto: p.id_producto, cantidad: p.cantidad ?? 1 }));
            const res: any = await this.compraService.checkout(items);
            if (res?.success) {
                this.carritoService.exportarXML(res.compraId);
                setTimeout(() => {
                    this.carritoService.vaciar();
                    this.mensaje = null;
                }, 2000);
            } else {
                this.mensaje = 'La compra se procesó pero ocurrió un problema.';
            }
        } catch (err: any) {
            this.mensaje = err?.error?.error || err?.message || 'Error en la compra';
        } finally {
            this.loading = false;
        }
    }
}