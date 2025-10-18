import {Component, OnInit, ChangeDetectorRef, inject} from '@angular/core';
import {Producto} from '../modelos/producto';
import {CarritoService} from '../servicios/carrito.service';
import {CommonModule} from "@angular/common";
import { Productos } from '../servicios/productos'
@Component({
    selector: 'app-catalogo',
    templateUrl: './catalogo.html',
    styleUrls: ['./catalogo.css'],
    standalone: true,
    imports: [CommonModule]
})
export class Catalogo implements OnInit {
    productos: Producto[] = [];
    loading = true;
    error: string | null = null;
    constructor(
        private productosService: Productos, 
        private carritoService: CarritoService,
        private cdr: ChangeDetectorRef
    ) {}
    async ngOnInit(): Promise<void> {
        this.productosService.getProductos().subscribe({
        next: (productosDesdeApi) => {
            if (Array.isArray(productosDesdeApi)) {
                this.productos = productosDesdeApi;
            } else if (productosDesdeApi && Array.isArray(productosDesdeApi.productos)) {
                this.productos = productosDesdeApi.productos;
            } else if (productosDesdeApi && Array.isArray(productosDesdeApi.data)) {
                this.productos = productosDesdeApi.data;
            } else {
                try {
                    const maybeArray = Object.values(productosDesdeApi || {}).filter(v => v && typeof v === 'object');
                    if (maybeArray.length > 0) this.productos = maybeArray as any;
                } catch (e) {}
            }
            this.loading = false;
            this.cdr.detectChanges();
        },
        error: (err) => {
            this.error = 'Error al cargar los productos';
            this.loading = false;
            console.error('Error desde la API:', err);
            this.cdr.detectChanges();
        }
    });
    }
    agregar(producto: Producto) {
        this.carritoService.agregar(producto);
    }
    trackById(index: number, producto: Producto): number {
        return producto.id_producto;
    }
}