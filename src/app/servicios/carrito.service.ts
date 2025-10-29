import { Injectable, signal, computed } from '@angular/core';
import { Producto } from '../modelos/producto';

@Injectable({
    providedIn: 'root'
})
export class CarritoService {
    private productosSignal = signal<Producto[]>([]);
    productos = this.productosSignal.asReadonly();

    agregar(producto: Producto) {
        this.productosSignal.update(lista => [...lista, producto]);
    }

    quitar(id: number) {
        this.productosSignal.update(lista =>
            lista.filter(p => p.id_producto !== id)
        );
    }

    vaciar() {
        this.productosSignal.set([]);
    }

    subtotal = computed(() => {
        return this.productosSignal().reduce((acc, p) => acc + p.precio, 0);
    });

    resumen = computed(() => {
        const sub = this.subtotal();
        const iva = sub * 0.16;
        const totalConIva = sub + iva;
        
        return {
            subtotal: sub,
            iva: iva,
            totalConIva: totalConIva
        };
    });
    
    exportarXML(productos: Producto[], compraId?: number) {
        if (productos.length === 0) {
            alert('El carrito esta vacio. No se puede generar el recibo.');
            return;
        }

        const subtotal = productos.reduce((acc, p) => acc + p.precio, 0);
        const iva = subtotal * 0.16;
        const totalConIva = subtotal + iva;

        const groupedItems = new Map<number, { producto: Producto, cantidad: number }>();

        for (const p of productos) {
            const id = p.id_producto;

            if (!groupedItems.has(id)) {
                groupedItems.set(id, { producto: p, cantidad: 1 });
            } else {
                const item = groupedItems.get(id);
                if (item) {
                    item.cantidad++;
                }
            }
        }
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<recibo>\n`;
        xml += `  <fecha>${new Date().toISOString()}</fecha>\n`;
        if (compraId) {
            xml += `  <id_compra>${compraId}</id_compra>\n`;
        }
        xml += `  <productos>\n`;
        for (const [id, data] of groupedItems.entries()) {
            const p = data.producto;
            const cantidad = data.cantidad;

            xml += `    <producto>\n`;2
            xml += `      <id>${p.id_producto}</id>\n`;
            xml += `      <nombre>${p.nombre}</nombre>\n`;
            xml += `      <cantidad>${cantidad}</cantidad>\n`;
            xml += `      <precio>${p.precio}</precio>\n`;
            xml += `      <subtotal>${(p.precio * cantidad).toFixed(2)}</subtotal>\n`;

            if (p.descripcion) {
                xml += `      <descripcion>${p.descripcion}</descripcion>\n`;
            }

            xml += `    </producto>\n`;
        }

        xml += `  </productos>\n`;
        xml += `  <subtotal>${subtotal.toFixed(2)}</subtotal>\n`;
        xml += `  <iva>${iva.toFixed(2)}</iva>\n`;
        xml += `  <total>${totalConIva.toFixed(2)}</total>\n`;
        xml += `</recibo>`;

        const blob = new Blob([xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const fileName = compraId ? `recibo-${compraId}.xml` : `recibo-${Date.now()}.xml`;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    }
}