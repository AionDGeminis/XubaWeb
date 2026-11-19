// user.service.ts
import { Injectable, computed, signal } from '@angular/core';
import { Usuario } from '../models/usuario-model';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _user = signal<Usuario | null>(null);

    /** Usuario actual (solo lectura) */
    readonly user = this._user.asReadonly();

    /** Datos derivados, útiles en las plantillas */
    readonly nombreCompleto = computed(() => {
        const u = this._user();
        return u ? `${u.nombre} ${u.apellido}` : '';
    });
    readonly hasUser = computed(() => this._user() !== null);

    /** Guarda el usuario completo (después del login o de /me) */
    setUser(user: Usuario): void {
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