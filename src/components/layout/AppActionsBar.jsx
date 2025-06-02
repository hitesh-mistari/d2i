import React from 'react';
    import { motion } from 'framer-motion';
    import { DownloadCloud, RefreshCw, FileText, FileJson } from 'lucide-react';
    import { Button } from '@/components/ui/button';

    const AppActionsBar = ({ onRegenerateCharts, onDownloadAllChartsAsZip, onExportData }) => {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="py-4 px-6 flex flex-wrap gap-3 justify-center items-center sticky bottom-0 bg-slate-100/80 backdrop-blur-sm w-full border-t border-slate-300 z-10"
        >
          <Button onClick={onRegenerateCharts} variant="outline" className="border-primary text-primary hover:bg-primary/10">
            <RefreshCw className="mr-2 h-4 w-4" /> Regenerate All Charts
          </Button>
          <Button onClick={onDownloadAllChartsAsZip} className="bg-green-600 hover:bg-green-700 text-white">
            <DownloadCloud className="mr-2 h-5 w-5" /> Download All as ZIP
          </Button>
          <Button onClick={() => onExportData('csv')} variant="outline" className="text-slate-700 hover:bg-slate-200">
            <FileText className="mr-2 h-4 w-4" /> Export All as CSV
          </Button>
          <Button onClick={() => onExportData('json')} variant="outline" className="text-slate-700 hover:bg-slate-200">
            <FileJson className="mr-2 h-4 w-4" /> Export All as JSON
          </Button>
        </motion.div>
      );
    };

    export default AppActionsBar;