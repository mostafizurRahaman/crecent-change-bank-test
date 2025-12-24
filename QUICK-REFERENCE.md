# Quick Reference Card

## 🚀 Start Development

```bash
cd stripe-frontend
npm install
cp .env.example .env.local
# Edit .env.local with your Stripe key
npm run dev
```

Open: http://localhost:3000

## 🔑 Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

Get Stripe key: https://dashboard.stripe.com/test/apikeys

## 💳 Test Cards

| Card | Purpose |
|------|---------|
| `4242 4242 4242 4242` | Success ✅ |
| `4000 0000 0000 9995` | Declined ❌ |
| `4000 0025 0000 3155` | 3D Secure 🔒 |

**Details:** Expiry: `12/25`, CVC: `123`, ZIP: `12345`

## 🗺️ Page Routes

```
/                          Landing page
/auth/sign-up             Register
/auth/verify-otp          Verify email
/auth/sign-in             Login
/profile/create           Create profile
/payment-method/add       Add card (Stripe)
/dashboard                Manage cards
```

## 📦 Key Files

```
lib/
  api.ts         → Backend API calls
  store.ts       → Auth state (Zustand)
  stripe.ts      → Stripe.js loader

app/
  auth/          → Sign up, OTP, Sign in
  profile/       → Profile creation
  payment-method/ → Stripe integration
  dashboard/     → Card management
```

## 🔐 Security Checklist

✅ Card data never touches your server  
✅ Only payment method tokens stored  
✅ Stripe Elements for card input  
✅ JWT for API authentication  
✅ HTTPS required in production  

## 🐛 Common Issues

### Backend not running
```bash
curl http://localhost:5000/api/health
```

### Stripe key missing
Check `.env.local` exists and contains `pk_test_`

### CORS error
Backend needs:
```typescript
app.use(cors({ origin: 'http://localhost:3000' }));
```

## 📚 Documentation

- `README-STRIPE.md` - Full guide
- `SETUP.md` - Setup instructions
- `SECURITY-COMPARISON.md` - Old vs new
- `PROJECT-SUMMARY.md` - Overview

## 🔗 Quick Links

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Docs](https://stripe.com/docs)

## ⚡ NPM Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run linter
```

## 🎯 Testing Flow

1. **Sign Up:** `test@example.com` / `password123`
2. **Verify OTP:** Check email or logs
3. **Sign In:** Same credentials
4. **Profile:** Fill name, address, phone
5. **Payment:** Use `4242 4242 4242 4242`
6. **Dashboard:** View and manage cards

## 🔍 Verify Security

Open DevTools → Network Tab

**Should NOT see:**
- ❌ Raw card numbers
- ❌ CVV codes

**Should see:**
- ✅ `pm_` payment method IDs
- ✅ `seti_` setup intent secrets

## 📊 Architecture

```
Browser → Next.js → Backend API
   ↓
Stripe (direct)
```

Card data goes directly to Stripe, not your backend.

## ⚙️ Tech Stack

- Next.js 14 + TypeScript
- Tailwind CSS
- Stripe.js + React Stripe.js
- React Hook Form + Zod
- Zustand + Axios

## 🎓 Key Concepts

1. **SetupIntent** - Stripe object for saving cards
2. **PaymentMethod** - Token representing saved card
3. **Elements** - Stripe's secure card input
4. **Token** - Reference to card (pm_xxx)

## 💡 Remember

> Never store raw card data!  
> Use Stripe tokenization!  
> Let Stripe handle PCI compliance!

---

**Need help?** Check `SETUP.md` for detailed instructions.
