import axios from "axios";

const API_URL =
   process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
   baseURL: API_URL,
   headers: {
      "Content-Type": "application/json",
   },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
   const token = localStorage.getItem("token");
   if (token) {
      config.headers.Authorization = `Bearer ${token}`;
   }
   return config;
});

// Auth API
export const authApi = {
   signUp: (data: {
      email: string;
      password: string;
      role: "CLIENT" | "ORGANIZATION";
   }) => api.post("/auth/signup", data),

   verifyOTP: (data: { email: string; otp: string }) =>
      api.post("/auth/verify-signup-otp", data),

   signIn: (data: { email: string; password: string }) =>
      api.post("/auth/signin", data),

   createProfile: (data: any) => {
      const formData = new FormData();
      formData.append("data", JSON.stringify(data));
      return api.post("/auth/create-Profile", formData, {
         headers: {
            "Content-Type": "multipart/form-data",
         },
      });
   },
};

// Payment Method API
export const paymentMethodApi = {
   createSetupIntent: () => api.post("/payment-method/setup-intent"),

   savePaymentMethod: (data: {
      stripePaymentMethodId: string;
      isDefault?: boolean;
   }) => api.post("/payment-method", data),

   getPaymentMethods: () => api.get("/payment-method"),

   setDefaultPaymentMethod: (id: string) =>
      api.patch(`/payment-method/${id}/default`),

   deletePaymentMethod: (id: string) => api.delete(`/payment-method/${id}`),
};

// Bank Connection API
export const bankConnectionApi = {
   generateLinkToken: () => api.post("/bank-connection/link-token"),

   createBankConnection: (data: { public_token: string }) =>
      
      api.post("/bank-connection/", data),

   getBankConnection: () => api.get("/bank-connection/me"),

   syncTransactions: (bankConnectionId: string, data?: { cursor?: string; count?: number }) =>
      api.post(`/bank-connection/${bankConnectionId}/sync`, data || {}),

   getTransactions: (bankConnectionId: string, startDate: string, endDate: string) =>
      api.get(`/bank-connection/${bankConnectionId}/transactions`, {
         params: { startDate, endDate }
      }),

   updateBankConnection: (bankConnectionId: string, data: { isActive: boolean }) =>
      api.patch(`/bank-connection/${bankConnectionId}`, data),

   revokeConnection: (bankConnectionId: string) =>
      api.post(`/bank-connection/${bankConnectionId}/revoke`),
};
