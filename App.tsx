import React, { useState, useMemo, useEffect } from 'react';
import type { Post, User, Community, Comment, PostTag, UserRole } from './types';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PostCard } from './components/PostCard';
import { PostDetail } from './components/PostDetail';
import { Profile } from './components/Profile';
import { HomePostCreator } from './components/HomePostCreator';
import { Login } from './components/Login';
import { SuccessNotification } from './components/SuccessNotification';
import { Onboarding, OnboardingData } from './components/Onboarding';

import {
  authService,
  communityService,
  postService,
  commentService,
  userService,
  onboardingService,
} from './services';

type View = 'home' | 'post' | 'profile';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [view, setView] = useState<View>('home');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          try {
            const user = await authService.getCurrentUser();
            // consulta si ya completó el onboarding
            let done = false;
            try {
              const onboardingState = await onboardingService.getOnboarding();
              done = !!onboardingState.done;
            } catch {
              done = false;
            }
            const updatedUser = { ...user, hasCompletedOnboarding: done };
            setCurrentUser(updatedUser);
            localStorage.setItem('current_user', JSON.stringify(updatedUser));

            if (!done) {
              const communitiesData = await communityService.getCommunities();
              setCommunities(communitiesData);
            }
          } catch {
            authService.logout();
          }
        }
      } catch (err) {
        console.error('Error initializing app:', err);
      } finally {
        setLoading(false);
      }
    };
    initializeApp();
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.hasCompletedOnboarding) {
      loadData();
    }
  }, [currentUser?.hasCompletedOnboarding]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [communitiesData, postsData] = await Promise.all([
        communityService.getCommunities(),
        postService.getPosts({ communityId: selectedCommunity || undefined }),
      ]);

      setCommunities(communitiesData);
      setPosts(postsData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const user = await authService.login(email, password);
      // tras el login consultamos si completó el onboarding
      let done = false;
      try {
        const onboardingState = await onboardingService.getOnboarding();
        done = !!onboardingState.done;
      } catch {
        done = false;
      }
      const updatedUser = { ...user, hasCompletedOnboarding: done };
      setCurrentUser(updatedUser);
      localStorage.setItem('current_user', JSON.stringify(updatedUser));
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Error al iniciar sesión');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setView('home');
  };

  const handleRegister = async (newUserData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) => {
    try {
      await authService.register({
        email: newUserData.email,
        password: newUserData.password,
        nombreCompleto: newUserData.name,
        rol: newUserData.role,
      });
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Error al registrar usuario');
    }
  };

  const handleCompleteOnboarding = async (data: OnboardingData) => {
    if (!currentUser) return;
    try {
      // guarda preferencias con números convertidos
      await onboardingService.saveOnboarding(data);
      const updated = { ...currentUser, hasCompletedOnboarding: true };
      setCurrentUser(updated);
      localStorage.setItem('current_user', JSON.stringify(updated));
      await loadData();  // recarga posts y comunidades
      setNotification('¡Tus preferencias han sido guardadas!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al guardar las preferencias');
    }
  };

  const handleVote = async (postId: string, direction: 'up' | 'down') => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const currentStatus = post.voteStatus;
    let voteValue: 1 | -1 | 0 = direction === 'up' ? 1 : -1;

    if (
      (currentStatus === 'up' && direction === 'up') ||
      (currentStatus === 'down' && direction === 'down')
    ) {
      voteValue = 0;
    }

    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id !== postId) return p;

        let newUpvotes = p.upvotes;
        let newDownvotes = p.downvotes;
        let newStatus = p.voteStatus;

        if (direction === 'up') {
          if (currentStatus === 'up') {
            newUpvotes -= 1;
            newStatus = 'none';
          } else {
            newUpvotes += 1;
            if (currentStatus === 'down') newDownvotes -= 1;
            newStatus = 'up';
          }
        } else {
          if (currentStatus === 'down') {
            newDownvotes -= 1;
            newStatus = 'none';
          } else {
            newDownvotes += 1;
            if (currentStatus === 'up') newUpvotes -= 1;
            newStatus = 'down';
          }
        }
        return { ...p, upvotes: newUpvotes, downvotes: newDownvotes, voteStatus: newStatus };
      })
    );

    try {
      if (voteValue !== 0) {
        await postService.votePost(postId, voteValue);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al votar');
      loadData();
    }
  };

  const handleAddComment = async (postId: string, comment: Comment) => {
    try {
      const result = await commentService.createComment(postId, comment.content);
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === postId ? result.post : p))
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al añadir comentario');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await postService.deletePost(postId);
      setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al eliminar post');
    }
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
    try {
      await commentService.deleteComment(postId, commentId);
      const updatedPost = await postService.getPost(postId);
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === postId ? updatedPost : p))
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al eliminar comentario');
    }
  };

  const handleCreatePost = async (data: {
    title: string;
    content: string;
    communityId: string;
    tag: PostTag;
  }) => {
    try {
      const newPost = await postService.createPost(data);
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      setNotification('¡Publicación creada!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al crear publicación');
    }
  };

  const handleUpdateUser = async (updates: {
    avatarUrl?: string;
    coverImageUrl?: string;
    title?: string;
    bio?: string;
  }) => {
    try {
      const updated = await userService.updateUser(updates);
      setCurrentUser(updated);
      setNotification('Perfil actualizado');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al actualizar perfil');
    }
  };

  const handleCreateCommunity = async (data: {
    name: string;
    description: string;
    moderators: User[];
  }) => {
    try {
      const newCommunity = await communityService.createCommunity(data);
      setCommunities((prev) => [...prev, newCommunity]);
      setNotification('¡Comunidad creada!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al crear comunidad');
    }
  };

  // Nuevo: unirse a una comunidad y refrescar datos
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

  const handleSelectPost = async (postId: string) => {
    try {
      const post = await postService.getPost(postId);
      setSelectedPost(post);
      setSelectedUser(null);
      setView('post');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar publicación');
    }
  };

  const handleSelectCommunity = async (communityId: string) => {
    setSelectedCommunity(communityId);
    setSelectedPost(null);
    setSelectedUser(null);
    setView('home');

    try {
      const postsData = await postService.getPosts({ communityId });
      setPosts(postsData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar publicaciones');
    }
  };

  const handleSelectUser = async (user: User) => {
    try {
      const fullUser = await userService.getUser(user.id);
      setSelectedUser(fullUser);
      setSelectedPost(null);
      setView('profile');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar perfil');
    }
  };

  const handleLogoClick = async () => {
    setSelectedCommunity(null);
    setSelectedPost(null);
    setSelectedUser(null);
    setSearchQuery('');
    setView('home');

    try {
      const postsData = await postService.getPosts();
      setPosts(postsData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar publicaciones');
    }
  };

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        if (selectedCommunity && post.communityId !== selectedCommunity) {
          return false;
        }
        if (
          searchQuery &&
          !post.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !post.content.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !post.communityName.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
      );
  }, [posts, selectedCommunity, searchQuery]);

  if (!currentUser) {
    return <Login onLogin={handleLogin} onRegister={handleRegister} />;
  }

  if (!currentUser.hasCompletedOnboarding) {
    return (
      <Onboarding
        currentUser={currentUser}
        onComplete={handleCompleteOnboarding}
        communities={communities}
      />
    );
  }

  const renderContent = () => {
    if (loading) {
      return <div className="text-center p-8">Cargando contenido...</div>;
    }

    switch (view) {
      case 'post':
        if (!selectedPost) return <div>Post no encontrado.</div>;
        return (
          <PostDetail
            post={selectedPost}
            currentUser={currentUser}
            onVote={handleVote}
            onAddComment={handleAddComment}
            onNavigateToProfile={handleSelectUser}
            onDeletePost={handleDeletePost}
            onDeleteComment={handleDeleteComment}
          />
        );
      case 'profile':
        if (!selectedUser) return <div>Usuario no encontrado.</div>;
        const userPosts = posts.filter((p) => p.author.id === selectedUser.id);
        return (
          <Profile
            user={selectedUser}
            currentUser={currentUser}
            posts={userPosts}
            onVote={handleVote}
            onSelectPost={handleSelectPost}
            onSelectCommunity={handleSelectCommunity}
            onSelectUser={handleSelectUser}
            onUpdateUser={handleUpdateUser}
            onDeletePost={handleDeletePost}
          />
        );
      case 'home':
      default:
        return (
          <>
            <HomePostCreator
              currentUser={currentUser}
              communities={communities}
              activeCommunity={selectedCommunity}
              onCreatePost={handleCreatePost}
            />
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onVote={handleVote}
                onSelectPost={handleSelectPost}
                onSelectCommunity={handleSelectCommunity}
                onSelectUser={handleSelectUser}
                onDeletePost={handleDeletePost}
              />
            ))}
          </>
        );
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen">
      <Header
        currentUser={currentUser}
        onLogoClick={handleLogoClick}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onProfileClick={() => handleSelectUser(currentUser)}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      {notification && (
        <SuccessNotification
          message={notification}
          onClose={() => setNotification(null)}
        />
      )}
      <main className="max-w-7xl mx-auto pt-20 px-2 sm:px-4 lg:px-8">
        <div className="grid grid-cols-12 gap-8">
          <Sidebar
            currentUser={currentUser}
            communities={communities}
            activeCommunity={selectedCommunity}
            onSelectCommunity={handleSelectCommunity}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            users={allUsers}
            onCreateCommunity={handleCreateCommunity}
            onJoinCommunity={handleJoinCommunity} // pasa el nuevo handler
          />
          <div className="col-span-12 md:col-span-8 lg:col-span-9">
            {error && (
              <div
                className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4"
                role="alert"
              >
                <p>{error}</p>
              </div>
            )}
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
