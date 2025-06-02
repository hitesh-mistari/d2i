import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DataSourcePanel from '@/components/sidebar/DataSourcePanel';
import GlobalBrandingPanel from '@/components/sidebar/GlobalBrandingPanel';
import FileUploadPanel from '@/components/sidebar/FileUploadPanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth.jsx';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Globe, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const LeftSidebar = ({
  extractedTablesData,
  chartConfigs,
  onSelectTable,
  brandConfig,
  onBrandConfigChange,
  onTablesExtracted,
  uploadedFileName,
  activeSiteId,
  onSiteSelected,
}) => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [userSites, setUserSites] = useState([]);
  const [loadingSites, setLoadingSites] = useState(false);

  useEffect(() => {
    const fetchUserSites = async () => {
      if (!user) {
        setUserSites([]);
        onSiteSelected(null); 
        return;
      }
      setLoadingSites(true);
      try {
        const { data, error } = await supabase
          .from('sites')
          .select('id, site_name')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setUserSites(data || []);
        
        if (data && data.length > 0) {
          if (!activeSiteId || !data.find(site => site.id === activeSiteId)) {
            onSiteSelected(data[0].id); 
          }
        } else {
          onSiteSelected(null);
        }

      } catch (error) {
        toast({ variant: 'destructive', title: 'Error fetching sites', description: error.message });
        setUserSites([]);
        onSiteSelected(null);
      } finally {
        setLoadingSites(false);
      }
    };
    fetchUserSites();
  }, [user, toast, activeSiteId, onSiteSelected]);


  const handleChartTitleClick = (chartId) => {
    const element = document.getElementById(`chart-card-${chartId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'transition-all', 'duration-300');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
      }, 1500);
    }
    if(onSelectTable && chartConfigs) {
      const index = chartConfigs.findIndex(c => c.id === chartId);
      if(index !== -1) onSelectTable(index);
    }
  };

  const isLoggedIn = !!session;

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="w-80 md:w-96 min-w-[320px] bg-slate-50 rounded-xl shadow-xl flex flex-col overflow-hidden max-h-[calc(100vh-180px)] "
    >
      <ScrollArea className="flex-grow p-3">
        <div className="space-y-4">
          <FileUploadPanel onTablesExtracted={onTablesExtracted} uploadedFileName={uploadedFileName} />
          
          {isLoggedIn && (
            <div className="p-3 border rounded-md bg-white">
              <Label htmlFor="activeSiteSelect" className="flex items-center mb-1 text-sm font-medium text-slate-700">
                <Globe className="mr-2 h-4 w-4 text-muted-foreground" /> Active Site Branding
              </Label>
              {loadingSites ? <p className="text-xs text-slate-500">Loading sites...</p> : (
                <Select 
                  value={activeSiteId || 'none'} 
                  onValueChange={(value) => onSiteSelected(value === 'none' ? null : value)}
                >
                  <SelectTrigger id="activeSiteSelect">
                    <SelectValue placeholder="Select a site for branding..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Use Global / Default Branding</SelectItem>
                    {userSites.map(site => (
                      <SelectItem key={site.id} value={site.id}>{site.site_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {userSites.length === 0 && !loadingSites && (
                <p className="text-xs text-slate-500 mt-1">No sites configured. <Button asChild variant="link" size="sm" className="p-0 h-auto"><Link to="/dashboard">Manage Sites</Link></Button></p>
              )}
            </div>
          )}
          
          {!isLoggedIn && (
            <Card className="bg-amber-50 border-amber-300">
                <CardContent className="pt-4 text-sm text-amber-700">
                    <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 mr-2 mt-0.5 text-amber-600 flex-shrink-0" />
                        <div>
                            You are using guest mode. Branding options are limited. 
                            <Button asChild variant="link" size="sm" className="p-0 h-auto ml-1 text-amber-700 hover:text-amber-800">
                                <Link to="/auth">Login or Sign Up</Link>
                            </Button>
                            {" "}for full branding customization and to save your sites.
                        </div>
                    </div>
                </CardContent>
            </Card>
          )}


          {extractedTablesData && extractedTablesData.length > 0 && chartConfigs && chartConfigs.length > 0 && (
            <DataSourcePanel
              charts={chartConfigs}
              onSelectChart={handleChartTitleClick}
            />
          )}
          <GlobalBrandingPanel
            config={brandConfig} 
            onConfigChange={onBrandConfigChange} 
            uploadedDocxName={uploadedFileName.replace(/\.docx$/i, '')}
            isSiteActive={!!activeSiteId && isLoggedIn} 
            activeSiteId={activeSiteId}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </ScrollArea>
    </motion.aside>
  );
};

export default LeftSidebar;