import { api } from './api';
import type { Post, Comment, PostTag, User } from '../types';

export const postService = {
  async getPosts(filters?: {
    communityId?: string;
    query?: string;
    limit?: number;
  }): Promise<Post[]> {
    const params: any = {
      limit: filters?.limit || 20,
    };

    if (filters?.communityId) {
      params.communityId = filters.communityId;
    }
    if (filters?.query) {
      params.q = filters.query;
    }

    const response = await api.get('/posts', { params });

    return response.data.map((p: any) => this.mapPost(p));
  },

  async getPost(postId: string): Promise<Post> {
    const response = await api.get(`/posts/${postId}`);
    return this.mapPost(response.data);
  },

  async createPost(data: {
    title: string;
    content: string;
    communityId: string;
    tag: PostTag;
  }): Promise<Post> {
    const response = await api.post('/posts', {
      community_id: data.communityId,
      title: data.title,
      body: data.content,
      tag: data.tag,
    });

    return this.mapPost(response.data);
  },

  async votePost(postId: string, value: 1 | -1): Promise<void> {
    await api.post(`/posts/${postId}/vote`, { value });
  },

  async bookmarkPost(postId: string): Promise<void> {
    await api.post(`/posts/${postId}/bookmark`);
  },

  async getComments(postId: string, limit: number = 50): Promise<Comment[]> {
    const response = await api.get(`/posts/${postId}/comments`, {
      params: { limit },
    });

    return response.data.map((c: any) => this.mapComment(c));
  },

  async deletePost(postId: string): Promise<void> {
    await api.delete(`/posts/${postId}`);
  },

  mapPost(p: any): Post {
    return {
      id: p.id ?? p.post_id,
      title: p.title ?? p.titulo,
      content: p.content ?? p.cuerpo,
      author: this.mapUser(p.author ?? p.autor),
      communityId: p.community_id ?? p.comunidad_id,
      communityName:
        p.community?.name ??
        p.community?.nombre ??
        p.comunidad?.nombre ??
        'Comunidad',
      upvotes: p.upvotes ?? p.votos_positivos ?? 0,
      downvotes: p.downvotes ?? p.votos_negativos ?? 0,
      comments: p.comments
        ? p.comments.map((c: any) => this.mapComment(c))
        : p.comentarios
        ? p.comentarios.map((c: any) => this.mapComment(c))
        : [],
      timestamp: this.formatTimestamp(
        p.created_at ?? p.fecha_creacion ?? new Date().toISOString()
      ),
      voteStatus:
        p.vote_status ??
        (p.voto_usuario === 1
          ? 'up'
          : p.voto_usuario === -1
          ? 'down'
          : 'none'),
      tag: (p.tag ?? p.etiqueta ?? 'Pregunta') as PostTag,
    };
  },

  mapComment(c: any): Comment {
    return {
      id: c.id ?? c.comentario_id,
      author: this.mapUser(c.author ?? c.autor),
      content: c.content ?? c.cuerpo,
      timestamp: this.formatTimestamp(
        c.created_at ?? c.fecha_creacion ?? new Date().toISOString()
      ),
    };
  },

  mapUser(u: any): User {
    const id = u.id ?? u.usuario_id;
    const name = u.name ?? u.nombreCompleto;
    const username = u.username ?? '';
    const role = (u.role ?? u.rol) as 'Profesor' | 'Estudiante';
    const avatarUrl =
      u.avatar_url ?? `https://picsum.photos/seed/user${id}/200/200`;
    const coverImageUrl =
      u.cover_image_url ??
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1740&auto=format&fit=crop';
    const title =
      u.title ??
      u.titulo ??
      (role === 'Profesor' ? 'Profesor' : 'Estudiante');
    const bio = u.bio ?? '';
    const joinedRaw = u.created_at ?? u.fecha_registro;
    const joinedDate = joinedRaw
      ? new Date(joinedRaw).toLocaleDateString('es-ES', {
          month: 'long',
          year: 'numeric',
        })
      : '';
    const communitiesCount =
      u.member_count ?? u.comunidades_count ?? 0;
    const communityIds = u.community_ids ?? u.comunidad_ids ?? [];
    const hasCompletedOnboarding =
      u.onboarding_completed ?? u.onboarding_completado ?? false;

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
    };
  },

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  },
};
