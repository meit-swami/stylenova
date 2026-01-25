import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  IconSparkles, 
  IconPhone, 
  IconLock, 
  IconArrowRight, 
  IconUser,
  IconBuildingStore,
  IconCheck
} from '@tabler/icons-react';

const plans = [
  { id: 'small', name: 'Small', price: '₹15,000/year', description: 'For boutiques' },
  { id: 'medium', name: 'Medium', price: '₹18,500/year', description: 'For growing stores', popular: true },
  { id: 'large', name: 'Large', price: '₹25,500/year', description: 'For large retailers' },
];

export default function Signup() {
  const [step, setStep] = useState<'info' | 'plan' | 'phone' | 'otp'>('info');
  const [formData, setFormData] = useState({
    name: '',
    storeName: '',
    phone: '',
    otp: '',
    plan: 'medium',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (step === 'info') setStep('plan');
    else if (step === 'plan') setStep('phone');
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
    }, 1500);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = '/dashboard';
    }, 1500);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <IconSparkles className="h-6 w-6 text-white" />
            </div>
            <span className="font-display text-xl font-bold">
              Style<span className="gradient-text">Nova</span> ✨
            </span>
          </Link>

          {/* Progress */}
          <div className="flex gap-2 mb-8">
            {['info', 'plan', 'phone', 'otp'].map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  ['info', 'plan', 'phone', 'otp'].indexOf(step) >= i
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {step === 'info' && (
            <>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Create your account
              </h1>
              <p className="text-muted-foreground mb-8">
                Let's get started with your store details
              </p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <div className="relative">
                    <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <div className="relative">
                    <IconBuildingStore className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="storeName"
                      placeholder="Enter your store name"
                      value={formData.storeName}
                      onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <Button onClick={handleNext} variant="hero" size="lg" className="w-full">
                  Continue
                  <IconArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </>
          )}

          {step === 'plan' && (
            <>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Choose your plan
              </h1>
              <p className="text-muted-foreground mb-8">
                Select the plan that fits your store
              </p>

              <div className="space-y-4 mb-8">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setFormData({ ...formData, plan: plan.id })}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      formData.plan === plan.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{plan.name}</span>
                          {plan.popular && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">{plan.price}</div>
                        {formData.plan === plan.id && (
                          <IconCheck className="w-5 h-5 text-primary ml-auto" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <Button onClick={handleNext} variant="hero" size="lg" className="w-full">
                Continue
                <IconArrowRight className="w-5 h-5" />
              </Button>
            </>
          )}

          {step === 'phone' && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Verify your number
              </h1>
              <p className="text-muted-foreground mb-8">
                We'll send you an OTP to verify your identity
              </p>

              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <div className="relative">
                  <IconPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending OTP...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Send OTP
                    <IconArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Enter OTP
              </h1>
              <p className="text-muted-foreground mb-8">
                We sent a code to {formData.phone}
              </p>

              <div className="space-y-2">
                <Label htmlFor="otp">OTP Code</Label>
                <div className="relative">
                  <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                    className="pl-10 h-12 text-center text-xl tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account
                    <IconArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 text-center text-white"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-secondary to-amber-400 flex items-center justify-center mx-auto mb-8 shadow-gold">
            <IconSparkles className="w-12 h-12" />
          </div>
          <h2 className="font-display text-4xl font-bold mb-4">
            Join 500+ Stores<br />Already Growing
          </h2>
          <p className="text-white/70 max-w-sm">
            Get started with the most advanced virtual try-on platform 
            for retail businesses.
          </p>
        </motion.div>

        <motion.div
          className="absolute top-1/4 left-10 w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl"
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-10 w-16 h-16 rounded-full bg-secondary/30 backdrop-blur-xl"
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>
    </div>
  );
}
