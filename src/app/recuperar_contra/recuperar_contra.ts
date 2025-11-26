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
    templateUrl: './recuperar_contra.html',
    styleUrls: ['./recuperar_contra.css']
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
        this.route.queryParams.subscribe(params => {
            this.id_cliente = params['id'] || '';
            this.token = params['token'] || '';
            
            if (!this.id_cliente || !this.token) {
                this.error = 'Enlace invalido. Por favor solicita un nuevo enlace de recuperacion.';
            }
        });
    }

    submit() {
        this.error = null;
        this.success = null;
        
        if (!this.id_cliente || !this.token) {
            this.error = 'Enlace invalido. Por favor solicita un nuevo enlace de recuperacion.';
            return;
        }

        if (!this.password || !this.confirmPassword) {
            this.error = 'Todos los campos son requeridos';
            return;
        }

        if (this.password !== this.confirmPassword) {
            this.error = 'Las contrasenas no coinciden';
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
                console.log('Contrasena restablecida:', response);
                this.success = 'Contrasena restablecida exitosamente. Redirigiendo al login...';
                setTimeout(() => {
                    this.router.navigateByUrl('/login');
                }, 2000);
            },
            error: (err) => {
                console.error('Error restableciendo contrasena:', err);
                if (err && err.name === 'TimeoutError') {
                    this.error = 'Tiempo de espera agotado. Verifica tu conexion o el servidor.';
                } else if (err && err.error && err.error.error) {
                    this.error = err.error.error;
                } else {
                    this.error = 'Error al restablecer la contrasena. El enlace puede haber expirado.';
                }
            }
        });
    }
}
