import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.jsx';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Save, Settings } from 'lucide-react';
import { defaultBrandConfigValues, getFullFooterText } from '@/config/siteBranding'; 
import BrandingForm from '@/pages/SiteBrandingPage/components/BrandingForm';
import BrandingPreview from '@/pages/SiteBrandingPage/components/BrandingPreview';
import { predefinedPalettes } from '@/config/colorPalettes';
import { loadGoogleFont } from '@/lib/utils';
import { useBrandConfig } from '@/hooks/useBrandConfig';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const SiteBrandingPage = () => {
  const { siteId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { brandConfig: globalBrandConfig, setBrandConfigDirectly, loadBrandConfigForSite: loadGlobalBrandConfig } = useBrandConfig();

  const [siteName, setSiteName] = useState('');
  const [branding, setBranding] = useState({
    ...defaultBrandConfigValues,
    article_name: '', 
    logo_url: '',
    chart_color_scheme_json: defaultBrandConfigValues.chartColorPalette,
  });
  const [customColors, setCustomColors] = useState(defaultBrandConfigValues.chartColorPalette.colors || ['#3B82F6', '#10B981', '#F59E0B']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [nextNavigationLocation, setNextNavigationLocation] = useState(null);

  const debounceTimeoutRef = useRef(null);

  const fetchSiteAndBranding = useCallback(async () => {
    if (!user || !siteId) return;
    setLoading(true);
    try {
      const { data: siteData, error: siteError } = await supabase
        .from('sites')
        .select('site_name')
        .eq('id', siteId)
        .eq('user_id', user.id)
        .single();

      if (siteError || !siteData) throw siteError || new Error('Site not found or access denied.');
      setSiteName(siteData.site_name);
      
      let initialBrandingState = {
        ...defaultBrandConfigValues,
        siteName: siteData.site_name, 
        article_name: siteData.site_name,
        footer_text: getFullFooterText(defaultBrandConfigValues.footerText, siteData.site_name),
      };
      loadGoogleFont(initialBrandingState.font_family || initialBrandingState.font);

      const { data: brandingData, error: brandingError } = await supabase
        .from('branding_settings')
        .select('*')
        .eq('site_id', siteId)
        .eq('user_id', user.id)
        .single();

      if (brandingError && brandingError.code !== 'PGRST116') { 
        throw brandingError;
      }
      
      if (brandingData) {
        initialBrandingState = {
            ...initialBrandingState,
            article_name: brandingData.article_name || siteData.site_name,
            logo_url: brandingData.logo_url || '',
            logo_placement: brandingData.logo_placement || defaultBrandConfigValues.logoPlacement,
            show_logo: brandingData.show_logo !== undefined ? brandingData.show_logo : defaultBrandConfigValues.showLogo,
            show_footer: brandingData.show_footer !== undefined ? brandingData.show_footer : defaultBrandConfigValues.showFooter,
            footer_text: brandingData.footer_text || getFullFooterText(defaultBrandConfigValues.footerText, siteData.site_name),
            font_family: brandingData.font_family || defaultBrandConfigValues.font,
            font_weight: brandingData.font_weight || defaultBrandConfigValues.fontWeight,
            background_color: brandingData.background_color || defaultBrandConfigValues.backgroundColor,
            footer_color: brandingData.footer_color || defaultBrandConfigValues.footerColor,
            chart_color_scheme_json: brandingData.chart_color_scheme_json || defaultBrandConfigValues.chartColorPalette,
            title_placement: brandingData.title_placement || defaultBrandConfigValues.titlePlacement,
            title_color: brandingData.title_color || defaultBrandConfigValues.titleColor,
            title_alignment: brandingData.title_alignment || defaultBrandConfigValues.titleAlignment,
            legend_color: brandingData.legend_color || defaultBrandConfigValues.legendColor,
            show_grid_lines: brandingData.show_grid_lines !== undefined ? brandingData.show_grid_lines : defaultBrandConfigValues.showGridLines,
            predicted_note: brandingData.predicted_note || '',
            show_chart_border: brandingData.show_chart_border !== undefined ? brandingData.show_chart_border : defaultBrandConfigValues.showChartBorder,
            chart_border_color: brandingData.chart_border_color || defaultBrandConfigValues.chartBorderColor,
            axis_tick_color: brandingData.axis_tick_color || defaultBrandConfigValues.axisTickColor,
            axis_label_color: brandingData.axis_label_color || defaultBrandConfigValues.axisLabelColor,
        };
        if (brandingData.chart_color_scheme_json?.type === 'custom' && Array.isArray(brandingData.chart_color_scheme_json.colors)) {
          setCustomColors(brandingData.chart_color_scheme_json.colors);
        }
        loadGoogleFont(initialBrandingState.font_family || initialBrandingState.font);
      }
      setBranding(initialBrandingState);
      setHasUnsavedChanges(false); 
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error loading data', description: error.message });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [user, siteId, toast, navigate]);

  useEffect(() => {
    fetchSiteAndBranding();
  }, [fetchSiteAndBranding]);

  const handleSaveChanges = useCallback(async (showToast = true) => {
    setSaving(true);
    try {
      const upsertData = {
        site_id: siteId,
        user_id: user.id,
        article_name: branding.article_name,
        logo_url: branding.logo_url,
        logo_placement: branding.logo_placement,
        show_logo: branding.show_logo,
        show_footer: branding.show_footer,
        footer_text: branding.footer_text,
        font_family: branding.font_family || branding.font,
        font_weight: branding.font_weight,
        background_color: branding.background_color,
        footer_color: branding.footer_color,
        chart_color_scheme_json: branding.chart_color_scheme_json 
          ? { 
              type: branding.chart_color_scheme_json.type, 
              ...(branding.chart_color_scheme_json.type === 'predefined' 
                ? { key: branding.chart_color_scheme_json.key } 
                : { colors: branding.chart_color_scheme_json.colors }
              )
            } 
          : defaultBrandConfigValues.chartColorPalette,
        title_placement: branding.title_placement,
        title_color: branding.title_color,
        title_alignment: branding.title_alignment,
        legend_color: branding.legend_color,
        show_grid_lines: branding.show_grid_lines,
        predicted_note: branding.predicted_note,
        show_chart_border: branding.show_chart_border,
        chart_border_color: branding.chart_border_color,
        axis_tick_color: branding.axis_tick_color,
        axis_label_color: branding.axis_label_color,
      };

      const { error } = await supabase
        .from('branding_settings')
        .upsert(upsertData , { onConflict: 'site_id, user_id' })
        .select(); 

      if (error) throw error;
      
      if (globalBrandConfig.siteName === siteName || siteId === globalBrandConfig.activeSiteId) {
         const updatedGlobalConfig = {
            ...globalBrandConfig, ...upsertData, font: upsertData.font_family, siteName: siteName,
        };
        setBrandConfigDirectly(updatedGlobalConfig);
        loadGlobalBrandConfig(siteId); 
      }
      
      setHasUnsavedChanges(false);
      if (showToast) {
        toast({ title: 'Branding Saved', description: 'Your branding settings have been updated.' });
      }
    } catch (error) {
      console.error("Error saving:", error);
      if (showToast) {
        toast({ variant: 'destructive', title: 'Error Saving Branding', description: error.message });
      }
    } finally {
      setSaving(false);
    }
  }, [siteId, user, branding, globalBrandConfig, siteName, toast, setBrandConfigDirectly, loadGlobalBrandConfig]);


  const debouncedSave = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      handleSaveChanges(false); // Auto-save, no toast
    }, 2000); // 2-second debounce
  }, [handleSaveChanges]);

  const handleInputChange = (field, value) => {
    setBranding(prev => {
      const newBranding = { ...prev, [field]: value };
      if (field === 'font_family' || field === 'font') {
        loadGoogleFont(value);
      }
      return newBranding;
    });
    setHasUnsavedChanges(true);
    debouncedSave();
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = ''; 
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges]);

  const handleColorPaletteTypeChange = (type) => {
    if (type === 'predefined') {
      handleInputChange('chart_color_scheme_json', { type: 'predefined', key: 'default', colors: defaultBrandConfigValues.chartColorPalette.colors });
    } else {
      handleInputChange('chart_color_scheme_json', { type: 'custom', colors: customColors });
    }
  };
  
  const handlePredefinedPaletteKeyChange = (key) => {
    handleInputChange('chart_color_scheme_json', { type: 'predefined', key, colors: predefinedPalettes[key] || defaultBrandConfigValues.chartColorPalette.colors });
  };

  const handleCustomColorChange = (index, color) => {
    const newColors = [...customColors];
    newColors[index] = color;
    setCustomColors(newColors);
    handleInputChange('chart_color_scheme_json', { type: 'custom', colors: newColors });
  };

  const addCustomColor = () => {
    if (customColors.length < 6) {
      const newColors = [...customColors, '#000000'];
      setCustomColors(newColors);
      handleInputChange('chart_color_scheme_json', { type: 'custom', colors: newColors });
    }
  };
  
  const removeCustomColor = (index) => {
    if (customColors.length > 1) {
      const newColors = customColors.filter((_, i) => i !== index);
      setCustomColors(newColors);
      handleInputChange('chart_color_scheme_json', { type: 'custom', colors: newColors });
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile || !user || !siteId) return;
    setUploadingLogo(true);
    try {
      const fileName = `${user.id}/${siteId}/${Date.now()}_${logoFile.name}`;
      const { data, error } = await supabase.storage
        .from('logos') 
        .upload(fileName, logoFile, {
          cacheControl: '3600',
          upsert: true, 
        });

      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(data.path);
      handleInputChange('logo_url', publicUrl);
      toast({ title: 'Logo Uploaded', description: 'Logo successfully uploaded and URL updated.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Logo Upload Failed', description: error.message });
    } finally {
      setUploadingLogo(false);
      setLogoFile(null); 
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl font-semibold text-primary">Loading Branding Settings...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-200 p-4 sm:p-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link to="/dashboard"><ArrowLeft /></Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Branding for: <span className="text-slate-700">{siteName}</span></h1>
        </div>
        <Button onClick={() => handleSaveChanges(true)} disabled={saving || uploadingLogo} className="bg-green-600 hover:bg-green-700">
          <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving...' : (hasUnsavedChanges ? 'Save Changes*' : 'Save Changes')}
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-lg flex flex-col max-h-[calc(100vh-180px)]">
          <CardHeader>
            <CardTitle className="flex items-center"><Settings className="mr-2 h-5 w-5 text-primary"/>Customize Branding</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto">
            <BrandingForm
              branding={branding}
              handleInputChange={handleInputChange}
              setLogoFile={setLogoFile}
              handleLogoUpload={handleLogoUpload}
              uploadingLogo={uploadingLogo}
              logoFile={logoFile}
              customColors={customColors}
              handleColorPaletteTypeChange={handleColorPaletteTypeChange}
              handlePredefinedPaletteKeyChange={handlePredefinedPaletteKeyChange}
              handleCustomColorChange={handleCustomColorChange}
              addCustomColor={addCustomColor}
              removeCustomColor={removeCustomColor}
            />
          </CardContent>
        </Card>
        
        <BrandingPreview branding={branding} siteName={siteName} />
      </div>
      <AlertDialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Do you want to save them before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setHasUnsavedChanges(false); 
              if(nextNavigationLocation) navigate(nextNavigationLocation);
            }}>
              Discard & Leave
            </AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              await handleSaveChanges(true);
              if(nextNavigationLocation) navigate(nextNavigationLocation);
            }}>
              Save & Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SiteBrandingPage;
