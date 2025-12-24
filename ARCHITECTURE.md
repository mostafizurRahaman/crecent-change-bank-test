# System Architecture

## 🏗️ Overall Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Next.js Frontend                       │  │
│  │                   (localhost:3000)                        │  │
│  │                                                           │  │
│  │  Components:                                              │  │
│  │  • Sign Up / Sign In / OTP                               │  │
│  │  • Profile Creation                                       │  │
│  │  • Stripe Elements (Payment)                             │  │
│  │  • Dashboard                                              │  │
│  │                                                           │  │
│  │  State Management:                                        │  │
│  │  • Zustand (auth state)                                  │  │
│  │  • React Hook Form (forms)                               │  │
│  │                                                           │  │
│  │  Libraries:                                               │  │
│  │  • @stripe/stripe-js                                     │  │
│  │  • @stripe/react-stripe-js                              │  │
│  │  • Axios (HTTP client)                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                           │           │
                           │           │
                  (1) API  │           │ (2) Card Data
                  Requests │           │     Direct
                           │           │
                           ▼           ▼
    ┌──────────────────────────┐   ┌──────────────────────────┐
    │   Backend API Server     │   │      Stripe API          │
    │   (localhost:5000)       │   │   (api.stripe.com)       │
    │                          │   │                          │
    │  Express.js + MongoDB    │   │  Payment Processing      │
    │                          │   │  Tokenization            │
    │  Endpoints:              │   │  PCI Compliance          │
    │  • /auth/*               │   │                          │
    │  • /payment-method/*     │   │  Returns:                │
    │                          │   │  • pm_xxx (tokens)       │
    │  Stores:                 │   │  • seti_xxx (intents)    │
    │  • User profiles         │   │                          │
    │  • Payment method tokens │   │                          │
    │    (pm_xxx only)         │   │                          │
    └──────────────────────────┘   └──────────────────────────┘
                │                              │
                └──────────────────────────────┘
                          (3) Webhook
                          (optional)
```

## 🔄 Payment Flow Sequence

### Traditional Flow (OLD - INSECURE ❌)

```
┌────────┐       ┌──────────┐       ┌──────────┐
│ User   │       │ Frontend │       │ Backend  │
└───┬────┘       └────┬─────┘       └────┬─────┘
    │                 │                   │
    │ Enters card     │                   │
    │ 4242 4242...   │                   │
    ├────────────────►│                   │
    │                 │                   │
    │                 │ POST /profile     │
    │                 │ {cardNumber:...}  │
    │                 ├──────────────────►│
    │                 │                   │
    │                 │                   │ Store raw card
    │                 │                   │ in database ❌
    │                 │                   │ INSECURE!
    │                 │                   │
    │                 │  Success          │
    │                 │◄──────────────────┤
    │                 │                   │
```

### Secure Flow (NEW - THIS IMPLEMENTATION ✅)

```
┌────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ User   │   │ Frontend │   │ Backend  │   │  Stripe  │
└───┬────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘
    │             │              │              │
    │             │ 1. Request   │              │
    │             │ SetupIntent  │              │
    │             ├─────────────►│              │
    │             │              │              │
    │             │              │ 2. Create    │
    │             │              │ SetupIntent  │
    │             │              ├─────────────►│
    │             │              │              │
    │             │              │ 3. Return    │
    │             │              │ client_secret│
    │             │              │◄─────────────┤
    │             │ 4. Return    │              │
    │             │ client_secret│              │
    │             │◄─────────────┤              │
    │             │              │              │
    │             │ 5. Load      │              │
    │             │ Stripe       │              │
    │             │ Elements     │              │
    │             │              │              │
    │ 6. Enter    │              │              │
    │ card data   │              │              │
    │ 4242 4242...│              │              │
    ├────────────►│              │              │
    │             │              │              │
    │             │ 7. Submit    │              │
    │             │ (card goes   │              │
    │             │ direct to    │              │
    │             │ Stripe)      │              │
    │             ├──────────────┼─────────────►│
    │             │              │              │
    │             │              │              │ 8. Tokenize
    │             │              │              │ card data
    │             │              │              │
    │             │ 9. Return    │              │
    │             │ pm_xxx token │              │
    │             │◄─────────────┼──────────────┤
    │             │              │              │
    │             │ 10. Save     │              │
    │             │ pm_xxx token │              │
    │             ├─────────────►│              │
    │             │              │              │
    │             │              │ 11. Store    │
    │             │              │ token only   │
    │             │              │ ✅ SECURE!   │
    │             │              │              │
    │             │ 12. Success  │              │
    │             │◄─────────────┤              │
    │             │              │              │
```

## 📦 Component Architecture

### Frontend Component Tree

```
App
│
├── Layout
│   └── Navigation (when authenticated)
│
├── Home (/)
│   └── Landing page with features
│
├── Auth Flow
│   ├── SignUp (/auth/sign-up)
│   ├── VerifyOTP (/auth/verify-otp)
│   └── SignIn (/auth/sign-in)
│
├── Profile
│   └── CreateProfile (/profile/create)
│       ├── ClientForm (name, address, phone)
│       └── OrganizationForm (org details)
│
├── Payment
│   └── AddPaymentMethod (/payment-method/add)
│       └── Stripe Elements
│           ├── PaymentElement (Stripe component)
│           └── CheckoutForm (submission logic)
│
└── Dashboard (/dashboard)
    ├── Payment Methods List
    ├── Add New Card Button
    └── Card Management Actions
```

## 🗄️ Data Models

### Frontend State (Zustand)

```typescript
interface AuthState {
  user: {
    id: string;
    email: string;
    role: 'CLIENT' | 'ORGANIZATION';
    hasProfile: boolean;
  } | null;
  token: string | null;
  setAuth: (user, token) => void;
  logout: () => void;
}
```

### Backend Database Models

```typescript
// User Collection
{
  _id: ObjectId,
  email: string,
  password: string (hashed),
  role: 'CLIENT' | 'ORGANIZATION',
  isVerified: boolean,
  hasProfile: boolean
}

// Client Profile Collection
{
  _id: ObjectId,
  userId: ObjectId,
  name: string,
  address: string,
  phoneNumber: string
  // ✅ NO card fields
}

// Organization Profile Collection
{
  _id: ObjectId,
  userId: ObjectId,
  organizationName: string,
  organizationType: string,
  address: string,
  phoneNumber: string,
  registrationNumber: string,
  website: string
  // ✅ NO card fields
}

// Payment Method Collection
{
  _id: ObjectId,
  userId: ObjectId,
  stripePaymentMethodId: string,  // pm_xxx (TOKEN ONLY)
  last4: string,                   // 4242
  brand: string,                   // visa
  expiryMonth: number,             // 12
  expiryYear: number,              // 2025
  isDefault: boolean
  // ✅ NO raw card data
}
```

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────────┐
│                  Security Layers                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Layer 1: HTTPS (Production)                       │
│  └─► Encrypted transport                           │
│                                                     │
│  Layer 2: JWT Authentication                       │
│  └─► Bearer token in Authorization header          │
│                                                     │
│  Layer 3: Input Validation                         │
│  └─► Zod schemas on frontend                       │
│  └─► Express validators on backend                 │
│                                                     │
│  Layer 4: Stripe Tokenization                      │
│  └─► Card data → Stripe → Token                    │
│  └─► Never store raw card data                     │
│                                                     │
│  Layer 5: PCI Compliance                           │
│  └─► Handled entirely by Stripe                    │
│  └─► Your server is out of PCI scope               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 📡 API Communication

### Request Flow with Authentication

```
┌──────────────────────────────────────────────────────┐
│                  API Request Example                 │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Frontend:                                           │
│  ┌────────────────────────────────────────────────┐ │
│  │ POST /payment-method                           │ │
│  │                                                │ │
│  │ Headers:                                       │ │
│  │   Authorization: Bearer eyJhbGc...            │ │
│  │   Content-Type: application/json              │ │
│  │                                                │ │
│  │ Body:                                          │ │
│  │   {                                            │ │
│  │     stripePaymentMethodId: "pm_1234...",     │ │
│  │     isDefault: true                           │ │
│  │   }                                            │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  Backend:                                            │
│  ┌────────────────────────────────────────────────┐ │
│  │ 1. Verify JWT token                           │ │
│  │ 2. Extract userId from token                  │ │
│  │ 3. Validate payment method ID with Stripe     │ │
│  │ 4. Store only token in database               │ │
│  │ 5. Return success                             │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## 🧩 Technology Stack Layers

```
┌─────────────────────────────────────────────────┐
│              Presentation Layer                 │
│  • React 19                                     │
│  • Next.js 14 (App Router)                      │
│  • Tailwind CSS                                 │
│  • Stripe Elements (UI Components)              │
└─────────────────────────────────────────────────┘
                     ↕
┌─────────────────────────────────────────────────┐
│              Business Logic Layer               │
│  • React Hook Form (Form management)            │
│  • Zod (Validation)                             │
│  • Zustand (State management)                   │
│  • Custom hooks & utilities                     │
└─────────────────────────────────────────────────┘
                     ↕
┌─────────────────────────────────────────────────┐
│              Communication Layer                │
│  • Axios (HTTP client)                          │
│  • Stripe.js (Stripe communication)             │
│  • API interceptors (JWT injection)             │
└─────────────────────────────────────────────────┘
                     ↕
┌─────────────────────────────────────────────────┐
│              External Services                  │
│  • Backend API (Express + MongoDB)              │
│  • Stripe API (Payment processing)              │
└─────────────────────────────────────────────────┘
```

## 🔄 State Management Flow

```
┌────────────────────────────────────────────────────────┐
│                  Zustand Auth Store                    │
│                                                        │
│  Initial State:                                        │
│    user: null                                          │
│    token: null                                         │
│                                                        │
│  After Sign In:                                        │
│    user: { id, email, role, hasProfile }              │
│    token: "eyJhbGc..."                                 │
│                                                        │
│  Persistence:                                          │
│    └─► localStorage (survives page refresh)           │
│                                                        │
│  Actions:                                              │
│    • setAuth(user, token)  - Login                    │
│    • setUser(user)         - Update profile status    │
│    • logout()              - Clear state              │
└────────────────────────────────────────────────────────┘
```

## 📊 Deployment Architecture

### Development

```
┌─────────────────┐     ┌─────────────────┐
│   localhost     │     │   localhost     │
│   :3000         │────►│   :5000         │
│  (Next.js Dev)  │     │  (Express API)  │
└─────────────────┘     └─────────────────┘
         │                       │
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
            ┌─────────────────┐
            │  Stripe Test    │
            │  Environment    │
            └─────────────────┘
```

### Production (Recommended)

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  ┌────────────────┐         ┌────────────────┐  │
│  │  Vercel/       │         │  Render/       │  │
│  │  Netlify       │────────►│  Railway       │  │
│  │                │  HTTPS  │                │  │
│  │  Next.js App   │         │  Express API   │  │
│  └────────────────┘         └────────────────┘  │
│         │                           │            │
│         │                           │            │
│         └──────────┬────────────────┘            │
│                    │                             │
│                    ▼                             │
│           ┌─────────────────┐                    │
│           │  MongoDB Atlas  │                    │
│           │  (Cloud DB)     │                    │
│           └─────────────────┘                    │
│                                                  │
└──────────────────────────────────────────────────┘
                     │
                     ▼
            ┌─────────────────┐
            │  Stripe Live    │
            │  Environment    │
            └─────────────────┘
```

## 🎯 Key Architectural Decisions

### 1. **Separate Payment Flow**
- ✅ Profile creation independent of payment
- ✅ Users can complete profile without card
- ✅ Payment method can be added/updated later

### 2. **Token-Based Storage**
- ✅ Never store sensitive card data
- ✅ Store only Stripe payment method IDs
- ✅ Retrieve card details from Stripe when needed

### 3. **Direct Stripe Communication**
- ✅ Card data goes directly to Stripe
- ✅ Frontend uses Stripe.js library
- ✅ Backend never sees raw card data

### 4. **JWT Authentication**
- ✅ Stateless authentication
- ✅ Token includes user context
- ✅ Easy to scale horizontally

### 5. **Client-Side Routing**
- ✅ Next.js App Router for navigation
- ✅ Client components for interactivity
- ✅ Fast page transitions

## 📚 Further Reading

- [Stripe Architecture Best Practices](https://stripe.com/docs/security/guide)
- [Next.js App Router Architecture](https://nextjs.org/docs/app/building-your-application/routing)
- [PCI DSS Compliance Guide](https://www.pcisecuritystandards.org/)

---

**This architecture ensures maximum security while maintaining developer productivity!** 🚀
