import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { Users, ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface Affiliate {
  id: number;
  affiliate_code: string;
  balance: number;
  /** null = uses the default commission from Affiliate Settings */
  fixed_commission: number | null;
  commission_per_order: number;
  status: "pending" | "active" | "blocked";
  orders: number;
  referrals: number;
  notes: string | null;
  payment: { method?: string; title?: string; account?: string; iban?: string };
  applied_at: string | null;
  user: { name: string | null; email: string | null; phone: string | null };
}

const statusStyle: Record<Affiliate["status"], string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  blocked: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function CommissionCell({ item, defaultCommission }: { item: Affiliate; defaultCommission: number }) {
  const [value, setValue] = useState(item.fixed_commission?.toString() ?? "");

  const save = () => {
    if ((item.fixed_commission?.toString() ?? "") === value) return;
    router.patch(
      route("admin.affiliate.commission", { id: item.id }),
      { fixed_commission: value === "" ? null : value },
      { preserveScroll: true, onSuccess: () => toast.success("Commission updated!") },
    );
  };

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-400">Rs.</span>
      <input
        type="number"
        min={0}
        value={value}
        placeholder={`${defaultCommission} (default)`}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => e.key === "Enter" && save()}
        className="w-28 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />
      <span className="text-xs text-gray-400">/ order</span>
    </div>
  );
}

export default function AffiliateManager({
  affiliates,
  defaultCommission,
}: {
  affiliates: Affiliate[];
  defaultCommission: number;
}) {
  const act = (name: "admin.affiliate.approve" | "admin.affiliate.block", id: number, message: string) => {
    router.patch(route(name, { id }), {}, { preserveScroll: true, onSuccess: () => toast.success(message) });
  };

  const pending = affiliates.filter((a) => a.status === "pending").length;

  return (
    <AppLayout breadcrumbs={[{ title: "Affiliate Management", href: "/admin/affiliates" }]}>
      <Head title="Admin - Manage Affiliates" />

      <div className="p-6 lg:p-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black dark:text-white flex items-center gap-3">
              <Users className="text-blue-600" size={32} />
              Affiliate Partners
            </h1>
            <p className="text-gray-500 mt-1">
              Approve applications from the website, set each partner's commission (Rs per delivered order) or block them.
            </p>
          </div>
          {pending > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-700">
              <Clock size={16} /> {pending} waiting for approval
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                  <th className="px-6 py-5">Partner</th>
                  <th className="px-6 py-5">Code</th>
                  <th className="px-6 py-5">Referrals / Orders</th>
                  <th className="px-6 py-5">Balance</th>
                  <th className="px-6 py-5">Commission</th>
                  <th className="px-6 py-5 text-center">Status</th>
                  <th className="px-6 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {affiliates.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-gray-400">No affiliate applications yet.</td>
                  </tr>
                )}
                {affiliates.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors align-top">
                    <td className="px-6 py-5">
                      <div className="font-bold text-gray-900 dark:text-white">{item.user.name ?? "—"}</div>
                      <div className="text-xs text-gray-400">{item.user.email}</div>
                      <div className="text-xs text-gray-400">{item.user.phone}</div>
                      {item.applied_at && <div className="text-[11px] text-gray-400 mt-1">Applied {item.applied_at}</div>}
                      {item.notes && <div className="mt-2 max-w-xs text-xs text-gray-600 dark:text-gray-300">“{item.notes}”</div>}
                      {Object.keys(item.payment).length > 0 && (
                        <div className="mt-1 text-[11px] text-gray-500">
                          Payout: {[item.payment.method, item.payment.title, item.payment.account, item.payment.iban].filter(Boolean).join(" · ")}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-mono bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold uppercase">
                        {item.affiliate_code}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700 dark:text-gray-300">
                      {item.referrals} / {item.orders}
                    </td>
                    <td className="px-6 py-5 font-black text-gray-900 dark:text-gray-100">
                      Rs. {item.balance.toLocaleString()}
                    </td>
                    <td className="px-6 py-5">
                      <CommissionCell item={item} defaultCommission={defaultCommission} />
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusStyle[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap space-x-2">
                      {item.status !== "active" && (
                        <button
                          onClick={() => act("admin.affiliate.approve", item.id, "Affiliate approved!")}
                          className="inline-flex items-center gap-2 p-2 px-3 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all font-medium"
                        >
                          <ShieldCheck size={18} /> {item.status === "pending" ? "Approve" : "Unblock"}
                        </button>
                      )}
                      {item.status !== "blocked" && (
                        <button
                          onClick={() => act("admin.affiliate.block", item.id, item.status === "pending" ? "Application rejected" : "Affiliate blocked")}
                          className="inline-flex items-center gap-2 p-2 px-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all font-medium"
                        >
                          <ShieldAlert size={18} /> {item.status === "pending" ? "Reject" : "Block"}
                        </button>
                      )}
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
