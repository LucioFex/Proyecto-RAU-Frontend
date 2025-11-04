import { api } from './api';

export const optionsService = {
  async getCareers(): Promise<string[]> {
    const res = await api.get('/options/careers');
    return res.data;
  },

  async getYears(): Promise<string[]> {
    const res = await api.get('/options/years');
    return res.data;
  },

  async getGradYears(): Promise<string[]> {
    const res = await api.get('/options/grad-years');
    return res.data;
  },
};
