// …imports…

function App() {
  // …estado y otros handlers…

  // Nuevo: unirse a comunidad y refrescar datos
  const handleJoinCommunity = async (communityId: string) => {
    try {
      // Llama al servicio para unirse
      await communityService.joinCommunity(communityId);
      // Refresca la información del usuario para actualizar communityIds
      const updatedUser = await authService.getCurrentUser();
      setCurrentUser(updatedUser);
      // Refresca la lista de comunidades por si cambió el conteo de miembros
      const updatedCommunities = await communityService.getCommunities();
      setCommunities(updatedCommunities);
      setNotification('¡Te has unido a la comunidad!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al unirse a la comunidad');
    }
  };

  // …resto del componente…

  return (
    // …
    <Sidebar
      currentUser={currentUser}
      communities={communities}
      activeCommunity={selectedCommunity}
      onSelectCommunity={handleSelectCommunity}
      isOpen={isSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}
      users={allUsers}
      onCreateCommunity={handleCreateCommunity}
      onJoinCommunity={handleJoinCommunity}  // pasa el nuevo handler
    />
    // …
  );
}
