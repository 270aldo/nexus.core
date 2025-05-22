import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ProgressComparison, ProgressMetric } from 'components/ProgressComparison';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import brain from 'brain';
import { toast } from 'sonner';

const mockMetrics: ProgressMetric[] = [
  {
    id: 'weight',
    name: 'Body Weight',
    unit: 'kg',
    target: 80,
    periods: [
      {
        label: 'Current Period',
        color: '#3b82f6',
        records: [
          { date: '2025-03-01', value: 85.4 },
          { date: '2025-03-08', value: 84.9 },
          { date: '2025-03-15', value: 83.8 },
          { date: '2025-03-22', value: 82.7 },
          { date: '2025-03-29', value: 82.1 },
          { date: '2025-04-05', value: 81.5 },
          { date: '2025-04-12', value: 81.2 },
          { date: '2025-04-19', value: 80.7 },
        ],
      },
      {
        label: 'Previous Period',
        color: '#ef4444',
        improvement: 5.5,
        records: [
          { date: '2025-03-01', value: 87.2 },
          { date: '2025-03-08', value: 86.5 },
          { date: '2025-03-15', value: 86.0 },
          { date: '2025-03-22', value: 85.7 },
          { date: '2025-03-29', value: 85.4 },
          { date: '2025-04-05', value: 85.2 },
          { date: '2025-04-12', value: 85.0 },
          { date: '2025-04-19', value: 85.3 },
        ],
      },
    ],
  },
  {
    id: 'squat',
    name: 'Squat 1RM',
    unit: 'kg',
    target: 150,
    periods: [
      {
        label: 'Current Period',
        color: '#3b82f6',
        records: [
          { date: '2025-03-01', value: 120 },
          { date: '2025-03-15', value: 125 },
          { date: '2025-03-29', value: 130 },
          { date: '2025-04-12', value: 135 },
        ],
      },
      {
        label: 'Previous Period',
        color: '#ef4444',
        improvement: 12.5,
        records: [
          { date: '2025-03-01', value: 110 },
          { date: '2025-03-15', value: 115 },
          { date: '2025-03-29', value: 117 },
          { date: '2025-04-12', value: 120 },
        ],
      },
    ],
  },
  {
    id: 'bodyfat',
    name: 'Body Fat Percentage',
    unit: '%',
    target: 15,
    periods: [
      {
        label: 'Current Period',
        color: '#3b82f6',
        records: [
          { date: '2025-03-01', value: 22.4 },
          { date: '2025-03-29', value: 20.7 },
          { date: '2025-04-12', value: 19.2 },
        ],
      },
      {
        label: 'Previous Period',
        color: '#ef4444',
        improvement: 8.9,
        records: [
          { date: '2025-03-01', value: 24.5 },
          { date: '2025-03-29', value: 23.8 },
          { date: '2025-04-12', value: 23.2 },
        ],
      },
    ],
  },
  {
    id: 'sleep',
    name: 'Sleep Quality',
    unit: 'score',
    target: 9,
    periods: [
      {
        label: 'Current Period',
        color: '#3b82f6',
        records: [
          { date: '2025-03-01', value: 6.2 },
          { date: '2025-03-08', value: 6.5 },
          { date: '2025-03-15', value: 7.0 },
          { date: '2025-03-22', value: 7.2 },
          { date: '2025-03-29', value: 7.5 },
          { date: '2025-04-05', value: 7.8 },
          { date: '2025-04-12', value: 8.1 },
          { date: '2025-04-19', value: 8.3 },
        ],
      },
      {
        label: 'Previous Period',
        color: '#ef4444',
        improvement: 30.6,
        records: [
          { date: '2025-03-01', value: 5.2 },
          { date: '2025-03-08', value: 5.4 },
          { date: '2025-03-15', value: 5.5 },
          { date: '2025-03-22', value: 5.6 },
          { date: '2025-03-29', value: 5.8 },
          { date: '2025-04-05', value: 6.0 },
          { date: '2025-04-12', value: 6.2 },
          { date: '2025-04-19', value: 6.4 },
        ],
      },
    ],
  },
];

const ProgressComparisonPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId') || '';
  const clientType = (searchParams.get('type') as 'PRIME' | 'LONGEVITY') || 'PRIME';
  
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<ProgressMetric[]>(mockMetrics);
  
  useEffect(() => {
    if (!clientId) {
      toast.error('Client ID is required');
      navigate('/clients');
      return;
    }
    
    // In a real implementation, we would fetch the actual metrics from the API
    // Currently using mock data, but this would be the place to load real data
    const loadClientMetrics = async () => {
      setLoading(true);
      try {
        // const response = await brain.get_progress_history({ clientId });
        // const data = await response.json();
        // Transform the data into the format required by the ProgressComparison component
        
        // For now, just use mock data
        setMetrics(mockMetrics);
      } catch (error) {
        console.error('Error loading progress metrics:', error);
        toast.error('Failed to load progress metrics');
      } finally {
        setLoading(false);
      }
    };
    
    loadClientMetrics();
  }, [clientId, navigate]);
  
  const handleTimeRangeChange = (period1: string, period2: string) => {
    // In a real implementation, this would refetch the data with the new time ranges
    console.log(`Comparing periods: ${period1} vs ${period2}`);
    toast.info(`Comparing ${period1} vs ${period2}`);
    
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      // Just keep using the same mock data for now
      setLoading(false);
    }, 800);
  };
  
  return (
    <div className="container py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2" 
          onClick={() => navigate(`/client-detail?id=${clientId}&type=${clientType}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Client
        </Button>
        <h1 className="text-2xl font-bold">Client Progress Comparison</h1>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-center">
            <div className="h-6 w-32 bg-muted rounded mx-auto"></div>
            <div className="h-4 w-60 bg-muted rounded mx-auto mt-2"></div>
            <div className="h-64 w-full max-w-4xl bg-muted rounded mx-auto mt-4"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {metrics.map(metric => (
            <ProgressComparison
              key={metric.id}
              clientId={clientId}
              clientType={clientType}
              metrics={[metric]}
              onTimeRangeChange={handleTimeRangeChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressComparisonPage;