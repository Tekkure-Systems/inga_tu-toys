import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../servicios/auth.service';
@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './login.html',
    styleUrls: []
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
            this.error = 'Ingrese correo y contraseña';
            return;
        }
        this.loading = true;
        this.auth.login(this.correo, this.password).subscribe({
            next: (res: any) => {
                this.loading = false;
                this.router.navigateByUrl('/catalogo');
            },
            error: (err) => {
                this.loading = false;
                this.error = err?.error?.error || 'Error en login';
            }
        });
    }
}