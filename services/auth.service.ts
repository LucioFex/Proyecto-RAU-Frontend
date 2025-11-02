import { api } from './api';
import type { User } from '../types';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  nombreCompleto: string;
  rol: 'Estudiante' | 'Profesor';
}

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    const { access_token } = response.data;
    localStorage.setItem('auth_token', access_token);

    const user = await this.getCurrentUser();
    localStorage.setItem('current_user', JSON.stringify(user));

    return user;
  },

  async register(data: RegisterRequest): Promise<User> {
    const response = await api.post('/auth/register', {
      email: data.email,
      password: data.password,
      nombreCompleto: data.nombreCompleto,
      rol: data.rol,
    });

    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    const backendUser = response.data;

    return {
      id: backendUser.usuario_id,
      name: backendUser.nombreCompleto,
      username: backendUser.username,
      avatarUrl: backendUser.avatar_url || `https://picsum.photos/seed/user${backendUser.usuario_id}/200/200`,
      coverImageUrl: backendUser.cover_image_url || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1740&auto=format&fit=crop',
      title: backendUser.titulo || (backendUser.rol === 'Profesor' ? 'Profesor' : 'Estudiante'),
      role: backendUser.rol as 'Profesor' | 'Estudiante',
      bio: backendUser.bio || '',
      joinedDate: new Date(backendUser.fecha_registro).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
      communitiesCount: backendUser.comunidades_count || 0,
      communityIds: backendUser.comunidad_ids || [],
      hasCompletedOnboarding: backendUser.onboarding_completado || false,
      careers: backendUser.carreras || [],
      currentYear: backendUser.anio_actual,
      graduationYear: backendUser.anio_graduacion,
    };
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },
};
