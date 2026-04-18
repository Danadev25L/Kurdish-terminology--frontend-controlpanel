"use client";

import { useApi } from "@/lib/hooks/use-api";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { RoleGate } from "@/components/auth/role-gate";
import type { Domain } from "@/lib/api/types";

export default function DomainsPage() {
  const router = useRouter();
  const { data: domains, isLoading } = useApi<Domain[]>("/api/domains");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Domains</h1>
        <RoleGate roles={["admin"]}>
          <Button>Add Domain</Button>
        </RoleGate>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : domains && domains.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((domain) => (
            <button
              key={domain.id}
              onClick={() => router.push(`/domains/${domain.id}`)}
              className="text-start"
            >
              <Card className="transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {domain.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted line-clamp-2">
                      {domain.description}
                    </p>
                  </div>
                  <Badge>{domain.slug}</Badge>
                </div>
                <div className="mt-3 flex gap-4 text-xs text-muted">
                  <span>{domain.members_count ?? 0} members</span>
                  <span>{domain.concepts_count ?? 0} concepts</span>
                </div>
              </Card>
            </button>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-muted">
          No domains found.
        </p>
      )}
    </div>
  );
}
