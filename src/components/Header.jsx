// AllRecipes/src/components/Header.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';
import { GiSpoon } from 'react-icons/gi';
import { BiSolidUserCircle } from 'react-icons/bi';
import { useFavorites } from '../context/FavoritesContext';
import UserSidebar from './UserSidebar';
import ThemeToggle from './layout/ThemeToggle'; 

const Header = () => {
  const [user, setUser] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites } = useFavorites();

  // Helper function to get user from localStorage
const getLocalStorageUser = () => {
  try {
    const userData = localStorage.getItem('allRecipesUser');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.isLoggedIn) {

        const savedProfilePicture = localStorage.getItem(`profilePicture_${parsedUser.email}`);
        if (savedProfilePicture && !parsedUser.profilePicture) {
          parsedUser.profilePicture = savedProfilePicture;
          localStorage.setItem('allRecipesUser', JSON.stringify(parsedUser));
        }
        return parsedUser;
      }
    }
    return null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('allRecipesUser');
    return null;
  }
};

  // Firebase auth state listener
  const setupFirebaseListener = async () => {
    try {
      const { auth } = await import('../config/firebase');
      const { onAuthStateChanged } = await import('firebase/auth');
      
      // Listen for authentication state changes
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          // User is signed in with Firebase - check localStorage for updates
          const localUser = getLocalStorageUser();
          if (localUser && localUser.email === firebaseUser.email) {
            setUser({...localUser}); 
          } else {
            // Create new user data from Firebase, but preserve any existing profile picture
            const existingUser = getLocalStorageUser();
            const userData = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              email: firebaseUser.email,
              isLoggedIn: true,
              provider: 'firebase',
              
              ...(existingUser?.profilePicture && { profilePicture: existingUser.profilePicture })
            };
            setUser(userData);
            localStorage.setItem('allRecipesUser', JSON.stringify(userData));
          }
        } else {
          // Check localStorage for fallback
          checkLocalStorageUser();
        }
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.warn('Firebase not available, using localStorage only');
      checkLocalStorageUser();
      setLoading(false);
      return null;
    }
  };

  // Check localStorage for user data
  const checkLocalStorageUser = () => {
    const localUser = getLocalStorageUser();
    setUser(localUser);
  };

  useEffect(() => {
    let unsubscribe = null;

    // Try to setup Firebase listener
    setupFirebaseListener().then((unsub) => {
      unsubscribe = unsub;
    });

    // Listen for localStorage changes and force re-render
    const handleStorageChange = () => {
      const localUser = getLocalStorageUser();
      if (localUser && localUser.email === user?.email) {
        setUser({...localUser}); // Force new object reference for re-render
      } else if (!localUser) {
        setUser(null);
      }
    };

    // Check for updates every 500ms (for same-tab updates)
    const interval = setInterval(handleStorageChange, 500);
    
    // Listen for storage events (cross-tab updates)
    window.addEventListener('storage', handleStorageChange);

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user?.email]);

  const handleAuthClick = () => {
    if (user) {
      setShowSidebar(true);
    } else {
      console.log('🔐 Navigating to login page...');
      
      // If already on login page, force refresh to go back to login view
      if (location.pathname === '/login') {
        window.location.href = '/login';
      } else {
        navigate('/login');
      }
    }
  };

  // Handle My Favorites click
  const handleFavoritesClick = (e) => {
    if (!user) {
      // If not logged in, redirect to login
      e.preventDefault();
      navigate('/login');
    }
    // If logged in, normal Link behavior will work
  };

  // Handle My Reviews click
  const handleReviewsClick = (e) => {
    if (!user) {
      // If not logged in, redirect to login
      e.preventDefault();
      navigate('/login');
    }
    // If logged in, normal Link behavior will work
  };

  const handleLogout = async () => {
    try {
      // Try Firebase logout first
      try {
        const { auth } = await import('../config/firebase');
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
        console.log('✅ User logged out from Firebase');
      } catch (firebaseError) {
        console.warn('Firebase logout failed, using localStorage cleanup');
      }
      
      // Always clear localStorage and local state
      setUser(null);
      setShowSidebar(false);
      localStorage.removeItem('allRecipesUser');
      navigate('/login');
      console.log('✅ User logged out successfully');
      
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUserUpdate = (updatedUser) => {
    setUser({...updatedUser});
    localStorage.setItem('allRecipesUser', JSON.stringify(updatedUser));
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  // Show loading state briefly
  if (loading) {
    return (
      <div className="header-container">
        <Link to={'/'}>
          <h1>
            All Recipes
            <GiSpoon />
          </h1>
        </Link>
        
        {/* Navigation Menu */}
        <nav className="header-nav">
          <Link to="/" className="nav-link">Home</Link>
        </nav>
        
        {/* UPDATED: Right section with theme toggle + user icon */}
        <div className="header-right-section">
          <ThemeToggle />
          <BiSolidUserCircle 
            className='user-img' 
            style={{ opacity: 0.5 }}
            title="Loading..."
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="header-container">
        <Link to={'/'}>
          <h1>
            All Recipes
            <GiSpoon />
          </h1>
        </Link>
        
        {/* Navigation Menu */}
        <nav className="header-nav">
          <Link 
            to="/" 
            className="nav-link"
          >
            Home
          </Link>
          
          {/* My Favorites - ALWAYS VISIBLE */}
          <Link 
            to="/my-favorites" 
            className="nav-link favorites-link"
            onClick={handleFavoritesClick}
          >
            <span className="favorites-text">My Favorites</span>
            <div className="favorites-icon">
              <svg 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="heart-icon"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {/* Favorites count badge - ONLY SHOW IF LOGGED IN AND HAS FAVORITES */}
              {user && favorites.length > 0 && (
                <span className="favorites-count">{favorites.length}</span>
              )}
            </div>
          </Link>

          {/* Meal Planner - ONLY SHOW IF LOGGED IN */}
                    <Link to="/meal-planner" className="nav-link">
                      Meal Planner
                    </Link>

          {/* My Reviews */}
          <Link 
            to="/my-reviews" 
            className="nav-link reviews-link"
            onClick={handleReviewsClick}
          >
            <span className="reviews-text">My Reviews</span>
            <div className="reviews-icon">
              <svg 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="review-icon"
              >
                <path d="M9 22a1 1 0 01-1-1v-3H4a2 2 0 01-2-2V4a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2h-6.1l-3.7 3.71c-.2.19-.45.29-.7.29H9z"/>
              </svg>
            </div>
          </Link>
          {/* Recently Viewed */}
          <Link 
            to="/recently-viewed" 
            className="nav-link recently-viewed-link"
          >
            <span className="viewed-text">Recently Viewed</span>
            <div className="viewed-icon">
              <svg 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="viewed-icon"
              >
                <path d=""/>
              </svg>
            </div>
          </Link>
        </nav>
        
        {/* Theme toggle */}
        <div className="header-right-section">
          <ThemeToggle />
          {user ? (
            // Show user avatar when logged in
            <div 
              className="user-avatar-header"
              onClick={handleAuthClick}
              title={`${user.name || user.email} - Click for account`}
              style={{ 
                cursor: 'pointer',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: user.profilePicture ? 'transparent' : 'linear-gradient(135deg, #ff6b35, #f7931e)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: '0.9rem',
                letterSpacing: '0.5px',
                boxShadow: '0 2px 10px rgba(255, 107, 53, 0.3)',
                transition: 'all 0.3s ease',
                overflow: 'hidden'
              }}
            >
              {user.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt="Profile" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    borderRadius: '50%',
                    display: 'block'
                  }}
                />
              ) : (
                getInitials(user.name || user.email)
              )}
            </div>
          ) : (
            // Show login icon when not logged in
            <BiSolidUserCircle 
              className='user-img' 
              onClick={handleAuthClick}
              title="Login / Register"
              style={{ cursor: 'pointer' }}
            />
          )}
        </div>
      </div>

      {showSidebar && user && (
        <UserSidebar 
          user={user}
          onClose={() => setShowSidebar(false)}
          onLogout={handleLogout}
          onUserUpdate={handleUserUpdate}
        />
      )}
    </>
  );
};

export default Header;