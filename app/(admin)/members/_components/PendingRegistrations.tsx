"use client";

import { useEffect, useState } from "react";
import {
  RiCheckLine,
  RiCloseLine,
  RiInboxLine,
  RiRefreshLine,
  RiUserAddLine,
} from "@remixicon/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type RegistrationRequest = {
  id: string;
  name: string;
  email: string;
  usn: string;
  phone: string | null;
  branch: string;
  year: string;
  referral_code: string | null;
  submitted_at: string;
  role?: string;
};

export function PendingRegistrations() {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchRequests() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/registrations", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load registrations");
      setRequests(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load registrations");
    } finally {
      setLoading(false);
    }
  }

  async function review(id: string, action: "approve" | "reject") {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to review registration");
      setRequests((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to review registration");
    } finally {
      setBusyId(null);
    }
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl bg-zinc-900" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
        <div className="flex items-center gap-2">
          <RiUserAddLine className="h-4 w-4 text-red-500" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Pending Registrations
            </h3>
            <p className="text-[10px] text-zinc-500">
              Verify USN details before approval.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={fetchRequests}
          aria-label="Refresh registrations"
        >
          <RiRefreshLine />
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-3 text-xs text-red-200">
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/20 py-14 text-center">
          <RiInboxLine className="mb-3 h-10 w-10 text-zinc-600" />
          <h3 className="text-sm font-bold text-white">No pending requests</h3>
          <p className="mt-1 text-xs text-zinc-500">New student registrations will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {requests.map((request) => {
            const isBusy = busyId === request.id;
            return (
              <div
                key={request.id}
                className="rounded-xl border border-zinc-800/70 bg-zinc-900/35 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-bold text-white">{request.name}</h3>
                      <Badge variant="outline" className="h-5 border-zinc-700 text-[10px] text-zinc-300">
                        {request.branch} Y{request.year}
                      </Badge>
                      <Badge className="h-5 bg-red-950/20 text-red-400 border border-red-900/30 text-[9px] font-black uppercase tracking-wider">
                        Role: {request.role || "student"}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-xs text-zinc-500">{request.email}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {request.usn}
                      {request.phone ? ` - ${request.phone}` : ""}
                    </p>
                    {request.referral_code && (
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-zinc-500">
                        Referral: {request.referral_code}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 bg-emerald-600 text-xs text-white hover:bg-emerald-500"
                    disabled={isBusy}
                    onClick={() => review(request.id, "approve")}
                  >
                    <RiCheckLine data-icon="inline-start" />
                    Approve
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 border-red-900/40 text-xs text-red-300 hover:bg-red-950/20"
                    disabled={isBusy}
                    onClick={() => review(request.id, "reject")}
                  >
                    <RiCloseLine data-icon="inline-start" />
                    Reject
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
