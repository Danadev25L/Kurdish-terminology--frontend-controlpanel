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
import { EditDomainModal } from "@/components/modals/edit-domain-modal";
import { deleteDomain, addDomainMember, removeDomainMember, updateDomainMember } from "@/lib/api/domains";
import { getUsers } from "@/lib/api/users";
import { Modal } from "@/components/ui/modal";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useToastStore } from "@/stores/toast-store";
import { useI18n } from "@/i18n/context";
import type { Domain, DomainMember } from "@/lib/api/types";

export default function DomainDetailPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = params.id as string;
  const { isAdmin, isDomainHead } = useRole();
  const addToast = useToastStore((s) => s.addToast);
  const canManage = isAdmin || isDomainHead;
  const { t } = useI18n();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [removeMember, setRemoveMember] = useState<DomainMember | null>(null);
  const [removing, setRemoving] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedUser, setSelectedUser] = useState<number | "">("");
  const [selectedRole, setSelectedRole] = useState<"expert" | "observer">("expert");

  // Edit domain modal state
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { data: domain, isLoading, refetch } = useApi<Domain>(`/api/v1/domains/${domainId}`);
  const { data: members } = useApi<DomainMember[]>(
    `/api/v1/domains/${domainId}/members`
  );
  const { data: usersData } = useApi<{ data: { id: number; name: string; email: string }[] }>(
    canManage ? `/api/v1/admin/users?per_page=100` : ""
  );

  const handleAddMember = useCallback(async () => {
    if (!selectedUser) return;
    setAdding(true);
    try {
      await addDomainMember(Number(domainId), { user_id: selectedUser, role: selectedRole });
      setAddMemberOpen(false);
      setSelectedUser("");
      setSelectedRole("expert");
      refetch();
      addToast({ type: "success", message: t("messages.member_added") });
    } catch {
      addToast({ type: "error", message: t("messages.member_add_failed") });
    } finally {
      setAdding(false);
    }
  }, [domainId, selectedUser, selectedRole, refetch, addToast]);

  const memberUserIds = new Set(members?.map((m) => m.id));
  const availableUsers = usersData?.data?.filter((u) => !memberUserIds.has(u.id)) ?? [];

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await deleteDomain(domainId);
      addToast({ type: "success", message: t("messages.domain_deleted") });
      router.push("/domains");
    } catch {
      addToast({ type: "error", message: t("messages.domain_delete_failed") });
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
        await removeDomainMember(domainId, removeMember.id);
        setRemoveMember(null);
        refetch();
        addToast({ type: "success", message: t("messages.member_removed") });
      } catch {
        addToast({ type: "error", message: t("messages.member_remove_failed") });
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
        await updateDomainMember(Number(domainId), member.id, { role: newRole });
        refetch();
        addToast({ type: "success", message: t("messages.role_updated") });
      } catch {
        addToast({ type: "error", message: t("messages.role_update_failed") });
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
    return <p className="text-center text-text-muted">{t("domains.not_found")}</p>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t("domains.title"), href: "/domains" }, { label: domain?.name ?? t("domains.title") }]} />
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
            {canManage && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditModalOpen(true)}
              >
                {t("common.edit")}
              </Button>
            )}
            <RoleGate roles={["admin"]}>
              <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
                {t("domains.delete_domain")}
              </Button>
            </RoleGate>
          </div>
        </div>
      </Card>

      {/* Edit Domain Modal */}
      <EditDomainModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        domain={domain}
        onSuccess={refetch}
      />

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle>{t("domains.detail.members")}</CardTitle>
          {canManage && <Button size="sm" onClick={() => setAddMemberOpen(true)}>{t("domains.detail.add_member")}</Button>}
        </CardHeader>

        {!members || members.length === 0 ? (
          <p className="text-[13px] text-text-muted">{t("domains.no_members")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light text-start text-[11px] font-semibold uppercase tracking-[0.05em] text-text-muted">
                  <th key="header-user" className="px-3 py-2">{t("common.user")}</th>
                  <th key="header-role" className="px-3 py-2">{t("common.role")}</th>
                  <th key="header-joined" className="px-3 py-2">{t("common.joined")}</th>
                  {canManage ? <th key="header-actions" className="px-3 py-2">{t("common.actions")}</th> : null}
                </tr>
              </thead>
              <tbody>
                {members.map((member, index) => (
                  <tr
                    key={`member-${member.id ?? index}`}
                    className="border-b border-border-light"
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={member.name ?? "?"} size="sm" />
                        <div>
                          <p className="text-[13px] font-semibold">
                            {member.name}
                          </p>
                          <p className="text-[11px] text-text-muted">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {canManage ? (
                        <Select
                          options={[
                            { value: "expert", label: t("roles.expert") },
                            { value: "observer", label: t("roles.observer") },
                          ]}
                          value={member.role}
                          onChange={(e) => handleRoleChange(member, e)}
                          className="w-28"
                        />
                      ) : (
                        <Badge variant={member.role === "expert" ? "primary" : "default"}>
                          {member.role === "expert" ? t("roles.expert") : t("roles.observer")}
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
                          {t("common.remove")}
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
        title={t("domains.delete_domain")}
        message={t("domains.delete_confirm", { name: domain.name })}
        confirmLabel={t("common.delete")}
        variant="danger"
        loading={deleting}
      />

      {/* Remove member confirmation */}
      <ConfirmationDialog
        open={!!removeMember}
        onClose={() => setRemoveMember(null)}
        onConfirm={confirmRemoveMember}
        title={t("domains.remove_member")}
        message={t("domains.remove_member_confirm", { name: removeMember?.name ?? "" })}
        confirmLabel={t("common.remove")}
        variant="danger"
        loading={removing}
      />

      {/* Add member modal */}
      <Modal open={addMemberOpen} onClose={() => { setAddMemberOpen(false); setSelectedUser(""); }} title={t("domains.detail.add_member")}>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-[13px] font-medium text-gray-700">{t("common.user")}</label>
            <Select
              options={[
                { value: "", label: `— ${t("domains.detail.select_user")} —` },
                ...availableUsers.map((u) => ({ value: String(u.id), label: `${u.name} (${u.email})` })),
              ]}
              value={String(selectedUser)}
              onChange={(e) => setSelectedUser(e.target.value ? Number(e.target.value) : "")}
              className="w-full"
            />
            {availableUsers.length === 0 && (
              <p className="mt-1 text-[11px] text-text-muted">{t("domains.detail.all_users_added")}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-medium text-gray-700">{t("common.role")}</label>
            <Select
              options={[
                { value: "expert", label: t("roles.expert") },
                { value: "observer", label: t("roles.observer") },
              ]}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as "expert" | "observer")}
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => { setAddMemberOpen(false); setSelectedUser(""); }}>{t("common.cancel")}</Button>
            <Button size="sm" disabled={!selectedUser || adding} onClick={handleAddMember}>
              {adding ? "..." : t("domains.detail.add_member")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
