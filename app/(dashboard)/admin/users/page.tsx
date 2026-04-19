"use client";

import { useState, useCallback } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { useAuth } from "@/lib/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { SkeletonTable } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { createUser, assignRoles, deleteUser as deleteUserApi } from "@/lib/api/users";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useToastStore } from "@/stores/toast-store";
import type { User, PaginatedResponse } from "@/lib/api/types";

const allRoles = ["admin", "main_board", "domain-head", "expert"];

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const addToast = useToastStore((s) => s.addToast);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading, refetch } = useApi<PaginatedResponse<User>>(
    `/api/v1/admin/users?page=${page}`
  );

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setCreating(true);
      try {
        const user = await createUser(createForm);
        if (selectedRoles.length > 0) {
          await assignRoles(user.id, selectedRoles);
        }
        setCreateOpen(false);
        setCreateForm({ name: "", email: "", password: "" });
        setSelectedRoles([]);
        refetch();
        addToast({ type: "success", message: "User created" });
      } catch {
        addToast({ type: "error", message: "Failed to create user" });
      } finally {
        setCreating(false);
      }
    },
    [createForm, selectedRoles, refetch, addToast]
  );

  const handleDelete = useCallback(
    async (user: User) => {
      setDeleteUser(user);
    },
    []
  );

  const confirmDelete = useCallback(
    async () => {
      if (!deleteUser) return;
      setDeleting(true);
      try {
        await deleteUserApi(deleteUser.id);
        setDeleteUser(null);
        refetch();
        addToast({ type: "success", message: "User deleted" });
      } catch {
        addToast({ type: "error", message: "Failed to delete user" });
      } finally {
        setDeleting(false);
      }
    },
    [deleteUser, refetch, addToast]
  );

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Users" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">User Management</h1>
        <Button onClick={() => setCreateOpen(true)}>Create User</Button>
      </div>

      {isLoading ? (
        <SkeletonTable rows={6} />
      ) : data?.data && data.data.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface-raised">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light bg-surface text-start text-[11px] font-semibold uppercase tracking-[0.05em] text-text-muted">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Roles</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
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
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge key={role} variant="primary">
                            {role.replace("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-text-muted">
                      {user.created_at}
                    </td>
                    <td className="px-4 py-3">
                      {user.id !== currentUser?.id && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(user)}
                        >
                          Delete
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
        <p className="py-8 text-center text-[13px] text-text-muted">No users found.</p>
      )}

      {/* Create user modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create User">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Name"
            value={createForm.name}
            onChange={(e) =>
              setCreateForm((f) => ({ ...f, name: e.target.value }))
            }
            required
          />
          <Input
            label="Email"
            type="email"
            value={createForm.email}
            onChange={(e) =>
              setCreateForm((f) => ({ ...f, email: e.target.value }))
            }
            required
          />
          <Input
            label="Password"
            type="password"
            value={createForm.password}
            onChange={(e) =>
              setCreateForm((f) => ({ ...f, password: e.target.value }))
            }
            required
          />
          <div>
            <p className="mb-2 text-[14px] font-bold text-text-secondary">Roles</p>
            <div className="flex flex-wrap gap-2">
              {allRoles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedRoles.includes(role)
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-muted hover:bg-surface"
                  }`}
                >
                  {role.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" loading={creating} className="w-full">
            Create User
          </Button>
        </form>
      </Modal>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        open={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={confirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete user "${deleteUser?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
