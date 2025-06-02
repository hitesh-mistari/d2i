import React, { useImperativeHandle, useEffect, useState, useRef } from 'react';
    import { Bar, Line, Pie } from 'react-chartjs-2';
    import ChartExportFooter from './ChartExportFooter';
    import html2canvas from 'html2canvas';
    import { getFullFooterText } from '@/config/siteBranding';
    import { loadGoogleFont } from '@/lib/utils';

    const ChartExportElement = React.forwardRef(({ chartData, chartOptions, chartConfig, brandConfig, hasData, chartId }, ref) => {
      const { chartType = 'bar', description, chartTitle } = chartConfig;
      const { 
        articleName, 
        logoUrl, 
        footerColor, 
        font, 
        fontWeight,
        footerText: footerTextTemplate,
        backgroundColor,
        showLogo,
        showFooter,
        logoPlacement,
        titlePlacement, 
        titleColor,
        titleAlignment, 
        legendColor,
        showGridLines,
        showChartBorder,
        chartBorderColor,
        axisTickColor,
        axisLabelColor,
       } = brandConfig;
      const exportContainerRef = useRef(null);
      const logoImgRef = useRef(null); 
      const [isLogoLoaded, setIsLogoLoaded] = useState(!logoUrl || !showLogo); 
      const [isFontLoaded, setIsFontLoaded] = useState(false);


      useEffect(() => {
        if (font) {
          loadGoogleFont(font);
          const timer = setTimeout(() => setIsFontLoaded(true), 1500); 
          return () => clearTimeout(timer);
        } else {
          setIsFontLoaded(true); 
        }
      }, [font]);


      useEffect(() => {
        if (logoUrl && showLogo) {
          setIsLogoLoaded(false); 
          const img = new Image();
          img.crossOrigin = "anonymous"; 
          img.src = logoUrl;
          img.onload = () => {
            if (logoImgRef.current) {
                logoImgRef.current.width = img.width;
                logoImgRef.current.height = img.height;
            }
            setIsLogoLoaded(true);
          };
          img.onerror = () => {
            console.warn(`ChartExportElement (${chartId}): Failed to load logo image from ${logoUrl}. Export will proceed without logo.`);
            setIsLogoLoaded(true); 
          }
        } else {
          setIsLogoLoaded(true); 
        }
      }, [logoUrl, showLogo, chartId]);


      const ChartComponent = chartType === 'line' ? Line : chartType === 'pie' ? Pie : Bar;
      
      const exportFontFamily = `"${font || 'Poppins'}", sans-serif`;
      const BORDER_WIDTH = '2px';

      const getTitleActualAlignment = () => {
        switch (titleAlignment) {
          case 'center': return 'center';
          case 'right': return 'end';
          case 'left':
          default: return 'start';
        }
      };

      const exportOptions = {
        ...chartOptions,
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          ...chartOptions.plugins,
          legend: {
            ...chartOptions.plugins.legend,
            labels: {
                ...chartOptions.plugins.legend.labels,
                font: { family: exportFontFamily, weight: fontWeight, size: 13 },
                color: legendColor || '#333333',
            }
          },
          title: {
            ...chartOptions.plugins.title,
            display: !!chartTitle && titlePlacement !== 'none',
            text: chartTitle,
            color: titleColor || '#333333',
            align: getTitleActualAlignment(),
            position: titlePlacement === 'bottom' ? 'bottom' : 'top',
            font: {
                ...(chartOptions.plugins?.title?.font || {}),
                family: exportFontFamily,
                weight: 'bold', 
            },
            padding: { 
              top: titlePlacement === 'top' || titlePlacement === 'center' ? 25 : 5, 
              bottom: titlePlacement === 'bottom' ? 25 : (description && titlePlacement !== 'bottom' ? 5 : 25)
            }
          },
          subtitle: {
            ...chartOptions.plugins.subtitle,
            display: !!description && titlePlacement !== 'none',
            text: description,
            color: titleColor ? titleColor.replace(')', ', 0.8)').replace('rgb', 'rgba') : '#555555',
            align: getTitleActualAlignment(),
            position: titlePlacement === 'bottom' ? 'bottom' : 'top', 
            font: {
                ...(chartOptions.plugins?.subtitle?.font || {}),
                family: exportFontFamily,
                weight: fontWeight,
            },
            padding: { 
              top: titlePlacement === 'bottom' ? 0 : 0,
              bottom: titlePlacement === 'bottom' ? 5 : 25
            }
          }
        },
        scales: {
            x: {
                ...(chartOptions.scales?.x || {}),
                grid: { ...(chartOptions.scales?.x?.grid || {}), display: showGridLines },
                ticks: { ...(chartOptions.scales?.x?.ticks || {}), color: axisTickColor || '#666666', font: { ...(chartOptions.scales?.x?.ticks?.font || {}), family: exportFontFamily, weight: fontWeight } },
                title: { ...(chartOptions.scales?.x?.title || {}), color: axisLabelColor || '#555555', font: { ...(chartOptions.scales?.x?.title?.font || {}), family: exportFontFamily, weight: fontWeight } }
            },
            y: {
                ...(chartOptions.scales?.y || {}),
                grid: { ...(chartOptions.scales?.y?.grid || {}), display: showGridLines },
                ticks: { ...(chartOptions.scales?.y?.ticks || {}), color: axisTickColor || '#666666', font: { ...(chartOptions.scales?.y?.ticks?.font || {}), family: exportFontFamily, weight: 'bold' } }, 
                title: { ...(chartOptions.scales?.y?.title || {}), color: axisLabelColor || '#555555', font: { ...(chartOptions.scales?.y?.title?.font || {}), family: exportFontFamily, weight: fontWeight } }
            }
        }

      };
      
      useImperativeHandle(ref, () => ({
        getChartCanvas: async () => {
          if (!exportContainerRef.current) {
            console.error(`ChartExportElement (${chartId}): Export container ref is not available.`);
            return null;
          }
          if (!hasData) {
            console.warn(`ChartExportElement (${chartId}): No data available for chart. Export might be empty or partial.`);
          }
          
          // Small delay to ensure DOM updates and image rendering
          await new Promise(resolve => setTimeout(resolve, 250));

          if (!isLogoLoaded && logoUrl && showLogo) {
            console.warn(`ChartExportElement (${chartId}): Logo is still not marked as loaded. Export will proceed, but logo might be missing.`);
          }
          if (!isFontLoaded) {
            console.warn(`ChartExportElement (${chartId}): Font is not marked as loaded yet. Export will use fallback font.`);
          }
          
          const elementToCapture = exportContainerRef.current;
          
          try {
            const canvas = await html2canvas(elementToCapture, {
              width: 1536,
              height: 804,
              scale: 2, 
              backgroundColor: backgroundColor || '#ffffff',
              useCORS: true,
              logging: false, 
              imageTimeout: 20000, 
              removeContainer: false,
            });
            return canvas;
          } catch (error) {
            console.error(`ChartExportElement (${chartId}): html2canvas error:`, error);
            return null;
          }
        }
      }));

      const logoContainerStyle = {
        position: 'absolute',
        zIndex: 10,
        padding: '20px', 
        display: 'flex',
      };
      
      let logoImgStyle = {
        maxHeight: '60px',
        maxWidth: '200px',
        objectFit: 'contain',
      };
    
      if (logoPlacement === 'top-left') { Object.assign(logoContainerStyle, { top: 0, left: 0, alignItems: 'flex-start', justifyContent: 'flex-start' }); }
      else if (logoPlacement === 'top-right') { Object.assign(logoContainerStyle, { top: 0, right: 0, alignItems: 'flex-start', justifyContent: 'flex-end' }); }
      else if (logoPlacement === 'bottom-left' && !showFooter) { Object.assign(logoContainerStyle, { bottom: 0, left: 0, alignItems: 'flex-end', justifyContent: 'flex-start' }); }
      else if (logoPlacement === 'bottom-right' && !showFooter) { Object.assign(logoContainerStyle, { bottom: 0, right: 0, alignItems: 'flex-end', justifyContent: 'flex-end' }); }
      else if (logoPlacement === 'center') { 
          Object.assign(logoContainerStyle, { 
              top: '50%', left: '50%', 
              transform: 'translate(-50%, -50%)',
              opacity: 0.15, 
              pointerEvents: 'none',
              alignItems: 'center',
              justifyContent: 'center',
          }); 
          logoImgStyle = { maxHeight: '120px', maxWidth: '400px', objectFit: 'contain' };
      }
      
      const shouldRenderLogoInMainArea = showLogo && logoUrl && 
                                      !((logoPlacement === 'bottom-left' || logoPlacement === 'bottom-right') && showFooter);

      const mainContentPaddingBottom = showFooter ? '5px' : '20px';

      return (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}>
          <div 
            ref={exportContainerRef}
            id={`export-container-${chartId}`}
            className="chart-export-bordered-container"
            style={{ 
              width: 1536, 
              height: 804, 
              backgroundColor: backgroundColor || '#ffffff', 
              fontFamily: exportFontFamily, 
              fontWeight: fontWeight || 'normal',
              display: 'flex', 
              flexDirection: 'column',
              border: showChartBorder ? `${BORDER_WIDTH} solid ${chartBorderColor || '#cccccc'}` : 'none',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {shouldRenderLogoInMainArea && (
                <div style={logoContainerStyle}>
                    <img ref={logoImgRef} src={logoUrl} alt="Export Logo" style={logoImgStyle} crossOrigin="anonymous"/>
                </div>
            )}
            {hasData && (
              <>
                <div style={{ flexGrow: 1, padding: `40px 40px ${mainContentPaddingBottom} 40px`, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <div style={{ flexGrow: 1, position: 'relative' }}>
                    <ChartComponent data={chartData} options={exportOptions} />
                  </div>
                </div>
                {showFooter && (
                  <ChartExportFooter 
                      articleName={articleName} 
                      logoUrl={logoUrl} 
                      showLogo={showLogo}
                      logoPlacement={logoPlacement}
                      secondaryColor={footerColor} 
                      font={font || "Poppins"}
                      footerTextTemplate={footerTextTemplate}
                  />
                )}
                {brandConfig.predictedNote && chartData.labels && chartData.labels.some(label => String(label).includes('*')) && (
                  <div style={{
                      position: 'absolute',
                      bottom: `calc(${(showFooter ? '60px' : '0px')} + 15px + ${showChartBorder ? BORDER_WIDTH : '0px'})`, 
                      left: `calc(40px + ${showChartBorder ? BORDER_WIDTH : '0px'})`,
                      fontSize: '16px',
                      fontStyle: 'italic',
                      color: '#555555',
                      fontFamily: exportFontFamily,
                      fontWeight: fontWeight || 'normal',
                  }}>
                      {brandConfig.predictedNote}
                  </div>
                )}
              </>
            )}
            {!hasData && (
                <div style={{flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#777'}}>
                    Chart data not available for export.
                </div>
            )}
          </div>
        </div>
      );
    });
    ChartExportElement.displayName = 'ChartExportElement';
    export default ChartExportElement;
