import React, { useRef } from 'react';
    import { Bar, Line, Pie } from 'react-chartjs-2';
    import { motion } from 'framer-motion';
    import { Download, BarChart2 } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import ChartExportFooter from './ChartExportFooter';

    const ChartPreviewCard = ({ chartData, chartOptions, chartConfig, brandConfig, onDownload, hasData }) => {
      const chartInstanceRef = useRef(null);
      const { chartTitle = "Chart Preview", chartType = 'bar', description } = chartConfig || {};
      
      const { 
        articleName = 'Article', 
        logoUrl = '', 
        footerColor = '#1F2937', 
        font = 'Poppins', 
        footerText: footerTextTemplate = '{articleName} | © Copyright {year}' 
      } = brandConfig || {};

      const ChartComponent = chartType === 'line' ? Line : chartType === 'pie' ? Pie : Bar;
      const ChartIcon = BarChart2;

      const previewChartOptions = {
        ...(chartOptions || {}),
        responsive: true,
        maintainAspectRatio: false, 
        layout: {
            padding: { top: 15, right: 20, bottom: 15, left: 20 }, 
            ...(chartOptions?.layout?.padding || {})
        },
        plugins: {
            ...(chartOptions?.plugins || {}),
            title: {
                ...(chartOptions?.plugins?.title || {}),
                font: { ...(chartOptions?.plugins?.title?.font || {}), size: 20 }, 
                padding: { top: 10, bottom: description ? 2 : 15, ...(chartOptions?.plugins?.title?.padding || {}) }
            },
            subtitle: {
                ...(chartOptions?.plugins?.subtitle || {}),
                display: !!description,
                text: description,
                font: { ...(chartOptions?.plugins?.subtitle?.font || {}), size: 12, style: 'italic' },
                padding: { top: 0, bottom: 10 }
            }
        },
        scales: {
            x: {
                ...(chartOptions?.scales?.x || {}),
                ticks: { ...(chartOptions?.scales?.x?.ticks || {}), font: { ...(chartOptions?.scales?.x?.ticks?.font || {}), size: 12 } }
            },
            y: {
                ...(chartOptions?.scales?.y || {}),
                ticks: { ...(chartOptions?.scales?.y?.ticks || {}), font: { ...(chartOptions?.scales?.y?.ticks?.font || {}), size: 12 } }
            }
        }
      };


      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full h-full flex flex-col"
        >
          <Card className="shadow-xl overflow-hidden flex-grow flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between gap-2 p-4 border-b">
              <div className="flex-grow min-w-0">
                <CardTitle className="text-lg flex items-center truncate">
                  <ChartIcon className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  <span className="truncate">{chartTitle}</span>
                </CardTitle>
                {description && <CardDescription className="text-xs truncate mt-0.5">{description}</CardDescription>}
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-2 sm:p-4 flex flex-col min-h-0">
              <div className="relative bg-white rounded-md border border-gray-200 chart-container-bg flex-grow flex flex-col" >
                {hasData ? (
                  <>
                    <div style={{ flexGrow: 1, height: '300px', minHeight: '300px', position: 'relative' }}>
                      <ChartComponent ref={chartInstanceRef} data={chartData} options={previewChartOptions} />
                    </div>
                    <div style={{ position: 'relative', width: '100%', marginTop: 'auto', flexShrink: 0 }}>
                      <ChartExportFooter 
                        articleName={articleName} 
                        logoUrl={logoUrl} 
                        secondaryColor={footerColor} 
                        font={font}
                        footerTextTemplate={footerTextTemplate}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-gray-50 rounded-md border-2 border-dashed border-gray-300 p-4">
                    <img  alt="Chart placeholder illustration" className="w-20 h-20 opacity-50 mb-3" src="https://images.unsplash.com/photo-1643917853949-74f4eba1c89b" />
                    <p className="text-md font-semibold">No data for this chart</p>
                    <p className="text-xs">Upload a DOCX or configure axes.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default ChartPreviewCard;