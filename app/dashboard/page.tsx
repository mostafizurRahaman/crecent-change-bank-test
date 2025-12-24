"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { paymentMethodApi } from "@/lib/api";
import Layout from "@/components/Layout";
import Link from "next/link";

interface PaymentMethod {
   id: string;
   last4: string;
   brand: string;
   expiryMonth: number;
   expiryYear: number;
   isDefault: boolean;
}

export default function DashboardPage() {
   const { user } = useAuthStore();
   const router = useRouter();
   const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
   const [isHydrated, setIsHydrated] = useState(false);

   useEffect(() => {
      setIsHydrated(true);
   }, []);

   useEffect(() => {
      if (!isHydrated) return;

      if (!user) {
         router.push("/auth/sign-in");
         return;
      }

      if (!user.hasProfile) {
         router.push("/profile/create");
         return;
      }

      loadPaymentMethods();
   }, [user, router, isHydrated]);

   const loadPaymentMethods = async () => {
      try {
         const response = await paymentMethodApi.getPaymentMethods();
         const data = response.data.data || response.data;
         setPaymentMethods(Array.isArray(data) ? data : []);
      } catch (err: any) {
         setError(
            err.response?.data?.message || "Failed to load payment methods"
         );
         setPaymentMethods([]);
      } finally {
         setLoading(false);
      }
   };

   const handleSetDefault = async (id: string) => {
      try {
         await paymentMethodApi.setDefaultPaymentMethod(id);
         await loadPaymentMethods();
      } catch (err: any) {
         alert(
            err.response?.data?.message ||
               "Failed to set default payment method"
         );
      }
   };

   const handleDelete = async (id: string) => {
      if (!confirm("Are you sure you want to delete this payment method?")) {
         return;
      }

      try {
         await paymentMethodApi.deletePaymentMethod(id);
         await loadPaymentMethods();
      } catch (err: any) {
         alert(
            err.response?.data?.message || "Failed to delete payment method"
         );
      }
   };

   if (!user) {
      return null;
   }

   return (
      <Layout>
         <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-white shadow sm:rounded-lg">
               <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                     Welcome, {user.email}!
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                     Account Type:{" "}
                     <span className="font-semibold">{user.role}</span>
                  </p>
                  <div className="mt-4">
                     <div className="flex items-center">
                        <svg
                           className="h-5 w-5 text-green-500 mr-2"
                           fill="currentColor"
                           viewBox="0 0 20 20"
                        >
                           <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                           />
                        </svg>
                        <span className="text-sm text-green-700 font-medium">
                           Profile Setup Complete
                        </span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Payment Methods Section */}
            <div className="bg-white shadow sm:rounded-lg">
               <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                     <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                           Payment Methods
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                           Manage your saved payment cards
                        </p>
                     </div>
                     <Link
                        href="/payment-method/add"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                     >
                        <svg
                           className="h-5 w-5 mr-2"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                           />
                        </svg>
                        Add New Card
                     </Link>
                  </div>

                  {error && (
                     <div className="mb-4 rounded-md bg-red-50 p-4">
                        <p className="text-sm text-red-800">{error}</p>
                     </div>
                  )}

                  {loading ? (
                     <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p className="mt-2 text-sm text-gray-600">
                           Loading payment methods...
                        </p>
                     </div>
                  ) : paymentMethods.length === 0 ? (
                     <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <svg
                           className="mx-auto h-12 w-12 text-gray-400"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                           />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                           No payment methods
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                           Get started by adding a payment card
                        </p>
                        <div className="mt-6">
                           <Link
                              href="/payment-method/add"
                              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                           >
                              Add Payment Method
                           </Link>
                        </div>
                     </div>
                  ) : (
                     <div className="space-y-4">
                        {paymentMethods?.map((pm) => (
                           <div
                              key={pm._id}
                              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300"
                           >
                              <div className="flex items-center">
                                 <div className="flex-shrink-0">
                                    <svg
                                       className="h-10 w-10 text-gray-400"
                                       fill="none"
                                       stroke="currentColor"
                                       viewBox="0 0 24 24"
                                    >
                                       <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                       />
                                    </svg>
                                 </div>
                                 <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-900">
                                       {pm.type?.toUpperCase() || "CARD"} ••••{" "}
                                       {pm.cardLast4}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                       Expires {pm.cardExpMonth}/{pm.cardExpYear}
                                    </p>
                                    {pm.isDefault && (
                                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          Default
                                       </span>
                                    )}
                                 </div>
                              </div>
                              <div className="flex space-x-2">
                                 {!pm.isDefault && (
                                    <button
                                       onClick={() => handleSetDefault(pm._id)}
                                       className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-900"
                                    >
                                       Set as Default
                                    </button>
                                 )}
                                 <button
                                    onClick={() => handleDelete(pm._id)}
                                    className="px-3 py-1 text-sm text-red-600 hover:text-red-900"
                                 >
                                    Delete
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>

            {/* Security Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
               <div className="flex">
                  <div className="flex-shrink-0">
                     <svg
                        className="h-5 w-5 text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                     >
                        <path
                           fillRule="evenodd"
                           d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                           clipRule="evenodd"
                        />
                     </svg>
                  </div>
                  <div className="ml-3">
                     <h3 className="text-sm font-medium text-blue-800">
                        Secure Implementation ✅
                     </h3>
                     <div className="mt-2 text-sm text-blue-700">
                        <p>
                           This implementation follows PCI DSS standards. Your
                           card details are tokenized by Stripe and never stored
                           on our servers. Only payment method references
                           (pm_xxx) are saved.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </Layout>
   );
}
