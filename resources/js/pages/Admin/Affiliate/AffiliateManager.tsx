import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { Users, ShieldCheck, ShieldAlert, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

interface Affiliate {
  id: number;
  affiliate_code: string;
  balance: number;
  commission_rate: number;
  status: string;
  user: { first_name: string; last_name: string; email: string };
}

export default function AffiliateManager({
  affiliates,
}: {
  affiliates: Affiliate[];
}) {
  const toggleStatus = (id: number) => {
    router.patch(
      route("admin.affiliate.updateStatus", { id }),
      {},
      {
        preserveScroll: true,
        onSuccess: () => toast.success("Status updated!"),
      },
    );
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Affiliate Management", href: "/admin/affiliates" },
      ]}
    >
      <Head title="Admin - Manage Affiliates" />

      <div className="p-6 lg:p-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black dark:text-white flex items-center gap-3">
              <Users className="text-blue-600" size={32} />
              Affiliate Partners
            </h1>
            <p className="text-gray-500 mt-1">
              Sytem ke tamam affiliate members ko yahan se manage karein.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                  <th className="px-8 py-5">Partner Details</th>
                  <th className="px-8 py-5">Affiliate Code</th>
                  <th className="px-8 py-5">Current Balance</th>
                  <th className="px-8 py-5">Commission</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {affiliates.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {item.user.first_name} {item.user.last_name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {item.user.email}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-mono bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tighter">
                        {item.affiliate_code}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-black text-gray-900 dark:text-gray-100">
                      Rs. {item.balance.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 font-semibold text-blue-600">
                      {item.commission_rate}%
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          item.status
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {item.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
    onClick={() => toggleStatus(item.id)}
    className={`inline-flex items-center gap-2 p-2 px-3 rounded-xl transition-all shadow-sm font-medium ${
        item.status
        ? "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
        : "bg-green-50 text-green-600 hover:bg-green-600 hover:text-white"
    }`}
    title={item.status ? "Deactivate User" : "Activate User"}
>
    {item.status ? (
        <>
            <ShieldAlert size={18} />
            <span>Block</span>
        </>
    ) : (
        <>
            <ShieldCheck size={18} />
            <span>Allow</span>
        </>
    )}
</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
