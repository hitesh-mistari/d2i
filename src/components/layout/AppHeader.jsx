import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, FileText, BarChart3, LogOut, UserCircle, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth.jsx';

const AppHeader = ({ onClearAll, showClearAll, currentFileName, chartCount, children }) => {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="w-full max-w-screen-2xl py-3 px-4 sm:px-6 flex justify-between items-center sticky top-0 bg-slate-100/80 backdrop-blur-sm z-20 border-b border-slate-300">
      <div className="flex items-center">
        <Link to={session ? "/dashboard" : "/"} className="flex items-center">
          <img  alt="App Logo" className="h-8 w-auto mr-3" src="https://images.unsplash.com/photo-1643917853949-74f4eba1c89b" />
          <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">DOCX to Infographics</h1>
        </Link>
      </div>
      
      <div className="flex-grow flex justify-center items-center">
        {children}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {showClearAll && currentFileName && (
          <div className="hidden md:flex items-center gap-3 text-sm text-slate-600 border-r border-slate-300 pr-3 mr-1">
            <div className="flex items-center">
               <FileText size={16} className="mr-1.5 text-slate-500"/> 
               <span>{currentFileName}</span>
            </div>
            <div className="flex items-center">
                <BarChart3 size={16} className="mr-1.5 text-slate-500"/>
                <span>{chartCount} Infographic{chartCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
        {showClearAll && (
          <Button onClick={onClearAll} variant="outline" size="sm">
            <Trash2 className="mr-1.5 h-4 w-4" /> Clear All
          </Button>
        )}
        {session ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <LayoutDashboard className="mr-1.5 h-4 w-4" /> Dashboard
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-1.5 h-4 w-4" /> Sign Out
            </Button>
          </>
        ) : (
          <Button variant="default" size="sm" onClick={() => navigate('/auth')}>
            <UserCircle className="mr-1.5 h-4 w-4" /> Login / Sign Up
          </Button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;