import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthService } from '../servicios/auth.service';
import { CarritoService } from '../servicios/carrito.service';
import { CompraService } from '../servicios/compra.service';
import { Producto } from '../modelos/producto';
@Component({
    selector: 'app-carrito',
    standalone: true,
    imports: [CurrencyPipe, CommonModule, FormsModule, RouterLink],
    templateUrl: './carrito.html',
    styleUrls: ['./carrito.css']
})
export class CarritoComponent implements OnInit {
    env = environment;
    get carrito() { return this.carritoService.productos(); }
    total = () => this.carritoService.total();
    loading = false;
    mensaje: string | null = null;
    private isBrowser: boolean;
    constructor(
        public carritoService: CarritoService,
        public auth: AuthService,
        public compraService: CompraService,
        @Inject(PLATFORM_ID) platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }
    trackById(index: number, item: Producto) {
        return item.id_producto;
    }
    async ngOnInit(): Promise<void> {
        if (this.isBrowser) {
            const params = new URLSearchParams(window.location.search);
            const orderId = params.get('orderId');
            if (orderId) {
                this.loading = true;
                const productos = this.carritoService.productos();
                try {
                    const resp = await this.compraService.capturePayPalOrder(orderId, productos);
                    this.loading = false;
                    if (resp?.compraPersisted) {
                        this.exportarXML(resp.compraId);
                        this.vaciar();
                        this.mensaje = '¡Compra realizada y recibo generado!';
                        setTimeout(() => this.mensaje = null, 5000);
                    } else {
                        this.mensaje = '⚠️ Pago realizado pero no se pudo registrar la compra en la base de datos.';
                    }
                } catch (err) {
                    this.loading = false;
                    this.mensaje = 'Error al capturar el pago de PayPal.';
                }
            }
        }
    }
    quitar(id: number) {
        this.carritoService.quitar(id);
    }
    vaciar() {
        this.carritoService.vaciar();
        this.mensaje = 'Carrito vaciado';
        setTimeout(() => this.mensaje = null, 2000);
    }
    exportarXML(compraId: number) {
        console.log('Exportar XML para compra:', compraId);
    }
    isLoggedIn(): boolean {
        return this.auth.isLoggedIn();
    }
    async checkout() {
        this.mensaje = null;
        if (!this.auth.isLoggedIn() && !this.env.forcePaypalTest) {
            this.mensaje = 'Debes iniciar sesión para completar la compra.';
            return;
        }
        const productos = this.carritoService.productos();
        if (!productos || productos.length === 0) {
            this.mensaje = 'El carrito está vacío.';
            return;
        }
        try {
            const amount = (this.total() ?? 0).toFixed(2);
            const items = productos.map((p: Producto) => ({
                producto: p.id_producto,
                cantidad: p.cantidad ?? 1
            }));
            const resp = await this.compraService.createPayPalOrder(amount, this.env.paypalCurrency, items);
            let approvalUrl = null;
            if (resp && Array.isArray(resp.links)) {
                const approveLink = resp.links.find((l: any) => l.rel === 'approve');
                approvalUrl = approveLink?.href;
            }
            if (approvalUrl) {
                console.log('Redirigiendo a PayPal:', approvalUrl);
                window.location.href = approvalUrl;
            } else {
                this.mensaje = 'No se pudo iniciar el pago con PayPal.';
            }
        } catch (err) {
            this.mensaje = 'Error al iniciar el pago con PayPal.';
        }
    }
}