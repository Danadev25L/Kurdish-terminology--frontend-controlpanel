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
import { EditUserModal } from "@/components/modals/edit-user-modal";
import { createUser, assignRoles, deleteUser as deleteUserApi } from "@/lib/api/users";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useToastStore } from "@/stores/toast-store";
import type { User, PaginatedResponse } from "@/lib/api/types";
import { useI18n } from "@/i18n/context";
import { Download } from "lucide-react";

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

  // Edit user modal state
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Reset password state
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);

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

  // Export all users to CSV
  const handleExport = useCallback(() => {
    if (!data?.data) return;

    const csv = [
      ["ID", "Name", "Email", "Roles", "Created At"].join(","),
      ...data.data.map(user => [
        user.id,
        `"${user.name}"`,
        user.email,
        `"${user.roles.join(", ")}"`,
        user.created_at,
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  // Reset password handler
  const handleResetPassword = useCallback(async () => {
    if (!resetPasswordUser || !newPassword) return;

    setResetting(true);
    try {
      // This would need a backend endpoint for password reset
      await fetch(`/api/v1/admin/users/${resetPasswordUser.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      setResetPasswordUser(null);
      setNewPassword("");
      addToast({ type: "success", message: "Password reset successfully" });
    } catch {
      addToast({ type: "error", message: "Failed to reset password" });
    } finally {
      setResetting(false);
    }
  }, [resetPasswordUser, newPassword, addToast]);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t("nav.admin"), href: "/admin" }, { label: t("admin.users.title") }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">{t("admin.users.title")}</h1>
          <p className="mt-1 text-sm text-text-muted">
            {data?.total ?? 0} total users
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExport} disabled={!data?.data.length}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setCreateOpen(true)}>{t("admin.users.create_user")}</Button>
        </div>
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
                  <th className="px-4 py-3 text-end">{t("common.actions")}</th>
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
                    <td className="px-4 py-3 text-end">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditUser(user);
                            setEditModalOpen(true);
                          }}
                        >
                          {t("common.edit")}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setResetPasswordUser(user);
                            setNewPassword("");
                          }}
                        >
                          Reset
                        </Button>
                        {user.id !== currentUser?.id && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setDeleteUser(user)}
                          >
                            {t("common.delete")}
                          </Button>
                        )}
                      </div>
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

      {/* Edit user modal */}
      <EditUserModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditUser(null);
        }}
        user={editUser}
        onSuccess={refetch}
      />

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

      {/* Reset Password Modal */}
      <Modal
        open={!!resetPasswordUser}
        onClose={() => {
          setResetPasswordUser(null);
          setNewPassword("");
        }}
        title={`Reset Password for ${resetPasswordUser?.name}`}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }} className="space-y-4">
          <p className="text-sm text-text-muted">
            Set a new password for <strong>{resetPasswordUser?.email}</strong>
          </p>
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
            minLength={8}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setResetPasswordUser(null);
                setNewPassword("");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={resetting} disabled={!newPassword || newPassword.length < 8}>
              Reset Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
