import React, { useState } from 'react';
import { useApp, TabType } from '../context/AppContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import {
  Sparkles,
  Bell,
  User,
  LogOut,
  Map,
  PlusCircle,
  MessageSquare,
  Award,
  ShieldAlert,
  Menu,
  X,
  CheckCircle,
  Activity
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, setCurrentUser, notifications, markNotificationAsRead } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signOut failed, clearing state locally.', err);
    }
    setCurrentUser(null);
    setActiveTab('landing');
  };

  const handleLoginAsGuest = () => {
    setCurrentUser({
      userId: 'user_dummy_1',
      name: 'Aarav Sharma',
      email: 'prajalpareta@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=120',
      role: 'citizen',
      reputationScore: 85,
      xp: 1250,
      rank: 'Silver',
      badges: ['first_report', 'helper_hand'],
      createdAt: new Date().toISOString()
    });
    setActiveTab('dashboard');
  };

  const navItems: { tab: TabType; label: string; icon: React.ReactNode }[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
    { tab: 'report', label: 'Report Issue', icon: <PlusCircle className="w-4 h-4 text-emerald-500" /> },
    { tab: 'map', label: 'Civic Map', icon: <Map className="w-4 h-4" /> },
    { tab: 'assistant', label: 'AI Assistant', icon: <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> },
    { tab: 'leaderboard', label: 'Leaderboard', icon: <Award className="w-4 h-4 text-blue-500" /> },
  ];

  // If user is admin, add Admin Panel to navigation
  if (currentUser?.role === 'admin') {
    navItems.push({
      tab: 'admin',
      label: 'Admin Control',
      icon: <ShieldAlert className="w-4 h-4 text-rose-500" />
    });
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg mr-2.5">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-sans font-bold text-lg tracking-tight bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                SpotFix
              </span>
              <span className="block text-[9px] font-mono text-blue-600 font-bold leading-none">INDORE CITIZEN ENGINE</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          {currentUser && (
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className={`flex items-center px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === item.tab
                      ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
                  }`}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* User Status / Notification & Actions */}
          <div className="flex items-center space-x-3.5">
            {currentUser ? (
              <>
                {/* Citizen Rank Badge */}
                <div className="hidden sm:flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs">
                  <div className="mr-2">
                    <span className="text-[10px] block text-slate-500 font-mono leading-none">CIVIC RANK</span>
                    <span className="font-bold text-blue-600 leading-none">{currentUser.rank}</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                </div>

                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all relative border border-transparent hover:border-slate-200"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden backdrop-blur-lg">
                      <div className="p-3.5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                        <span className="text-sm font-semibold text-slate-800">Realtime Updates</span>
                        <span className="text-xs text-slate-500">{unreadCount} unread</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.notificationId}
                              onClick={() => markNotificationAsRead(notif.notificationId)}
                              className={`p-3 text-xs transition-colors cursor-pointer ${
                                notif.read ? 'bg-white text-slate-500 hover:bg-slate-50' : 'bg-blue-50/70 text-slate-800 hover:bg-blue-50'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-0.5">
                                <span className="font-medium text-slate-800 flex items-center">
                                  {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5 inline-block"></span>}
                                  {notif.title}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="leading-relaxed text-slate-600">{notif.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-2 border-t border-slate-200 text-center bg-slate-50">
                        <button
                          onClick={() => {
                            notifications.forEach(n => markNotificationAsRead(n.notificationId));
                            setShowNotifications(false);
                          }}
                          className="text-[11px] text-blue-600 hover:text-blue-700 font-bold transition-colors"
                        >
                          Mark all as read
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown Profile / Logout */}
                <div className="flex items-center space-x-2">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full border border-blue-500/50 object-cover"
                  />
                  <span className="hidden lg:inline text-xs text-slate-700 font-medium">
                    {currentUser.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLoginAsGuest}
                  className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 transition-all shadow-lg shadow-blue-500/10 text-white"
                >
                  Guest Citizen
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            {currentUser && (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && currentUser && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => {
                setActiveTab(item.tab);
                setShowMobileMenu(false);
              }}
              className={`flex items-center w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === item.tab
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};
