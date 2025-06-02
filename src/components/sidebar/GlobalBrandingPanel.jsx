import React, { useState, useEffect } from 'react';
import { Palette, Image as ImageIcon, Type, FileText as FileTextIcon, Globe, RotateCcw, Settings, Save, Lock, AlignLeft, Paintbrush } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { defaultBrandConfigValues, guestBrandConfigValues } from '@/config/siteBranding'; 
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth.jsx';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { titleAlignments } from '@/pages/SiteBrandingPage/components/BrandingForm';


const GlobalBrandingPanel = ({ config, onConfigChange, uploadedDocxName, isSiteActive, activeSiteId, isLoggedIn }) => {
  const [localConfig, setLocalConfig] = useState(config);
  const { toast } = useToast();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalConfig(isLoggedIn ? config : guestBrandConfigValues);
  }, [config, isLoggedIn]);
  
  useEffect(() => {
    if (uploadedDocxName && uploadedDocxName !== localConfig.articleName && !localConfig.articleNameManuallySet && (!isSiteActive || !isLoggedIn) ) {
      setLocalConfig(prev => ({...prev, articleName: uploadedDocxName}));
    }
  }, [uploadedDocxName, localConfig.articleName, localConfig.articleNameManuallySet, isSiteActive, isLoggedIn]);

  const handleChange = (eOrName, value) => {
    let name, val;
    if (typeof eOrName === 'string') {
        name = eOrName;
        val = value;
    } else {
        name = eOrName.target.name;
        val = eOrName.target.value;
    }

    setLocalConfig(prev => {
      const updatedLocalConf = { ...prev, [name]: val };
      if (name === "articleName") {
        updatedLocalConf.articleNameManuallySet = true;
      }
      
      if (!isSiteActive || !isLoggedIn) {
        onConfigChange(updatedLocalConf);
      }
      return updatedLocalConf;
    });
  };
  
  const handleResetToDefault = () => {
    let defaultConfigToApply;
    if (!isLoggedIn) {
        defaultConfigToApply = { ...guestBrandConfigValues, articleName: uploadedDocxName || guestBrandConfigValues.articleName, articleNameManuallySet: false };
    } else if (isSiteActive && localConfig.siteName) {
        defaultConfigToApply = { 
            ...defaultBrandConfigValues, 
            siteName: localConfig.siteName,
            articleName: localConfig.siteName, 
            footerText: `© {year} ${localConfig.siteName}`,
            articleNameManuallySet: false
        };
    } else {
        defaultConfigToApply = { 
            ...defaultBrandConfigValues, 
            articleName: uploadedDocxName || defaultBrandConfigValues.articleName,
            articleNameManuallySet: false
        };
    }
    
    setLocalConfig(defaultConfigToApply);
    onConfigChange(defaultConfigToApply); 
    toast({
      title: "Branding Reset",
      description: `Branding settings have been reset. ${isSiteActive && isLoggedIn ? "Save to apply to current site." : ""}`,
    });
  };

  const handleSaveConfig = async () => {
    if (isSiteActive && activeSiteId && user) {
      setSaving(true);
      try {
        const dbBrandingData = {
          site_id: activeSiteId,
          user_id: user.id,
          article_name: localConfig.articleName, 
          logo_url: localConfig.logoUrl,
          logo_placement: localConfig.logoPlacement,
          show_logo: localConfig.showLogo,
          show_footer: localConfig.showFooter,
          footer_text: localConfig.footerText,
          font_family: localConfig.font,
          background_color: localConfig.backgroundColor,
          footer_color: localConfig.footerColor,
          chart_color_scheme_json: localConfig.chartColorPalette,
          title_placement: localConfig.titlePlacement,
          title_color: localConfig.titleColor,
          title_alignment: localConfig.titleAlignment,
          predicted_note: localConfig.predictedNote,
        };

        const { error } = await supabase
          .from('branding_settings')
          .upsert(dbBrandingData, { onConflict: 'site_id, user_id' });

        if (error) throw error;
        onConfigChange(localConfig); 
        toast({
          title: "Site Branding Saved",
          description: `Branding for ${localConfig.siteName || 'current site'} has been saved.`,
        });
      } catch (error) {
        toast({ variant: "destructive", title: "Error Saving Site Branding", description: error.message });
      } finally {
        setSaving(false);
      }
    } else if (isLoggedIn) {
      onConfigChange(localConfig); 
      localStorage.setItem(`brandConfig_user_${user.id}_global`, JSON.stringify(localConfig));
      toast({
        title: "Global Branding Updated",
        description: "Your global/default branding settings have been applied.",
      });
    } else {
        toast({
            title: "Guest Mode",
            description: "Branding changes are temporary. Login to save.",
        });
    }
  };
  
  const panelTitle = !isLoggedIn ? "Guest Branding (Default)" : (isSiteActive ? `Branding: ${localConfig.siteName || 'Selected Site'}` : "Global/Default Branding");
  const panelDescription = !isLoggedIn 
    ? "You are in guest mode. Infographics use default branding. Login for full customization."
    : (isSiteActive 
      ? `Customize branding for "${localConfig.siteName || 'Selected Site'}". These settings will be saved for this site.`
      : "These are your global/default settings. Select a site from above to customize its specific branding, or manage sites in your dashboard.");


  const disabledForGuest = !isLoggedIn;


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          {disabledForGuest && <Lock className="mr-2 h-5 w-5 text-amber-500" />}
          {!disabledForGuest && <Palette className="mr-2 h-5 w-5 text-primary" />} 
          {panelTitle}
        </CardTitle>
        <CardDescription>{panelDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {isSiteActive && localConfig.siteName && isLoggedIn && (
            <div>
                <Label className="flex items-center"><Globe className="mr-2 h-4 w-4 text-muted-foreground" />Site Name</Label>
                <Input value={localConfig.siteName} disabled className="mt-1 bg-slate-100" />
            </div>
        )}
        <div>
          <Label htmlFor="articleNameGlobal" className="flex items-center"><FileTextIcon className="mr-2 h-4 w-4 text-muted-foreground" />Article Name (for Footer & ZIP)</Label>
          <Input id="articleNameGlobal" name="articleName" value={localConfig.articleName || ''} onChange={handleChange} placeholder="e.g., Global Market Trends" disabled={disabledForGuest}/>
        </div>
        <div>
          <Label htmlFor="logoUrlGlobal" className="flex items-center"><ImageIcon className="mr-2 h-4 w-4 text-muted-foreground" />Logo URL (for chart footer)</Label>
          <Input id="logoUrlGlobal" name="logoUrl" type="url" value={localConfig.logoUrl || ''} onChange={handleChange} placeholder={disabledForGuest ? "Login to add logo" : "https://example.com/logo.png"} disabled={disabledForGuest} />
          {localConfig.logoUrl && !disabledForGuest && (
            <div className="mt-2 p-2 border rounded-md bg-slate-100 dark:bg-slate-800 inline-block max-w-[150px]">
              <img src={localConfig.logoUrl} alt="Brand logo preview" className="h-8 w-auto object-contain" onError={(e) => { e.target.alt="Logo preview failed"; e.target.style.display='none'; }} />
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="footerColorGlobal" className="flex items-center"><Palette className="mr-2 h-4 w-4 text-muted-foreground" />Footer Background Color</Label>
          <div className="flex items-center gap-2">
            <Input id="footerColorGlobal" name="footerColor" type="color" value={localConfig.footerColor || '#1F2937'} onChange={handleChange} className="w-10 h-10 p-1 shrink-0" disabled={disabledForGuest}/>
            <Input type="text" value={localConfig.footerColor || '#1F2937'} onChange={handleChange} name="footerColor" placeholder="#1F2937" className="flex-1" disabled={disabledForGuest}/>
          </div>
        </div>
        <div>
          <Label htmlFor="fontGlobal" className="flex items-center"><Type className="mr-2 h-4 w-4 text-muted-foreground" />Default Chart Font Family</Label>
          <Input id="fontGlobal" name="font" value={localConfig.font || 'Poppins'} onChange={handleChange} placeholder="e.g., Poppins, sans-serif" disabled={disabledForGuest}/>
        </div>
        <div>
          <Label htmlFor="footerTextGlobal" className="flex items-center"><FileTextIcon className="mr-2 h-4 w-4 text-muted-foreground" />Footer Text Template (use {'{year}'} & {'{articleName}'})</Label>
          <Input id="footerTextGlobal" name="footerText" value={localConfig.footerText || ''} onChange={handleChange} placeholder="e.g., {articleName} | © Copyright {year}" disabled={disabledForGuest}/>
        </div>
         <div>
          <Label htmlFor="titleColorGlobal" className="flex items-center"><Paintbrush className="mr-2 h-4 w-4 text-muted-foreground" />Infographic Title Color</Label>
          <div className="flex items-center gap-2">
            <Input id="titleColorGlobal" name="titleColor" type="color" value={localConfig.titleColor || '#333333'} onChange={handleChange} className="w-10 h-10 p-1 shrink-0" disabled={disabledForGuest}/>
            <Input type="text" value={localConfig.titleColor || '#333333'} onChange={handleChange} name="titleColor" placeholder="#333333" className="flex-1" disabled={disabledForGuest}/>
          </div>
        </div>
         <div>
            <Label htmlFor="titleAlignmentGlobal" className="flex items-center"><AlignLeft className="mr-2 h-4 w-4 text-muted-foreground" />Infographic Title Alignment</Label>
            <Select value={localConfig.titleAlignment || 'left'} onValueChange={(value) => handleChange('titleAlignment', value)} disabled={disabledForGuest}>
                <SelectTrigger id="titleAlignmentGlobal">
                    <SelectValue placeholder="Select title alignment" />
                </SelectTrigger>
                <SelectContent>
                    {titleAlignments.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                            <span className="flex items-center">{opt.icon}{opt.label}</span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <div>
          <Label htmlFor="predictedNoteGlobal">Optional Note for Predicted Data (e.g., *forecasted)</Label>
          <Input id="predictedNoteGlobal" name="predictedNote" value={localConfig.predictedNote || ''} onChange={handleChange} placeholder={disabledForGuest ? "Login to customize" : "Leave empty if not needed"} disabled={disabledForGuest}/>
        </div>
        <div className="flex gap-2">
          {isLoggedIn ? (
            <>
              <Button onClick={handleSaveConfig} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={saving}>
                {isSiteActive ? <Save className="mr-2 h-4 w-4" /> : <Settings className="mr-2 h-4 w-4" />}
                {saving ? 'Saving...' : (isSiteActive ? 'Save Site Branding' : 'Apply Global Settings')}
              </Button>
              <Button onClick={handleResetToDefault} variant="outline" className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" /> Reset
              </Button>
            </>
          ) : (
             <Button asChild className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white">
                <Link to="/auth">
                    <Lock className="mr-2 h-4 w-4" /> Login to Customize & Save Branding
                </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
export default GlobalBrandingPanel;