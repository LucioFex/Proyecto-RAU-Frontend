import { api } from './api';

export interface OnboardingData {
  careers: string[];
  year: string;
  gradYear: string;
  communities: Set<string>;
}

export const onboardingService = {
  async getOnboarding(): Promise<any> {
    const response = await api.get('/onboarding');
    return response.data;
  },

  async saveOnboarding(data: OnboardingData): Promise<any> {
    const response = await api.post('/onboarding', {
      carreras: data.careers,
      anio_actual: data.year,
      anio_graduacion: data.gradYear,
      comunidad_ids: Array.from(data.communities),
    });

    return response.data;
  },
};
