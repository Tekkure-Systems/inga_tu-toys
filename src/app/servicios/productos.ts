import { Injectable } from '@angular/core';
import { Producto } from '../modelos/producto';
@Injectable({
    providedIn: 'root'
})
export class Productos {
    private xmlUrl = '/assets/catalogo.xml';
    constructor() {}
    async getProductos(): Promise<Producto[]> {
        try {
            const response = await fetch(this.xmlUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const xmlString = await response.text();
            const productos = this.parseXML(xmlString);
            return productos;
        } catch (error) {
            return [
                { id: 1, nombre: 'Laptop Gamer', precio: 1200, descripcion: 'Laptop de alto rendimiento para gaming' },
                { id: 2, nombre: 'Smartphone', precio: 800, descripcion: 'Teléfono inteligente última generación' },
                { id: 3, nombre: 'Tablet', precio: 400, descripcion: 'Tablet para trabajo y entretenimiento' }
            ];
        }
    }
    private parseXML(xmlString: string): Producto[] {
        try {
            const parser = new DOMParser();
            const xml = parser.parseFromString(xmlString, 'text/xml');
            const parseError = xml.querySelector('parsererror');
            if (parseError) {
                throw new Error('XML parsing error: ' + parseError.textContent);
            }
            const productos: Producto[] = [];
            const nodes = xml.getElementsByTagName('producto');
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                const idElement = node.getElementsByTagName('id')[0];
                const nombreElement = node.getElementsByTagName('nombre')[0];
                const precioElement = node.getElementsByTagName('precio')[0];
                const descripcionElement = node.getElementsByTagName('descripcion')[0];
                if (idElement && nombreElement && precioElement) {
                    const producto: Producto = {
                        id: parseInt(idElement.textContent || '0', 10),
                        nombre: nombreElement.textContent || 'Sin nombre',
                        precio: parseFloat(precioElement.textContent || '0'),
                        descripcion: descripcionElement?.textContent || undefined
                    };
                    productos.push(producto);
                }
            }
            return productos;
        } catch (error) {
            return [];
        }
    }
}