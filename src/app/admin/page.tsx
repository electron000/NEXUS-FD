"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-black font-mono text-[10px] text-zinc-700 uppercase tracking-widest">
      Redirecting to Admin Terminal...
    </div>
  );
}
