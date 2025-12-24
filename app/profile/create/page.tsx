/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";

const clientProfileSchema = z.object({
   role: z.literal("CLIENT"),
   name: z.string().min(1, "Name is required"),
   address: z.string().min(1, "Address is required"),
   phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
   state: z.string().default("Lakshmipur"),
   postalCode: z.string().default("3701"),
});

const organizationProfileSchema = z.object({
   role: z.literal("ORGANIZATION"),
   organizationName: z.string().min(1, "Organization name is required"),
   organizationType: z.enum(["NONPROFIT", "CHARITY", "SOCIAL_ENTERPRISE"]),
   address: z.string().min(1, "Address is required"),
   phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
   registrationNumber: z.string().optional(),
   website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type ClientProfile = z.infer<typeof clientProfileSchema>;
type OrganizationProfile = z.infer<typeof organizationProfileSchema>;
type ProfileForm = ClientProfile | OrganizationProfile;

export default function CreateProfilePage() {
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const [isHydrated, setIsHydrated] = useState(false);
   const { user, setUser } = useAuthStore();
   const router = useRouter();

   const schema =
      user?.role === "CLIENT" ? clientProfileSchema : organizationProfileSchema;

   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useForm<ProfileForm>({
      resolver: zodResolver(schema),
      defaultValues: {
         role: user?.role || "CLIENT",
      },
   });

   useEffect(() => {
      setIsHydrated(true);
   }, []);

   useEffect(() => {
      if (!isHydrated) return;

      if (!user) {
         router.push("/auth/sign-in");
      } else if (user.hasProfile) {
         router.push("/dashboard");
      }
   }, [user, router, isHydrated]);

   const onSubmit = async (data: ProfileForm) => {
      try {
         setLoading(true);
         setError("");

         const response = await authApi.createProfile(data);

         if (user) {
            setUser({ ...user, hasProfile: true });
         }

         router.push("/payment-method/add");
      } catch (err: any) {
         setError(err.response?.data?.message || "Profile creation failed");
      } finally {
         setLoading(false);
      }
   };

   if (!user) {
      return null;
   }

   return (
      <Layout>
         <div className="max-w-2xl mx-auto">
            <div className="bg-white shadow sm:rounded-lg">
               <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                     Create Your Profile
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                     Step 3 of 4: Complete your profile (No card details
                     required yet)
                  </p>

                  {error && (
                     <div className="mt-4 rounded-md bg-red-50 p-4">
                        <p className="text-sm text-red-800">{error}</p>
                     </div>
                  )}

                  <form
                     className="mt-6 space-y-6"
                     onSubmit={handleSubmit(onSubmit)}
                  >
                     <input type="hidden" {...register("role")} />

                     {user.role === "CLIENT" ? (
                        <>
                           <div>
                              <label
                                 htmlFor="name"
                                 className="block text-sm font-medium text-gray-700"
                              >
                                 Full Name *
                              </label>
                              <input
                                 {...register("name")}
                                 type="text"
                                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                 placeholder="John Doe"
                              />
                              {errors.name && (
                                 <p className="mt-1 text-sm text-red-600">
                                    {errors.name.message}
                                 </p>
                              )}
                           </div>
                        </>
                     ) : (
                        <>
                           <div>
                              <label
                                 htmlFor="organizationName"
                                 className="block text-sm font-medium text-gray-700"
                              >
                                 Organization Name *
                              </label>
                              <input
                                 {...register("organizationName")}
                                 type="text"
                                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                 placeholder="My Charity Organization"
                              />
                              {errors.organizationName && (
                                 <p className="mt-1 text-sm text-red-600">
                                    {errors.organizationName.message}
                                 </p>
                              )}
                           </div>

                           <div>
                              <label
                                 htmlFor="organizationType"
                                 className="block text-sm font-medium text-gray-700"
                              >
                                 Organization Type *
                              </label>
                              <select
                                 {...register("organizationType")}
                                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              >
                                 <option value="NONPROFIT">Non-Profit</option>
                                 <option value="CHARITY">Charity</option>
                                 <option value="SOCIAL_ENTERPRISE">
                                    Social Enterprise
                                 </option>
                              </select>
                              {errors.organizationType && (
                                 <p className="mt-1 text-sm text-red-600">
                                    {errors.organizationType.message}
                                 </p>
                              )}
                           </div>

                           <div>
                              <label
                                 htmlFor="registrationNumber"
                                 className="block text-sm font-medium text-gray-700"
                              >
                                 Registration Number
                              </label>
                              <input
                                 {...register("registrationNumber")}
                                 type="text"
                                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                 placeholder="Optional"
                              />
                           </div>

                           <div>
                              <label
                                 htmlFor="website"
                                 className="block text-sm font-medium text-gray-700"
                              >
                                 Website
                              </label>
                              <input
                                 {...register("website")}
                                 type="url"
                                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                 placeholder="https://example.org"
                              />
                              {errors.website && (
                                 <p className="mt-1 text-sm text-red-600">
                                    {errors.website.message}
                                 </p>
                              )}
                           </div>
                        </>
                     )}

                     <div>
                        <label
                           htmlFor="address"
                           className="block text-sm font-medium text-gray-700"
                        >
                           Address *
                        </label>
                        <textarea
                           {...register("address")}
                           rows={3}
                           className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                           placeholder="123 Main St, City, State, ZIP"
                        />
                        {errors.address && (
                           <p className="mt-1 text-sm text-red-600">
                              {errors.address.message}
                           </p>
                        )}
                     </div>

                     <div>
                        <label
                           htmlFor="phoneNumber"
                           className="block text-sm font-medium text-gray-700"
                        >
                           Phone Number *
                        </label>
                        <input
                           {...register("phoneNumber")}
                           type="tel"
                           className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                           placeholder="+1234567890"
                        />
                        {errors.phoneNumber && (
                           <p className="mt-1 text-sm text-red-600">
                              {errors.phoneNumber.message}
                           </p>
                        )}
                     </div>

                     <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <p className="text-sm text-blue-700">
                           ✅ <strong>Secure Payment Setup:</strong> After
                           creating your profile, you'll be redirected to
                           securely add your payment method using Stripe. Your
                           card details will never be stored on our servers.
                        </p>
                     </div>

                     <div className="flex justify-end">
                        <button
                           type="submit"
                           disabled={loading}
                           className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                           {loading
                              ? "Creating Profile..."
                              : "Create Profile & Continue to Payment"}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      </Layout>
   );
}
