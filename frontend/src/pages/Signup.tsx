import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from 'utils/auth-context';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const { error, data } = await signUp(email, password);
      if (error) throw error;
      
      // Check if the user needs to confirm their email
      if (!data?.user?.identities || data.user.identities.length === 0) {
        setMessage('Check your email for a confirmation link.');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md border-2 border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-mono text-lg font-bold text-primary-foreground">
              NGX
            </div>
            <div className="font-mono font-bold tracking-tighter text-lg">NEXUSCORE</div>
          </div>
          <CardTitle className="text-2xl font-mono tracking-tighter">Sign Up</CardTitle>
          <CardDescription>Create your account to access the NGX control center</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6 space-y-4">
            {error && (
              <div className="p-3 mb-4 text-sm text-destructive bg-destructive/10 border border-destructive rounded-md">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 mb-4 text-sm text-green-500 bg-green-500/10 border border-green-500 rounded-md">
                {message}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium font-mono">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="border-2 font-mono"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium font-mono">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="border-2 font-mono"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t border-border pt-4">
            <Button
              type="submit"
              className="w-full font-mono"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
            <div className="text-sm text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-primary underline font-mono">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
