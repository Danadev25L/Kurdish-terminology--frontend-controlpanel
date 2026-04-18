"use client";

import { useParams } from "next/navigation";
import { useApi } from "@/lib/hooks/use-api";
import { useRole } from "@/lib/hooks/use-role";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Avatar } from "@/components/ui/avatar";
import { RoleGate } from "@/components/auth/role-gate";
import type { Domain, DomainMember } from "@/lib/api/types";

export default function DomainDetailPage() {
  const params = useParams();
  const domainId = params.id as string;
  const { isAdmin, isDomainHead } = useRole();
  const canManage = isAdmin || isDomainHead;

  const { data: domain, isLoading } = useApi<Domain>(`/api/domains/${domainId}`);
  const { data: members } = useApi<DomainMember[]>(
    `/api/domains/${domainId}/members`
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!domain) {
    return <p className="text-center text-muted">Domain not found.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Domain info */}
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {domain.name}
            </h1>
            <p className="mt-1 text-sm text-muted">{domain.description}</p>
          </div>
          <Badge>{domain.slug}</Badge>
        </div>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          {canManage && <Button size="sm">Add Member</Button>}
        </CardHeader>

        {!members || members.length === 0 ? (
          <p className="text-sm text-muted">No members yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-start text-xs font-medium uppercase text-muted">
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Joined</th>
                  {canManage && <th className="px-3 py-2">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr
                    key={member.user_id}
                    className="border-b border-border"
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={member.user?.name ?? "?"} size="sm" />
                        <div>
                          <p className="text-sm font-medium">
                            {member.user?.name}
                          </p>
                          <p className="text-xs text-muted">
                            {member.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {canManage ? (
                        <Select
                          options={[
                            { value: "expert", label: "Expert" },
                            { value: "observer", label: "Observer" },
                          ]}
                          value={member.role}
                          className="w-28"
                        />
                      ) : (
                        <Badge variant={member.role === "expert" ? "primary" : "default"}>
                          {member.role}
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-muted">
                      {member.joined_at}
                    </td>
                    {canManage && (
                      <td className="px-3 py-3">
                        <Button variant="ghost" size="sm">
                          Remove
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
