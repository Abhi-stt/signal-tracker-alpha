
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, DollarSign, Plus, X, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Auth } from '@/components/Auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface TrackedStock {
  id: string;
  symbol: string;
  buy_above: number;
  sell_below: number;
  last_price: number | null;
  status: 'watching' | 'buy_signal' | 'sell_signal';
  signal_triggered: string | null;
  created_at: string;
  updated_at: string;
}

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [formData, setFormData] = useState({
    symbol: '',
    buyAbove: '',
    sellBelow: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch tracked stocks
  const { data: trackedStocks = [], isLoading } = useQuery({
    queryKey: ['tracked-stocks'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-tracked-stocks');
      if (error) throw error;
      return data.stocks as TrackedStock[];
    },
    enabled: !!session,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Real-time subscription
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel('tracked_stocks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tracked_stocks',
          filter: `user_id=eq.${session.user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tracked-stocks'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, queryClient]);

  // Add stock mutation
  const addStockMutation = useMutation({
    mutationFn: async (stockData: { symbol: string; buyAbove: number; sellBelow: number }) => {
      const { data, error } = await supabase.functions.invoke('track-stock', {
        body: stockData
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracked-stocks'] });
      setFormData({ symbol: '', buyAbove: '', sellBelow: '' });
      setIsAdding(false);
      toast({
        title: "Stock Added",
        description: "Stock is now being tracked with real-time Alpaca data",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add stock",
        variant: "destructive",
      });
    }
  });

  // Remove stock mutation
  const removeStockMutation = useMutation({
    mutationFn: async (stockId: string) => {
      const { data, error } = await supabase.functions.invoke('untrack-stock', {
        body: { stockId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracked-stocks'] });
      toast({
        title: "Stock Removed",
        description: "Stock removed from tracking",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove stock",
        variant: "destructive",
      });
    }
  });

  // Manual signal check
  const checkSignalsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-signals');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tracked-stocks'] });
      toast({
        title: "Signals Updated",
        description: `Checked ${data.total} stocks, updated ${data.updated}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to check signals",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.symbol || !formData.buyAbove || !formData.sellBelow) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    addStockMutation.mutate({
      symbol: formData.symbol.toUpperCase(),
      buyAbove: parseFloat(formData.buyAbove),
      sellBelow: parseFloat(formData.sellBelow)
    });
  };

  const getStatusBadge = (status: TrackedStock['status']) => {
    switch (status) {
      case 'buy_signal':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Buy Signal</Badge>;
      case 'sell_signal':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">Sell Signal</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">Watching</Badge>;
    }
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Stock Trading Dashboard</h1>
            <p className="text-muted-foreground">Real-time tracking with Alpaca Markets API</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => checkSignalsMutation.mutate()}
              disabled={checkSignalsMutation.isPending}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${checkSignalsMutation.isPending ? 'animate-spin' : ''}`} />
              Check Prices
            </Button>
            <div className="flex items-center space-x-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Live Alpaca Data</span>
            </div>
            <Button
              onClick={() => supabase.auth.signOut()}
              variant="outline"
              size="sm"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tracked Stocks</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trackedStocks.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Signals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {trackedStocks.filter(s => s.status !== 'watching').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Buy Signals</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {trackedStocks.filter(s => s.status === 'buy_signal').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sell Signals</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                {trackedStocks.filter(s => s.status === 'sell_signal').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Stock Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Track New Stock
              {!isAdding && (
                <Button onClick={() => setIsAdding(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stock
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          {isAdding && (
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Stock Symbol</Label>
                  <Input
                    id="symbol"
                    placeholder="AAPL"
                    value={formData.symbol}
                    onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buyAbove">Buy Above ($)</Label>
                  <Input
                    id="buyAbove"
                    type="number"
                    step="0.01"
                    placeholder="200.00"
                    value={formData.buyAbove}
                    onChange={(e) => setFormData(prev => ({ ...prev, buyAbove: e.target.value }))}
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellBelow">Sell Below ($)</Label>
                  <Input
                    id="sellBelow"
                    type="number"
                    step="0.01"
                    placeholder="180.00"
                    value={formData.sellBelow}
                    onChange={(e) => setFormData(prev => ({ ...prev, sellBelow: e.target.value }))}
                    className="bg-input border-border"
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <Button 
                    type="submit" 
                    disabled={addStockMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {addStockMutation.isPending ? 'Adding...' : 'Track Stock'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAdding(false)}
                    className="border-border"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Tracked Stocks Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Tracked Stocks ({trackedStocks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
                <p>Loading tracked stocks...</p>
              </div>
            ) : trackedStocks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No stocks being tracked yet.</p>
                <p className="text-sm">Add your first stock to get started with real-time tracking!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">Symbol</th>
                      <th className="text-right py-3 px-4 font-medium">Current Price</th>
                      <th className="text-right py-3 px-4 font-medium">Buy Target</th>
                      <th className="text-right py-3 px-4 font-medium">Sell Target</th>
                      <th className="text-center py-3 px-4 font-medium">Status</th>
                      <th className="text-center py-3 px-4 font-medium">Last Updated</th>
                      <th className="text-center py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trackedStocks.map((stock) => (
                      <tr key={stock.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="font-bold">{stock.symbol}</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-bold">
                            {stock.last_price ? `$${stock.last_price.toFixed(2)}` : 'Loading...'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="text-green-400">${stock.buy_above.toFixed(2)}</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="text-red-400">${stock.sell_below.toFixed(2)}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(stock.status)}
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                          {new Date(stock.updated_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStockMutation.mutate(stock.id)}
                            disabled={removeStockMutation.isPending}
                            className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
