import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';

import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter';
import AboutModal from '@/components/AboutModal';
import FeedbackModal from '@/components/FeedbackModal';
import LeftSidebar from '@/components/layout/LeftSidebar';
import InitialUploadView from '@/components/InitialUploadView';
import InfographicGridDisplay from '@/components/InfographicGridDisplay';
import InfographicEditDrawer from '@/components/InfographicEditDrawer';
import ZoomControl from '@/components/ZoomControl';
import AppActionsBar from '@/components/layout/AppActionsBar';

import AuthPage from '@/pages/AuthPage';
import DashboardPage from '@/pages/DashboardPage';
import PasswordResetPage from '@/pages/PasswordResetPage';
import UpdatePasswordPage from '@/pages/UpdatePasswordPage';
import SiteBrandingPage from '@/pages/SiteBrandingPage';


import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';

import { useChartData } from '@/hooks/useChartData';
import { useBrandConfig } from '@/hooks/useBrandConfig'; 
import { useAuth } from '@/hooks/useAuth.jsx';
import { downloadSingleChart, downloadChartsAsZip } from '@/lib/downloadUtils';
import { generateTitleFromText } from '@/lib/utils';
import { predefinedPalettes } from '@/config/colorPalettes';
import { supabase } from '@/lib/supabaseClient';
import { guestBrandConfigValues } from '@/config/siteBranding';


const MainAppLayout = () => {
  const { user } = useAuth();
  const { 
    brandConfig: initialBrandConfig, 
    handleGlobalBrandConfigChange, 
    setInitialArticleNameFromFileName,
    resetBrandConfig: originalResetBrandConfig,
    loadBrandConfigForSite,
    activeSiteId,
    setActiveSiteId,
  } = useBrandConfig();

  const brandConfig = user ? initialBrandConfig : guestBrandConfigValues;

  const resetBrandConfig = () => {
    originalResetBrandConfig();
    if (!user) {
      handleGlobalBrandConfigChange(guestBrandConfigValues);
    }
  };


  const {
    extractedTablesData,
    chartConfigs,
    selectedTableIndex, 
    setSelectedTableIndex,
    chartRefs,
    uploadedFileName,
    handleTablesExtracted: originalHandleTablesExtracted,
    handleChartConfigChange: originalHandleChartConfigChange,
    resetChartData,
    getAITitle,
  } = useChartData(setInitialArticleNameFromFileName);
  
  const [showInfo, setShowInfo] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [editingChartConfig, setEditingChartConfig] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const { toast } = useToast();
  const { session } = useAuth();


  const handleChartConfigChange = useCallback((newConfig) => {
    originalHandleChartConfigChange(newConfig);
    if (editingChartConfig && editingChartConfig.id === newConfig.id) {
      setEditingChartConfig(newConfig);
    }
  }, [originalHandleChartConfigChange, editingChartConfig]);
  
  const handleClearAll = () => {
    resetChartData();
    resetBrandConfig(); 
    setEditingChartConfig(null);
    setIsDrawerOpen(false);
    setZoomLevel(1);
    toast({
      title: "All Data Cleared",
      description: "DOCX data, chart configurations, and previews have been reset.",
    });
  };

  const handleEditChart = (chartId) => {
    const configToEdit = chartConfigs.find(c => c.id === chartId);
    if (configToEdit) {
      setEditingChartConfig(configToEdit);
      setIsDrawerOpen(true);
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingChartConfig(null);
  };

  const handleDownloadAllChartsAsZip = () => {
    downloadChartsAsZip(chartConfigs, chartRefs, extractedTablesData, brandConfig, uploadedFileName, toast);
  };

  const handleRegenerateCharts = async () => {
    if (extractedTablesData.length > 0) {
        toast({
          title: "Regenerating Charts...",
          description: "Fetching AI titles and rebuilding chart configurations.",
        });

        const newChartConfigsPromises = extractedTablesData.map(async (tableData, index) => {
          const aiTitle = await getAITitle(tableData);
          const autoTitle = aiTitle || generateTitleFromText(tableData.precedingText || `Chart for ${tableData.name}`);
          const yAxisDefaultLabel = tableData.headers.length > 1 ? tableData.headers[1] : ( (tableData.headers.length > 0 && tableData.headers[0] !== (tableData.headers[0] || '')) ? tableData.headers[0] : 'Values');
          
          const paletteForChart = brandConfig.chartColorPalette?.type === 'custom' 
            ? brandConfig.chartColorPalette.colors 
            : predefinedPalettes[brandConfig.chartColorPalette?.key || 'default'];

          return {
              id: `chart-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
              tableId: tableData.id,
              xAxis: tableData.headers[0] || '',
              yAxes: tableData.headers.length > 1 ? [tableData.headers[1]] : (tableData.headers.length > 0 ? [tableData.headers[0]] : []),
              yAxisLabel: yAxisDefaultLabel,
              chartTitle: autoTitle,
              description: `Data visualization for ${tableData.name}.`,
              chartType: 'bar',
              showLegend: true,
              colorPalette: paletteForChart.slice(0, (tableData.headers.length > 1 ? tableData.headers.length -1 : 0)),
              tableIndex: index,
          };
        });
        
        const newChartConfigs = await Promise.all(newChartConfigsPromises);
        
        originalHandleChartConfigChange(newChartConfigs);

        if (chartConfigs.length > 0 && chartRefs.current.length !== newChartConfigs.length) {
             chartRefs.current = newChartConfigs.map(() => React.createRef());
        }

        toast({
        title: "Charts Regenerated",
        description: "All chart configurations have been reset with potentially new AI-generated titles.",
        });
    } else {
        toast({
        variant: "destructive",
        title: "No Data",
        description: "Upload a DOCX file first to regenerate charts.",
        });
    }
  };

  const exportAllTablesData = (format) => {
    if (extractedTablesData.length === 0) {
      toast({ variant: "destructive", title: "No Data", description: "Upload a DOCX file to export data." });
      return;
    }

    let dataToExport;
    let fileName;
    let mimeType;

    const allTablesDataForExport = extractedTablesData.map(table => ({
      title: table.name,
      headers: table.headers,
      data: table.rawData
    }));

    if (format === 'json') {
      dataToExport = JSON.stringify(allTablesDataForExport, null, 2);
      fileName = `${uploadedFileName.replace(/\.docx$/i, '') || 'tables_export'}.json`;
      mimeType = 'application/json';
    } else if (format === 'csv') {
      let csvString = '';
      allTablesDataForExport.forEach(table => {
        csvString += `"${table.title}"\n`; 
        const csvTableData = table.data.map(row => table.headers.map(h => row[h]));
        csvString += Papa.unparse([table.headers, ...csvTableData]);
        csvString += '\n\n'; 
      });
      dataToExport = csvString;
      fileName = `${uploadedFileName.replace(/\.docx$/i, '') || 'tables_export'}.csv`;
      mimeType = 'text/csv';
    } else {
      return; 
    }

    const blob = new Blob([dataToExport], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName; // This ensures direct download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast({ title: `Data Exported as ${format.toUpperCase()}`, description: `File: ${fileName}` });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-200 text-slate-800 flex flex-col items-center selection:bg-primary/30 selection:text-primary-foreground">
      <AppHeader 
        onClearAll={handleClearAll}
        showClearAll={extractedTablesData.length > 0}
        currentFileName={uploadedFileName}
        chartCount={chartConfigs.length}
        session={session}
      >
        {extractedTablesData.length > 0 && (
          <ZoomControl currentZoom={zoomLevel} onZoomChange={setZoomLevel} />
        )}
      </AppHeader>
      
      {extractedTablesData.length === 0 ? (
        <InitialUploadView onTablesExtracted={originalHandleTablesExtracted} />
      ) : (
        <main className="w-full max-w-screen-2xl flex-grow flex p-4 sm:p-6 gap-6 overflow-hidden">
          <LeftSidebar
            extractedTablesData={extractedTablesData}
            selectedTableIndex={selectedTableIndex} 
            onSelectTable={setSelectedTableIndex} 
            brandConfig={brandConfig}
            onBrandConfigChange={handleGlobalBrandConfigChange}
            onTablesExtracted={originalHandleTablesExtracted} 
            uploadedFileName={uploadedFileName}
            chartConfigs={chartConfigs} 
            activeSiteId={activeSiteId}
            onSiteSelected={(siteId) => {
              setActiveSiteId(siteId);
              if (user) loadBrandConfigForSite(siteId); 
            }}
          />
          
          <InfographicGridDisplay
            chartConfigs={chartConfigs}
            extractedTablesData={extractedTablesData}
            brandConfig={brandConfig}
            chartRefs={chartRefs}
            onEditChart={handleEditChart}
            onDownloadChart={downloadSingleChart} 
            toast={toast}
            zoomLevel={zoomLevel}
          />
        </main>
      )}
      
      {extractedTablesData.length > 0 && chartConfigs.length > 0 && (
         <AppActionsBar
            onRegenerateCharts={handleRegenerateCharts}
            onDownloadAllChartsAsZip={handleDownloadAllChartsAsZip}
            onExportData={exportAllTablesData}
         />
      )}

      <AppFooter 
        onToggleInfo={() => setShowInfo(prev => !prev)} 
        onToggleFeedback={() => setShowFeedbackModal(prev => !prev)}
      />

      <AnimatePresence>
        {showInfo && <AboutModal onClose={() => setShowInfo(false)} />}
      </AnimatePresence>
      
      <AnimatePresence>
        {showFeedbackModal && <FeedbackModal onClose={() => setShowFeedbackModal(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isDrawerOpen && editingChartConfig && (
          <InfographicEditDrawer
            isOpen={isDrawerOpen}
            onClose={handleCloseDrawer}
            config={editingChartConfig}
            onConfigChange={handleChartConfigChange}
            tableHeaders={extractedTablesData.find(t => t.id === editingChartConfig.tableId)?.headers || []}
            brandConfig={brandConfig}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const ProtectedRoute = ({ children }) => {
  const { session, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen"><p>Loading application state...</p></div>;
  return session ? children : <Navigate to="/auth" replace />;
};

const App = () => {
  const { session, loading, setSession } = useAuth();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
      }
    );
    return () => {
      subscription?.unsubscribe();
    };
  }, [setSession]);


  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl font-semibold text-primary">Loading Application...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={session ? <Navigate to="/dashboard" /> : <AuthPage />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
        
        <Route path="/" element={<MainAppLayout />} /> 
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
         <Route 
          path="/dashboard/site/:siteId/branding" 
          element={
            <ProtectedRoute>
              <SiteBrandingPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to={"/"} />} />
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;