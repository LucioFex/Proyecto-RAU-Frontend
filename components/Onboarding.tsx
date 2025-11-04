import React, { useState, useMemo, useEffect } from 'react';
import type { Community, User } from '../types';
import { Logo } from './icons/Logo';
import { Combobox } from './Combobox';
import {
  AtomIcon,
  BeakerIcon,
  BookIcon,
  CodeIcon,
  HistoryIcon,
  SigmaIcon,
} from './icons';
import { optionsService } from '../services';

export interface OnboardingData {
  careers: string[];
  year: string;
  gradYear: string;
  communities: Set<string>;
}

interface OnboardingProps {
  currentUser: User;
  communities: Community[];
  onComplete: (data: OnboardingData) => void;
}

const iconMap: { [key: string]: React.FC<{ className?: string }> } = {
  Sigma: SigmaIcon,
  Atom: AtomIcon,
  Code: CodeIcon,
  Beaker: BeakerIcon,
  Book: BookIcon,
  History: HistoryIcon,
};

export const Onboarding: React.FC<OnboardingProps> = ({
  currentUser,
  communities,
  onComplete,
}) => {
  const isStudent = currentUser.role === 'Estudiante';
  const TOTAL_STEPS = isStudent ? 5 : 3;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    careers: [],
    year: '',
    gradYear: '',
    communities: new Set(),
  });

  // Opciones dinámicas (con fallback)
  const [careerOptions, setCareerOptions] = useState<string[]>([]);
  const [yearOptions, setYearOptions] = useState<string[]>([]);
  const [gradYearOptions, setGradYearOptions] = useState<string[]>([]);

  useEffect(() => {
    async function fetchOptions() {
      try {
        const [careers, years, gradYears] = await Promise.all([
          optionsService.getCareers(),
          optionsService.getYears(),
          optionsService.getGradYears(),
        ]);
        setCareerOptions(careers);
        setYearOptions(years);
        setGradYearOptions(gradYears);
      } catch {
        // fallback a listas estáticas
        setCareerOptions([
          'Ing. en Informática',
          'Abogacía',
          'Lic. en Economía',
          'Lic. en Marketing',
          'Física',
          'Química',
          'Lic. en Finanzas',
          'Lic. en Negocios Digitales',
        ]);
        setYearOptions(['1º Año', '2º Año', '3º Año', '4º Año', '5º Año']);
        setGradYearOptions([
          '2024',
          '2025',
          '2026',
          '2027',
          '2028',
          '2029',
          '2030',
          '2031',
        ]);
      }
    }
    fetchOptions();
  }, []);

  const progress = useMemo(
    () => ((step - 1) / (TOTAL_STEPS - 1)) * 100,
    [step, TOTAL_STEPS]
  );

  const handleNext = () =>
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  const goToStep = (targetStep: number) => setStep(targetStep);

  const handleCommunityToggle = (communityId: string) => {
    setFormData((prev) => {
      const newCommunities = new Set(prev.communities);
      if (newCommunities.has(communityId)) {
        newCommunities.delete(communityId);
      } else {
        newCommunities.add(communityId);
      }
      return { ...prev, communities: newCommunities };
    });
  };

  const handleCareerToggle = (career: string) => {
    setFormData((prev) => {
      const newCareers = new Set(prev.careers);
      if (newCareers.has(career)) {
        newCareers.delete(career);
      } else {
        newCareers.add(career);
      }
      return { ...prev, careers: Array.from(newCareers) };
    });
  };

  const isStepComplete = useMemo(() => {
    if (isStudent) {
      switch (step) {
        case 1:
          return !!formData.careers.length;
        case 2:
          return !!formData.year;
        case 3:
          return !!formData.gradYear;
        case 4:
          return formData.communities.size > 0;
        default:
          return true;
      }
    } else {
      // Profesor
      switch (step) {
        case 1:
          return formData.careers.length > 0;
        case 2:
          return formData.communities.size > 0;
        default:
          return true;
      }
    }
  }, [step, formData, isStudent]);

  const renderStudentContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold text-center mb-8 text-slate-800">
              ¿Qué carrera estás cursando?
            </h1>
            <Combobox
              items={careerOptions}
              value={formData.careers[0] || ''}
              onChange={(value) =>
                setFormData((p) => ({ ...p, careers: [value] }))
              }
              placeholder="Elige una…"
            />
          </div>
        );
      case 2:
        return (
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold text-center mb-8 text-slate-800">
              ¿En qué año de la carrera estás?
            </h1>
            <div className="space-y-3">
              {yearOptions.map((year) => (
                <label
                  key={year}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.year === year
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                      : 'bg-white border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="year"
                    value={year}
                    checked={formData.year === year}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, year: e.target.value }))
                    }
                    className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-md font-medium text-slate-700">
                    {year}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold text-center mb-8 text-slate-800">
              ¿En qué año pensás graduarte?
            </h1>
            <Combobox
              items={gradYearOptions}
              value={formData.gradYear}
              onChange={(value) =>
                setFormData((p) => ({ ...p, gradYear: value }))
              }
              placeholder="Elige una…"
            />
          </div>
        );
      case 4:
        return renderCommunitySelector(
          'Selecciona algunas para personalizar tu experiencia inicial.'
        );
      case 5:
        return renderConfirmationScreen();
      default:
        return null;
    }
  };

  const renderProfessorContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold text-center mb-8 text-slate-800">
              ¿En qué carrera(s) estás enseñando?
            </h1>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {careerOptions.map((career) => (
                <label
                  key={career}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.careers.includes(career)
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                      : 'bg-white border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.careers.includes(career)}
                    onChange={() => handleCareerToggle(career)}
                    className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-md font-medium text-slate-700">
                    {career}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      case 2:
        return renderCommunitySelector(
          '¡Te recomendamos las siguientes comunidades alineadas con tus carreras para conectar con tus alumn@s!'
        );
      case 3:
        return renderConfirmationScreen();
      default:
        return null;
    }
  };

  const renderCommunitySelector = (subtitle: string) => {
    return (
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-2 text-slate-800">
          Comunidades de Interés
        </h1>
        <p className="text-center text-slate-500 mb-8">{subtitle}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-2">
          {communities.map((community) => {
            const isSelected = formData.communities.has(community.id);
            const Icon = iconMap[community.icon] || BookIcon;
            return (
              <div
                key={community.id}
                onClick={() => handleCommunityToggle(community.id)}
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`flex items-center justify-center h-8 w-8 rounded-md ${
                    isSelected ? 'bg-blue-100' : 'bg-slate-100'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isSelected ? 'text-blue-600' : 'text-slate-600'
                    }`}
                  />
                </div>
                <span className="font-medium text-slate-800">
                  {community.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderConfirmationScreen = () => {
    return (
      <div className="w-full max-w-2xl text-center bg-white p-8 sm:p-10 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-slate-800">
          ¡Gracias por confirmar tus preferencias!
        </h1>
        <p className="mt-3 text-slate-600 max-w-xl mx-auto">
          Tus preferencias académicas se han guardado con éxito. Te invitamos a
          continuar al Dashboard para comenzar a interactuar con tus compañeros y
          compartir recursos.
        </p>

        <div className="mt-8 text-left border-t border-slate-200 pt-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">
            Preferencias Académicas
          </h2>
          {isStudent ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <span className="text-sm text-slate-500">Carrera</span>
                <p className="font-semibold text-blue-600">
                  {formData.careers[0]}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Año en Curso</span>
                <p className="font-semibold text-blue-600">{formData.year}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500">
                  Año de Graduación
                </span>
                <p className="font-semibold text-blue-600">
                  {formData.gradYear}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <span className="text-sm text-slate-500">Carreras</span>
              <p className="font-semibold text-blue-600">
                {formData.careers.join(', ')}
              </p>
            </div>
          )}
          <div className="mt-6">
            <span className="text-sm text-slate-500">
              Comunidades de Interés
            </span>
            <div className="flex flex-wrap gap-3 mt-2">
              {Array.from(formData.communities).map((id) => {
                const community = communities.find((c) => c.id === id);
                if (!community) return null;
                const Icon = iconMap[community.icon] || BookIcon;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 p-2 px-3 border border-slate-200 rounded-md bg-white"
                  >
                    <div className="flex items-center justify-center h-6 w-6 rounded-md bg-slate-100">
                      <Icon className="h-4 w-4 text-slate-500" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {community.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => goToStep(1)}
            className="px-6 py-3 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Editar Preferencias
          </button>
          <button
            onClick={() => onComplete(formData)}
            className="px-6 py-3 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Proceder al Dashboard
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center p-4">
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Logo className="h-8 w-8 text-slate-800" />
        <span className="font-bold text-xl text-slate-800">RAU</span>
      </div>
      <div className="w-full max-w-2xl mb-8">
        <span className="text-sm font-medium text-slate-600">
          Paso {step} de {TOTAL_STEPS}
        </span>
        <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="w-full flex-grow flex items-center justify-center">
        {isStudent ? renderStudentContent() : renderProfessorContent()}
      </div>

      {step < TOTAL_STEPS && (
        <div className="mt-8">
          <button
            onClick={handleNext}
            disabled={!isStepComplete}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
          >
            {step === TOTAL_STEPS - 1 ? 'Terminar' : 'Siguiente'}
          </button>
        </div>
      )}
    </div>
  );
};
