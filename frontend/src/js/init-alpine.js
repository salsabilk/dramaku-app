import { useState, useEffect } from 'react';

function useAppData() {
  // Get theme from localStorage
  const getThemeFromLocalStorage = () => {
    const savedTheme = window.localStorage.getItem('dark');
    if (savedTheme) {
      return JSON.parse(savedTheme);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // Set theme to localStorage
  const setThemeToLocalStorage = (value) => {
    window.localStorage.setItem('dark', value);
  };

  // Dark mode state
  const [dark, setDark] = useState(getThemeFromLocalStorage());

  // Toggle theme
  const toggleTheme = () => {
    setDark(!dark);
    setThemeToLocalStorage(!dark);
  };

  // Side menu state
  const [isSideMenuOpen, setSideMenuOpen] = useState(false);
  const toggleSideMenu = () => setSideMenuOpen(!isSideMenuOpen);
  const closeSideMenu = () => setSideMenuOpen(false);

  // Notifications menu state
  const [isNotificationsMenuOpen, setNotificationsMenuOpen] = useState(false);
  const toggleNotificationsMenu = () => setNotificationsMenuOpen(!isNotificationsMenuOpen);
  const closeNotificationsMenu = () => setNotificationsMenuOpen(false);

  // Profile menu state
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const toggleProfileMenu = () => setProfileMenuOpen(!isProfileMenuOpen);
  const closeProfileMenu = () => setProfileMenuOpen(false);

  // Pages menu state
  const [isPagesMenuOpen, setPagesMenuOpen] = useState(false);
  const togglePagesMenu = () => setPagesMenuOpen(!isPagesMenuOpen);

  // Modal state
  const [isModalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  // Sync dark mode with system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setDark(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return {
    dark,
    toggleTheme,
    isSideMenuOpen,
    toggleSideMenu,
    closeSideMenu,
    isNotificationsMenuOpen,
    toggleNotificationsMenu,
    closeNotificationsMenu,
    isProfileMenuOpen,
    toggleProfileMenu,
    closeProfileMenu,
    isPagesMenuOpen,
    togglePagesMenu,
    isModalOpen,
    openModal,
    closeModal,
  };
}

export default useAppData;
