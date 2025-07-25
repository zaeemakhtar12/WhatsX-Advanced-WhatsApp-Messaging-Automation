import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../pages/Dashboard';

// Mobile Bottom Navigation Component
export function MobileBottomNav({ currentPage, onPageChange, userRole, menuItems }) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingUp = currentScrollY < lastScrollY;
      
      setIsVisible(isScrollingUp || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const visibleMenuItems = menuItems.slice(1, 5); // Show main features only

  return (
    <div className={`
      fixed bottom-0 left-0 right-0 z-40 transform transition-transform duration-300 ease-in-out
      ${isVisible ? 'translate-y-0' : 'translate-y-full'}
    `}>
      <div className="bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-dark-border/50 px-4 py-2">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {visibleMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-300 ${
                currentPage === item.id
                  ? 'text-whatsapp-500 bg-whatsapp-50 dark:bg-whatsapp-900/20 scale-110'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-surfaceHover'
              }`}
            >
              <span className={`text-lg transition-transform duration-300 ${
                currentPage === item.id ? 'animate-bounce' : ''
              }`}>
                {item.icon}
              </span>
              <span className="text-xs font-medium">{item.label.split(' ')[0]}</span>
              {currentPage === item.id && (
                <div className="w-1 h-1 bg-whatsapp-500 rounded-full animate-ping" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Mobile Sidebar Overlay
export function MobileSidebarOverlay({ 
  isOpen, 
  onClose, 
  currentPage, 
  onPageChange, 
  userRole, 
  onLogout, 
  menuItems 
}) {
  const overlayRef = useRef(null);
  const sidebarRef = useRef(null);
  const [startX, setStartX] = useState(null);
  const [currentX, setCurrentX] = useState(null);
  const [isSwipingToClose, setIsSwipingToClose] = useState(false);

  // Handle swipe gestures
  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!startX) return;
    
    setCurrentX(e.touches[0].clientX);
    const diffX = startX - e.touches[0].clientX;
    
    if (diffX > 0 && diffX > 50) {
      setIsSwipingToClose(true);
    } else {
      setIsSwipingToClose(false);
    }
  };

  const handleTouchEnd = () => {
    if (isSwipingToClose && startX && currentX) {
      const diffX = startX - currentX;
      if (diffX > 100) {
        onClose();
      }
    }
    setStartX(null);
    setCurrentX(null);
    setIsSwipingToClose(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex"
      onClick={(e) => {
        if (e.target === overlayRef.current) {
          onClose();
        }
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
      
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`
          relative w-80 max-w-[85vw] h-full sidebar-gradient transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isSwipingToClose ? 'translate-x-[-20px]' : ''}
        `}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-whatsapp-500 to-blue-500 rounded-xl flex items-center justify-center shadow-neon animate-glow">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor"/>
                    <path d="M8 9h8M8 13h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white text-shadow">WhatsApp Bulk</h2>
                  <p className="text-xs text-gray-300">Mobile Dashboard</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  onClose();
                }}
                className={`
                  w-full text-left p-4 rounded-xl transition-all duration-300 group animate-slide-in-left
                  ${currentPage === item.id
                    ? 'bg-white/20 text-white shadow-glass transform scale-105'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white hover:scale-105'
                  }
                `}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-2xl transition-transform duration-300 ${
                    currentPage === item.id ? 'animate-bounce' : 'group-hover:animate-bounce'
                  }`}>
                    {item.icon}
                  </span>
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                  {currentPage === item.id && (
                    <div className="ml-auto w-2 h-2 bg-whatsapp-400 rounded-full animate-pulse" />
                  )}
                </div>
              </button>
            ))}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10">
              <div className="w-10 h-10 bg-gradient-to-br from-whatsapp-500 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {userRole?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Role: {userRole}</p>
                <p className="text-gray-300 text-xs">WhatsApp Bulk Messenger</p>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
        
        {/* Swipe indicator */}
        <div className="absolute top-1/2 -right-4 transform -translate-y-1/2">
          <div className="w-8 h-12 bg-white/20 backdrop-blur-sm rounded-l-xl flex items-center justify-center">
            <div className="w-1 h-6 bg-white/40 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile Floating Action Button
export function MobileFloatingActionButton({ onAction, actions = [] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="fixed bottom-20 right-6 z-30">
      {/* Action buttons */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 space-y-3 animate-slide-in">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.handler();
                setIsExpanded(false);
              }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl shadow-elevated backdrop-blur-lg transition-all duration-300 hover:scale-105
                ${action.color ? `bg-${action.color}-500 text-white` : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300'}
              `}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="text-lg">{action.icon}</span>
              <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Main FAB */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-14 h-14 bg-whatsapp-500 hover:bg-whatsapp-600 text-white rounded-full shadow-neon 
          flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95
          ${isExpanded ? 'rotate-45' : 'rotate-0'}
        `}
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}

// Mobile Search Bar
export function MobileSearchBar({ placeholder, onSearch, onFocus, onBlur }) {
  const [isFocused, setIsFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <div className={`
      relative transition-all duration-300 ease-out
      ${isFocused ? 'transform scale-105' : ''}
    `}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onSearch?.(e.target.value);
          }}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          className={`
            w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-300
            ${isFocused 
              ? 'border-whatsapp-500 ring-2 ring-whatsapp-500/20 bg-white dark:bg-dark-surface' 
              : 'border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surfaceHover'
            }
            text-gray-900 dark:text-white placeholder-gray-400
          `}
        />
        
        <div className={`
          absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300
          ${isFocused ? 'text-whatsapp-500' : 'text-gray-400'}
        `}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              onSearch?.('');
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// Mobile Pull-to-Refresh Component
export function MobilePullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(null);
  
  const threshold = 80;
  
  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };
  
  const handleTouchMove = (e) => {
    if (startY && window.scrollY === 0) {
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY);
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };
  
  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh?.();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    setStartY(null);
  };
  
  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-whatsapp-50 dark:bg-whatsapp-900/20 transition-all duration-200"
          style={{ 
            height: `${Math.min(pullDistance, threshold)}px`,
            opacity: pullDistance / threshold 
          }}
        >
          <div className={`text-whatsapp-500 ${isRefreshing ? 'animate-spin' : ''}`}>
            {isRefreshing ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path d="M1 4v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="19,12 12,19 5,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        </div>
      )}
      
      {/* Content */}
      <div 
        className="transition-transform duration-200"
        style={{ 
          transform: `translateY(${Math.min(pullDistance, threshold)}px)` 
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default {
  MobileBottomNav,
  MobileSidebarOverlay,
  MobileFloatingActionButton,
  MobileSearchBar,
  MobilePullToRefresh,
}; 