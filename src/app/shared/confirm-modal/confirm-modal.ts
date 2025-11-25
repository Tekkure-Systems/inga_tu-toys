import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-confirm-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './confirm-modal.html',
    styleUrls: ['./confirm-modal.css']
})
export class ConfirmModalComponent {
    @Input() titulo: string = 'Confirmar accion';
    @Input() mensaje: string = '¿Estas seguro de realizar esta accion?';
    @Input() textoConfirmar: string = 'Confirmar';
    @Input() textoCancelar: string = 'Cancelar';
    @Output() confirmar = new EventEmitter<void>();
    @Output() cancelar = new EventEmitter<void>();

    onConfirmar() {
        this.confirmar.emit();
    }

    onCancelar() {
        this.cancelar.emit();
    }
}

