import { Shield, Lock, Truck, RotateCcw } from "lucide-react";

export function TrustBlocks() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="flex flex-col items-center gap-2 rounded-lg border border-zinc-200 bg-white p-4 text-center dark:border-white/10 dark:bg-black">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <Lock className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        </div>
        <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
          Secure Payment
        </div>
        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          SSL Encrypted
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 rounded-lg border border-zinc-200 bg-white p-4 text-center dark:border-white/10 dark:bg-black">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <Shield className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        </div>
        <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
          Protected
        </div>
        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          Your data is safe
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 rounded-lg border border-zinc-200 bg-white p-4 text-center dark:border-white/10 dark:bg-black">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <Truck className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        </div>
        <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
          Fast Shipping
        </div>
        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          Quick delivery
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 rounded-lg border border-zinc-200 bg-white p-4 text-center dark:border-white/10 dark:bg-black">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <RotateCcw className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        </div>
        <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
          Easy Returns
        </div>
        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          Satisfaction guaranteed
        </div>
      </div>
    </div>
  );
}
