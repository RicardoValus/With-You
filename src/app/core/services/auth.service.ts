import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'with_you_auth_token';

interface LoginResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenSignal = signal<string | null>(this.readStoredToken());

  readonly token = this.tokenSignal.asReadonly();

  isAuthenticated(): boolean {
    return Boolean(this.tokenSignal());
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  async login(password: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${environment.apiBaseUrl}/login`, { password }),
    );
    sessionStorage.setItem(TOKEN_KEY, response.token);
    this.tokenSignal.set(response.token);
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    this.tokenSignal.set(null);
  }

  authHeaders(): Record<string, string> {
    const token = this.tokenSignal();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private readStoredToken(): string | null {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }
}
