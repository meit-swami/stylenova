import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  IconSettings,
  IconPalette,
  IconBell,
  IconLock,
  IconDeviceTablet,
  IconLanguage,
  IconCheck,
  IconAlertCircle
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'notifications' | 'tablet'>('general');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure your store and platform settings
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {[
              { id: 'general', label: 'General', icon: IconSettings },
              { id: 'ai', label: 'AI Assistant', icon: IconLanguage },
              { id: 'notifications', label: 'Notifications', icon: IconBell },
              { id: 'tablet', label: 'Tablet Request', icon: IconDeviceTablet },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as typeof activeTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-6">Account Settings</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="john@fashionhub.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue="+91 98765 43210" />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-6">Payment Gateway</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-500">R</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Razorpay</p>
                        <p className="text-sm text-muted-foreground">Accept cards, UPI, and wallets</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-purple-500">P</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">PhonePe</p>
                        <p className="text-sm text-muted-foreground">UPI payments via PhonePe</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Assistant Settings */}
          {activeTab === 'ai' && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-6">AI Voice Assistant</h3>
              <p className="text-sm text-muted-foreground mb-6">Configure the AI assistant for customer mode</p>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Default Language</Label>
                  <Select defaultValue="hinglish">
                    <SelectTrigger className="w-full sm:w-64">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">हिंदी (Hindi)</SelectItem>
                      <SelectItem value="hinglish">Hinglish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div>
                    <p className="font-medium text-foreground">Voice Feedback</p>
                    <p className="text-sm text-muted-foreground">AI speaks comments about outfits</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div>
                    <p className="font-medium text-foreground">Unique Reactions</p>
                    <p className="text-sm text-muted-foreground">Generate unique comments for each outfit</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-foreground">Honest Feedback</p>
                    <p className="text-sm text-muted-foreground">AI gives honest suggestions when outfit doesn't match</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border flex justify-end">
                <Button variant="hero">
                  <IconCheck className="w-4 h-4" />
                  Save Settings
                </Button>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-6">Notification Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div>
                    <p className="font-medium text-foreground">Low Stock Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified when products run low</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div>
                    <p className="font-medium text-foreground">New Order Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive alerts for new sales</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div>
                    <p className="font-medium text-foreground">Subscription Reminders</p>
                    <p className="text-sm text-muted-foreground">Get reminders before subscription expires</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-foreground">Email Reports</p>
                    <p className="text-sm text-muted-foreground">Weekly summary reports via email</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          )}

          {/* Tablet Request */}
          {activeTab === 'tablet' && (
            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">Request Additional Tablet</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Need more tablets for your store? Submit a request and our team will process it.
                </p>
                
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="tabletCount">Number of Tablets</Label>
                    <Select defaultValue="1">
                      <SelectTrigger>
                        <SelectValue placeholder="Select quantity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Tablet</SelectItem>
                        <SelectItem value="2">2 Tablets</SelectItem>
                        <SelectItem value="3">3 Tablets</SelectItem>
                        <SelectItem value="4">4 Tablets</SelectItem>
                        <SelectItem value="5">5 Tablets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Request</Label>
                    <Input id="reason" placeholder="e.g., Expanding to new floor, replacement, etc." />
                  </div>
                  <Button variant="hero">
                    Submit Request
                  </Button>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">Request History</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">2 Tablets - New showroom</p>
                      <p className="text-sm text-muted-foreground">Submitted: Jan 10, 2024</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">
                      Approved
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">1 Tablet - Replacement</p>
                      <p className="text-sm text-muted-foreground">Submitted: Dec 15, 2023</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">
                      Delivered
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
