import { useState, useCallback, useRef } from 'react';
    import { generateTitleFromText } from '@/lib/utils';
    import { predefinedPalettes } from '@/config/colorPalettes';
    import React from 'react';
    import { supabase } from '@/lib/supabaseClient';

    export const useChartData = (initialBrandConfigSetter) => {
      const [extractedTablesData, setExtractedTablesData] = useState([]);
      const [chartConfigs, setChartConfigs] = useState([]);
      const [selectedTableIndex, setSelectedTableIndex] = useState(0);
      const chartRefs = useRef([]);
      const [uploadedFileName, setUploadedFileName] = useState('');

      const getAITitle = async (tableData) => {
        try {
          const { data, error } = await supabase.functions.invoke('generate-chart-title', {
            body: { tableData: {
              headers: tableData.headers,
              rawData: tableData.rawData.slice(0,3), 
              precedingText: tableData.precedingText,
              name: tableData.name
            } },
          });

          if (error) {
            console.error('Supabase function error:', error.message);
            return null;
          }
          return data?.title || null;
        } catch (e) {
          console.error('Error invoking Supabase function:', e.message);
          return null;
        }
      };

      const handleTablesExtracted = useCallback(async (tablesWithContext, fileName) => {
        setUploadedFileName(fileName || '');
        
        const newExtractedTablesData = tablesWithContext.map((tc, index) => ({
          id: `table-${Date.now()}-${index}`,
          name: generateTitleFromText(tc.precedingText || `Table ${index + 1}`),
          columns: tc.table.headers.length,
          rows: tc.table.data.length,
          headers: tc.table.headers,
          rawData: tc.table.data, 
          precedingText: tc.precedingText,
        }));
        setExtractedTablesData(newExtractedTablesData);
        
        const newChartRefs = newExtractedTablesData.map(() => React.createRef());
        chartRefs.current = newChartRefs;
        
        const initialConfigsPromises = newExtractedTablesData.map(async (tableData, index) => {
          const aiTitle = await getAITitle(tableData);
          const autoTitle = aiTitle || generateTitleFromText(tableData.precedingText || `Chart for ${tableData.name}`);
          const yAxisDefaultLabel = tableData.headers.length > 1 ? tableData.headers[1] : ( (tableData.headers.length > 0 && tableData.headers[0] !== (tableData.headers[0] || '')) ? tableData.headers[0] : 'Values');
          
          return {
            id: `chart-${Date.now()}-${index}`,
            tableId: tableData.id,
            xAxis: tableData.headers[0] || '',
            yAxes: tableData.headers.length > 1 ? [tableData.headers[1]] : (tableData.headers.length > 0 ? [tableData.headers[0]] : []),
            yAxisLabel: yAxisDefaultLabel, 
            chartTitle: autoTitle,
            description: `Data visualization for ${tableData.name}.`,
            chartType: 'bar',
            showLegend: true,
            colorPalette: predefinedPalettes.default.slice(0, (tableData.headers.length > 1 ? 1 : 0)),
            tableIndex: index, 
          };
        });

        const initialConfigs = await Promise.all(initialConfigsPromises);
        setChartConfigs(initialConfigs);
        setSelectedTableIndex(0);
        
        if (initialBrandConfigSetter) {
            initialBrandConfigSetter(fileName);
        }

      }, [initialBrandConfigSetter]);

      const handleChartConfigChange = useCallback((newConfigOrUpdater) => {
        if (typeof newConfigOrUpdater === 'function') {
            setChartConfigs(prevConfigs => newConfigOrUpdater(prevConfigs));
        } else {
            setChartConfigs(prevConfigs => prevConfigs.map(cfg => cfg.id === newConfigOrUpdater.id ? newConfigOrUpdater : cfg));
        }
      }, []);


      const resetChartData = () => {
        setExtractedTablesData([]);
        setChartConfigs([]);
        chartRefs.current = [];
        setUploadedFileName('');
        setSelectedTableIndex(0);
        const fileInput = document.getElementById('docx-upload-main');
        if (fileInput) {
            fileInput.value = ""; 
        }
      };

      return {
        extractedTablesData,
        chartConfigs,
        selectedTableIndex,
        setSelectedTableIndex,
        chartRefs,
        uploadedFileName,
        handleTablesExtracted,
        handleChartConfigChange,
        resetChartData,
        getAITitle, 
      };
    };