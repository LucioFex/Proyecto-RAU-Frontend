import React, { useState } from 'react';
import type { Community } from '../types';
import { XIcon } from './icons/XIcon';
import { AtomIcon } from './icons/AtomIcon';
import { BeakerIcon } from './icons/BeakerIcon';
import { BookIcon } from './icons/BookIcon';
import { CodeIcon } from './icons/CodeIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { SigmaIcon } from './icons/SigmaIcon';

interface JoinCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  communities: Community[];
  /** Callback que ejecuta la acción de unirse en el backend */
  onJoin: (communityId: string) => Promise<void>;
}

const iconMap: { [key: string]: React.FC<{ className?: string }> } = {
  Sigma: SigmaIcon,
  Atom: AtomIcon,
  Code: CodeIcon,
  Beaker: BeakerIcon,
  Book: BookIcon,
  History: HistoryIcon,
};

export const JoinCommunityModal: React.FC<JoinCommunityModalProps> = ({
  isOpen,
  onClose,
  communities,
  onJoin,
}) => {
  // Seguimos usando un set local para deshabilitar botones, pero ahora
  // la acción real se delega en onJoin.
  const [joinedCommunities, setJoinedCommunities] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleJoin = async (communityId: string) => {
    try {
      await onJoin(communityId);
      // Marcamos como unida localmente para deshabilitar el botón
      setJoinedCommunities((prev) => new Set(prev).add(communityId));
    } catch (err) {
      console.error('Error al unirse a la comunidad', err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-slate-800">Unirse a una Comunidad</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="overflow-y-auto p-4">
          <ul className="space-y-3">
            {communities.map((community) => {
              const IconComponent = iconMap[community.icon] || BookIcon;
              const isJoined = joinedCommunities.has(community.id);
              return (
                <li key={community.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <IconComponent className="h-8 w-8 text-slate-500" />
                    <div>
                      <h3 className="font-semibold text-slate-800">{community.name}</h3>
                      <p className="text-sm text-slate-500">{community.memberCount} miembros</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoin(community.id)}
                    disabled={isJoined}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                      isJoined
                        ? 'bg-slate-200 text-slate-500 cursor-default'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {isJoined ? 'Unido' : 'Unirse'}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
