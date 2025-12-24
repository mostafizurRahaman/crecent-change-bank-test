# Quick Setup Guide

## 🚦 Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js 18+ installed
- [ ] Backend API running on `http://localhost:5000`
- [ ] Stripe account (free test account works)
- [ ] Stripe API keys from dashboard

## 📋 Setup Steps

### 1. Install Dependencies

```bash
cd stripe-frontend
npm install
```

### 2. Configure Environment

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

**Get your Stripe key:**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy the "Publishable key" (starts with `pk_test_`)
3. Paste it in `.env.local`

### 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## ✅ Test the Complete Flow

### Step 1: Sign Up
- Navigate to http://localhost:3000/auth/sign-up
- Enter email: `test@example.com`
- Enter password: `password123`
- Select role: CLIENT
- Click "Sign Up"

### Step 2: Verify OTP
- Check your email (or backend logs for OTP)
- Enter the 6-digit code
- Click "Verify OTP"

### Step 3: Sign In
- Enter same credentials
- Click "Sign In"

### Step 4: Create Profile
- Fill in your name: `John Doe`
- Enter address: `123 Main St, City, State, ZIP`
- Enter phone: `+1234567890`
- Click "Create Profile & Continue to Payment"

### Step 5: Add Payment Method
- Use test card: `4242 4242 4242 4242`
- Expiry: `12/25`
- CVC: `123`
- Postal code: `12345`
- Click "Add Payment Method"

### Step 6: Dashboard
- View your saved payment method
- Try adding another card
- Set default card
- Delete a card

## 🐛 Common Issues

### Backend Not Running

**Error:** "Network Error" or "Failed to fetch"

**Solution:**
```bash
# Make sure backend is running on port 5000
curl http://localhost:5000/api/health
```

### Stripe Key Not Found

**Error:** "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"

**Solution:**
1. Check `.env.local` exists in project root
2. Verify key starts with `pk_test_`
3. Restart dev server: `npm run dev`

### CORS Errors

**Error:** "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution:**
Update backend CORS config:
```typescript
// Backend
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

## 🎯 What to Test

### Security Features
- [ ] Card details never appear in browser DevTools Network tab
- [ ] Only payment method IDs (pm_xxx) sent to backend
- [ ] Profile creation works WITHOUT card fields

### User Experience
- [ ] Form validation works (try empty fields)
- [ ] Error messages display properly
- [ ] Success states show correctly
- [ ] Navigation flow is intuitive

### Stripe Integration
- [ ] Test successful card (4242 4242 4242 4242)
- [ ] Test declined card (4000 0000 0000 9995)
- [ ] Test 3D Secure card (4000 0025 0000 3155)
- [ ] Card appears in dashboard after adding

## 📊 Architecture Overview

```
┌─────────────┐      ┌──────────────┐      ┌──────────┐
│   Browser   │ ───► │   Next.js    │ ───► │ Backend  │
│             │      │   Frontend   │      │   API    │
└─────────────┘      └──────────────┘      └──────────┘
       │                                          │
       │                                          │
       │             ┌──────────────┐             │
       └────────────►│    Stripe    │◄────────────┘
                     │   (Direct)   │
                     └──────────────┘

Flow:
1. User enters card in browser
2. Card data goes DIRECTLY to Stripe (not your server)
3. Stripe returns payment method token (pm_xxx)
4. Frontend sends token to backend
5. Backend stores only the token
```

## 🔐 Security Verification

### Check Your Implementation

Open browser DevTools and verify:

**✅ GOOD - Should NOT see:**
- Raw card numbers
- CVV codes
- Full card details in network requests

**✅ GOOD - Should see:**
- Payment method IDs like `pm_1234567890`
- Setup intent client secrets like `seti_xxx`
- JWT tokens in Authorization headers

## 🎓 Next Steps

After testing the basic flow:

1. **Add more payment methods** - Test managing multiple cards
2. **Test payment failures** - Use declined test cards
3. **Test 3D Secure** - Use card 4000 0025 0000 3155
4. **Explore dashboard** - Set default, delete cards
5. **Check backend logs** - See what data is stored

## 📚 Additional Resources

- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Backend API Documentation](../backend/README.md)

---

**Ready to test!** Start at http://localhost:3000 🚀
