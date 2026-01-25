import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconSparkles, 
  IconCamera, 
  IconHeart, 
  IconShare,
  IconArrowLeft,
  IconArrowRight,
  IconRefresh,
  IconMicrophone,
  IconQrcode,
  IconSun,
  IconMoon,
  Icon360,
  IconX
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

const suggestions = [
  { id: 1, name: 'Silk Saree - Royal Blue', price: '₹4,599', match: 95, image: '🥻' },
  { id: 2, name: 'Designer Lehenga', price: '₹12,999', match: 88, image: '👗' },
  { id: 3, name: 'Embroidered Kurti', price: '₹1,299', match: 82, image: '👚' },
  { id: 4, name: 'Gold Necklace', price: '₹24,999', match: 78, image: '📿' },
  { id: 5, name: 'Silk Dupatta', price: '₹899', match: 75, image: '🧣' },
  { id: 6, name: 'Bangles Set', price: '₹499', match: 72, image: '💍' },
];

const wishlistItems = [
  { id: 1, name: 'Silk Saree - Royal Blue', image: '🥻' },
  { id: 2, name: 'Gold Necklace', image: '📿' },
];

export default function KioskMode() {
  const [step, setStep] = useState<'welcome' | 'capture' | 'suggestions' | 'tryon' | 'wishlist'>('welcome');
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [lightMode, setLightMode] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-primary-foreground relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-10" />
      
      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl"
        animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-gradient-to-br from-secondary/20 to-amber-400/20 blur-3xl"
        animate={{ y: [0, 30, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <IconSparkles className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">StyleNova ✨</h1>
            <p className="text-sm opacity-60">Virtual Try-On Experience</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Wishlist Badge */}
          <button className="relative p-3 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
            <IconHeart className="w-6 h-6" />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-xs flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </button>
          
          {/* Exit Button */}
          <a href="/dashboard" className="p-3 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
            <IconX className="w-6 h-6" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 pb-6">
        <AnimatePresence mode="wait">
          {/* Welcome Screen */}
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center min-h-[70vh] text-center"
            >
              <motion.div
                className="w-32 h-32 rounded-3xl bg-gradient-to-br from-secondary to-amber-400 flex items-center justify-center mb-8 shadow-gold"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <IconSparkles className="w-16 h-16" />
              </motion.div>
              
              <h2 className="font-display text-5xl font-bold mb-4">
                Welcome to StyleNova ✨
              </h2>
              <p className="text-xl opacity-70 max-w-md mb-12">
                Try on outfits virtually and discover your perfect look!
              </p>
              
              <Button 
                variant="gold" 
                size="xl" 
                className="text-xl px-12 py-6 h-auto"
                onClick={() => setStep('capture')}
              >
                <IconCamera className="w-7 h-7" />
                Start Your Experience
              </Button>
              
              {/* Language Options */}
              <div className="flex gap-4 mt-12">
                <button className="px-6 py-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors text-sm">
                  English
                </button>
                <button className="px-6 py-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors text-sm">
                  हिंदी
                </button>
                <button className="px-6 py-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors text-sm">
                  Hinglish
                </button>
              </div>
            </motion.div>
          )}

          {/* Capture Screen */}
          {step === 'capture' && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="font-display text-3xl font-bold text-center mb-8">
                Let's capture your look
              </h2>
              
              {/* Camera Frame */}
              <div className="aspect-[4/3] bg-slate-800/50 backdrop-blur-xl rounded-3xl border-2 border-dashed border-white/20 flex items-center justify-center relative overflow-hidden mb-8">
                <div className="text-center">
                  <IconCamera className="w-20 h-20 mx-auto mb-4 opacity-50" />
                  <p className="text-lg opacity-70">Position yourself in the frame</p>
                  <p className="text-sm opacity-50">Stand 3-4 feet away from the camera</p>
                </div>
                
                {/* Corner Guides */}
                <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-white/30 rounded-tl-xl" />
                <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-white/30 rounded-tr-xl" />
                <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-white/30 rounded-bl-xl" />
                <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-white/30 rounded-br-xl" />
              </div>
              
              {/* Controls */}
              <div className="flex justify-center gap-4">
                <Button variant="glass" size="xl" onClick={() => setStep('welcome')}>
                  <IconArrowLeft className="w-5 h-5" />
                  Back
                </Button>
                <Button variant="gold" size="xl" onClick={() => setStep('suggestions')}>
                  <IconCamera className="w-5 h-5" />
                  Capture & Analyze
                </Button>
              </div>
            </motion.div>
          )}

          {/* Suggestions Screen */}
          {step === 'suggestions' && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display text-3xl font-bold">
                    AI-Curated For You ✨
                  </h2>
                  <p className="opacity-70">Based on your style profile</p>
                </div>
                <div className="flex gap-3">
                  <button className="p-3 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
                    <IconMicrophone className="w-6 h-6" />
                  </button>
                  <Button variant="glass" onClick={() => setStep('capture')}>
                    <IconRefresh className="w-5 h-5" />
                    Re-scan
                  </Button>
                </div>
              </div>
              
              {/* AI Voice Message */}
              <div className="bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-xl rounded-2xl p-6 mb-8">
                <p className="text-lg italic">
                  "Wow! Based on your warm skin tone and elegant style, I've picked some beautiful pieces. 
                  The royal blue saree would look stunning on you! 🌟"
                </p>
              </div>
              
              {/* Product Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                {suggestions.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedItem(item.id);
                      setStep('tryon');
                    }}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-left hover:bg-white/20 transition-all border border-white/10"
                  >
                    <div className="text-6xl mb-4">{item.image}</div>
                    <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                    <p className="opacity-70">{item.price}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        item.match >= 90 ? 'bg-success/20 text-success' :
                        item.match >= 80 ? 'bg-secondary/20 text-secondary' :
                        'bg-white/20'
                      }`}>
                        {item.match}% match
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
              
              <div className="flex justify-center">
                <Button variant="glass" size="xl" onClick={() => setStep('wishlist')}>
                  <IconHeart className="w-5 h-5" />
                  View Wishlist ({wishlistItems.length})
                </Button>
              </div>
            </motion.div>
          )}

          {/* Try-On Screen */}
          {step === 'tryon' && selectedItem && (
            <motion.div
              key="tryon"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-5xl mx-auto"
            >
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Try-On Preview */}
                <div className="relative">
                  <div className="aspect-[3/4] bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-xl rounded-3xl flex items-center justify-center relative overflow-hidden">
                    <div className="text-center">
                      <div className="text-9xl mb-4">
                        {suggestions.find(s => s.id === selectedItem)?.image}
                      </div>
                      <p className="text-xl font-display font-bold">Virtual Try-On</p>
                    </div>
                    
                    {/* Light Controls */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                      <button 
                        onClick={() => setLightMode(!lightMode)}
                        className={`p-3 rounded-xl transition-colors ${lightMode ? 'bg-secondary' : 'bg-white/20'}`}
                      >
                        {lightMode ? <IconSun className="w-5 h-5" /> : <IconMoon className="w-5 h-5" />}
                      </button>
                      <button className="p-3 rounded-xl bg-white/20">
                        <Icon360 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Controls */}
                <div className="flex flex-col justify-center">
                  <h2 className="font-display text-3xl font-bold mb-2">
                    {suggestions.find(s => s.id === selectedItem)?.name}
                  </h2>
                  <p className="text-2xl opacity-70 mb-8">
                    {suggestions.find(s => s.id === selectedItem)?.price}
                  </p>
                  
                  <div className="space-y-4">
                    <Button variant="gold" size="xl" className="w-full">
                      <IconHeart className="w-5 h-5" />
                      Add to Wishlist
                    </Button>
                    <Button variant="glass" size="xl" className="w-full">
                      <IconShare className="w-5 h-5" />
                      Share This Look
                    </Button>
                    <Button variant="glass" size="xl" className="w-full">
                      <IconQrcode className="w-5 h-5" />
                      Generate QR Code
                    </Button>
                  </div>
                  
                  <div className="flex gap-4 mt-8">
                    <Button variant="outline" className="flex-1 border-white/20 text-primary-foreground hover:bg-white/10" onClick={() => setStep('suggestions')}>
                      <IconArrowLeft className="w-5 h-5" />
                      Back
                    </Button>
                    <Button variant="outline" className="flex-1 border-white/20 text-primary-foreground hover:bg-white/10">
                      Next Item
                      <IconArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Wishlist Screen */}
          {step === 'wishlist' && (
            <motion.div
              key="wishlist"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="font-display text-3xl font-bold text-center mb-8">
                Your Wishlist ❤️
              </h2>
              
              <div className="space-y-4 mb-8">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 flex items-center gap-6">
                    <div className="text-5xl">{item.image}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                    </div>
                    <button className="p-3 rounded-xl hover:bg-white/20 transition-colors">
                      <IconX className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button variant="glass" size="xl" onClick={() => setStep('suggestions')}>
                  <IconArrowLeft className="w-5 h-5" />
                  Continue Shopping
                </Button>
                <Button variant="gold" size="xl">
                  <IconQrcode className="w-5 h-5" />
                  Get QR & Share
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 text-center text-sm opacity-50">
        Powered by StyleNova ✨ • Developed by Brandzaha Creative Agency with ❤️
      </footer>
    </div>
  );
}
