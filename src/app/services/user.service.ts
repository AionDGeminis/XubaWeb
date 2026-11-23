// user.service.ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { Usuario } from '../models/usuario-model';
import { catchError, finalize, map, Observable, of, shareReplay, tap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as env, headers } from '../environment/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {

    private authService = inject(AuthService);
    private _user = signal<Usuario | null>(null);
    private sesionCheck$?: Observable<boolean>;
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
    setUser(user: Usuario | null): void {
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

    checkSession(): Observable<boolean> {
        if (this.isLoggedIn()) return of(true);

        if (!this.sesionCheck$) {
            this.sesionCheck$ = this.authService.validarSesion().pipe(
                tap((resp: any) => {
                    if (this.esRespuestaValida(resp)) this.setUser(resp);
                }),
                map((resp: any) => this.esRespuestaValida(resp)),
                catchError(() => of(false)),
                finalize(() => (this.sesionCheck$ = undefined)),
                shareReplay(1)
            );
        }
        return this.sesionCheck$;
    }

    private esRespuestaValida(resp: any): boolean {
        return !!resp && resp.success !== false; // ajusta a lo que devuelve tu API
    }
}