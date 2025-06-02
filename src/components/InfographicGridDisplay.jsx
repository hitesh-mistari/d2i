import React from 'react';
    import { motion } from 'framer-motion';
    import InfographicCard from '@/components/InfographicCard';
    import { ScrollArea } from '@/components/ui/scroll-area';
    import { cn } from '@/lib/utils';

    const InfographicGridDisplay = ({ 
      chartConfigs, 
      extractedTablesData, 
      brandConfig, 
      chartRefs, 
      onEditChart,
      onDownloadChart,
      toast,
      zoomLevel = 1
    }) => {
      if (!chartConfigs || chartConfigs.length === 0) {
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-grow flex items-center justify-center bg-slate-200/50 rounded-xl shadow-inner p-6"
          >
            <div className="text-center text-slate-500">
              <img  alt="Illustration of documents and charts" className="w-40 h-40 opacity-60 mx-auto mb-4" src="https://images.unsplash.com/photo-1643917853949-74f4eba1c89b" />
              <h2 className="text-xl font-semibold">No Infographics Generated Yet</h2>
              <p className="mt-1">Upload a DOCX file and configure your charts to see them here.</p>
            </div>
          </motion.div>
        );
      }

      const gridColsClass = chartConfigs.length === 1 && zoomLevel >= 1.5 
        ? 'grid-cols-1' 
        : chartConfigs.length === 2 && zoomLevel >= 1
        ? 'grid-cols-1 lg:grid-cols-2'
        : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';

      return (
        <ScrollArea className="flex-grow bg-slate-200/30 rounded-xl shadow-inner p-2 sm:p-4 overflow-auto">
          <motion.div
            style={{ 
              transform: `scale(${zoomLevel})`, 
              transformOrigin: 'top left', 
              width: zoomLevel === 1 ? '100%' : `${100 / zoomLevel}%`, 
              height: zoomLevel === 1 ? '100%' : `${100 / zoomLevel}%`,
              paddingBottom: zoomLevel > 1 ? `${(zoomLevel -1) * 50}vh` : '0px' // Add padding to allow scrolling when zoomed
            }}
            className={cn("grid gap-4 sm:gap-6", gridColsClass)}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            {chartConfigs.map((chartConfig, index) => {
              const tableData = extractedTablesData.find(td => td.id === chartConfig.tableId);
              if (!tableData) return null; 
              
              const chartComponentRef = chartRefs.current[index] || React.createRef();
              if(!chartRefs.current[index]) {
                  chartRefs.current[index] = chartComponentRef;
              }

              return (
                <motion.div
                  key={chartConfig.id}
                  id={`chart-card-${chartConfig.id}`}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="h-full" 
                >
                  <InfographicCard
                    chartConfig={chartConfig}
                    tableData={tableData}
                    brandConfig={brandConfig}
                    chartRef={chartComponentRef} 
                    onEdit={() => onEditChart(chartConfig.id)}
                    onDownload={() => {
                        if (chartComponentRef.current && typeof chartComponentRef.current.getChartCanvas === 'function') {
                            onDownloadChart(chartComponentRef.current, chartConfig, toast);
                        } else {
                            console.error("Download Error in GridDisplay: Ref or getChartCanvas missing.", chartComponentRef.current);
                            toast({variant: 'destructive', title: 'Download Error', description: 'Chart component ref or getChartCanvas method not available.'});
                        }
                    }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </ScrollArea>
      );
    };

    export default InfographicGridDisplay;