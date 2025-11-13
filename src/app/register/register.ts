import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../servicios/auth.service';
import { timeout, switchMap, finalize } from 'rxjs/operators';
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
    tipo_usuario = '';
    loading = false;
    error: string | null = null;
    success: string | null = null;
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
            finalize(() => {
                console.log('🔄 Finalize ejecutándose, this.loading = false');
                this.loading = false;
            }),
            switchMap(() => {
                console.log('Registro exitoso, intentando login automatico');
                return this.auth.login(this.correo, this.password).pipe(
                    timeout(10000)
                );
            })
        ).subscribe({
            next: () => {
                console.log('Login exitoso, redirigiendo a catalogo');
                this.router.navigateByUrl('/catalogo');
            },
            error: (err) => {
                console.error('Error en registro o login:', err);
                console.log('🔍 err.status:', err.status);
                console.log('🔍 Comparación === 409:', err.status === 409);
                
                if (err && err.status === 409) {
                    console.log('✅ ENTRANDO AL IF 409');
                    this.error = 'El correo ya esta registrado';
                    console.log('✅ this.error asignado:', this.error);
                } else if (err && err.name === 'TimeoutError') {
                    console.log('⏱️ TimeoutError');
                    this.error = 'La solicitud tardo demasiado. Intenta de nuevo.';
                } else if (err && (err.status === 401 || err.status === 0)) {
                    console.log('🔐 Error 401/0');
                    this.success = 'Registro exitoso. Inicia sesion para continuar.';
                    setTimeout(() => this.router.navigateByUrl('/login'), 1200);
                } else if (err && err.status === 400) {
                    console.log('❌ Error 400');
                    this.error = err.error?.error || 'Datos invalidos';
                } else {
                    console.log('❌ ELSE GENERAL');
                    this.error = err.error?.error || 'Error al registrar';
                }
                
                console.log('📝 Estado final - this.error:', this.error);
                console.log('📝 Estado final - this.success:', this.success);
            }
        });
    }
}