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
    templateUrl: './forgot-password.html',
    styleUrls: ['./forgot-password.css']
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

        // Validar formato de correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.correo)) {
            this.error = 'Por favor ingresa un correo válido';
            return;
        }

        this.loading = true;
        console.log('Enviando solicitud para:', this.correo);
        this.auth.forgotPassword(this.correo).pipe(
            timeout(30000), // Aumentado a 30 segundos para dar tiempo al envío de email
            finalize(() => {
                this.loading = false;
            })
        ).subscribe({
            next: (response) => {
                console.log('✅ Respuesta recibida del servidor');
                console.log('Tipo:', typeof response);
                console.log('Contenido:', response);
                
                // Asegurarse de que response sea un objeto
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
                    console.error('Respuesta vacía o inválida');
                    this.error = 'Error: Respuesta inválida del servidor';
                    this.cdr.detectChanges();
                    return;
                }
                
                console.log('Objeto procesado:', responseObj);
                
                // Usar setTimeout para diferir la actualización y evitar ExpressionChangedAfterItHasBeenCheckedError
                setTimeout(() => {
                    this.success = responseObj.message || 'Si el correo existe, se enviará un enlace para restablecer la contraseña';
                    // Forzar detección de cambios para zoneless
                    this.cdr.detectChanges();
                }, 0);
            },
            error: (err) => {
                console.error('Error enviando email:', err);
                // Usar setTimeout para diferir la actualización
                setTimeout(() => {
                    if (err && err.name === 'TimeoutError') {
                        this.error = 'Tiempo de espera agotado. Verifica tu conexión o el servidor.';
                    } else if (err && err.error && err.error.error) {
                        this.error = err.error.error;
                    } else {
                        this.error = 'Error al enviar el correo. Por favor intenta de nuevo.';
                    }
                    // Forzar detección de cambios para zoneless
                    this.cdr.detectChanges();
                }, 0);
            }
        });
    }

}
