import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Producto } from '../modelos/producto';
import { CarritoService } from '../servicios/carrito.service';
import { CommonModule } from "@angular/common";
import { Productos } from '../servicios/productos';

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
                this.productos = this.extractProductosArray(productosDesdeApi);
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

    extractProductosArray(data: any): Producto[] {
        if (Array.isArray(data)) {
            return data;
        }

        if (data && Array.isArray(data.productos)) {
            return data.productos;
        }

        if (data && Array.isArray(data.data)) {
            return data.data;
        }

        try {
            const values = Object.values(data || {});
            const maybeArray = values.filter(v => v && typeof v === 'object');
            if (maybeArray.length > 0) {
                return maybeArray as Producto[];
            }
        } catch (e) {
            console.error('Error extrayendo productos:', e);
        }

        return [];
    }

    agregar(producto: Producto) {
        this.carritoService.agregar(producto);
    }

    trackById(index: number, producto: Producto): number {
        return producto.id_producto;
    }
}