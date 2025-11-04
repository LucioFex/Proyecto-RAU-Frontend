import React, { useState, useMemo } from 'react';
import type { Community, User } from '../types';
import { AtomIcon } from './icons/AtomIcon';
import { BeakerIcon } from './icons/BeakerIcon';
import { BookIcon } from './icons/BookIcon';
import { CodeIcon } from './icons/CodeIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { SigmaIcon } from './icons/SigmaIcon';
import { PlusIcon } from './icons/PlusIcon';
import { UsersIcon } from './icons/UsersIcon';
import { JoinCommunityModal } from './JoinCommunityModal';
import { CreateCommunityModal } from './CreateCommunityModal';

interface SidebarProps {
  currentUser: User | null;
  communities: Community[];
  activeCommunity: string | null;
  onSelectCommunity: (communityId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onCreateCommunity: (data: { name: string; description: string; moderators: User[] }) => void;
  /** Nuevo callback para unirse a una comunidad */
  onJoinCommunity: (communityId: string) => Promise<void>;
}

const iconMap: { [key: string]: React.FC<{ className?: string }> } = {
  Sigma: SigmaIcon,
  Atom: AtomIcon,
  Code: CodeIcon,
  Beaker: BeakerIcon,
  Book: BookIcon,
  History: HistoryIcon,
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  communities,
  activeCommunity,
  onSelectCommunity,
  isOpen,
  onClose,
  users,
  onCreateCommunity,
  onJoinCommunity,
}) => {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateCommunityAndCloseModal = (data: { name: string; description: string; moderators: User[] }) => {
    onCreateCommunity(data);
    setIsCreateModalOpen(false);
  };

  const userCommunities = useMemo(() => {
    if (!currentUser || !currentUser.communityIds) {
      return [];
    }
    return communities.filter((community) => currentUser.communityIds.includes(community.id));
  }, [currentUser, communities]);

  // …(resto del código del sidebar sin cambios en el render)…

  return (
    <>
      {/* Sidebar original */}
      {/* …tu contenido… */}

      <JoinCommunityModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        communities={communities}
        onJoin={onJoinCommunity}
      />
      <CreateCommunityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        users={users}
        onCreateCommunity={handleCreateCommunityAndCloseModal}
      />
    </>
  );
};
