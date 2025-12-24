"use client";

import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
   const { user, logout } = useAuthStore();
   const router = useRouter();

   const handleLogout = () => {
      logout();
      router.push("/auth/sign-in");
   };

   return (
      <div className="min-h-screen bg-gray-50">
         {user && (
            <nav className="bg-white shadow">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between h-16">
                     <div className="flex items-center">
                        <h1 className="text-xl font-bold text-gray-900">
                           Stripe Payment Test
                        </h1>
                     </div>
                     <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-700">
                           {user.email} ({user.role})
                        </span>
                        <button
                           onClick={() => handleLogout()}
                           className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                        >
                           Logout
                        </button>
                     </div>
                  </div>
               </div>
            </nav>
         )}
         <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
         </main>
      </div>
   );
}
