import JSZip from 'jszip';

    export const downloadSingleChart = async (chartComponentRef, config, toast) => {
      if (!chartComponentRef || typeof chartComponentRef.getChartCanvas !== 'function') {
        toast({ variant: 'destructive', title: 'Cannot Download Chart', description: 'Chart component reference or getChartCanvas method is not available. Please ensure the chart is fully rendered.' });
        console.error("downloadSingleChart: chartComponentRef or getChartCanvas is invalid", chartComponentRef);
        return;
      }
      if (!config || !config.chartTitle) {
         toast({ variant: 'destructive', title: 'Cannot Download Chart', description: 'Chart configuration or title is missing.' });
        return;
      }
      
      toast({ title: 'Preparing Download...', description: `Generating image for "${config.chartTitle}".` });
      try {
        const canvas = await chartComponentRef.getChartCanvas();
        if (canvas) {
          const imgData = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          const fileNameBase = (config.chartTitle).replace(/[^a-z0-9_]/gi, '-').toLowerCase() || 'infographic';
          link.download = `${fileNameBase}.png`;
          link.href = imgData;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
          toast({ title: 'Chart Downloaded!', description: `"${config.chartTitle}" saved as ${fileNameBase}.png.` });
        } else {
          toast({ variant: 'destructive', title: 'Image Error', description: `Could not generate canvas for "${config.chartTitle}". Ensure chart has data and is configured.` });
        }
      } catch (error) {
        console.error(`Error generating image for chart "${config.chartTitle}":`, error);
        toast({ variant: 'destructive', title: `Image Error: ${config.chartTitle}`, description: error.message || 'An unknown error occurred while generating the image.' });
      }
    };

    export const downloadChartsAsZip = async (chartConfigs, chartRefs, extractedTablesData, brandConfig, uploadedFileName, toast) => {
      if (!chartConfigs || chartConfigs.length === 0 || !extractedTablesData || extractedTablesData.length === 0) {
        toast({ variant: 'destructive', title: 'No Charts to Download', description: 'Please upload a DOCX file and generate charts first.' });
        return;
      }
    
      toast({ title: 'Preparing ZIP...', description: 'Generating images for all charts. This may take a moment.' });
      const zip = new JSZip();
      let imagesGeneratedCount = 0;
      
      for (let i = 0; i < chartConfigs.length; i++) {
        const chartConfig = chartConfigs[i];
        const chartComponentRef = chartRefs.current[i]?.current;
        const tableData = extractedTablesData.find(td => td.id === chartConfig.tableId);

        if (!tableData || !tableData.rawData || tableData.rawData.length === 0) {
          console.warn(`Skipping chart "${chartConfig.chartTitle}" (ID: ${chartConfig.id}) due to missing rawData.`);
          continue; 
        }

        if (chartComponentRef && typeof chartComponentRef.getChartCanvas === 'function') {
          try {
            const canvas = await chartComponentRef.getChartCanvas();
            if (canvas) {
              const imgData = canvas.toDataURL('image/png');
              const chartTitle = chartConfig.chartTitle || `chart_${i+1}`;
              const fileName = chartTitle.replace(/[^a-z0-9_]/gi, '-').toLowerCase() + '.png';
              zip.file(fileName, imgData.substr(imgData.indexOf(',') + 1), { base64: true });
              imagesGeneratedCount++;
            } else {
               console.warn(`Image Generation Skipped for chart "${chartConfig.chartTitle}" (ID: ${chartConfig.id}). Canvas was null.`);
               toast({ variant: 'warning', title: `Image Generation Skipped (Chart: ${chartConfig.chartTitle || i+1})`, description: `Could not generate canvas. Check if chart has data and is visible.` });
            }
          } catch (error) {
            console.error(`Error generating image for chart ${chartConfig.chartTitle || i + 1} (ID: ${chartConfig.id}):`, error);
            toast({ variant: 'destructive', title: `Image Error (Chart: ${chartConfig.chartTitle || i+1})`, description: error.message });
          }
        } else if (tableData.rawData.length > 0) {
           console.warn(`Export Skipped for chart "${chartConfig.chartTitle}" (ID: ${chartConfig.id}). Chart component ref or getChartCanvas method not available. Ref:`, chartComponentRef);
           toast({ variant: 'warning', title: `Export Skipped (Chart: ${chartConfig.chartTitle || i+1})`, description: `Chart component not ready. Try re-selecting axes or ensure it's rendered.` });
        }
      }
    
      if (imagesGeneratedCount > 0) {
          const zipFileNameBase = brandConfig.articleName || uploadedFileName.replace(/\.docx$/i, '') || brandConfig.siteName || 'charts_export';
          const finalZipName = `${zipFileNameBase.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip`;
          zip.generateAsync({ type: 'blob' }).then(function (content) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(content);
          link.download = finalZipName; // Direct download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
          toast({ title: 'ZIP Downloaded', description: `${imagesGeneratedCount} chart(s) have been downloaded as ${finalZipName}.` });
          }).catch(err => {
              toast({ variant: "destructive", title: "ZIP Generation Error", description: err.message });
          });
      } else {
          toast({ variant: 'destructive', title: 'No images generated', description: 'Could not generate any images for the ZIP file. Ensure charts have data and are configured correctly.' });
      }
    };