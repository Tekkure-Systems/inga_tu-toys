import { Component, inject ,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../servicios/auth.service';
import { timeout, switchMap } from 'rxjs/operators';

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
    private cdr = inject(ChangeDetectorRef);

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
    tipo_usuario = '';
    loading = false;
    error: string | null = null;
    success: string | null = null;

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    submit() {
    console.log('Submit method called');
    this.error = null;
    this.success = null;

    if (!this.nombre || !this.correo || !this.password || !this.apellidos || 
        !this.calle || !this.cp || !this.estado || !this.municipio ||
        !this.no_exterior || !this.tipo_usuario || !this.fecha_nacimiento) {
        this.error = 'No puedes dejar campos vacios';
        return;
    }

    if (!this.isValidEmail(this.correo)) {
        this.error = 'Por favor ingresa un correo valido (ejemplo: usuario@dominio.com)';
        return;
    }

    this.loading = true;

    let noExteriorValue = undefined;
    if (this.no_exterior) {
        const parsed = parseInt(this.no_exterior);
        if (!isNaN(parsed)) {
            noExteriorValue = parsed;
        }
    }

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
        no_exterior: noExteriorValue,
        tipo_usuario: this.tipo_usuario
    }).pipe(
        timeout(10000),
        switchMap(() => {
            console.log('Registro exitoso, intentando login automatico');
            return this.auth.login(this.correo, this.password).pipe(
                timeout(10000)
            );
        })
    ).subscribe({
        next: () => {
            console.log('Login exitoso, redirigiendo a catalogo');
            this.loading = false; 
            this.router.navigateByUrl('/catalogo');
        },
        error: (err) => {
            console.error('Error en registro o login:', err);
            setTimeout(() => {
                this.loading = false; 
                
                if (err && err.status === 409) {
                    this.error = 'El correo ya esta registrado';
                } else if (err && err.name === 'TimeoutError') {
                    this.error = 'La solicitud tardo demasiado. Intenta de nuevo.';
                } else if (err && (err.status === 401 || err.status === 0)) {
                    this.success = 'Registro exitoso. Inicia sesion para continuar.';
                    setTimeout(() => this.router.navigateByUrl('/login'), 1200);
                } else if (err && err.status === 400) {
                    this.error = err.error?.error || 'Datos invalidos';
                } else {
                    this.error = err.error?.error || 'Error al registrar';
                }
                this.cdr.detectChanges();
            }, 0);
        }
    });
}
}