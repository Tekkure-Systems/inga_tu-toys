import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../servicios/auth.service';
import { finalize, timeout } from 'rxjs/operators';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './reset-password.html',
    styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent implements OnInit {
    private auth = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    
    id_cliente: string = '';
    token: string = '';
    password = '';
    confirmPassword = '';
    loading = false;
    error: string | null = null;
    success: string | null = null;

    ngOnInit() {
        // Obtener id y token de la URL
        this.route.queryParams.subscribe(params => {
            this.id_cliente = params['id'] || '';
            this.token = params['token'] || '';
            
            if (!this.id_cliente || !this.token) {
                this.error = 'Enlace inválido. Por favor solicita un nuevo enlace de recuperación.';
            }
        });
    }

    submit() {
        this.error = null;
        this.success = null;
        
        if (!this.id_cliente || !this.token) {
            this.error = 'Enlace inválido. Por favor solicita un nuevo enlace de recuperación.';
            return;
        }

        if (!this.password || !this.confirmPassword) {
            this.error = 'Todos los campos son requeridos';
            return;
        }

        if (this.password !== this.confirmPassword) {
            this.error = 'Las contraseñas no coinciden';
            return;
        }

        // Validar que la contraseña sea segura
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(this.password)) {
            this.error = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número';
            return;
        }

        this.loading = true;
        this.auth.resetPassword(this.id_cliente, this.token, this.password).pipe(
            timeout(10000),
            finalize(() => {
                this.loading = false;
            })
        ).subscribe({
            next: (response) => {
                console.log('Contraseña restablecida:', response);
                this.success = 'Contraseña restablecida exitosamente. Redirigiendo al login...';
                // Redirigir al login después de 2 segundos
                setTimeout(() => {
                    this.router.navigateByUrl('/login');
                }, 2000);
            },
            error: (err) => {
                console.error('Error restableciendo contraseña:', err);
                if (err && err.name === 'TimeoutError') {
                    this.error = 'Tiempo de espera agotado. Verifica tu conexión o el servidor.';
                } else if (err && err.error && err.error.error) {
                    this.error = err.error.error;
                } else {
                    this.error = 'Error al restablecer la contraseña. El enlace puede haber expirado.';
                }
            }
        });
    }
}
