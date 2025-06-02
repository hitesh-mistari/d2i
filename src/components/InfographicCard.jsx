import React from 'react';
    import { Bar, Line, Pie } from 'react-chartjs-2';
    import { motion } from 'framer-motion';
    import { Download, Edit3, BarChart2, Image as ImageIconPlaceholder } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { generateChartOptions, generateChartData } from '@/components/charting/chartUtils';
    import ChartExportElement from '@/components/charting/ChartExportElement';


    const InfographicCard = ({ chartConfig, tableData, brandConfig, chartRef, onEdit, onDownload }) => {
      const { chartTitle = "Infographic", chartType = 'bar', description } = chartConfig || {};
      const { 
        logoUrl = '', 
        showLogo = true,
        logoPlacement = 'top-right',
        font = 'Poppins',
        backgroundColor = '#FFFFFF',
        fontWeight = 'normal',
      } = brandConfig || {};

      const ChartComponent = chartType === 'line' ? Line : chartType === 'pie' ? Pie : Bar;
      const ChartIcon = BarChart2;

      const cardChartData = React.useMemo(() => generateChartData(tableData, chartConfig, brandConfig), [tableData, chartConfig, brandConfig]);
      
      const cardChartOptions = React.useMemo(() => {
        const baseOptions = generateChartOptions(chartConfig, brandConfig, cardChartData); 
        return {
          ...baseOptions,
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: { top: (showLogo && logoUrl && (logoPlacement === 'top-left' || logoPlacement === 'top-right')) ? 35 : 10, right: 15, bottom: 10, left: 15 },
             ...(baseOptions.layout?.padding || {})
          },
          plugins: {
            ...baseOptions.plugins,
            legend: {
                ...baseOptions.plugins.legend,
                display: chartConfig.showLegend && (chartConfig.yAxes?.length > 1 || chartType === 'pie'),
                labels: { ...baseOptions.plugins.legend?.labels, font: { ...(baseOptions.plugins.legend?.labels?.font || {}), size: 10 }, padding: 8, boxWidth: 10 }
            },
            title: {
              ...baseOptions.plugins.title,
              display: false, 
            },
            subtitle: {
                ...baseOptions.plugins.subtitle,
                display: false, 
            },
          },
          scales: {
            x: {
              ...baseOptions.scales?.x,
              ticks: { ...(baseOptions.scales?.x?.ticks || {}), font: { ...(baseOptions.scales?.x?.ticks?.font || {}), size: 10 }, padding: 5 },
              title: { ...(baseOptions.scales?.x?.title || {}), font: { ...(baseOptions.scales?.x?.title?.font || {}), size: 10 }, padding: {top: 5}}
            },
            y: {
              ...baseOptions.scales?.y,
              ticks: { ...(baseOptions.scales?.y?.ticks || {}), font: { ...(baseOptions.scales?.y?.ticks?.font || {}), size: 10 }, padding: 5 },
              title: { ...(baseOptions.scales?.y?.title || {}), display: false} 
            }
          }
        };
      }, [chartConfig, brandConfig, chartType, cardChartData, showLogo, logoUrl, logoPlacement]);

      
      const hasData = React.useMemo(() => {
        if (!tableData?.rawData || tableData.rawData.length === 0 || !chartConfig.xAxis || !chartConfig.yAxes || chartConfig.yAxes.length === 0) {
          return false;
        }
        return tableData.rawData.every(item => 
          item.hasOwnProperty(chartConfig.xAxis) && chartConfig.yAxes.every(yAxisKey => item.hasOwnProperty(yAxisKey))
        );
      }, [tableData, chartConfig.xAxis, chartConfig.yAxes]);

      const logoContainerStyle = {
        position: 'absolute',
        zIndex: 5, // Lower z-index for card preview
        padding: '5px',
        display: 'flex',
        alignItems: 'center',
      };
      
      let logoImgStyle = {
        maxHeight: '20px', // Smaller for card preview
        maxWidth: '75px',  // Smaller for card preview
        objectFit: 'contain',
      };
    
      if (logoPlacement === 'top-left') { Object.assign(logoContainerStyle, { top: '5px', left: '5px', justifyContent: 'flex-start' }); }
      else if (logoPlacement === 'top-right') { Object.assign(logoContainerStyle, { top: '5px', right: '5px', justifyContent: 'flex-end' }); }
      // Center and bottom placements are not typically shown in small card previews to avoid clutter.
      // They will be visible in the full export.

      return (
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full bg-white">
          <CardHeader className="p-4 border-b">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-grow min-w-0">
                    <CardTitle className="text-base font-semibold flex items-center">
                    <ChartIcon className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
                    <span className="truncate" title={chartTitle}>{chartTitle}</span>
                    </CardTitle>
                    {description && <CardDescription className="text-xs text-slate-500 truncate mt-0.5" title={description}>{description}</CardDescription>}
                </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow p-2 sm:p-3 flex flex-col min-h-0">
            <div 
              className="relative bg-slate-50 rounded border border-slate-200 flex-grow flex flex-col" 
              style={{ 
                minHeight: '250px', 
                backgroundColor: backgroundColor,
                fontFamily: `"${font || 'Poppins'}", sans-serif`,
                fontWeight: fontWeight || 'normal',
              }}
            >
              {showLogo && logoUrl && (logoPlacement === 'top-left' || logoPlacement === 'top-right') && (
                  <div style={logoContainerStyle}>
                      <img src={logoUrl} alt="Brand Logo" style={logoImgStyle}/>
                  </div>
              )}
              {hasData ? (
                <>
                  <div style={{ flexGrow: 1, height: '100%', position: 'relative' }}>
                    <ChartComponent data={cardChartData} options={cardChartOptions} />
                  </div>
                  
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                  <ImageIconPlaceholder className="w-16 h-16 opacity-40 mb-2 text-slate-400" />
                  <p className="text-sm font-medium">No Data</p>
                  <p className="text-xs">Configure axes or check data.</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-3 border-t flex justify-end space-x-2 bg-slate-50/50">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit
            </Button>
            <Button variant="default" size="sm" onClick={onDownload} disabled={!hasData} className="bg-primary hover:bg-primary/90">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Download
            </Button>
          </CardFooter>
          
          <ChartExportElement
            ref={chartRef} 
            chartData={cardChartData}
            chartOptions={generateChartOptions(chartConfig, brandConfig, cardChartData)} 
            chartConfig={chartConfig}
            brandConfig={brandConfig}
            hasData={hasData}
            chartId={chartConfig.id} 
          />
        </Card>
      );
    };

    export default InfographicCard;