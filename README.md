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
- **Image Generation**: `google/gemini-2.5-flash-image` (virtual try-on overlays)
- **Voice TTS**: ElevenLabs Multilingual v2 (Hindi/English/Hinglish)
- **Backup Models**: 
  - `google/gemini-2.5-flash` - Multimodal + reasoning
  - `google/gemini-2.5-pro` - Complex reasoning tasks
  - `openai/gpt-5` - High accuracy tasks

### AI Features Powered By
| Feature | Model/Service | Purpose |
|---------|---------------|---------|
| Customer Analysis | gemini-3-flash-preview | Skin tone, body type, face shape detection |
| Outfit Comments | gemini-3-flash-preview | Personalized fashion feedback in Hindi/English/Hinglish |
| Product Analysis | gemini-3-flash-preview | eCom product categorization (women's costume/jewellery) |
| Style Recommendations | gemini-3-flash-preview | Color and style suggestions based on features |
| **Virtual Try-On Overlay** | gemini-2.5-flash-image | AI-generated image overlay of product on person |
| **Voice AI Stylist** | ElevenLabs Multilingual v2 | Speaks outfit recommendations in Hindi/English/Hinglish |
| Product URL Parsing | fetch-product edge function | Extract product images and details from any eCom URL |

---

## 🪞 Virtual Try-On Studio

### Mode 1: Live Camera Try-On (Inventory Matching)
**Purpose**: Match customer with available store inventory

**Flow**:
1. **Upload Person Photos** (3-5 required)
   - Front view, side view, full body shots from different angles
2. **AI Analyzes Customer Features**
   - Skin tone detection
   - Body type estimation
   - Recommended colors
3. **Automatic Inventory Matching**
   - AI matches customer features with store products
   - Products sorted by match score (%)
   - AI-generated outfit comments
4. **Virtual Overlay**
   - Shows selected product virtually on customer
5. **Save with Customer Info**
   - Full Name, Mobile Number, Address (optional)
   - Result saved for future viewing without reprocessing

### Mode 2: eCom Virtual Try-On
**Purpose**: Try products from any online store

**Flow**:
1. **Step 1: Enter Product URL**
   - Paste any e-commerce product page URL
   - System automatically fetches product images (up to 10)
   - Auto-detects product category:
     - ✅ Women's Costume (saree, lehenga, kurti, dress, gown, suit)
     - ✅ Jewellery (necklace, earrings, bangles, pendant)
     - ❌ Other categories not supported
2. **Step 2: Upload Person Photos** (3-5 required)
   - Front, side, full body from different angles
3. **Step 3: Virtual Try-On Processing**
   - AI generates virtual overlay
   - Match score calculation
   - Personalized AI comment in selected language
4. **Save Result**
   - Collect: Full Name, Mobile Number, Address (optional)
   - Saved for future viewing without reprocessing
   - Raw request/response data preserved

### Mode 3: Saved Looks Gallery
- View all previously saved try-on results
- No reprocessing required
- Access AI comments and match scores

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
GET /rest/v1/tryon_sessions?customer_phone=eq.{phone}&store_id=eq.{storeId}
```

#### Store Information
```
GET /rest/v1/stores?id=eq.{storeId}&select=name,brand_name,logo_url,address
```

#### Products (Public View)
```
GET /rest/v1/products?store_id=eq.{storeId}&is_active=eq.true&select=*,product_variants(*),product_categories(name)
```

### Edge Functions
```
POST /functions/v1/send-sms              - Send SMS notifications
POST /functions/v1/ai-assistant          - AI-powered assistant (outfit comments, analysis)
POST /functions/v1/fetch-product         - Fetch product images from eCom URL
POST /functions/v1/text-to-speech        - Voice AI stylist (ElevenLabs TTS)
POST /functions/v1/generate-tryon-image  - AI image overlay for virtual try-on
```

### Fetch Product Function (NEW)
```json
// Request
POST /functions/v1/fetch-product
{
  "url": "https://example.com/product/beautiful-saree"
}

// Response
{
  "productName": "Beautiful Red Silk Saree",
  "description": "Elegant silk saree with gold zari work",
  "images": ["https://...", "https://...", ...],
  "price": "₹4,999",
  "category": "women_costume" | "jewellery" | "unknown"
}
```

### AI Assistant Function Parameters
```json
{
  "type": "analyze_customer" | "analyze_product" | "ecom_tryon" | "outfit_comment",
  "context": {
    "customerImage": "base64 image data",
    "productImages": ["array of base64 images"],
    "productUrl": "optional product URL",
    "productDescription": "optional description",
    "productName": "product name",
    "productCategory": "women_costume | jewellery",
    "productColors": ["Red", "Gold"]
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

### 🪞 Virtual Try-On Studio
- **Live Camera Mode**: 
  - Upload 3-5 person photos from different angles
  - AI analyzes skin tone, body type, recommended colors
  - Automatic matching with store inventory products
  - Match score and AI outfit comments
  - Virtual overlay of selected outfit
  - Save with customer info (Name, Mobile, Address)
  
- **eCom Virtual Try-On**: 
  - Enter any e-commerce product URL
  - Auto-fetch product images (up to 10)
  - Auto-detect category (women's costume/jewellery only)
  - Upload 3-5 person photos
  - Virtual try-on with match score
  - Save with customer info for future access
  
- **Saved Looks Gallery**:
  - View all saved try-on results
  - No reprocessing required
  - Preserved raw data for debugging

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
- `tryon_sessions` - Customer try-on sessions with detected features
- `tryon_results` - AI try-on results
- `wishlists` - Customer wishlists
- `wishlist_items` - Wishlist products
- `virtual_tryon_results` - Saved processed images with:
  - `customer_image_url` / `customer_image_base64`
  - `product_images[]` - Array of product images
  - `product_url` - Original eCom URL
  - `product_name`, `product_category`
  - `detected_features` - JSON of analyzed features
  - `ai_comment` - AI-generated comment
  - `match_score` - Compatibility percentage
  - `raw_request_data` - Original request for debugging
  - `raw_response_data` - AI response for debugging
  - `is_saved` - Boolean for saved vs temporary
  - `processing_status` - pending/completed/failed

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
