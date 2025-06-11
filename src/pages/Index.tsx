
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, DollarSign, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TrackedStock {
  id: string;
  symbol: string;
  buyAbove: number;
  sellBelow: number;
  currentPrice: number;
  status: 'watching' | 'buy_signal' | 'sell_signal';
  lastUpdated: Date;
  priceChange: number;
}

const Index = () => {
  const [trackedStocks, setTrackedStocks] = useState<TrackedStock[]>([]);
  const [formData, setFormData] = useState({
    symbol: '',
    buyAbove: '',
    sellBelow: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  // Mock price updates to simulate real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      setTrackedStocks(prev => prev.map(stock => {
        const change = (Math.random() - 0.5) * 2; // Random change between -1 and 1
        const newPrice = Math.max(0.01, stock.currentPrice + change);
        const priceChange = newPrice - stock.currentPrice;
        
        // Determine status based on price targets
        let newStatus = stock.status;
        if (newPrice >= stock.buyAbove && stock.status === 'watching') {
          newStatus = 'buy_signal';
          toast({
            title: "Buy Signal!",
            description: `${stock.symbol} hit your buy target at $${newPrice.toFixed(2)}`,
            variant: "default",
          });
        } else if (newPrice <= stock.sellBelow && stock.status === 'watching') {
          newStatus = 'sell_signal';
          toast({
            title: "Sell Signal!",
            description: `${stock.symbol} hit your sell target at $${newPrice.toFixed(2)}`,
            variant: "destructive",
          });
        }

        return {
          ...stock,
          currentPrice: newPrice,
          status: newStatus,
          priceChange,
          lastUpdated: new Date()
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [toast]);

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

    const newStock: TrackedStock = {
      id: Date.now().toString(),
      symbol: formData.symbol.toUpperCase(),
      buyAbove: parseFloat(formData.buyAbove),
      sellBelow: parseFloat(formData.sellBelow),
      currentPrice: Math.random() * 200 + 50, // Mock initial price
      status: 'watching',
      lastUpdated: new Date(),
      priceChange: 0
    };

    setTrackedStocks(prev => [...prev, newStock]);
    setFormData({ symbol: '', buyAbove: '', sellBelow: '' });
    setIsAdding(false);
    
    toast({
      title: "Stock Added",
      description: `Now tracking ${newStock.symbol}`,
    });
  };

  const removeStock = (id: string) => {
    setTrackedStocks(prev => prev.filter(stock => stock.id !== id));
    toast({
      title: "Stock Removed",
      description: "Stock removed from tracking",
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

  const getPriceColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Stock Trading Dashboard</h1>
            <p className="text-muted-foreground">Paper Trading with Alpaca • Live Market Simulation</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Live Market Data</span>
            </div>
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
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    Track Stock
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
            <CardTitle>Tracked Stocks</CardTitle>
          </CardHeader>
          <CardContent>
            {trackedStocks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No stocks being tracked yet.</p>
                <p className="text-sm">Add your first stock to get started!</p>
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
                      <th className="text-center py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trackedStocks.map((stock) => (
                      <tr key={stock.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="font-bold">{stock.symbol}</div>
                          <div className="text-sm text-muted-foreground">
                            {stock.lastUpdated.toLocaleTimeString()}
                          </div>
                        </td>
                        <td className={`py-3 px-4 text-right price-font ${getPriceColor(stock.priceChange)}`}>
                          <div className="font-bold">${stock.currentPrice.toFixed(2)}</div>
                          <div className="text-sm">
                            {stock.priceChange >= 0 ? '+' : ''}${stock.priceChange.toFixed(2)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right price-font">
                          <div className="text-green-400">${stock.buyAbove.toFixed(2)}</div>
                        </td>
                        <td className="py-3 px-4 text-right price-font">
                          <div className="text-red-400">${stock.sellBelow.toFixed(2)}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(stock.status)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStock(stock.id)}
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
