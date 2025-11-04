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
    // Enviar claves en inglés para que el backend no falle
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
    // identificar campos tanto en español como en inglés
    const id = p.post_id ?? p.id;
    const title = p.titulo ?? p.title;
    const content = p.cuerpo ?? p.body ?? p.content;
    const communityId = p.comunidad_id ?? p.community_id;
    const communityName =
      p.comunidad?.nombre ??
      p.community?.name ??
      'Comunidad';
    const upvotes = p.votos_positivos ?? p.upvotes ?? 0;
    const downvotes = p.votos_negativos ?? p.downvotes ?? 0;
    const commentsArr = p.comentarios ?? p.comments ?? [];
    const authorObj = p.autor ?? p.author;
    let author: User;

    if (authorObj) {
      // si existe objeto autor/autora, mapearlo
      author = this.mapUser(authorObj);
    } else {
      // fallback: crear un usuario básico si solo hay author_id
      const uid = p.autor_id ?? p.author_id;
      author = {
        id: uid ?? '',
        name: '',
        username: '',
        avatarUrl: uid
          ? `https://picsum.photos/seed/user${uid}/200/200`
          : `https://picsum.photos/200/200`,
        coverImageUrl:
          'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1740&auto=format&fit=crop',
        title: '',
        role: 'Estudiante',
        bio: '',
        joinedDate: '',
        communitiesCount: 0,
        communityIds: [],
        hasCompletedOnboarding: false,
      };
    }

    const timestampStr = p.fecha_creacion ?? p.created_at ?? '';
    const voteStatus =
      p.voto_usuario === 1
        ? 'up'
        : p.voto_usuario === -1
        ? 'down'
        : p.vote_status ?? 'none';
    const tag = (p.etiqueta ?? p.tag ?? 'Pregunta') as PostTag;

    return {
      id,
      title,
      content,
      author,
      communityId,
      communityName,
      upvotes,
      downvotes,
      comments: commentsArr.map((c: any) => this.mapComment(c)),
      timestamp: this.formatTimestamp(timestampStr),
      voteStatus,
      tag,
    };
  },

  mapComment(c: any): Comment {
    const id = c.comentario_id ?? c.id;
    const content = c.cuerpo ?? c.body;
    const timestampStr = c.fecha_creacion ?? c.created_at ?? '';
    const authorObj = c.autor ?? c.author;
    let author: User;

    if (authorObj) {
      author = this.mapUser(authorObj);
    } else {
      const uid = c.autor_id ?? c.author_id;
      author = {
        id: uid ?? '',
        name: '',
        username: '',
        avatarUrl: uid
          ? `https://picsum.photos/seed/user${uid}/200/200`
          : `https://picsum.photos/200/200`,
        coverImageUrl:
          'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1740&auto=format&fit=crop',
        title: '',
        role: 'Estudiante',
        bio: '',
        joinedDate: '',
        communitiesCount: 0,
        communityIds: [],
        hasCompletedOnboarding: false,
      };
    }

    return {
      id,
      author,
      content,
      timestamp: this.formatTimestamp(timestampStr),
    };
  },

  mapUser(u: any): User {
    const id = u.usuario_id ?? u.id;
    const name = u.nombreCompleto ?? u.name ?? '';
    const username = u.username ?? '';
    const avatarUrl =
      u.avatar_url ??
      (id
        ? `https://picsum.photos/seed/user${id}/200/200`
        : 'https://picsum.photos/200/200');
    const coverImageUrl =
      u.cover_image_url ??
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1740&auto=format&fit=crop';
    const title =
      u.titulo ??
      u.title ??
      (u.rol || u.role) === 'Profesor'
        ? 'Profesor'
        : 'Estudiante';
    const role = (u.rol ?? u.role) as 'Profesor' | 'Estudiante';
    const bio = u.bio ?? '';
    const joinedRaw = u.fecha_registro ?? u.created_at;
    const joinedDate = joinedRaw
      ? new Date(joinedRaw).toLocaleDateString('es-ES', {
          month: 'long',
          year: 'numeric',
        })
      : '';
    const communitiesCount =
      u.comunidades_count ?? u.member_count ?? 0;
    const communityIds =
      u.comunidad_ids ?? u.community_ids ?? [];
    const hasCompletedOnboarding =
      u.onboarding_completado ??
      u.hasCompletedOnboarding ??
      false;

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
    if (diffMins < 60)
      return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24)
      return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  },
};
