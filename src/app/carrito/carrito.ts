import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
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
    get carrito() {
        return this.carritoService.productos();
    }
    resumen;
    loading = false;
    mensaje: string | null = null;
    private isBrowser: boolean;

    constructor(
        public carritoService: CarritoService,
        public auth: AuthService,
        public compraService: CompraService,
        private cdr: ChangeDetectorRef,
        @Inject(PLATFORM_ID) platformId: Object
    ) {
        this.resumen = this.carritoService.resumen;
        this.isBrowser = isPlatformBrowser(platformId);
    }

    trackById(index: number, item: Producto) {
        return item.id_producto;
    }

    async ngOnInit(): Promise<void> {
        if (!this.isBrowser) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const orderId = params.get('token');
        const savedCartJson = window.localStorage.getItem('tempCart');

        if (orderId && savedCartJson) {
            this.loading = true;
            const productos: Producto[] = JSON.parse(savedCartJson);

            try {
                const resp = await this.compraService.capturePayPalOrder(orderId, productos);
                this.loading = false;

                if (resp && resp.compraPersisted) {
                    this.exportarXML(productos, resp.compraId);
                    this.vaciar();
                    this.mensaje = 'Compra realizada y recibo generado';
                    setTimeout(() => this.mensaje = null, 5000);
                } else {
                    this.mensaje = 'Pago realizado pero no se pudo registrar la compra en la base de datos.';
                }
            } catch (err) {
                this.loading = false;
                this.mensaje = 'Error al capturar el pago de PayPal.';
            } finally {
                window.localStorage.removeItem('tempCart');
                this.cdr.detectChanges();
            }
        } else if (orderId && !savedCartJson) {
            this.loading = false;
            this.mensaje = 'Error: No se pudo recuperar tu carrito despues del pago.';
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

    exportarXML(productos: Producto[], compraId: number) {
        this.carritoService.exportarXML(productos, compraId);
    }

    isLoggedIn(): boolean {
        return this.auth.isLoggedIn();
    }

    async checkout() {
        this.mensaje = null;

        const isUserLoggedIn = this.auth.isLoggedIn();
        const forceTest = this.env.forcePaypalTest;

        if (!isUserLoggedIn && !forceTest) {
            this.mensaje = 'Debes iniciar sesion para completar la compra.';
            return;
        }

        const productos = this.carritoService.productos();

        if (!productos || productos.length === 0) {
            this.mensaje = 'El carrito esta vacio.';
            return;
        }

        this.loading = true;

        try {
            const amount = this.resumen().totalConIva.toFixed(2);

            const groupedItems = new Map<number, number>();

            for (const p of productos) {
                const id = p.id_producto;
                const cantidadActual = groupedItems.get(id) || 0;
                groupedItems.set(id, cantidadActual + 1);
            }

            const items = Array.from(groupedItems.entries()).map(([productoId, cantidad]) => ({
                producto: productoId,
                cantidad: cantidad
            }));

            if (this.isBrowser) {
                window.localStorage.setItem('tempCart', JSON.stringify(productos));
            }

            const resp = await this.compraService.createPayPalOrder(amount, this.env.paypalCurrency, items);
            let approvalUrl = null;

            if (resp && Array.isArray(resp.links)) {
                const approveLink = resp.links.find((l: any) => l.rel === 'approve');
                if (approveLink) {
                    approvalUrl = approveLink.href;
                }
            }

            if (approvalUrl) {
                window.location.href = approvalUrl;
            } else {
                this.loading = false;
                this.mensaje = 'No se pudo iniciar el pago con PayPal.';
                if (this.isBrowser) {
                    window.localStorage.removeItem('tempCart');
                }
            }
        } catch (err: any) {
            this.loading = false;
            console.error('Error en checkout:', err);
            if (err && err.error && err.error.detail) {
                this.mensaje = err.error.detail;
            } else {
                this.mensaje = 'Error al iniciar el pago con PayPal.';
            }

            if (this.isBrowser) {
                window.localStorage.removeItem('tempCart');
            }
            this.cdr.detectChanges();
        }
    }
}
