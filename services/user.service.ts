import { api } from './api';
import type { User } from '../types';

export const userService = {
  async getUser(userId: string): Promise<User> {
    const response = await api.get(`/users/${userId}`);
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

  async updateUser(updates: {
    avatarUrl?: string;
    coverImageUrl?: string;
    title?: string;
    bio?: string;
  }): Promise<User> {
    const response = await api.patch('/users/me', {
      avatar_url: updates.avatarUrl,
      cover_image_url: updates.coverImageUrl,
      title: updates.title,
      bio: updates.bio,
    });

    const backendUser: any = response.data;
    // reutiliza la misma lógica de mapeo mostrada arriba
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
};
