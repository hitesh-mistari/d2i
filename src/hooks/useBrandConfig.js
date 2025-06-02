import { useState, useEffect, useCallback } from 'react';
import { defaultBrandConfigValues, guestBrandConfigValues } from '@/config/siteBranding';
import { predefinedPalettes } from '@/config/colorPalettes';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth.jsx';
import { loadGoogleFont } from '@/lib/utils';

export const useBrandConfig = () => {
  const { user } = useAuth();
  const [activeSiteId, setActiveSiteId] = useState(null);
  
  const getInitialBrandConfig = useCallback(() => {
    let initialConf;
    if (user) {
      const storedConfig = localStorage.getItem(`brandConfig_user_${user.id}_global`);
      if (storedConfig) {
        try {
          const parsedConfig = JSON.parse(storedConfig);
          initialConf = { ...defaultBrandConfigValues, ...parsedConfig };
        } catch (e) {
          console.error("Failed to parse stored user global brand config:", e);
          initialConf = defaultBrandConfigValues;
        }
      } else {
        initialConf = defaultBrandConfigValues;
      }
    } else {
      initialConf = guestBrandConfigValues;
    }
    loadGoogleFont(initialConf.font);
    return initialConf;
  }, [user]);

  const [brandConfig, setBrandConfig] = useState(getInitialBrandConfig);

  useEffect(() => {
    const newInitialConfig = getInitialBrandConfig();
    setBrandConfig(newInitialConfig);
  }, [user, getInitialBrandConfig]);


  const loadBrandConfigForSite = useCallback(async (siteId) => {
    if (!user || !siteId) {
      setActiveSiteId(null);
      const initialGlobalConf = getInitialBrandConfig();
      setBrandConfig(initialGlobalConf);
      loadGoogleFont(initialGlobalConf.font);
      return;
    }
    
    setActiveSiteId(siteId);
    try {
      const { data: siteDetails, error: siteDetailsError } = await supabase
        .from('sites')
        .select('site_name')
        .eq('id', siteId)
        .eq('user_id', user.id)
        .single();

      if (siteDetailsError) throw siteDetailsError;
      if (!siteDetails) throw new Error("Site not found or access denied.");


      const { data: brandingData, error: brandingError } = await supabase
        .from('branding_settings')
        .select('*')
        .eq('site_id', siteId)
        .eq('user_id', user.id)
        .single();

      if (brandingError && brandingError.code !== 'PGRST116') throw brandingError;

      let loadedConfig;
      if (brandingData) {
        loadedConfig = {
          ...defaultBrandConfigValues,
          siteName: siteDetails.site_name,
          articleName: brandingData.article_name || siteDetails.site_name || defaultBrandConfigValues.articleName,
          primaryColor: brandingData.primary_color || defaultBrandConfigValues.primaryColor,
          footerColor: brandingData.footer_color || defaultBrandConfigValues.footerColor, 
          logoUrl: brandingData.logo_url || '',
          logoPlacement: brandingData.logo_placement || defaultBrandConfigValues.logoPlacement,
          showLogo: brandingData.show_logo !== undefined ? brandingData.show_logo : defaultBrandConfigValues.showLogo,
          showFooter: brandingData.show_footer !== undefined ? brandingData.show_footer : defaultBrandConfigValues.showFooter,
          footerText: brandingData.footer_text || `© {year} ${siteDetails.site_name}`,
          font: brandingData.font_family || defaultBrandConfigValues.font,
          fontWeight: brandingData.font_weight || defaultBrandConfigValues.fontWeight,
          backgroundColor: brandingData.background_color || defaultBrandConfigValues.backgroundColor,
          chartColorPalette: brandingData.chart_color_scheme_json || defaultBrandConfigValues.chartColorPalette,
          titlePlacement: brandingData.title_placement || defaultBrandConfigValues.titlePlacement,
          titleColor: brandingData.title_color || defaultBrandConfigValues.titleColor,
          titleAlignment: brandingData.title_alignment || defaultBrandConfigValues.titleAlignment,
          legendColor: brandingData.legend_color || defaultBrandConfigValues.legendColor,
          showGridLines: brandingData.show_grid_lines !== undefined ? brandingData.show_grid_lines : defaultBrandConfigValues.showGridLines,
          predictedNote: brandingData.predicted_note || '',
          articleNameManuallySet: !!brandingData.article_name,
          showChartBorder: brandingData.show_chart_border !== undefined ? brandingData.show_chart_border : defaultBrandConfigValues.showChartBorder,
          chartBorderColor: brandingData.chart_border_color || defaultBrandConfigValues.chartBorderColor,
          axisTickColor: brandingData.axis_tick_color || defaultBrandConfigValues.axisTickColor,
          axisLabelColor: brandingData.axis_label_color || defaultBrandConfigValues.axisLabelColor,
        };
      } else {
        loadedConfig = {
          ...defaultBrandConfigValues,
          siteName: siteDetails.site_name,
          articleName: siteDetails.site_name, 
          footerText: `© {year} ${siteDetails.site_name}`,
        };
      }
      setBrandConfig(loadedConfig);
      loadGoogleFont(loadedConfig.font);

    } catch (error) {
      console.error("Error loading brand config for site:", error);
      const initialGlobalConfOnError = getInitialBrandConfig();
      setBrandConfig(initialGlobalConfOnError); 
      loadGoogleFont(initialGlobalConfOnError.font);
    }
  }, [user, getInitialBrandConfig]);
  
  
  useEffect(() => {
    if (user && !activeSiteId) { 
      localStorage.setItem(`brandConfig_user_${user.id}_global`, JSON.stringify(brandConfig));
    }
    if (brandConfig.font) {
      loadGoogleFont(brandConfig.font);
    }
  }, [brandConfig, activeSiteId, user]);


  const handleGlobalBrandConfigChange = useCallback((newGlobalConfig) => {
    setBrandConfig(prevConfig => {
      const updatedConfig = { ...prevConfig, ...newGlobalConfig };
      if (updatedConfig.font) {
        loadGoogleFont(updatedConfig.font);
      }
      if (user && !activeSiteId) {
        localStorage.setItem(`brandConfig_user_${user.id}_global`, JSON.stringify(updatedConfig));
      }
      return updatedConfig;
    });
  }, [activeSiteId, user]);
  
  const setInitialArticleNameFromFileName = useCallback((fileName) => {
    setBrandConfig(prevConfig => {
      const newArticleName = fileName ? fileName.replace(/\.docx$/i, '') : prevConfig.articleName;
      if ((!prevConfig.articleNameManuallySet || prevConfig.articleName !== newArticleName) && newArticleName) {
        return { ...prevConfig, articleName: newArticleName, articleNameManuallySet: false };
      }
      return prevConfig;
    });
  }, []);

  const resetBrandConfig = () => { 
    const initialGlobalConf = getInitialBrandConfig();
    setBrandConfig(initialGlobalConf);
    setActiveSiteId(null);
    if (user) {
        localStorage.removeItem(`brandConfig_user_${user.id}_global`);
    }
    loadGoogleFont(initialGlobalConf.font);
  };

  return {
    brandConfig,
    handleGlobalBrandConfigChange,
    setInitialArticleNameFromFileName,
    resetBrandConfig,
    loadBrandConfigForSite,
    activeSiteId,
    setActiveSiteId,
    setBrandConfigDirectly: setBrandConfig 
  };
};
