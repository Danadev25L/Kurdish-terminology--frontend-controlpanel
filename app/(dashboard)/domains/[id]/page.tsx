"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/lib/hooks/use-api";
import { useRole } from "@/lib/hooks/use-role";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Avatar } from "@/components/ui/avatar";
import { RoleGate } from "@/components/auth/role-gate";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { deleteDomain, removeDomainMember, updateDomainMember } from "@/lib/api/domains";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useToastStore } from "@/stores/toast-store";
import type { Domain, DomainMember } from "@/lib/api/types";

export default function DomainDetailPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = params.id as string;
  const { isAdmin, isDomainHead } = useRole();
  const addToast = useToastStore((s) => s.addToast);
  const canManage = isAdmin || isDomainHead;

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [removeMember, setRemoveMember] = useState<DomainMember | null>(null);
  const [removing, setRemoving] = useState(false);

  const { data: domain, isLoading, refetch } = useApi<Domain>(`/api/v1/domains/${domainId}`);
  const { data: members } = useApi<DomainMember[]>(
    `/api/v1/domains/${domainId}/members`
  );

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await deleteDomain(domainId);
      addToast({ type: "success", message: "Domain deleted" });
      router.push("/domains");
    } catch {
      addToast({ type: "error", message: "Failed to delete domain" });
    } finally {
      setDeleting(false);
    }
  }, [domainId, router, addToast]);

  const handleRemoveMember = useCallback(
    async (member: DomainMember) => {
      setRemoveMember(member);
    },
    []
  );

  const confirmRemoveMember = useCallback(
    async () => {
      if (!removeMember) return;
      setRemoving(true);
      try {
        await removeDomainMember(domainId, removeMember.user_id);
        setRemoveMember(null);
        refetch();
        addToast({ type: "success", message: "Member removed" });
      } catch {
        addToast({ type: "error", message: "Failed to remove member" });
      } finally {
        setRemoving(false);
      }
    },
    [domainId, removeMember, refetch, addToast]
  );

  const handleRoleChange = useCallback(
    async (member: DomainMember, e: React.ChangeEvent<HTMLSelectElement>) => {
      const newRole = e.target.value as "expert" | "observer";
      try {
        await updateDomainMember(Number(domainId), member.user_id, { role: newRole });
        refetch();
        addToast({ type: "success", message: "Role updated" });
      } catch {
        addToast({ type: "error", message: "Failed to update role" });
        // Revert the select to the original value on failure
        e.target.value = member.role;
      }
    },
    [domainId, refetch, addToast]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!domain) {
    return <p className="text-center text-text-muted">Domain not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Domains", href: "/domains" }, { label: domain?.name ?? "Domain" }]} />
      {/* Domain info */}
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">
              {domain.name}
            </h1>
            <p className="mt-1 text-[13px] text-text-muted">{domain.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge>{domain.slug}</Badge>
            <RoleGate roles={["admin"]}>
              <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
                Delete Domain
              </Button>
            </RoleGate>
          </div>
        </div>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          {canManage && <Button size="sm">Add Member</Button>}
        </CardHeader>

        {!members || members.length === 0 ? (
          <p className="text-[13px] text-text-muted">No members yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light text-start text-[11px] font-semibold uppercase tracking-[0.05em] text-text-muted">
                  <th key="header-user" className="px-3 py-2">User</th>
                  <th key="header-role" className="px-3 py-2">Role</th>
                  <th key="header-joined" className="px-3 py-2">Joined</th>
                  {canManage ? <th key="header-actions" className="px-3 py-2">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {members.map((member, index) => (
                  <tr
                    key={`member-${member.user_id ?? index}`}
                    className="border-b border-border-light"
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={member.user?.name ?? "?"} size="sm" />
                        <div>
                          <p className="text-[13px] font-semibold">
                            {member.user?.name}
                          </p>
                          <p className="text-[11px] text-text-muted">
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
                          onChange={(e) => handleRoleChange(member, e)}
                          className="w-28"
                        />
                      ) : (
                        <Badge variant={member.role === "expert" ? "primary" : "default"}>
                          {member.role}
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-3 text-[13px] text-text-muted">
                      {member.joined_at}
                    </td>
                    {canManage ? (
                      <td className="px-3 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member)}
                        >
                          Remove
                        </Button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete domain confirmation */}
      <ConfirmationDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Domain"
        message={`Are you sure you want to delete "${domain.name}"? This will also delete all concepts and candidates associated with this domain. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />

      {/* Remove member confirmation */}
      <ConfirmationDialog
        open={!!removeMember}
        onClose={() => setRemoveMember(null)}
        onConfirm={confirmRemoveMember}
        title="Remove Member"
        message={`Are you sure you want to remove ${removeMember?.user?.name} from this domain?`}
        confirmLabel="Remove"
        variant="danger"
        loading={removing}
      />
    </div>
  );
}
