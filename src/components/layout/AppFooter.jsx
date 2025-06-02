import React from 'react';
    import { Info, MessageSquare as MessageSquareText } from 'lucide-react';
    import { Button } from '@/components/ui/button';

    const AppFooter = ({ onToggleInfo, onToggleFeedback }) => {
      return (
        <footer className="w-full max-w-7xl mt-12 pt-8 border-t border-slate-300 text-center text-slate-500 text-sm">
          <div className="flex justify-center items-center space-x-4 mb-2">
            <p>&copy; {new Date().getFullYear()} DOCX to Infographics. All rights reserved.</p>
            <Button variant="ghost" size="sm" onClick={onToggleInfo} className="text-slate-500 hover:text-primary">
              <Info className="h-4 w-4 mr-1" /> About
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggleFeedback} className="text-slate-500 hover:text-primary">
              <MessageSquareText className="h-4 w-4 mr-1" /> Feedback
            </Button>
          </div>
          <p>Powered by Hostinger Horizons.</p>
        </footer>
      );
    };

    export default AppFooter;