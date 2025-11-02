import { api } from './api';
import type { Community, User } from '../types';

export const communityService = {
  async getCommunities(query?: string, limit: number = 100): Promise<Community[]> {
    const params: any = { limit };
    if (query) {
      params.q = query;
    }

    const response = await api.get('/communities', { params });

    return response.data.map((c: any) => ({
      id: c.comunidad_id,
      name: c.nombre,
      description: c.descripcion,
      memberCount: c.miembros_count || 0,
      icon: this.mapIconFromDescription(c.descripcion),
    }));
  },

  async createCommunity(data: {
    name: string;
    description: string;
    moderators: User[];
  }): Promise<Community> {
    const response = await api.post('/communities', {
      nombre: data.name,
      descripcion: data.description,
    });

    const c = response.data;
    return {
      id: c.comunidad_id,
      name: c.nombre,
      description: c.descripcion,
      memberCount: c.miembros_count || 1,
      icon: this.mapIconFromDescription(c.descripcion),
    };
  },

  async joinCommunity(communityId: string): Promise<void> {
    await api.post(`/communities/${communityId}/join`);
  },

  async leaveCommunity(communityId: string): Promise<void> {
    await api.delete(`/communities/${communityId}/leave`);
  },

  async getCommunity(communityId: string): Promise<Community> {
    const response = await api.get(`/communities/${communityId}`);
    const c = response.data;

    return {
      id: c.comunidad_id,
      name: c.nombre,
      description: c.descripcion,
      memberCount: c.miembros_count || 0,
      icon: this.mapIconFromDescription(c.descripcion),
    };
  },

  mapIconFromDescription(description: string): string {
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes('matemática') || lowerDesc.includes('cálculo')) return 'Sigma';
    if (lowerDesc.includes('física') || lowerDesc.includes('cuántica')) return 'Atom';
    if (lowerDesc.includes('programación') || lowerDesc.includes('código')) return 'Code';
    if (lowerDesc.includes('química')) return 'Beaker';
    if (lowerDesc.includes('historia')) return 'History';

    return 'Book';
  },
};
