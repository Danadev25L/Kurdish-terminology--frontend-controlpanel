"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminSectionProps {
  data: {
    pending_user_approvals: number;
    total_domains: number;
    total_users: number;
    total_concepts: number;
  };
}

export function AdminSection({ data }: AdminSectionProps) {
  const router = useRouter();

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Pending User Approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Pending Users</CardTitle>
        </CardHeader>
        <div className="p-4">
          <p className="text-3xl font-bold text-foreground">{data.pending_user_approvals}</p>
          <p className="text-xs text-text-muted mt-1">Awaiting approval</p>
          {data.pending_user_approvals > 0 && (
            <button
              onClick={() => router.push("/admin/users")}
              className="w-full mt-3 rounded-lg bg-warning px-3 py-1.5 text-xs font-semibold text-white hover:bg-warning/90 transition-colors"
            >
              Review Users
            </button>
          )}
        </div>
      </Card>

      {/* Total Domains */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Domains</CardTitle>
        </CardHeader>
        <div className="p-4">
          <p className="text-3xl font-bold text-foreground">{data.total_domains}</p>
          <p className="text-xs text-text-muted mt-1">Active domains</p>
          <button
            onClick={() => router.push("/admin/domains")}
            className="w-full mt-3 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            Manage
          </button>
        </div>
      </Card>

      {/* Total Users */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Users</CardTitle>
        </CardHeader>
        <div className="p-4">
          <p className="text-3xl font-bold text-foreground">{data.total_users}</p>
          <p className="text-xs text-text-muted mt-1">Registered users</p>
          <button
            onClick={() => router.push("/admin/users")}
            className="w-full mt-3 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            View All
          </button>
        </div>
      </Card>

      {/* Total Concepts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Concepts</CardTitle>
        </CardHeader>
        <div className="p-4">
          <p className="text-3xl font-bold text-foreground">{data.total_concepts}</p>
          <p className="text-xs text-text-muted mt-1">Total concepts</p>
          <button
            onClick={() => router.push("/concepts")}
            className="w-full mt-3 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            Browse
          </button>
        </div>
      </Card>

      {/* Admin Quick Actions */}
      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Administration</CardTitle>
        </CardHeader>
        <div className="p-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <AdminActionButton
            label="User Management"
            onClick={() => router.push("/admin/users")}
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            }
          />
          <AdminActionButton
            label="Domain Management"
            onClick={() => router.push("/admin/domains")}
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
              </svg>
            }
          />
          <AdminActionButton
            label="System Audit"
            onClick={() => router.push("/admin/audit")}
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            }
          />
          <AdminActionButton
            label="Settings"
            onClick={() => router.push("/admin/settings")}
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 018.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
              </svg>
            }
          />
        </div>
      </Card>
    </div>
  );
}

interface AdminActionButtonProps {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
}

function AdminActionButton({ label, onClick, icon }: AdminActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
