import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { User } from '../../store/Authentication/auth.models';
import { getFirebaseBackend } from 'src/app/authUtils';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { GlobalComponent } from '../../global-component';
import { SessionService } from '../session/session.service';
import { BACKEND_API_URL } from './backend-api-url';

import { login, loginSuccess, loginFailure, logout, logoutSuccess, RegisterSuccess } from '../../store/Authentication/authentication.actions';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

const AUTH_API = GlobalComponent.AUTH_API;

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

export interface AuthUserInfo {
    id: number;
    nome: string;
    email?: string;
    perfil: 'GERENTE' | 'DIRETOR';
    gerenteId?: number | null;
    jobpositionId?: number[] | null;
    managerId?: number | null;
    coordenatorId?: number | null;
    gestorId?: number | null;
    token?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    user!: User;
    currentUserValue: any;

    private currentUserSubject: BehaviorSubject<User>;

    constructor(
        private http: HttpClient,
        private store: Store,
        private afAuth: AngularFireAuth,
        private sessionService: SessionService
    ) {
        this.currentUserSubject = new BehaviorSubject<User>(this.sessionService.getCurrentUser() ?? ({} as User));
    }

    signInWithGoogle(): Promise<User> {
        const provider = new firebase.auth.GoogleAuthProvider();
        return this.signInWithPopup(provider);
    }

    signInWithFacebook(): Promise<User> {
        const provider = new firebase.auth.FacebookAuthProvider();
        return this.signInWithPopup(provider);
    }

    private async signInWithPopup(provider: firebase.auth.AuthProvider): Promise<User> {
        try {
            const result = await this.afAuth.signInWithPopup(provider);
            const user = result.user;
            return {
            };
        } catch (error) {
            throw new Error('Failed to sign in with the specified provider.');
        }
    }

    signOut(): Promise<void> {
        return this.afAuth.signOut();
    }

    register(email: string, first_name: string, password: string) {
        return this.http.post(AUTH_API + 'signup', {
            email,
            first_name,
            password,
        }, httpOptions).pipe(
            map((response: any) => {
                const user = response;
                this.store.dispatch(RegisterSuccess({ user }));
                return user;
            }),
            catchError((error: any) => {
                const errorMessage = 'Login failed';
                this.store.dispatch(loginFailure({ error: errorMessage }));
                return throwError(() => errorMessage);
            })
        );
    }

    login(email: string, password: string) {
        this.store.dispatch(login({ email, password }));

        return this.http.post(AUTH_API + 'signin', {
            email,
            password
        }, httpOptions).pipe(
            map((response: any) => {
                const user = response;
                this.store.dispatch(loginSuccess({ user }));
                return user;
            }),
            catchError((error: any) => {
                const errorMessage = 'Login failed';
                this.store.dispatch(loginFailure({ error: errorMessage }));
                return throwError(() => errorMessage);
            })
        );
    }

    logout(): Observable<void> {
        this.store.dispatch(logout());

        this.sessionService.clearSession();
        this.currentUserSubject.next(null!);
        this.store.dispatch(logoutSuccess());

        return of(undefined).pipe(
            tap(() => {
            })
        );
    }

    resetPassword(email: string) {
        return this.http.post(AUTH_API + 'reset-password', { email }, httpOptions);
    }

    getUser(forceRefresh = false): Observable<AuthUserInfo> {
        const current = this.getUserSnapshot();
        if (!forceRefresh && current?.id && current?.perfil) {
            return of(current);
        }

        const token = this.sessionService.getToken();
        if (!token) {
            return throwError(() => new Error('Usuário não autenticado.'));
        }

        return this.http.get<AuthUserInfo>(`${BACKEND_API_URL}api/Auth/me`, {
            headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
        }).pipe(
            map((user) => ({ ...current, ...user, token: current?.token ?? token } as AuthUserInfo)),
            tap((user) => {
                this.sessionService.setSession(user as any);
                this.currentUserSubject.next(user as any);
            })
        );
    }

    getUserSnapshot(): AuthUserInfo | null {
        const user = this.sessionService.getCurrentUser() as any;
        return user && user.id ? user as AuthUserInfo : null;
    }

    isGerente(user: Partial<AuthUserInfo> | null = this.getUserSnapshot()): boolean {
        return (user?.perfil ?? '').toString().toUpperCase() === 'GERENTE';
    }

    isDiretor(user: Partial<AuthUserInfo> | null = this.getUserSnapshot()): boolean {
        return (user?.perfil ?? '').toString().toUpperCase() === 'DIRETOR';
    }

    public currentUser(): any {
        return getFirebaseBackend()!.getAuthenticatedUser();
    }
}
