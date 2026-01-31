# StyleNova - AI-Powered Retail Management Platform

A comprehensive retail management SaaS platform built for fashion boutiques with AI-powered virtual try-on capabilities, POS system, inventory management, and customer engagement features.

## 🌐 Live URLs

- **Published App**: https://stylenova.lovable.app
- **Preview URL**: https://ec80f0cd-bc67-4bb9-90b5-ea67c2d871e9.lovableproject.com

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Tabler Icons, Lucide React
- **QR Codes**: qrcode.react
- **Barcode Scanning**: html5-qrcode
- **Routing**: React Router DOM v6
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation

### Backend (Lovable Cloud / Supabase)
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Edge Functions**: Deno-based serverless functions
- **Real-time**: Supabase Realtime subscriptions

### AI Integration
- **AI Gateway**: Lovable AI Gateway (https://ai.gateway.lovable.dev)
- **Primary Model**: `google/gemini-3-flash-preview` (fast, balanced)
- **Backup Models**: 
  - `google/gemini-2.5-flash` - Multimodal + reasoning
  - `google/gemini-2.5-pro` - Complex reasoning tasks
  - `openai/gpt-5` - High accuracy tasks

### AI Features Powered By
| Feature | Model | Purpose |
|---------|-------|---------|
| Customer Analysis | gemini-3-flash-preview | Skin tone, body type, face shape detection |
| Outfit Comments | gemini-3-flash-preview | Personalized fashion feedback in Hindi/English/Hinglish |
| Product Analysis | gemini-3-flash-preview | eCom product categorization (women's costume/jewellery) |
| Style Recommendations | gemini-3-flash-preview | Color and style suggestions based on features |

---

## 📱 Mobile App Integration Endpoints

Use these endpoints to build a customer-facing mobile app (.apk):

### Base URLs
```
Supabase API: https://shmjlpytbyolhlficnzn.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobWpscHl0YnlvbGhsZmljbnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMTQxNjIsImV4cCI6MjA4NDg5MDE2Mn0.fg0CxMROZR-0rVguouWCGjBajWcfKbu2gNRZvDU1peQ
```

### REST API Endpoints

#### Authentication
```
POST /auth/v1/signup              - Customer signup
POST /auth/v1/token?grant_type=password - Customer login
POST /auth/v1/logout              - Logout
GET  /auth/v1/user                - Get current user
```

#### Customer Order History
```
GET /rest/v1/orders?customer_phone=eq.{phone}&store_id=eq.{storeId}&select=*,order_items(*)
```

#### Loyalty Program
```
GET /rest/v1/loyalty_accounts?customer_phone=eq.{phone}&store_id=eq.{storeId}
GET /rest/v1/loyalty_transactions?loyalty_account_id=eq.{accountId}&order=created_at.desc
GET /rest/v1/loyalty_rewards?store_id=eq.{storeId}&is_active=eq.true
```

#### Public Wishlists
```
GET /rest/v1/wishlists?id=eq.{wishlistId}&is_public=eq.true
GET /rest/v1/wishlist_items?wishlist_id=eq.{wishlistId}&select=*,tryon_results(*)
```

#### Virtual Try-On Results
```
GET /rest/v1/virtual_tryon_results?store_id=eq.{storeId}&is_saved=eq.true
POST /rest/v1/virtual_tryon_results - Save new try-on result
```

#### Store Information
```
GET /rest/v1/stores?id=eq.{storeId}&select=name,brand_name,logo_url,address
```

#### Products (Public View)
```
GET /rest/v1/products?store_id=eq.{storeId}&is_active=eq.true&select=*,product_variants(*)
```

### Edge Functions
```
POST /functions/v1/send-sms       - Send SMS notifications
POST /functions/v1/ai-assistant   - AI-powered assistant (outfit comments, analysis)
```

### AI Assistant Function Parameters
```json
{
  "type": "analyze_customer" | "analyze_product" | "ecom_tryon" | "outfit_comment",
  "context": {
    "customerImage": "base64 image data",
    "productImages": ["array of base64 images"],
    "productUrl": "optional product URL",
    "productDescription": "optional description"
  },
  "language": "english" | "hindi" | "hinglish"
}
```

### Web Pages for Mobile WebView
```
/order-history?phone={phone}&store={storeId}  - Customer purchase history
/wishlist/{wishlistId}                         - Public wishlist view
```

---

## ✨ Features Implemented

### 🏪 Store Management
- Multi-tenant store setup with owner profiles
- Store branding (logo, photos, GST number)
- Role-based access control (Owner, Admin, Staff, Cashier, etc.)
- Subscription plans (Small, Medium, Large stores)

### 📦 Inventory Management
- Product catalog with variants (size, color, SKU)
- Stock quantity tracking with low-stock alerts
- Inventory movement history
- Category management

### 💰 Point of Sale (POS)
- Touch-friendly cart interface
- Barcode scanner integration (camera-based)
- GST (18%) and discount calculations
- Multiple payment methods (Cash, Card, UPI)
- Thermal receipt generation with QR codes
- Customer info capture

### 🎁 Customer Loyalty Program
- Points earned per purchase (10 pts per ₹100)
- Tier system: Bronze → Silver → Gold → Platinum
- Redeemable rewards with discounts
- Points history tracking

### 📱 Kiosk Mode (Customer-Facing)
- Virtual try-on suggestions
- Product browsing from inventory
- Wishlist creation with QR sharing
- Customer phone collection
- SMS notifications for wishlists

### 🪞 Virtual Try-On Studio (NEW)
- **Live Camera Mode**: Real-time camera capture with AI analysis
- **Photo Upload Mode**: Upload and analyze customer photos
  - Skin tone detection
  - Body type estimation
  - Face shape analysis
  - Color recommendations
  - Style suggestions
- **eCom Virtual Try-On**: 
  - Enter product URL or description
  - Upload 3-5 product images from different angles
  - Auto-detect product category (women's costume/jewellery)
  - Virtual try-on with match score
- **Saved Results Gallery**:
  - Save processed try-on results
  - View without reprocessing
  - Raw data preserved for future use

### 📊 Analytics Dashboard
- Daily/Weekly/Monthly revenue charts
- Top-selling products visualization
- Footfall and conversion metrics
- Real-time data from orders

### 🧾 Receipt & QR Features
- Thermal-style receipt generation
- QR code for purchase history access
- Loyalty points display on receipts
- Print functionality

### 📲 SMS Notifications
- Wishlist sharing via SMS
- Hinglish (Hindi + English) message personalization
- Edge function for SMS delivery

### 👥 Staff Management
- Role-based permissions
- Staff invitation system
- Activity tracking

---

## 🗄️ Database Schema

### Core Tables
- `stores` - Store profiles and settings
- `products` - Product catalog
- `product_variants` - Size/color variants with stock
- `product_categories` - Category hierarchy
- `orders` - Sales transactions
- `order_items` - Line items per order
- `inventory_movements` - Stock change history

### User & Auth
- `profiles` - User profile data
- `user_roles` - Role assignments

### Loyalty System
- `loyalty_accounts` - Customer points balance
- `loyalty_transactions` - Points history
- `loyalty_rewards` - Redeemable rewards
- `reward_redemptions` - Redemption records

### Try-On & Wishlist
- `tryon_sessions` - Customer try-on sessions
- `tryon_results` - AI try-on results
- `wishlists` - Customer wishlists
- `wishlist_items` - Wishlist products
- `virtual_tryon_results` - Saved processed try-on images with raw data

### Subscriptions
- `subscription_plans` - Available plans
- `subscriptions` - Store subscriptions
- `tablet_requests` - Hardware requests

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or bun

### Installation
```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project
cd stylenova

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
The project uses Lovable Cloud which auto-configures:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## 📱 Mobile App Development

For building a native mobile app, you can use the API endpoints listed above with any mobile framework (React Native, Flutter, etc.) or use Capacitor for a hybrid approach.

### Capacitor Setup (Optional)
```sh
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init
npx cap add android
npx cap sync
npx cap run android
```

---

## 📄 License

This project is built with [Lovable](https://lovable.dev).

---

## 🔗 Links

- [Lovable Documentation](https://docs.lovable.dev)
- [Supabase Documentation](https://supabase.com/docs)
