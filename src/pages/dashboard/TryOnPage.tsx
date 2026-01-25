import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  IconCamera, 
  IconSparkles, 
  IconUser, 
  IconPalette,
  IconRuler,
  IconHeart,
  IconShare,
  IconQrcode,
  IconPlayerPlay,
  IconRefresh
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

const suggestedItems = [
  { id: 1, name: 'Silk Saree - Royal Blue', price: '₹4,599', match: 95, image: '🥻' },
  { id: 2, name: 'Designer Lehenga Set', price: '₹12,999', match: 88, image: '👗' },
  { id: 3, name: 'Embroidered Kurti', price: '₹1,299', match: 82, image: '👚' },
  { id: 4, name: 'Gold Necklace - Temple', price: '₹24,999', match: 78, image: '📿' },
];

const detectedFeatures = {
  skinTone: 'Warm Medium',
  bodyType: 'Hourglass',
  height: '5\'4"',
  colors: ['Royal Blue', 'Gold', 'Maroon', 'Pink'],
};

export default function TryOnPage() {
  const [activeTab, setActiveTab] = useState<'capture' | 'results'>('capture');
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Virtual Try-On Studio
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered outfit visualization for your customers
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <IconRefresh className="w-4 h-4" />
            New Session
          </Button>
          <Button variant="gold">
            <IconPlayerPlay className="w-4 h-4" />
            Launch Kiosk
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Panel - Camera/Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Camera View */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 relative flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
                  <IconCamera className="w-10 h-10" />
                </div>
                <p className="font-medium mb-2">Camera Preview</p>
                <p className="text-sm opacity-60">Position customer in frame for optimal detection</p>
              </div>
              
              {/* Detection Overlay */}
              <div className="absolute inset-4 border-2 border-dashed border-primary/30 rounded-xl" />
              
              {/* Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                <Button variant="glass" size="lg">
                  <IconCamera className="w-5 h-5" />
                  Capture
                </Button>
              </div>
            </div>
          </div>

          {/* Detected Features */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <IconSparkles className="w-5 h-5 text-secondary" />
              AI Detection Results
            </h3>
            
            <div className="grid sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-muted/50">
                <IconUser className="w-6 h-6 text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Skin Tone</p>
                <p className="font-medium text-foreground">{detectedFeatures.skinTone}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <IconRuler className="w-6 h-6 text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Body Type</p>
                <p className="font-medium text-foreground">{detectedFeatures.bodyType}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <IconRuler className="w-6 h-6 text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Height Est.</p>
                <p className="font-medium text-foreground">{detectedFeatures.height}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <IconPalette className="w-6 h-6 text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Best Colors</p>
                <div className="flex gap-1 mt-1">
                  {detectedFeatures.colors.slice(0, 3).map((color) => (
                    <span key={color} className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent" title={color} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Try-On Result */}
          {selectedItem && (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-50 relative flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-4">
                    {suggestedItems.find(i => i.id === selectedItem)?.image}
                  </div>
                  <p className="text-xl font-display font-bold text-foreground">
                    Virtual Try-On Preview
                  </p>
                  <p className="text-muted-foreground">
                    {suggestedItems.find(i => i.id === selectedItem)?.name}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                  <Button variant="outline" size="sm">
                    <IconHeart className="w-4 h-4" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm">
                    <IconShare className="w-4 h-4" />
                    Share
                  </Button>
                  <Button variant="hero" size="sm">
                    <IconQrcode className="w-4 h-4" />
                    QR Code
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Suggestions */}
        <div className="space-y-6">
          {/* Suggested Items */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <IconSparkles className="w-5 h-5 text-secondary" />
              AI Suggestions
            </h3>
            
            <div className="space-y-3">
              {suggestedItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedItem === item.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{item.image}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.price}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        item.match >= 90 ? 'text-success' :
                        item.match >= 80 ? 'text-secondary' : 'text-muted-foreground'
                      }`}>
                        {item.match}% match
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Wishlist Summary */}
          <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-6 text-primary-foreground">
            <IconHeart className="w-8 h-8 mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">
              Customer Wishlist
            </h3>
            <p className="text-sm opacity-80 mb-4">
              3 items saved • Ready to share
            </p>
            <div className="flex gap-2">
              <Button variant="glass" size="sm">
                <IconQrcode className="w-4 h-4" />
                Generate QR
              </Button>
              <Button variant="glass" size="sm">
                <IconShare className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>

          {/* AI Voice Assistant */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">
              AI Assistant
            </h3>
            <div className="p-4 rounded-xl bg-muted/50 italic text-muted-foreground">
              "Wow, yeh dress aap pe kaafi elegant lag raha hai! 
              The royal blue color really complements your skin tone."
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1">
                Hindi
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                English
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Hinglish
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
