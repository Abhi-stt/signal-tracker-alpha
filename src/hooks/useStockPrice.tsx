
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useStockPrice = (symbol: string) => {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = async () => {
    if (!symbol) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-stock-price', {
        body: { symbol }
      });

      if (error) throw error;
      
      setPrice(data.price);
    } catch (err) {
      console.error('Error fetching stock price:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch price');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
  }, [symbol]);

  return { price, loading, error, refetch: fetchPrice };
};
