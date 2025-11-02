import { api } from './api';
import type { User } from '../types';

export const userService = {
  async getUser(userId: string): Promise<User> {
    const response = await api.get(`/users/${userId}`);
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

  async updateUser(updates: {
    avatarUrl?: string;
    coverImageUrl?: string;
    title?: string;
    bio?: string;
  }): Promise<User> {
    const response = await api.patch('/users/me', {
      avatar_url: updates.avatarUrl,
      cover_image_url: updates.coverImageUrl,
      titulo: updates.title,
      bio: updates.bio,
    });

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
};
