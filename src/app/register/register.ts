import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../servicios/auth.service';
import {timeout, switchMap, finalize} from 'rxjs/operators';
@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './register.html',
    styleUrls: []
})
export class RegisterComponent {
    private auth = inject(AuthService);
    private router = inject(Router);
    nombre = '';
    apellidos = '';
    correo = '';
    password = '';
    fecha_nacimiento = '';
    calle = '';
    municipio = '';
    estado = '';
    cp = '';
    no_exterior = '';
    loading = false;
    error: string | null = null;
    success: string | null = null;
    submit() {
        this.error = null;
        this.success = null;
        if (!this.nombre || !this.correo || !this.password) {
            this.error = 'nombre, correo y contraseña son requeridos';
            return;
        }
        this.loading = true;
        console.log('Register: sending payload', {
            nombre: this.nombre,
            apellidos: this.apellidos,
            correo: this.correo,
            fecha_nacimiento: this.fecha_nacimiento,
            calle: this.calle,
            municipio: this.municipio,
            estado: this.estado,
            cp: this.cp,
            no_exterior: this.no_exterior
        });
        this.auth.register({
            nombre: this.nombre,
            apellidos: this.apellidos,
            correo: this.correo,
            password: this.password,
            fecha_nacimiento: this.fecha_nacimiento,
            calle: this.calle,
            municipio: this.municipio,
            estado: this.estado,
            cp: this.cp,
            no_exterior: this.no_exterior ? parseInt(this.no_exterior) : undefined
        }).pipe(
            timeout(10000),
            switchMap(() => {
                return this.auth.login(this.correo, this.password).pipe(timeout(10000));
            }),
            finalize(() => {
                this.loading = false;
            })
        ).subscribe({
            next: () => {
                this.router.navigateByUrl('/catalogo');
            },
            error: (err) => {
                if (err && err.status === 409) {
                    this.error = 'El correo ya está registrado';
                } else if (err && err.name === 'TimeoutError') {
                    this.error = 'La solicitud tardó demasiado. Intenta de nuevo.';
                } else if (err && err.status === 201) {
                    // unlikely: status 201 would come as success, but keep for completeness
                    this.success = 'Registro exitoso. Puedes iniciar sesión.';
                    setTimeout(() => this.router.navigateByUrl('/login'), 1200);
                } else {
                    // Generic fallback: if registration succeeded but login failed, tell user to login
                    if (err && (err.status === 401 || err.status === 0)) {
                        this.success = 'Registro exitoso. Inicia sesión para continuar.';
                        setTimeout(() => this.router.navigateByUrl('/login'), 1200);
                    } else {
                        this.error = err?.error?.error || 'Error al registrar';
                    }
                }
            }
        });
    }
}