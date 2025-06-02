import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom'; 
import { useAuth } from '@/hooks/useAuth.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { updateUserPassword, session } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const hash = location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const errorDescription = params.get('error_description');

    if (errorDescription) {
      toast({ variant: 'destructive', title: 'Error', description: decodeURIComponent(errorDescription) });
      navigate('/auth'); 
    }
    
    if (accessToken && !session) {
        
    }

  }, [location, session, navigate, toast]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Passwords do not match.' });
      return;
    }
    if (password.length < 6) {
      toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 6 characters long.' });
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const { error } = await updateUserPassword(password);
      if (error) throw error;
      setMessage('Password updated successfully! You can now log in with your new password.');
      toast({ title: 'Password Updated!', description: 'Your password has been changed.' });
      setTimeout(() => navigate('/auth'), 3000); 
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error updating password', description: error.message });
      setMessage('');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const hash = location.hash.substring(1);
    const params = new URLSearchParams(hash);
    if (!params.get('access_token') && !session) {
      toast({ variant: 'destructive', title: 'Invalid Link', description: 'This password update link is invalid or has expired.' });
      navigate('/auth');
    }
  }, [location, session, navigate, toast]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-sky-200 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Update Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          {message ? (
            <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="password">New Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter new password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  placeholder="Confirm new password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          )}
        </CardContent>
        {!message && (
          <CardFooter>
            <Button variant="link" asChild className="w-full">
              <Link to="/auth" className="flex items-center justify-center">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
              </Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default UpdatePasswordPage;