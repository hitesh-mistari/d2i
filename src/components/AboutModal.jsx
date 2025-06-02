import React from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';

    const AboutModal = ({ onClose }) => {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[100]"
          onClick={onClose}
        >
          <motion.div 
            className="bg-white p-6 rounded-lg shadow-2xl max-w-md w-full text-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-primary mb-3">About This App</h2>
            <p className="mb-2">This application extracts tables from DOCX files and converts them into customizable, brandable charts, styled like DemandSage infographics.</p>
            <p className="mb-2">Key Features:</p>
            <ul className="list-disc list-inside mb-4 text-sm space-y-1">
              <li>DOCX file upload and table extraction (up to 5MB).</li>
              <li>Multiple chart previews (Bar, Line, Pie).</li>
              <li>Individual chart configuration (X/Y axes, title, type).</li>
              <li>Site branding (logo, colors, site name for ZIP).</li>
              <li>Individual PNG download for each chart (1536x804px).</li>
              <li>Download all charts as a single ZIP file.</li>
              <li>Optional "*predicted" note on charts.</li>
            </ul>
            <p className="text-xs text-slate-500">Built with React, TailwindCSS, Chart.js, Mammoth.js, JSZip, and shadcn/ui components.</p>
            <Button onClick={onClose} className="mt-4 w-full bg-primary hover:bg-primary/90 text-primary-foreground">Close</Button>
          </motion.div>
        </motion.div>
      );
    };

    export default AboutModal;