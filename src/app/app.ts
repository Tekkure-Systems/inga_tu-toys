import {Component, signal, inject} from '@angular/core';
import {RouterModule, Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './servicios/auth.service';
@Component({
    selector: 'app-root',
    templateUrl: './app.html',
    standalone: true,
    imports: [CommonModule, RouterModule],
    styleUrls: ['./app.css']
})
export class App {
    protected readonly title = signal('ingatu-toys');
    private auth = inject(AuthService);
    private router = inject(Router);
    isBrowser = typeof window !== 'undefined';
    get user() {
        return this.isBrowser ? this.auth.getUser() : null;
    }
    isLoggedIn() {
        return this.isBrowser && this.auth.isLoggedIn();
    }
    logout() {
        if (this.isBrowser) this.auth.logout();
        this.router.navigateByUrl('/catalogo');
    }
}