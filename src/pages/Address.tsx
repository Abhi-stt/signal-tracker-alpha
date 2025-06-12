
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Home, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AddressTypeSelector } from '@/components/address/AddressTypeSelector';
import { CitySelector } from '@/components/address/CitySelector';
import { StateSelector } from '@/components/address/StateSelector';
import { CountrySelector } from '@/components/address/CountrySelector';
import { MapComponent } from '@/components/address/MapComponent';

const Address = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    addressType: 'Home',
    address: '500, Williamson House, Main Street...',
    city: 'Los Angeles',
    state: 'New York',
    country: 'USA',
    zipCode: '852014'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Address submitted:', formData);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Container */}
      <div className="max-w-sm mx-auto bg-background min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Address</h1>
          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Shipping Address Label */}
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-4">Shipping Address</h2>
          </div>

          {/* Map */}
          <MapComponent />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Address Type */}
            <div className="space-y-2">
              <Label htmlFor="addressType" className="text-sm font-medium">Address Type</Label>
              <AddressTypeSelector 
                value={formData.addressType}
                onValueChange={(value) => updateFormData('addressType', value)}
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                className="bg-muted/30 border-border"
                placeholder="Enter your address"
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium">City</Label>
              <CitySelector 
                value={formData.city}
                onValueChange={(value) => updateFormData('city', value)}
              />
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-medium">State</Label>
              <StateSelector 
                value={formData.state}
                onValueChange={(value) => updateFormData('state', value)}
              />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium">Country</Label>
              <CountrySelector 
                value={formData.country}
                onValueChange={(value) => updateFormData('country', value)}
              />
            </div>

            {/* Zip Code */}
            <div className="space-y-2">
              <Label htmlFor="zipCode" className="text-sm font-medium">Zip Code</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => updateFormData('zipCode', e.target.value)}
                className="bg-muted/30 border-border"
                placeholder="Enter zip code"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-full text-base font-medium"
              >
                Submit
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Address;
