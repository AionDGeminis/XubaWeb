// user.service.ts
import { Injectable, computed, signal } from '@angular/core';
import { Usuario } from '../models/usuario-model';
import { map, Observable, tap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as env, headers } from '../environment/environment';

@Injectable({ providedIn: 'root' })
export class UserService {

    private _user = signal<Usuario | null>(null);

    isLoggedIn = computed(() => {
        const __usuario = !!this._user();
        // const __token = localStorage.getItem('XUBA_TKN');
        return __usuario;
        // return __usuario && !!__token;
    });

    currentUser = computed(() => this._user());
    /** Usuario actual (solo lectura) */
    // readonly user = this._user.asReadonly();

    /** Datos derivados, útiles en las plantillas */
    readonly nombreCompleto = computed(() => {
        const u = this._user();
        return u ? `${u.nombre} ${u.apellido}` : '';
    });

    readonly hasUser = computed(() => this._user() !== null);


    constructor(private http: HttpClient) {

    }

    /** Guarda el usuario completo (después del login o de /me) */
    setUser(user: Usuario): void {
        console.log('se guarda el usuario: ', user)
        this._user.set(user);
    }

    /** Actualiza solo algunos campos (por ejemplo, después de editar el perfil) */
    updateUser(changes: Partial<Usuario>): void {
        this._user.update(u => (u ? { ...u, ...changes } : u));
    }

    /** Limpia los datos (logout o 401) */
    clear(): void {
        this._user.set(null);
    }
}