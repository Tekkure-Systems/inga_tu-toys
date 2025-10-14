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
        try {
            this.productos = await this.productosService.getProductos();
            this.loading = false;
            this.cdr.detectChanges();
        } catch (error) {
            this.error = 'Error al cargar los productos';
            this.loading = false;
            this.cdr.detectChanges();
        }
    }
    agregar(producto: Producto) {
        this.carritoService.agregar(producto);
    }
    trackById(index: number, producto: Producto): number {
        return producto.id_producto;
    }
}