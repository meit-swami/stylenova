import { motion } from 'framer-motion';
import { 
  IconDownload, 
  IconUserPlus, 
  IconBuildingStore, 
  IconPackage,
  IconUsers,
  IconSparkles
} from '@tabler/icons-react';

const steps = [
  {
    number: '01',
    icon: IconDownload,
    title: 'Download the App',
    description: 'Get StyleNova from the Play Store on your store tablet.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    number: '02',
    icon: IconUserPlus,
    title: 'Sign Up & Choose Plan',
    description: 'Create your account with OTP verification and select your subscription plan.',
    gradient: 'from-primary to-accent',
  },
  {
    number: '03',
    icon: IconBuildingStore,
    title: 'Setup Store Profile',
    description: 'Add your logo, address, GPS location, store photos, and business details.',
    gradient: 'from-secondary to-amber-400',
  },
  {
    number: '04',
    icon: IconPackage,
    title: 'Add Products',
    description: 'Upload your inventory with categories, SKUs, sizes, colors, and pricing.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    number: '05',
    icon: IconUsers,
    title: 'Switch to Customer Mode',
    description: 'Let customers try on outfits virtually, save wishlists, and share their looks!',
    gradient: 'from-rose-500 to-pink-500',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <IconSparkles className="w-4 h-4" />
            <span>Simple Setup</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Get Started in{' '}
            <span className="gradient-text">5 Easy Steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From download to delighted customers in minutes. Our streamlined onboarding 
            gets your store up and running quickly.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connection Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-secondary hidden sm:block" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex items-center gap-8 mb-12 last:mb-0 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Content Card */}
              <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                <div className="bg-card rounded-2xl border border-border p-6 card-hover inline-block text-left">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-4`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Step Number */}
              <div className="relative z-10 w-16 h-16 rounded-full bg-background border-4 border-primary flex items-center justify-center flex-shrink-0">
                <span className="font-display text-xl font-bold text-primary">{step.number}</span>
              </div>

              {/* Spacer for alignment */}
              <div className="flex-1 hidden md:block" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
