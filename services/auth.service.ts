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
    const backendUser: any = response.data;

    const id = backendUser.id ?? backendUser.usuario_id;
    const name = backendUser.name ?? backendUser.nombreCompleto;
    const username = backendUser.username ?? '';
    const role = (backendUser.role ?? backendUser.rol) as 'Profesor' | 'Estudiante';
    const avatarUrl =
      backendUser.avatar_url ??
      `https://picsum.photos/seed/user${id}/200/200`;
    const coverImageUrl =
      backendUser.cover_image_url ??
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1740&auto=format&fit=crop';
    const title =
      backendUser.title ??
      backendUser.titulo ??
      (role === 'Profesor' ? 'Profesor' : 'Estudiante');
    const bio = backendUser.bio ?? '';
    const joinedRaw = backendUser.created_at ?? backendUser.fecha_registro;
    const joinedDate = joinedRaw
      ? new Date(joinedRaw).toLocaleDateString('es-ES', {
          month: 'long',
          year: 'numeric',
        })
      : '';
    const communitiesCount =
      backendUser.member_count ?? backendUser.comunidades_count ?? 0;
    const communityIds =
      backendUser.community_ids ?? backendUser.comunidad_ids ?? [];
    const hasCompletedOnboarding =
      backendUser.onboarding_completed ??
      backendUser.onboarding_completado ??
      false;
    const careers =
      backendUser.careers ?? backendUser.carreras ?? [];
    const currentYear =
      backendUser.current_year ?? backendUser.anio_actual;
    const graduationYear =
      backendUser.graduation_year ?? backendUser.anio_graduacion;

    return {
      id,
      name,
      username,
      avatarUrl,
      coverImageUrl,
      title,
      role,
      bio,
      joinedDate,
      communitiesCount,
      communityIds,
      hasCompletedOnboarding,
      careers,
      currentYear,
      graduationYear,
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
