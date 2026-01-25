import { motion } from 'framer-motion';
import { 
  IconCamera, 
  IconHanger, 
  IconReceipt, 
  IconPackage, 
  IconUsers, 
  IconChartPie,
  IconDeviceMobile,
  IconShare,
  IconSparkles
} from '@tabler/icons-react';

const features = [
  {
    icon: IconCamera,
    title: 'AI Virtual Try-On',
    description: 'Customers capture 3-4 images, AI detects skin tone, body size, and preferences to suggest perfect outfits.',
    gradient: 'from-primary to-accent',
  },
  {
    icon: IconHanger,
    title: 'Smart Inventory',
    description: 'Complete product management with SKUs, size/color variants, auto stock updates, and low-stock alerts.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: IconReceipt,
    title: 'POS & Billing',
    description: 'Seamless checkout with cart, discounts, taxes, invoice generation, and receipt printing.',
    gradient: 'from-secondary to-amber-400',
  },
  {
    icon: IconPackage,
    title: 'Product Categories',
    description: 'Organize shirts, jeans, sarees, suits, lehengas, jewellery, and all ladies wear with ease.',
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    icon: IconUsers,
    title: 'Role-Based Access',
    description: 'Create staff roles for product listing, inventory management, finance, and cashier operations.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: IconChartPie,
    title: 'Analytics Dashboard',
    description: 'Track footfall, try-on sessions, top saved products, and conversion metrics in real-time.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: IconDeviceMobile,
    title: 'Kiosk Mode',
    description: 'Dedicated tablet interface for in-store customers with AI voice assistance in Hindi/English.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: IconShare,
    title: 'Wishlist & Share',
    description: 'Customers save looks, generate QR codes, and share their virtual try-on results anywhere.',
    gradient: 'from-indigo-500 to-blue-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Features() {
  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
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
            <span>Powerful Features</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything You Need to{' '}
            <span className="gradient-text">Transform Retail</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From AI-powered virtual try-on to complete inventory and billing management, 
            StyleNova provides all the tools your store needs to succeed.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group"
            >
              <div className="h-full bg-card rounded-2xl border border-border p-6 card-hover">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
