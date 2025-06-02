import React, { useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
    import html2canvas from 'html2canvas';
    import { useToast } from '@/components/ui/use-toast';
    import { generateChartOptions, generateChartData } from '@/components/charting/chartUtils';
    import ChartPreviewCard from '@/components/charting/ChartPreviewCard';
    import ChartExportElement from '@/components/charting/ChartExportElement';
    
    const ChartRenderer = forwardRef(({ tableData, chartConfig, brandConfig, chartId }, ref) => {
      const chartExportContainerRef = useRef(null);
      const { toast } = useToast();
    
      const { xAxis, yAxes, chartTitle } = chartConfig;
      
      const chartData = useMemo(() => generateChartData(tableData, chartConfig, brandConfig), [tableData, chartConfig, brandConfig]);
      const chartOptions = useMemo(() => generateChartOptions(chartConfig, brandConfig, chartData), [chartConfig, brandConfig, chartData]);
    
      const hasData = useMemo(() => {
        if (!tableData?.rawData || tableData.rawData.length === 0 || !xAxis || !yAxes || yAxes.length === 0) {
          return false;
        }
        return tableData.rawData.every(item => 
          item.hasOwnProperty(xAxis) && yAxes.every(yAxisKey => item.hasOwnProperty(yAxisKey))
        );
      }, [tableData, xAxis, yAxes]);
    
      useImperativeHandle(ref, () => ({
        getChartCanvas: async () => {
          if (!chartExportContainerRef.current || !hasData) return null;
          
          const elementToCapture = chartExportContainerRef.current.querySelector('.chart-export-bordered-container') || chartExportContainerRef.current;

          return html2canvas(elementToCapture, {
            width: 1536,
            height: 804,
            scale: 2, 
            backgroundColor: '#ffffff',
            useCORS: true,
            logging: false,
            imageTimeout: 15000, 
            removeContainer: false, 
          });
        }
      }));
    
      const handleDownload = async () => {
        if (!chartExportContainerRef.current || !hasData) {
            toast({ variant: "destructive", title: "Export Error", description: "Chart data or export container not found." });
            return;
        }
        toast({ title: "Preparing Download...", description: "Your chart image (1536x804px) is being generated." });
        try {
            const elementToCapture = chartExportContainerRef.current.querySelector('.chart-export-bordered-container') || chartExportContainerRef.current;
            const canvas = await html2canvas(elementToCapture, {
                width: 1536,
                height: 804,
                scale: 2, 
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                imageTimeout: 15000,
                removeContainer: false, 
            });
            const link = document.createElement('a');
            link.download = `${chartTitle.replace(/[^a-z0-9_]/gi, '-').toLowerCase() || 'chart'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast({ title: "Download Started!", description: "Chart image saved as PNG." });
        } catch (err) {
            toast({ variant: "destructive", title: "Download Error", description: "Could not generate image: " + err.message });
        }
      };
        
      return (
        <>
          <ChartPreviewCard
            chartData={chartData}
            chartOptions={chartOptions}
            chartConfig={chartConfig}
            brandConfig={brandConfig}
            onDownload={handleDownload}
            hasData={hasData}
          />
          <ChartExportElement
            ref={chartExportContainerRef}
            chartData={chartData}
            chartOptions={chartOptions}
            chartConfig={chartConfig}
            brandConfig={brandConfig}
            hasData={hasData}
            chartId={chartId} 
          />
        </>
      );
    });    
    ChartRenderer.displayName = 'ChartRenderer';
    export default ChartRenderer;