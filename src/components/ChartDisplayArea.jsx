import React from 'react';
    import { motion } from 'framer-motion';
    import ChartRenderer from '@/components/ChartRenderer';
    import { Card } from '@/components/ui/card';
    import { BarChart3 } from 'lucide-react';

    const ChartDisplayArea = ({ tableData, chartConfig, brandConfig, chartRef }) => {
      if (!tableData || !chartConfig) {
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-grow flex items-center justify-center bg-slate-200/50 rounded-xl shadow-inner"
          >
            <Card className="w-full max-w-md flex flex-col items-center justify-center p-10 text-center bg-white shadow-lg">
              <img  alt="Illustration of a graph and document" className="w-32 h-32 opacity-50 mb-6" src="https://images.unsplash.com/photo-1643917853949-74f4eba1c89b" />
              <p className="text-xl font-semibold text-slate-600">Upload a DOCX to Get Started</p>
              <p className="text-sm text-slate-500 mt-1">Your chart preview will appear here.</p>
            </Card>
          </motion.div>
        );
      }

      return (
        <motion.div 
          key={chartConfig.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-grow flex flex-col items-center justify-center p-4 bg-slate-200/50 rounded-xl shadow-inner"
        >
          <div className="w-full h-full max-w-[1000px] max-h-[650px] bg-white rounded-lg shadow-xl overflow-hidden">
            <ChartRenderer
              ref={chartRef}
              tableData={tableData}
              chartConfig={chartConfig}
              brandConfig={brandConfig}
              chartId={chartConfig.id}
            />
          </div>
        </motion.div>
      );
    };

    export default ChartDisplayArea;