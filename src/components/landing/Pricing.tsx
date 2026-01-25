import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  IconCheck, 
  IconSparkles, 
  IconDeviceTablet,
  IconBuildingStore
} from '@tabler/icons-react';

const plans = [
  {
    name: 'Small',
    icon: IconBuildingStore,
    description: 'Perfect for boutiques and small retail stores',
    monthlyTotal: '₹18,000',
    monthlyPrice: '₹1,500',
    yearlyPrice: '₹15,000',
    tabletCost: '₹7,000',
    softwareCost: '₹8,000',
    features: [
      'Virtual Try-On (Basic)',
      'Inventory Management',
      'POS & Billing',
      'Up to 500 Products',
      '1 Staff Account',
      'Basic Analytics',
      'Email Support',
    ],
    popular: false,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Medium',
    icon: IconBuildingStore,
    description: 'Ideal for growing retail businesses',
    monthlyTotal: '₹22,000',
    monthlyPrice: '₹1,833',
    yearlyPrice: '₹18,500',
    tabletCost: '₹7,000',
    softwareCost: '₹11,500',
    features: [
      'Virtual Try-On (Advanced)',
      'Inventory Management',
      'POS & Billing',
      'Up to 2,000 Products',
      '5 Staff Accounts',
      'Advanced Analytics',
      'AI Voice Assistant',
      'Wishlist & QR Sharing',
      'Priority Support',
    ],
    popular: true,
    gradient: 'from-primary to-accent',
  },
  {
    name: 'Large',
    icon: IconBuildingStore,
    description: 'For large stores with multiple departments',
    monthlyTotal: '₹30,000',
    monthlyPrice: '₹2,500',
    yearlyPrice: '₹25,500',
    tabletCost: '₹7,000',
    softwareCost: '₹18,500',
    features: [
      'Virtual Try-On (Premium)',
      'Inventory Management',
      'POS & Billing',
      'Unlimited Products',
      'Unlimited Staff Accounts',
      'Full Analytics Suite',
      'AI Voice Assistant (Multi-lang)',
      'Wishlist & QR Sharing',
      '360° View Feature',
      'Multi-Tablet Support',
      'Dedicated Account Manager',
      'Custom Integrations',
    ],
    popular: false,
    gradient: 'from-secondary to-amber-400',
  },
];

export function Pricing() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section id="pricing" className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <IconSparkles className="w-4 h-4" />
            <span>Enterprise Pricing</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Plans That{' '}
            <span className="gradient-text-gold">Scale With You</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Choose the perfect plan for your store. All plans include a tablet device at a subsidized rate.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 rounded-full bg-card border border-border">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                !isYearly ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                isYearly ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-card rounded-2xl border ${
                plan.popular ? 'border-primary shadow-glow' : 'border-border'
              } p-8 card-hover`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mx-auto mb-4`}>
                  <plan.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-foreground mb-1">
                  {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isYearly ? 'one-time yearly payment' : 'per month (12 months)'}
                </div>
                {!isYearly && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Total: {plan.monthlyTotal}/year
                  </div>
                )}
              </div>

              {/* Tablet Info */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 mb-6">
                <IconDeviceTablet className="w-6 h-6 text-primary" />
                <div className="text-sm">
                  <div className="font-medium text-foreground">Tablet Included</div>
                  <div className="text-muted-foreground">Worth ₹15,000 at just {plan.tabletCost}</div>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <IconCheck className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to="/signup" className="block">
                <Button
                  variant={plan.popular ? 'hero' : 'outline'}
                  size="lg"
                  className="w-full"
                >
                  Get Started
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Payment Methods Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12 text-sm text-muted-foreground"
        >
          <p>
            Accept payments via CC swipe, eMandate, Razorpay, and PhonePe. 
            <br className="hidden sm:block" />
            Subscription required for continued access. Lock system applies on expiration.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
