import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InventarioService, ProductoForm } from '../servicios/inventario.service';
// import { Productos } from '../servicios/productos';
import { Producto } from '../modelos/producto';
import { AuthService } from '../servicios/auth.service';
import { ConfirmModalComponent } from '../shared/confirm-modal/confirm-modal';
@Component({
    selector: 'app-inventario',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ConfirmModalComponent],
    templateUrl: './inventario.html',
    styleUrls: ['./inventario.css']
})
export class InventarioComponent implements OnInit {
    private inventarioService = inject(InventarioService);
    // private productosService = inject(Productos); // Removed unused service
    private auth = inject(AuthService);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);
    producto: ProductoForm = {
        nombre: '',
        descripcion: '',
        precio: 0,
        cantidad: 0,
        imagen: '',
        categoria: '',
        edad: ''
    };
    productos: Producto[] = [];
    loading = false;
    error: string | null = null;
    success: string | null = null;
    mostrarFormulario = false;
    productoEditando: number | null = null;
    mostrarModalEliminar = false;
    productoAEliminar: { id: number; nombre: string } | null = null;
    categorias = ['Accion', 'Construccion', 'Educativo', 'Electronico', 'Munecas', 'Vehiculos', 'Deportivo', 'Musical', 'Otro'];
    edades = ['0-2 anos', '3-5 anos', '6-8 anos', '9-12 anos', '12+ anos'];
    ngOnInit(): void {
        if (!this.auth.isAdmin()) {
            this.router.navigateByUrl('/catalogo');
            return;
        }
        this.cargarInventario();
    }
    cargarInventario(): void {
        this.loading = true;
        this.error = null;
        this.cdr.detectChanges();
        this.inventarioService.obtenerTodosLosProductos().subscribe({
            next: (productos) => {
                this.productos = this.extractProductosArray(productos);
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.error = 'Error al cargar el inventario';
                this.loading = false;
                this.cdr.detectChanges();
                console.error('Error al cargar inventario:', err);
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
        return [];
    }
    mostrarFormularioNuevo(): void {
        this.producto = {
            nombre: '',
            descripcion: '',
            precio: 0,
            cantidad: 0,
            imagen: '',
            categoria: '',
            edad: ''
        };
        this.productoEditando = null;
        this.mostrarFormulario = true;
        this.error = null;
        this.success = null;
    }
    cancelarFormulario(): void {
        this.mostrarFormulario = false;
        this.productoEditando = null;
        this.error = null;
        this.success = null;
    }
    editarProducto(producto: Producto): void {
        this.producto = {
            nombre: producto.nombre,
            descripcion: producto.descripcion || '',
            precio: producto.precio,
            cantidad: producto.cantidad || 0,
            imagen: producto.imagen || '',
            categoria: (producto as any).categoria || '',
            edad: (producto as any).edad || ''
        };
        this.productoEditando = producto.id_producto;
        this.mostrarFormulario = true;
        this.error = null;
        this.success = null;
    }
    submitFormulario(): void {
        this.error = null;
        this.success = null;
        if (!this.producto.nombre || !this.producto.descripcion) {
            this.error = 'Nombre y descripcion son requeridos';
            return;
        }
        if (!this.producto.precio || this.producto.precio <= 0) {
            this.error = 'El precio debe ser mayor a 0';
            return;
        }
        if (this.producto.cantidad < 0) {
            this.error = 'La cantidad no puede ser negativa';
            return;
        }
        this.loading = true;
        this.error = null;
        this.success = null;
        if (this.productoEditando) {
            const productoParaEnviar: any = {};
            if (this.producto.nombre) productoParaEnviar.nombre = this.producto.nombre;
            if (this.producto.descripcion) productoParaEnviar.descripcion = this.producto.descripcion;
            if (this.producto.precio !== undefined) productoParaEnviar.precio = this.producto.precio;
            if (this.producto.cantidad !== undefined) productoParaEnviar.cantidad = this.producto.cantidad;
            if (this.producto.imagen !== undefined) productoParaEnviar.imagen = this.producto.imagen || undefined;
            this.inventarioService.actualizarProducto(this.productoEditando, productoParaEnviar).subscribe({
                next: () => {
                    this.loading = false;
                    this.success = 'Producto actualizado exitosamente';
                    this.cdr.detectChanges();
                    this.cargarInventario();
                    setTimeout(() => {
                        this.cancelarFormulario();
                    }, 1500);
                },
                error: (err) => {
                    this.loading = false;
                    if (err && err.error && err.error.error) {
                        this.error = err.error.error;
                    } else {
                        this.error = 'Error al actualizar el producto';
                    }
                    this.cdr.detectChanges();
                    console.error('Error al actualizar producto:', err);
                }
            });
        } else {
            const productoParaEnviar = {
                nombre: this.producto.nombre,
                descripcion: this.producto.descripcion,
                precio: this.producto.precio,
                cantidad: this.producto.cantidad,
                imagen: this.producto.imagen || undefined
            };
            console.log('Enviando producto:', productoParaEnviar);
            this.inventarioService.agregarProducto(productoParaEnviar).subscribe({
                next: (response) => {
                    this.loading = false;
                    this.success = 'Producto agregado exitosamente';
                    this.cdr.detectChanges();
                    this.cargarInventario();
                    setTimeout(() => {
                        this.cancelarFormulario();
                    }, 1500);
                },
                error: (err) => {
                    this.loading = false;
                    console.error('Error completo al agregar producto:', err);
                    console.error('Error status:', err.status);
                    console.error('Error message:', err.message);
                    console.error('Error error:', err.error);
                    if (err && err.error) {
                        if (err.error.error) {
                            this.error = err.error.error;
                        } else if (typeof err.error === 'string') {
                            this.error = err.error;
                        } else {
                            this.error = 'Error al agregar el producto. Revisa la consola del servidor.';
                        }
                    } else {
                        this.error = `Error ${err.status || 'desconocido'} al agregar el producto.`;
                    }
                    this.cdr.detectChanges();
                }
            });
        }
    }
    eliminarProducto(id_producto: number, nombre: string): void {
        this.productoAEliminar = { id: id_producto, nombre: nombre };
        this.mostrarModalEliminar = true;
    }

    confirmarEliminacion(): void {
        if (!this.productoAEliminar) return;

        this.mostrarModalEliminar = false;
        this.loading = true;
        this.error = null;
        this.success = null;
        this.cdr.detectChanges();

        const id_producto = this.productoAEliminar.id;
        this.productoAEliminar = null;

        this.inventarioService.eliminarProducto(id_producto).subscribe({
            next: (response) => {
                this.success = 'Producto eliminado exitosamente';
                this.loading = false;
                this.cdr.detectChanges();
                setTimeout(() => {
                    this.cargarInventario();
                }, 500);
            },
            error: (err) => {
                this.loading = false;
                if (err && err.error) {
                    if (err.error.error) {
                        this.error = err.error.error;
                    } else if (err.error.details) {
                        this.error = `Error: ${err.error.details}`;
                    } else if (typeof err.error === 'string') {
                        this.error = err.error;
                    } else {
                        this.error = 'Error al eliminar el producto. Revisa la consola del servidor backend para mas detalles.';
                    }
                } else {
                    this.error = `Error ${err.status || 'desconocido'} al eliminar el producto. Revisa la consola del servidor backend.`;
                }
                this.cdr.detectChanges();
            }
        });
    }

    cancelarEliminacion(): void {
        this.mostrarModalEliminar = false;
        this.productoAEliminar = null;
    }
    getStockClass(cantidad: number): string {
        if (cantidad === 0) {
            return 'stock-agotado';
        } else if (cantidad < 10) {
            return 'stock-bajo';
        }
        return 'stock-normal';
    }
    trackById(index: number, producto: Producto): number {
        return producto.id_producto;
    }
}
