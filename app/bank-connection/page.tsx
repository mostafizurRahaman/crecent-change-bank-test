"use client";

import { useState, useEffect, useCallback } from "react";
import { usePlaidLink } from "react-plaid-link";
import { bankConnectionApi } from "@/lib/api";

interface BankConnection {
   _id: string;
   accountName: string;
   accountType: string;
   institutionName: string;
   isActive: boolean;
   lastSyncAt: string;
}

interface Transaction {
   transaction_id: string;
   amount: number;
   date: string;
   name: string;
   merchant_name?: string;
   category: string[];
   pending: boolean;
}

export default function BankConnectionPage() {
   const [linkToken, setLinkToken] = useState<string | null>(null);
   const [bankConnection, setBankConnection] = useState<BankConnection | null>(
      null
   );
   const [transactions, setTransactions] = useState<Transaction[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [startDate, setStartDate] = useState("");
   const [endDate, setEndDate] = useState("");

   useEffect(() => {
      fetchBankConnection();
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      setStartDate(start.toISOString().split("T")[0]);
      setEndDate(end.toISOString().split("T")[0]);
   }, []);

   const fetchBankConnection = async () => {
      try {
         const response = await bankConnectionApi.getBankConnection();
         if (response.data.success) {
            setBankConnection(response.data.data);
         }
      } catch (err: any) {
         if (err.response?.status !== 404) {
            console.error("Error fetching bank connection:", err);
         }
      }
   };

   const generateLinkToken = async () => {
      try {
         setLoading(true);
         setError(null);
         const response = await bankConnectionApi.generateLinkToken();
         if (response.data.success) {
            setLinkToken(response.data.data.link_token);
         }
      } catch (err: any) {
         setError(
            err.response?.data?.message || "Failed to generate link token"
         );
      } finally {
         setLoading(false);
      }
   };

   const onSuccess = useCallback(async (public_token: string) => {
      console.log({ public_token });
      try {
         setLoading(true);
         const response = await bankConnectionApi.createBankConnection({
            public_token,
         });
         if (response.data.success) {
            setBankConnection(response.data.data);
            setError(null);
         }
      } catch (err: any) {
         setError(
            err.response?.data?.message || "Failed to create bank connection"
         );
      } finally {
         setLoading(false);
      }
   }, []);

   const config = {
      token: linkToken,
      onSuccess,
   };

   const { open, ready } = usePlaidLink(config);

   const handleConnectBank = async () => {
      if (!linkToken) {
         await generateLinkToken();
      }
      if (ready) {
         open();
      }
   };

   const syncTransactions = async () => {
      if (!bankConnection) return;
      try {
         setLoading(true);
         setError(null);
         await bankConnectionApi.syncTransactions(bankConnection._id);
         await fetchTransactions();
      } catch (err: any) {
         setError(err.response?.data?.message || "Failed to sync transactions");
      } finally {
         setLoading(false);
      }
   };

   const fetchTransactions = async () => {
      if (!bankConnection || !startDate || !endDate) return;
      try {
         setLoading(true);
         setError(null);
         const response = await bankConnectionApi.getTransactions(
            bankConnection._id,
            startDate,
            endDate
         );
         if (response.data.success) {
            setTransactions(response.data.data);
         }
      } catch (err: any) {
         setError(
            err.response?.data?.message || "Failed to fetch transactions"
         );
      } finally {
         setLoading(false);
      }
   };

   const revokeConnection = async () => {
      if (!bankConnection) return;
      if (!confirm("Are you sure you want to disconnect your bank account?"))
         return;
      try {
         setLoading(true);
         setError(null);
         await bankConnectionApi.revokeConnection(bankConnection._id);
         setBankConnection(null);
         setTransactions([]);
      } catch (err: any) {
         setError(err.response?.data?.message || "Failed to revoke connection");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      if (linkToken && ready) {
         open();
      }
   }, [linkToken, ready, open]);

   return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
         <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
               <h1 className="text-3xl font-bold">Bank Connection</h1>
               <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg flex items-center gap-2">
                  <span className="font-semibold">🧪 SANDBOX MODE</span>
               </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-6">
               <p className="font-semibold mb-2">Testing with Plaid Sandbox:</p>
               <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>
                     Username:{" "}
                     <code className="bg-blue-100 px-2 py-0.5 rounded">
                        user_good
                     </code>
                  </li>
                  <li>
                     Password:{" "}
                     <code className="bg-blue-100 px-2 py-0.5 rounded">
                        pass_good
                     </code>
                  </li>
                  <li>Select any bank to test the integration</li>
               </ul>
            </div>

            {error && (
               <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
               </div>
            )}

            {!bankConnection ? (
               <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">
                     Connect Your Bank Account
                  </h2>
                  <p className="text-gray-600 mb-6">
                     Securely connect your bank account to view transactions and
                     manage your finances.
                  </p>
                  <button
                     onClick={handleConnectBank}
                     disabled={loading}
                     className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     {loading ? "Loading..." : "Connect Bank Account"}
                  </button>
               </div>
            ) : (
               <>
                  <div className="bg-white rounded-lg shadow p-6 mb-6">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <h2 className="text-xl font-semibold mb-2">
                              Connected Account
                           </h2>
                           <div className="space-y-2">
                              <p className="text-gray-600">
                                 <span className="font-medium">
                                    Institution:
                                 </span>{" "}
                                 {bankConnection.institutionName}
                              </p>
                              <p className="text-gray-600">
                                 <span className="font-medium">Account:</span>{" "}
                                 {bankConnection.accountName}
                              </p>
                              <p className="text-gray-600">
                                 <span className="font-medium">Type:</span>{" "}
                                 {bankConnection.accountType}
                              </p>
                              <p className="text-gray-600">
                                 <span className="font-medium">Status:</span>{" "}
                                 <span
                                    className={
                                       bankConnection.isActive
                                          ? "text-green-600"
                                          : "text-red-600"
                                    }
                                 >
                                    {bankConnection.isActive
                                       ? "Active"
                                       : "Inactive"}
                                 </span>
                              </p>
                              {bankConnection.lastSyncAt && (
                                 <p className="text-gray-600">
                                    <span className="font-medium">
                                       Last Synced:
                                    </span>{" "}
                                    {new Date(
                                       bankConnection.lastSyncAt
                                    ).toLocaleString()}
                                 </p>
                              )}
                           </div>
                        </div>
                        <button
                           onClick={revokeConnection}
                           disabled={loading}
                           className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                        >
                           Disconnect
                        </button>
                     </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6 mb-6">
                     <h2 className="text-xl font-semibold mb-4">
                        Transactions
                     </h2>

                     <div className="flex flex-wrap gap-4 mb-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Date
                           </label>
                           <input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="border border-gray-300 rounded px-3 py-2"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                              End Date
                           </label>
                           <input
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="border border-gray-300 rounded px-3 py-2"
                           />
                        </div>
                        <div className="flex items-end gap-2">
                           <button
                              onClick={fetchTransactions}
                              disabled={loading}
                              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                           >
                              Load Transactions
                           </button>
                           <button
                              onClick={syncTransactions}
                              disabled={loading}
                              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                           >
                              Sync Latest
                           </button>
                        </div>
                     </div>

                     {loading ? (
                        <div className="text-center py-8 text-gray-500">
                           Loading...
                        </div>
                     ) : transactions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                           No transactions found. Click "Load Transactions" to
                           fetch data.
                        </div>
                     ) : (
                        <div className="overflow-x-auto">
                           <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                 <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                       Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                       Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                       Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                       Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                       Status
                                    </th>
                                 </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                 {transactions.map((transaction) => (
                                    <tr key={transaction.transaction_id}>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {new Date(
                                             transaction.date
                                          ).toLocaleDateString()}
                                       </td>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {transaction.merchant_name ||
                                             transaction.name}
                                       </td>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {transaction.category?.join(", ") || "Uncategorized"}
                                       </td>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                          <span
                                             className={
                                                transaction.amount > 0
                                                   ? "text-red-600"
                                                   : "text-green-600"
                                             }
                                          >
                                             $
                                             {Math.abs(
                                                transaction.amount
                                             ).toFixed(2)}
                                          </span>
                                       </td>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm">
                                          <span
                                             className={`px-2 py-1 rounded text-xs ${
                                                transaction.pending
                                                   ? "bg-yellow-100 text-yellow-800"
                                                   : "bg-green-100 text-green-800"
                                             }`}
                                          >
                                             {transaction.pending
                                                ? "Pending"
                                                : "Completed"}
                                          </span>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     )}
                  </div>
               </>
            )}
         </div>
      </div>
   );
}
