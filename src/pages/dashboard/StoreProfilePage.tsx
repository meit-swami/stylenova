import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  IconBuilding,
  IconMapPin,
  IconPhoto,
  IconUser,
  IconReceipt,
  IconUpload,
  IconCheck
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

export default function StoreProfilePage() {
  const [activeTab, setActiveTab] = useState<'basic' | 'business' | 'settings'>('basic');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
          Store Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your store information and settings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        {[
          { id: 'basic', label: 'Basic Info', icon: IconBuilding },
          { id: 'business', label: 'Business Details', icon: IconReceipt },
          { id: 'settings', label: 'Display Settings', icon: IconPhoto },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`pb-4 px-2 font-medium transition-colors relative flex items-center gap-2 ${
              activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="storeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Basic Info Tab */}
      {activeTab === 'basic' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Logo Upload */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Store Logo</h3>
            <div className="aspect-square rounded-2xl bg-muted/50 border-2 border-dashed border-border flex flex-col items-center justify-center mb-4">
              <IconUpload className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click to upload logo</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
            </div>
            <Button variant="outline" className="w-full">
              <IconUpload className="w-4 h-4" />
              Upload Logo
            </Button>
          </div>

          {/* Store Details Form */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-6">Store Details</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input id="storeName" placeholder="Enter store name" defaultValue="Fashion Hub" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name</Label>
                <Input id="brandName" placeholder="Enter brand name" defaultValue="Fashion Hub India" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input id="ownerName" placeholder="Enter owner name" defaultValue="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+91 98765 43210" defaultValue="+91 98765 43210" />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" placeholder="Enter full address" defaultValue="123 Fashion Street, New Delhi, India 110001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lat">GPS Latitude</Label>
                <Input id="lat" placeholder="28.6139" defaultValue="28.6139" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="long">GPS Longitude</Label>
                <Input id="long" placeholder="77.2090" defaultValue="77.2090" />
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border flex justify-end gap-3">
              <Button variant="outline">Cancel</Button>
              <Button variant="hero">
                <IconCheck className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>

          {/* Store Photos */}
          <div className="lg:col-span-3 bg-card rounded-2xl border border-border p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Store Photos</h3>
            <p className="text-sm text-muted-foreground mb-4">Upload photos of your store interior and exterior</p>
            <div className="grid sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-video rounded-xl bg-muted/50 border-2 border-dashed border-border flex flex-col items-center justify-center">
                  <IconPhoto className="w-6 h-6 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">Photo {i}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Business Details Tab */}
      {activeTab === 'business' && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-6">Business Registration Details</h3>
          <p className="text-sm text-muted-foreground mb-6">Optional: Add your business registration details for tax invoices</p>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl">
            <div className="space-y-2">
              <Label htmlFor="gst">GST Number</Label>
              <Input id="gst" placeholder="e.g., 22AAAAA0000A1Z5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uin">UIN (Unique Identification Number)</Label>
              <Input id="uin" placeholder="Enter UIN" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brn">BRN (Business Registration Number)</Label>
              <Input id="brn" placeholder="Enter BRN" />
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border flex justify-end gap-3">
            <Button variant="outline">Cancel</Button>
            <Button variant="hero">
              <IconCheck className="w-4 h-4" />
              Save Details
            </Button>
          </div>
        </div>
      )}

      {/* Display Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-card rounded-2xl border border-border p-6 max-w-2xl">
          <h3 className="font-display text-lg font-semibold text-foreground mb-6">Customer Mode Settings</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-border">
              <div>
                <p className="font-medium text-foreground">Show Product Pricing</p>
                <p className="text-sm text-muted-foreground">Display prices in customer/kiosk mode</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-4 border-b border-border">
              <div>
                <p className="font-medium text-foreground">Enable Wishlist</p>
                <p className="text-sm text-muted-foreground">Allow customers to save items to wishlist</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-4 border-b border-border">
              <div>
                <p className="font-medium text-foreground">Enable Sharing</p>
                <p className="text-sm text-muted-foreground">Allow customers to share try-on results</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-foreground">QR Code Generation</p>
                <p className="text-sm text-muted-foreground">Generate QR codes for wishlists</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border flex justify-end gap-3">
            <Button variant="outline">Reset to Default</Button>
            <Button variant="hero">
              <IconCheck className="w-4 h-4" />
              Save Settings
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
