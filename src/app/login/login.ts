import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../servicios/auth.service';
import { finalize, timeout } from 'rxjs/operators';
@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './login.html',
    styleUrls: ['./login.css']
})
export class LoginComponent {
    private auth = inject(AuthService);
    private router = inject(Router);
    correo = '';
    password = '';
    loading = false;
    error: string | null = null;
    submit() {
        this.error = null;
        if (!this.correo || !this.password) {
            this.error = 'Correo y contrasena son requeridos';
            return;
        }
        this.loading = true;
        this.auth.login(this.correo, this.password).pipe(
            timeout(10000),
            finalize(() => {
                this.loading = false;
            })
        ).subscribe({
            next: (response) => {
                console.log('Login exitoso:', response);
                this.router.navigateByUrl('/catalogo');
            },
            error: (err) => {
                console.error('Error en login:', err);
                if (err && err.name === 'TimeoutError') {
                    this.error = 'Tiempo de espera agotado. Verifica tu conexion o el servidor.';
                } else if (err && err.status === 401) {
                    this.error = 'Credenciales invalidas';
                } else if (err && err.error && err.error.error) {
                    this.error = err.error.error;
                } else {
                    this.error = 'Error al conectar con el servidor. Verifica que la tabla administrador exista.';
                }
            }
        });
    }
}