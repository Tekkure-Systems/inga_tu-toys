import { Routes } from '@angular/router';
import { Catalogo } from "./catalogo/catalogo";
import { CarritoComponent } from "./carrito/carrito";
export const routes: Routes = [
    {path: '', redirectTo: "catalogo", pathMatch: 'full'},
    {path: 'catalogo', component: Catalogo},
    {path: 'carrito', component: CarritoComponent},
    {path: 'login', loadComponent: () => import('./login/login').then(m => m.LoginComponent)},
    {path: 'register', loadComponent: () => import('./register/register').then(m => m.RegisterComponent)},
    {path: 'forgot-password', loadComponent: () => import('./forgot-password/forgot-password').then(m => m.ForgotPasswordComponent)},
    {path: 'reset-password', loadComponent: () => import('./reset-password/reset-password').then(m => m.ResetPasswordComponent)},
    {path: 'inventario', loadComponent: () => import('./inventario/inventario').then(m => m.InventarioComponent)}
];