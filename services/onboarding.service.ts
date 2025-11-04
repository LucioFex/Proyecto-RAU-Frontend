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
    // extraer el número del año académico (por ejemplo '2º Año' -> 2)
    let yearNum: number | undefined = undefined;
    if (data.year) {
      const match = data.year.match(/\d+/);
      if (match) {
        yearNum = parseInt(match[0], 10);
      }
    }
    // convertir el año de graduación a número
    const gradYearNum = data.gradYear ? parseInt(data.gradYear, 10) : undefined;

    const response = await api.post('/onboarding', {
      careers: data.careers,
      year: yearNum,
      graduation_year: gradYearNum,
      favorite_communities: Array.from(data.communities),
    });
    return response.data;
  },
};
