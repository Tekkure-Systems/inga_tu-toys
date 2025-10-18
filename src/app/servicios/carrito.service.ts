import {Injectable, signal} from '@angular/core';
import {Producto} from '../modelos/producto';
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
    total() {
        return this.productosSignal().reduce((acc, p) => acc + p.precio, 0);
    }
    exportarXML(compraId?: number) {
        const productos = this.productosSignal();
        if (productos.length === 0) {
            alert('El carrito está vacío. No se puede generar el recibo.');
            return;
        }
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<recibo>\n`;
        xml += `  <fecha>${new Date().toISOString()}</fecha>\n`;
        if (compraId) {
            xml += `  <id_compra>${compraId}</id_compra>\n`;
        }
        xml += `  <productos>\n`;
        for (const p of productos) {
            xml += `    <producto>\n`;
            xml += `      <id>${p.id_producto}</id>\n`;
            xml += `      <nombre>${p.nombre}</nombre>\n`;
            xml += `      <cantidad>${p.cantidad ?? 1}</cantidad>\n`;
            xml += `      <precio>${p.precio}</precio>\n`;
            xml += `      <subtotal>${(p.precio * (p.cantidad ?? 1)).toFixed(2)}</subtotal>\n`;
            if (p.descripcion) {
                xml += `      <descripcion>${p.descripcion}</descripcion>\n`;
            }
            xml += `    </producto>\n`;
        }
        xml += `  </productos>\n`;
        xml += `  <total>${this.total().toFixed(2)}</total>\n`;
        xml += `</recibo>`;
        const blob = new Blob([xml], {type: 'application/xml'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recibo-${compraId || Date.now()}.xml`;
        a.click();
        URL.revokeObjectURL(url);
    }
}