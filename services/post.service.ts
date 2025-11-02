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
      titulo: data.title,
      cuerpo: data.content,
      etiqueta: data.tag,
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
      id: p.post_id,
      title: p.titulo,
      content: p.cuerpo,
      author: this.mapUser(p.autor),
      communityId: p.comunidad_id,
      communityName: p.comunidad?.nombre || 'Comunidad',
      upvotes: p.votos_positivos || 0,
      downvotes: p.votos_negativos || 0,
      comments: p.comentarios ? p.comentarios.map((c: any) => this.mapComment(c)) : [],
      timestamp: this.formatTimestamp(p.fecha_creacion),
      voteStatus: p.voto_usuario === 1 ? 'up' : p.voto_usuario === -1 ? 'down' : 'none',
      tag: (p.etiqueta || 'Pregunta') as PostTag,
    };
  },

  mapComment(c: any): Comment {
    return {
      id: c.comentario_id,
      author: this.mapUser(c.autor),
      content: c.cuerpo,
      timestamp: this.formatTimestamp(c.fecha_creacion),
    };
  },

  mapUser(u: any): User {
    return {
      id: u.usuario_id,
      name: u.nombreCompleto,
      username: u.username,
      avatarUrl: u.avatar_url || `https://picsum.photos/seed/user${u.usuario_id}/200/200`,
      coverImageUrl: u.cover_image_url || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1740&auto=format&fit=crop',
      title: u.titulo || (u.rol === 'Profesor' ? 'Profesor' : 'Estudiante'),
      role: u.rol as 'Profesor' | 'Estudiante',
      bio: u.bio || '',
      joinedDate: u.fecha_registro ? new Date(u.fecha_registro).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : '',
      communitiesCount: u.comunidades_count || 0,
      communityIds: u.comunidad_ids || [],
      hasCompletedOnboarding: u.onboarding_completado || false,
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
