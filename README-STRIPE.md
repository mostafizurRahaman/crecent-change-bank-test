# Stripe Payment Integration - Next.js Frontend

This is a secure, PCI-compliant Next.js frontend for testing Stripe payment integration. It demonstrates the **correct approach** to handling payments - with NO raw card data storage on your servers.

## 🎯 What This Project Demonstrates

### ✅ Secure Payment Flow (CORRECT APPROACH)

```
User Flow:
1. Sign Up → 2. Verify OTP → 3. Sign In → 4. Create Profile → 5. Add Payment Method (via Stripe)

Security Benefits:
✅ Card details never touch your server
✅ Only Stripe payment method tokens (pm_xxx) are stored
✅ PCI DSS compliant
✅ Supports 3D Secure authentication
✅ Ready for Apple Pay / Google Pay
```

### ❌ What We DON'T Do (Insecure Approach)

```
❌ Store raw card numbers in database
❌ Store CVV codes
❌ Handle card data on your backend
❌ Mix payment data with profile creation
```

## 🏗️ Project Structure

```
stripe-frontend/
├── app/
│   ├── auth/
│   │   ├── sign-up/page.tsx          # Step 1: User registration
│   │   ├── verify-otp/page.tsx       # Step 2: Email verification
│   │   └── sign-in/page.tsx          # Step 3: Authentication
│   ├── profile/
│   │   └── create/page.tsx           # Step 4: Profile (NO card fields)
│   ├── payment-method/
│   │   └── add/page.tsx              # Step 5: Secure Stripe payment setup
│   ├── dashboard/page.tsx            # Manage payment methods
│   └── page.tsx                      # Landing page
├── lib/
│   ├── api.ts                        # Backend API integration
│   ├── store.ts                      # State management (Zustand)
│   └── stripe.ts                     # Stripe.js initialization
├── components/
│   └── Layout.tsx                    # Shared layout with nav
└── .env.local                        # Environment variables
```

## 🚀 Quick Start

### Prerequisites

1. **Node.js 18+** installed
2. **Backend API running** (Express.js with Stripe integration)
3. **Stripe Account** - Get your API keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd stripe-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your values:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   ```

   **Where to get Stripe keys:**
   - Log in to [Stripe Dashboard](https://dashboard.stripe.com)
   - Go to Developers → API Keys
   - Copy the **Publishable key** (starts with `pk_test_` for test mode)
   - ⚠️ **Never use Secret Key in frontend!**

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 🔐 Complete User Flow

### 1️⃣ Sign Up (`/auth/sign-up`)

- User enters email, password, and selects role (CLIENT or ORGANIZATION)
- Backend sends OTP to email
- **No card details collected here!**

### 2️⃣ Verify OTP (`/auth/verify-otp`)

- User enters 6-digit code from email
- Email verification completes

### 3️⃣ Sign In (`/auth/sign-in`)

- User authenticates with email and password
- Receives JWT token for API requests

### 4️⃣ Create Profile (`/profile/create`)

**CLIENT Profile:**
- Full Name
- Address
- Phone Number

**ORGANIZATION Profile:**
- Organization Name
- Organization Type (Nonprofit, Charity, Social Enterprise)
- Registration Number
- Website
- Address
- Phone Number

**⚠️ Important:** NO card fields here! This is the secure approach.

### 5️⃣ Add Payment Method (`/payment-method/add`)

This is where the magic happens! 🎩✨

**How it works:**

1. **Backend creates SetupIntent:**
   ```typescript
   POST /payment-method/setup-intent
   Response: { clientSecret: "seti_xxx" }
   ```

2. **Frontend displays Stripe Elements:**
   - Stripe.js loads secure card input form
   - Card data is collected directly by Stripe
   - **Card data NEVER touches your server!**

3. **Frontend confirms setup with Stripe:**
   ```typescript
   stripe.confirmSetup({
     elements,
     confirmParams: { /* ... */ }
   })
   ```

4. **Backend receives payment method token:**
   ```typescript
   POST /payment-method
   Body: { stripePaymentMethodId: "pm_xxx", isDefault: true }
   ```

5. **Only token is stored in database:**
   ```
   MongoDB: { stripePaymentMethodId: "pm_1234567890", isDefault: true }
   ```

**Security Benefits:**
- ✅ PCI DSS compliant (Stripe handles PCI)
- ✅ 3D Secure authentication supported
- ✅ Automatic card validation
- ✅ No liability for card data breaches

### 6️⃣ Dashboard (`/dashboard`)

- View all saved payment methods
- Set default card
- Delete cards
- Add more payment methods

## 🧪 Testing with Stripe Test Cards

When testing in development, use these test card numbers:

| Card Number          | Scenario                  | Use Case                    |
|---------------------|---------------------------|-----------------------------|
| `4242 4242 4242 4242` | Success                   | Standard successful payment |
| `4000 0025 0000 3155` | 3D Secure Required        | Test SCA authentication     |
| `4000 0000 0000 9995` | Declined                  | Test payment failure        |

**For any test card:**
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- Postal Code: Any valid code (e.g., 12345)

More test cards: https://stripe.com/docs/testing

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Stripe Integration:** 
  - `@stripe/stripe-js` - Stripe.js library
  - `@stripe/react-stripe-js` - React components for Stripe Elements
- **Form Validation:** React Hook Form + Zod
- **State Management:** Zustand (with persistence)
- **HTTP Client:** Axios

## 📡 API Endpoints

### Authentication

```typescript
POST /auth/sign-up
Body: { email, password, role }

POST /auth/verify-otp
Body: { email, otp }

POST /auth/sign-in
Body: { email, password }
Response: { token, user }

POST /auth/create-profile
Body: { role, name/organizationName, address, phoneNumber, ... }
Headers: { Authorization: "Bearer <token>" }
```

### Payment Methods

```typescript
POST /payment-method/setup-intent
Headers: { Authorization: "Bearer <token>" }
Response: { clientSecret }

POST /payment-method
Body: { stripePaymentMethodId, isDefault }
Headers: { Authorization: "Bearer <token>" }

GET /payment-method
Headers: { Authorization: "Bearer <token>" }
Response: [{ id, last4, brand, expiryMonth, expiryYear, isDefault }]

PATCH /payment-method/:id/set-default
Headers: { Authorization: "Bearer <token>" }

DELETE /payment-method/:id
Headers: { Authorization: "Bearer <token>" }
```

## 🔒 Security Best Practices

### ✅ What This Project Does Right

1. **Stripe Elements Integration:**
   - Card data collected by Stripe's hosted form
   - Never passes through your server

2. **Token-Based Storage:**
   - Only stores Stripe payment method IDs (pm_xxx)
   - No sensitive card data in your database

3. **JWT Authentication:**
   - Secure API access with Bearer tokens
   - Token stored in localStorage and Zustand

4. **Environment Variables:**
   - API keys not hardcoded
   - Uses `NEXT_PUBLIC_` prefix for client-side variables

5. **Input Validation:**
   - Zod schemas for type-safe validation
   - React Hook Form for form state

### 🛡️ Additional Security Recommendations

1. **HTTPS in Production:**
   ```bash
   # Always use HTTPS for production
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

2. **Secure Headers:**
   ```typescript
   // next.config.ts
   headers: async () => [
     {
       source: '/:path*',
       headers: [
         { key: 'X-Content-Type-Options', value: 'nosniff' },
         { key: 'X-Frame-Options', value: 'DENY' },
         { key: 'X-XSS-Protection', value: '1; mode=block' }
       ]
     }
   ]
   ```

3. **Rate Limiting:**
   - Implement rate limiting on backend API
   - Prevent brute force attacks

4. **CORS Configuration:**
   ```typescript
   // Backend - Only allow your frontend domain
   cors({
     origin: 'https://yourdomain.com',
     credentials: true
   })
   ```

## 🐛 Troubleshooting

### Issue: "Failed to initialize payment setup"

**Cause:** Backend not running or incorrect API URL

**Fix:**
1. Check backend is running: `http://localhost:5000/api/health`
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check browser console for CORS errors

### Issue: "Stripe failed to load"

**Cause:** Invalid or missing Stripe publishable key

**Fix:**
1. Verify `.env.local` has correct `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
2. Make sure you're using the **publishable key** (pk_test_...), not secret key
3. Restart dev server after changing `.env.local`

### Issue: "Card validation failed"

**Cause:** Using wrong test card or card details

**Fix:**
1. Use test cards from [Stripe Testing Docs](https://stripe.com/docs/testing)
2. Ensure expiry date is in the future
3. Try `4242 4242 4242 4242` for guaranteed success

### Issue: "Network error" or CORS

**Cause:** Backend CORS not configured for frontend origin

**Fix:**
```typescript
// Backend - app.ts or server.ts
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

## 📚 Learn More

### Stripe Documentation
- [Stripe.js Reference](https://stripe.com/docs/js)
- [SetupIntents Guide](https://stripe.com/docs/payments/setup-intents)
- [Payment Methods API](https://stripe.com/docs/api/payment_methods)
- [Testing Cards](https://stripe.com/docs/testing)

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

### Related Libraries
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [Zustand State](https://zustand-demo.pmnd.rs/)
- [Axios HTTP Client](https://axios-http.com/)

## 🎓 Key Takeaways

1. **Never store raw card data** - Use Stripe tokenization
2. **Separate concerns** - Profile creation ≠ Payment setup
3. **Use Stripe Elements** - Secure, hosted card input
4. **Only store tokens** - payment method IDs, not card details
5. **PCI compliance** - Let Stripe handle it

## 📝 License

This is a demonstration project for educational purposes.

## 🤝 Contributing

This project demonstrates best practices for Stripe integration. Feel free to use it as a reference for your own implementations.

## 💬 Support

For Stripe-related questions:
- [Stripe Support](https://support.stripe.com/)
- [Stripe Discord Community](https://discord.gg/stripe)

For Next.js questions:
- [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)

---

**Built with ❤️ following Stripe's best practices**

Remember: The best security is not storing sensitive data at all! 🔐
