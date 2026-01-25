import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  IconPlayerPlay, 
  IconSparkles, 
  IconDeviceTablet, 
  IconShirt,
  IconChartBar 
} from '@tabler/icons-react';

const stats = [
  { label: 'Active Stores', value: '500+' },
  { label: 'Try-Ons Daily', value: '10K+' },
  { label: 'Conversion Boost', value: '+45%' },
];

export function Hero() {
  return (
    <section className="hero-gradient min-h-screen flex items-center pt-24 pb-12 relative overflow-hidden">
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      
      {/* Floating Elements */}
      <motion.div
        className="absolute top-1/4 left-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 backdrop-blur-xl"
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-20 w-16 h-16 rounded-full bg-gradient-to-br from-secondary/30 to-amber-400/30 backdrop-blur-xl"
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-12 h-12 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 backdrop-blur-xl"
        animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm mb-6"
            >
              <IconSparkles className="w-4 h-4 text-secondary" />
              <span>AI-Powered Virtual Try-On for Retail</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              Transform Your Store with{' '}
              <span className="bg-gradient-to-r from-secondary via-amber-300 to-secondary bg-clip-text text-transparent">
                Virtual Try-On
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-white/70 max-w-xl mx-auto lg:mx-0 mb-8"
            >
              Empower your customers with AI-driven virtual try-on. Boost sales, reduce returns, 
              and deliver a magical shopping experience with StyleNova's all-in-one retail solution.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/signup">
                <Button variant="gold" size="xl">
                  <IconSparkles className="w-5 h-5" />
                  Start Free Trial
                </Button>
              </Link>
              <Button variant="glass" size="xl">
                <IconPlayerPlay className="w-5 h-5" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap gap-8 justify-center lg:justify-start mt-12"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Hero Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Main Device Mockup */}
            <div className="relative mx-auto max-w-lg">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-accent/40 blur-3xl rounded-full" />
              
              {/* Tablet Frame */}
              <motion.div
                className="relative glass rounded-3xl p-3 shadow-2xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl aspect-[4/3] overflow-hidden relative">
                  {/* Screen Content Preview */}
                  <div className="absolute inset-0 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <IconSparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-semibold text-sm">StyleNova</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                      </div>
                    </div>
                    
                    {/* Try-On Preview Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <motion.div
                          key={i}
                          className="aspect-[3/4] rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur border border-white/10"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: 0.8 + i * 0.1 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Feature Cards */}
              <motion.div
                className="absolute -left-16 top-1/4 glass rounded-xl p-4 shadow-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <IconShirt className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">Virtual Try-On</div>
                    <div className="text-white/60 text-xs">AI-Powered</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute -right-12 top-1/3 glass rounded-xl p-4 shadow-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-amber-400 flex items-center justify-center">
                    <IconDeviceTablet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">Kiosk Mode</div>
                    <div className="text-white/60 text-xs">In-Store Ready</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 left-1/4 glass rounded-xl p-4 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.6 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <IconChartBar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">+45% Sales</div>
                    <div className="text-white/60 text-xs">Avg. Increase</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
