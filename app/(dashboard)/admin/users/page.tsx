"use client";

import { useState, useCallback } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { SkeletonTable } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { createUser, assignRoles, deleteUser as deleteUserApi } from "@/lib/api/users";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useToastStore } from "@/stores/toast-store";
import type { User, PaginatedResponse } from "@/lib/api/types";
import { useI18n } from "@/i18n/context";

const allRoles = ["admin", "main_board", "domain-head", "expert"];

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const addToast = useToastStore((s) => s.addToast);
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null);

  const { data, isLoading, refetch } = useApi<PaginatedResponse<User>>(
    `/api/v1/admin/users?page=${page}`
  );

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setCreating(true);
      try {
        const user = await createUser(createForm);
        if (selectedRole) {
          await assignRoles(user.id, [selectedRole]);
        }
        setCreateOpen(false);
        setCreateForm({ name: "", email: "", password: "" });
        setSelectedRole("");
        refetch();
        addToast({ type: "success", message: t("messages.user_created") });
      } catch {
        addToast({ type: "error", message: t("messages.user_create_failed") });
      } finally {
        setCreating(false);
      }
    },
    [createForm, selectedRole, refetch, addToast]
  );

  const confirmDelete = useCallback(
    async () => {
      if (!deleteUser) return;
      setDeleting(true);
      try {
        await deleteUserApi(deleteUser.id);
        setDeleteUser(null);
        refetch();
        addToast({ type: "success", message: t("messages.user_deleted") });
      } catch {
        addToast({ type: "error", message: t("messages.user_delete_failed") });
      } finally {
        setDeleting(false);
      }
    },
    [deleteUser, refetch, addToast]
  );

  const handleRoleChange = useCallback(
    async (user: User, e: React.ChangeEvent<HTMLSelectElement>) => {
      const newRole = e.target.value;
      setUpdatingRoleId(user.id);
      try {
        await assignRoles(user.id, newRole ? [newRole] : []);
        refetch();
        addToast({ type: "success", message: t("messages.role_updated") });
      } catch {
        addToast({ type: "error", message: t("messages.role_update_failed") });
        e.target.value = user.roles[0] ?? "";
      } finally {
        setUpdatingRoleId(null);
      }
    },
    [refetch, addToast]
  );

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t("nav.admin"), href: "/admin" }, { label: t("admin.users.title") }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">{t("admin.users.title")}</h1>
        <Button onClick={() => setCreateOpen(true)}>{t("admin.users.create_user")}</Button>
      </div>

      {isLoading ? (
        <SkeletonTable rows={6} />
      ) : data?.data && data.data.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface-raised">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light bg-surface text-start text-[11px] font-semibold uppercase tracking-[0.05em] text-text-muted">
                  <th className="px-4 py-3">{t("common.name")}</th>
                  <th className="px-4 py-3">{t("common.email")}</th>
                  <th className="px-4 py-3">{t("common.roles")}</th>
                  <th className="px-4 py-3">{t("common.created")}</th>
                  <th className="px-4 py-3">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((user) => (
                  <tr key={user.id} className="border-b border-border-light">
                    <td className="px-4 py-3 font-semibold">{user.name}</td>
                    <td className="px-4 py-3 text-[13px] text-text-muted">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      {user.id !== currentUser?.id ? (
                        <Select
                          options={[
                            { value: "", label: `— ${t("admin.users.no_role")} —` },
                            ...allRoles.map((r) => ({ value: r, label: t(`roles.${r.replace("-", "_")}`) ?? r.replace(/_/g, " ") })),
                          ]}
                          value={user.roles[0] ?? ""}
                          onChange={(e) => handleRoleChange(user, e)}
                          disabled={updatingRoleId === user.id}
                          className="w-36"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge key={role} variant="primary">
                              {role.replace(/_/g, " ")}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-text-muted">
                      {user.created_at}
                    </td>
                    <td className="px-4 py-3">
                      {user.id !== currentUser?.id && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteUser(user)}
                        >
                          {t("common.delete")}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={data.current_page}
            lastPage={data.last_page}
            onPageChange={setPage}
          />
        </>
      ) : (
        <p className="py-8 text-center text-[13px] text-text-muted">{t("admin.users.no_users")}</p>
      )}

      {/* Create user modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={t("admin.users.create_user")}>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label={t("common.name")}
            value={createForm.name}
            onChange={(e) =>
              setCreateForm((f) => ({ ...f, name: e.target.value }))
            }
            required
          />
          <Input
            label={t("common.email")}
            type="email"
            value={createForm.email}
            onChange={(e) =>
              setCreateForm((f) => ({ ...f, email: e.target.value }))
            }
            required
          />
          <Input
            label={t("admin.users.password")}
            type="password"
            value={createForm.password}
            onChange={(e) =>
              setCreateForm((f) => ({ ...f, password: e.target.value }))
            }
            required
          />
          <Select
            label={t("common.roles")}
            options={[
              { value: "", label: `— ${t("admin.users.no_role")} —` },
              ...allRoles.map((r) => ({ value: r, label: t(`roles.${r.replace("-", "_")}`) ?? r.replace(/_/g, " ") })),
            ]}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          />
          <Button type="submit" loading={creating} className="w-full">
            {t("admin.users.create_user")}
          </Button>
        </form>
      </Modal>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        open={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={confirmDelete}
        title={t("admin.users.delete_user")}
        message={t("admin.users.delete_confirm", { name: deleteUser?.name ?? "" })}
        confirmLabel={t("common.delete")}
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
