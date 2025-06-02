import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.jsx';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2, Settings, LogOut, LayoutDashboard, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sites, setSites] = useState([]);
  const [newSiteName, setNewSiteName] = useState('');
  const [loadingSites, setLoadingSites] = useState(true);
  const [isAddingSite, setIsAddingSite] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState(null);

  const fetchSites = async () => {
    if (!user) return;
    setLoadingSites(true);
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSites(data || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error fetching sites', description: error.message });
    } finally {
      setLoadingSites(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, [user]);

  const handleAddSite = async (e) => {
    e.preventDefault();
    if (!newSiteName.trim()) {
      toast({ variant: 'destructive', title: 'Site name cannot be empty' });
      return;
    }
    setIsAddingSite(true);
    try {
      const { data: newSite, error } = await supabase
        .from('sites')
        .insert([{ user_id: user.id, site_name: newSiteName.trim() }])
        .select()
        .single();
      
      if (error) throw error;

      
      const { error: brandingError } = await supabase
        .from('branding_settings')
        .insert([{
          site_id: newSite.id,
          user_id: user.id,
          
          footer_text: `© {year} ${newSiteName.trim()}`,
          chart_color_scheme_json: { type: 'predefined', key: 'default' }
        }]);

      if (brandingError) {
        
        await supabase.from('sites').delete().eq('id', newSite.id);
        throw brandingError;
      }

      setSites(prevSites => [newSite, ...prevSites]);
      setNewSiteName('');
      toast({ title: 'Site Added!', description: `${newSiteName} has been successfully added.` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error adding site', description: error.message });
    } finally {
      setIsAddingSite(false);
    }
  };

  const handleDeleteSite = async () => {
    if (!siteToDelete) return;
    try {
      
      const { error } = await supabase.from('sites').delete().eq('id', siteToDelete.id);
      if (error) throw error;
      setSites(sites.filter(site => site.id !== siteToDelete.id));
      toast({ title: 'Site Deleted', description: `${siteToDelete.site_name} has been removed.` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error deleting site', description: error.message });
    } finally {
      setSiteToDelete(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-200 p-4 sm:p-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <img src="https://images.unsplash.com/photo-1643917853949-74f4eba1c89b" alt="App Logo" className="w-12 h-12 mr-3 rounded-full shadow-md" />
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button variant="outline" onClick={() => navigate('/')} className="text-sm sm:text-base">
            <FileText className="mr-2 h-4 w-4" /> Infographic Tool
          </Button>
          <Button variant="ghost" onClick={handleSignOut} className="text-sm sm:text-base">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </header>

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome, {user?.email?.split('@')[0] || 'User'}!</CardTitle>
          <CardDescription>Manage your sites and their branding settings here.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><LayoutDashboard className="mr-2 h-5 w-5 text-primary"/>Stats Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Infographics Generated: <span className="font-semibold">N/A (Feature coming soon)</span></p>
              <p>Sites Connected: <span className="font-semibold">{sites.length}</span></p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><PlusCircle className="mr-2 h-5 w-5 text-primary"/>Add New Site</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSite} className="space-y-3">
                <div>
                  <Label htmlFor="new-site-name">Site Name (e.g., myblog.com)</Label>
                  <Input 
                    id="new-site-name" 
                    value={newSiteName} 
                    onChange={(e) => setNewSiteName(e.target.value)} 
                    placeholder="Enter site name or domain" 
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isAddingSite}>
                  {isAddingSite ? 'Adding...' : 'Add Site'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-2xl font-semibold mb-6 text-slate-700">Your Sites</h2>
        {loadingSites ? (
          <p className="text-slate-600">Loading your sites...</p>
        ) : sites.length === 0 ? (
          <p className="text-slate-600">You haven't added any sites yet. Add one above to get started!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map(site => (
              <Card key={site.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="truncate text-xl">{site.site_name}</CardTitle>
                  <CardDescription>Created: {new Date(site.created_at).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/site/${site.id}/branding`)}>
                    <Settings className="mr-1.5 h-4 w-4" /> Branding
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" onClick={() => setSiteToDelete(site)}>
                        <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the site "{siteToDelete?.site_name}" and all its associated branding settings.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSiteToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSite} className="bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;