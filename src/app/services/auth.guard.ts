import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { UserService } from './user.service'; // ajusta la ruta

export const authGuard: CanActivateFn = () => {
    const userService = inject(UserService);
    const router = inject(Router);

    return userService.checkSession().pipe(
        map(ok => (ok ? true : router.createUrlTree(['/error'])))
    );
};