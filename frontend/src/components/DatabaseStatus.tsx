import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import brain from '@/brain/Brain';

interface Props {
  onValidated?: () => void;
  onError?: () => void;
  minimal?: boolean;
}

export function DatabaseStatus({ onValidated, onError, minimal = false }: Props) {
  const [hasSampleData, setHasSampleData] = useState<boolean>(false);
  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [message, setMessage] = useState<string>('Checking database configuration...');
  const navigate = useNavigate();
  
  const checkDatabaseStatus = async () => {
    setStatus('checking');
    setMessage('Checking database configuration...');
    
    try {
      // Try to get clients as a way to check if tables exist
      const response = await brain.search_clients({ limit: 1 });
      const data = await response.json();
      
      if (data.error && data.error.includes('does not exist')) {
        setStatus('invalid');
        setMessage('Database tables not found. Please initialize the database.');
        onError && onError();
        return false;
      }
      
      // If we got here, the table exists
      setStatus('valid');
      
      // Check if we have any clients to determine if sample data exists
      if (Array.isArray(data.clients) && data.clients.length > 0) {
        setHasSampleData(true);
      } else {
        setHasSampleData(false);
      }
      setMessage('Database is properly configured.');
      onValidated && onValidated();
      return true;
    } catch (error: any) {
      // Check if the error is about missing tables
      if (error.message && error.message.includes('does not exist')) {
        setStatus('invalid');
        setMessage('Database tables not found. Please initialize the database.');
        onError && onError();
        return false;
      }
      
      // Other error
      setStatus('invalid');
      setMessage(`Error checking database: ${error.message || 'Unknown error'}`);
      onError && onError();
      return false;
    }
  };
  
  useEffect(() => {
    checkDatabaseStatus();
  }, []);
  
  const goToSetup = () => {
    navigate('/database-setup');
  };
  
  // Minimal version just shows an error if needed
  if (minimal) {
    if (status === 'invalid') {
      return (
        <Card className="border-2 border-destructive mb-6 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="font-mono text-destructive">{message}</div>
              <Button onClick={goToSetup} variant="destructive" className="font-mono">
                Setup Database
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }
    return null;
  }
  
  // Full version with all states
  return (
    <Card className={`border-2 ${status === 'valid' ? 'border-green-600' : status === 'invalid' ? 'border-destructive' : 'border-border'} mb-6`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-mono">
          Database Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className={`w-4 h-4 rounded-full ${status === 'valid' ? 'bg-green-600' : status === 'invalid' ? 'bg-destructive' : 'bg-amber-500'}`}></div>
          <div className="font-mono">{message}</div>
        </div>
        {status === 'valid' && !hasSampleData && (
          <div className="mt-4 p-3 bg-amber-500/20 rounded border border-amber-500 text-sm">
            <span className="font-mono font-bold">Note:</span> Database schema exists but no sample data found. 
            You may want to create sample data for testing visualizations.
          </div>
        )}
      </CardContent>
      <CardFooter>
        {status === 'invalid' && (
          <Button onClick={goToSetup} variant="destructive" className="w-full font-mono">
            Setup Database
          </Button>
        )}
        {status === 'valid' && (
          <Button onClick={checkDatabaseStatus} variant="outline" className="w-full font-mono border-2">
            Verify Again
          </Button>
        )}
        {status === 'checking' && (
          <Button disabled className="w-full font-mono">
            Checking...
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
