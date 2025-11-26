import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../servicios/auth.service';
import { finalize, timeout } from 'rxjs/operators';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './contra_olvido.html',
    styleUrls: ['./contra_olvido.css']
})
export class ForgotPasswordComponent {
    private auth = inject(AuthService);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);
    
    correo = '';
    loading = false;
    error: string | null = null;
    success: string | null = null;

    submit() {
        this.error = null;
        this.success = null;
        
        if (!this.correo) {
            this.error = 'El correo es requerido';
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.correo)) {
            this.error = 'Por favor ingresa un correo valido';
            return;
        }

        this.loading = true;
        console.log('Enviando solicitud para:', this.correo);
        this.auth.forgotPassword(this.correo).pipe(
            timeout(30000),
            finalize(() => {
                this.loading = false;
            })
        ).subscribe({
            next: (response) => {
                console.log('✅ Respuesta recibida del servidor');
                console.log('Tipo:', typeof response);
                console.log('Contenido:', response);
                
                let responseObj = response;
                if (typeof response === 'string') {
                    try {
                        responseObj = JSON.parse(response);
                    } catch (e) {
                        console.error('Error parseando respuesta:', e);
                        responseObj = { message: 'Error al procesar la respuesta del servidor' };
                    }
                }
                
                if (!responseObj) {
                    console.error('Respuesta vacia o invalida');
                    this.error = 'Error: Respuesta invalida del servidor';
                    this.cdr.detectChanges();
                    return;
                }
                
                console.log('Objeto procesado:', responseObj);
                
                setTimeout(() => {
                    this.success = responseObj.message || 'Si el correo existe, se enviara un enlace para restablecer la contrasena';
                    this.cdr.detectChanges();
                }, 0);
            },
            error: (err) => {
                console.error('Error enviando email:', err);
                setTimeout(() => {
                    if (err && err.name === 'TimeoutError') {
                        this.error = 'Tiempo de espera agotado. Verifica tu conexion o el servidor.';
                    } else if (err && err.error && err.error.error) {
                        this.error = err.error.error;
                    } else {
                        this.error = 'Error al enviar el correo. Por favor intenta de nuevo.';
                    }
                    this.cdr.detectChanges();
                }, 0);
            }
        });
    }

}
