import {Component, ElementRef, ViewChild, OnInit, AfterViewInit, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {CurrencyPipe, CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {environment} from '../../environments/environment';
import {AuthService} from '../servicios/auth.service';
import {CarritoService} from '../servicios/carrito.service';
import {CompraService} from '../servicios/compra.service';
import {Producto} from '../modelos/producto';
declare global {
    interface Window {
        paypal: any;
    }
}
@Component({
    selector: 'app-carrito',
    standalone: true,
    imports: [CurrencyPipe, CommonModule, FormsModule, RouterLink],
    templateUrl: './carrito.html',
    styleUrls: ['./carrito.css']
})
export class CarritoComponent implements OnInit, AfterViewInit {
    env = environment;
    get carrito() {
        return this.carritoService.productos();
    }
    total = () => this.carritoService.total();
    loading = false;
    mensaje: string | null = null;
    @ViewChild('paypal', {static: false}) paypalElement!: ElementRef;
    private paypalRendered = false;
    private paypalScriptLoaded = false;
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
    ngOnInit(): void {
        if (this.isBrowser) {
            this.loadPayPalScript();
        }
    }
    ngAfterViewInit(): void {
        if (this.isBrowser) {
            setTimeout(() => {
                if (this.shouldShowPayPal()) {
                    this.renderPayPalButton();
                }
            }, 500);
        }
    }
    private shouldShowPayPal(): boolean {
        return (this.auth.isLoggedIn() || this.env.forcePaypalTest) &&
            this.carrito.length > 0 &&
            this.paypalElement?.nativeElement;
    }
    private async loadPayPalScript(): Promise<void> {
        if (!this.isBrowser) return;
        if (this.paypalScriptLoaded || (typeof window !== 'undefined' && window.paypal)) {
            this.paypalScriptLoaded = true;
            return;
        }
        return new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${this.env.paypalClientId}&currency=${this.env.paypalCurrency}`;
            script.async = true;
            script.onload = () => {
                this.paypalScriptLoaded = true;
                console.log('PayPal SDK cargado exitosamente');
                resolve();
            };
            script.onerror = (e) => {
                console.error('Error cargando PayPal SDK:', e);
                reject(e);
            };
            document.body.appendChild(script);
        });
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
        if (!this.paypalRendered && this.shouldShowPayPal()) {
            await this.loadPayPalScript();
            this.renderPayPalButton();
            this.mensaje = 'Usa los botones de PayPal abajo para completar tu pago';
        }
    }
    async renderPayPalButton() {
        if (!this.isBrowser || this.paypalRendered || !this.paypalElement?.nativeElement) return;
        try {
            if (typeof window !== 'undefined' && !window.paypal) {
                await this.loadPayPalScript();
            }
            if (typeof window === 'undefined' || !window.paypal) {
                console.error('PayPal SDK no está disponible');
                return;
            }
            this.paypalRendered = true;
            const productos = this.carritoService.productos();
            const items = productos.map((p: Producto) => ({
                producto: p.id_producto,
                cantidad: p.cantidad ?? 1
            }));
            const amount = (this.total() ?? 0).toFixed(2);
            window.paypal.Buttons({
                style: {
                    layout: 'vertical',
                    color: 'gold',
                    shape: 'rect',
                    label: 'paypal'
                },
                createOrder: (data: any, actions: any) => {
                    console.log('Creando orden de PayPal...');
                    return this.compraService.createPayPalOrder(amount, this.env.paypalCurrency, items)
                        .then((resp: any) => {
                            console.log('Orden creada:', resp);
                            return resp.id;
                        })
                        .catch((err: any) => {
                            console.error('Error creando orden:', err);
                            this.mensaje = 'Error al crear la orden de PayPal';
                            throw err;
                        });
                },
                onApprove: (data: any, actions: any) => {
                    this.loading = true;
                    return this.compraService.capturePayPalOrder(data.orderID, items)
                        .then((captureResp: any) => {
                            this.loading = false;
                            if (captureResp?.compraPersisted) {
                                this.exportarXML(captureResp.compraId);
                                this.vaciar();
                                setTimeout(() => this.mensaje = null, 5000);
                            } else {
                                this.mensaje = '⚠️ Pago realizado pero no se pudo registrar la compra en la base de datos.';
                            }
                        })
                        .catch((err: any) => {
                            console.error('Error capturando pago:', err);
                            this.loading = false;
                            this.mensaje = 'Error al capturar el pago de PayPal';
                        });
                },
                onCancel: (data: any) => {
                    this.mensaje = 'Pago cancelado';
                    setTimeout(() => this.mensaje = null, 3000);
                },
                onError: (err: any) => {
                    this.mensaje = 'Error en PayPal. Reintenta más tarde.';
                    setTimeout(() => this.mensaje = null, 4000);
                }
            }).render(this.paypalElement.nativeElement);
        } catch (err) {
            console.error('Error renderizando botones de PayPal:', err);
            this.mensaje = 'Error al cargar PayPal. Recarga la página.';
            this.paypalRendered = false;
        }
    }
}