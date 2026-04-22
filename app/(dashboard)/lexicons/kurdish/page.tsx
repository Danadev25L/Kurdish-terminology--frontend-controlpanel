"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/hooks/use-api";
import { RoleGate } from "@/components/auth/role-gate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { useToastStore } from "@/stores/toast-store";
import {
  getLexicon,
  createLexiconWord,
  updateLexiconWord,
  deleteLexiconWord,
} from "@/lib/api/lexicons";
import type { LexiconWord, PaginatedResponse } from "@/lib/api/types";
import { useI18n } from "@/i18n/context";
import { Languages, Edit, Trash2, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils/format";

const PARTS_OF_SPEECH = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "preposition",
  "conjunction",
  "interjection",
];

const DIALECTS = [
  "sorani",
  "kurmanji",
  "dimili",
  "hewrami",
  "laki",
  "other",
];

export default function KurdishLexiconPage() {
  const { t } = useI18n();
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingWord, setEditingWord] = useState<LexiconWord | null>(null);
  const [formData, setFormData] = useState({
    word: "",
    part_of_speech: "",
    etymology: "",
    root_word: "",
    dialect_tag: "",
  });

  const { data, refetch } = useApi<PaginatedResponse<LexiconWord>>(
    `/api/v1/lexicons/kurdish?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`
  );

  const words = data?.data ?? [];
  const totalPages = data?.last_page ?? 1;

  const handleCreate = useCallback(async () => {
    if (!formData.word.trim() || !formData.part_of_speech) return;

    setIsLoading(true);
    try {
      await createLexiconWord("kurdish", formData);
      setCreateModalOpen(false);
      setFormData({ word: "", part_of_speech: "", etymology: "", root_word: "", dialect_tag: "" });
      addToast({ type: "success", message: "Word added successfully" });
      refetch();
    } catch {
      addToast({ type: "error", message: "Failed to add word" });
    } finally {
      setIsLoading(false);
    }
  }, [formData, addToast, refetch]);

  const handleUpdate = useCallback(async () => {
    if (!editingWord || !formData.word.trim() || !formData.part_of_speech) return;

    setIsLoading(true);
    try {
      await updateLexiconWord("kurdish", editingWord.id, formData);
      setEditModalOpen(false);
      setEditingWord(null);
      setFormData({ word: "", part_of_speech: "", etymology: "", root_word: "", dialect_tag: "" });
      addToast({ type: "success", message: "Word updated successfully" });
      refetch();
    } catch {
      addToast({ type: "error", message: "Failed to update word" });
    } finally {
      setIsLoading(false);
    }
  }, [editingWord, formData, addToast, refetch]);

  const handleDelete = useCallback(async () => {
    if (deleteId === null) return;

    setIsLoading(true);
    try {
      await deleteLexiconWord("kurdish", deleteId);
      setDeleteId(null);
      addToast({ type: "success", message: "Word deleted successfully" });
      refetch();
    } catch {
      addToast({ type: "error", message: "Failed to delete word" });
    } finally {
      setIsLoading(false);
    }
  }, [deleteId, addToast, refetch]);

  const openEditModal = useCallback((word: LexiconWord) => {
    setEditingWord(word);
    setFormData({
      word: word.word,
      part_of_speech: word.part_of_speech,
      etymology: word.etymology ?? "",
      root_word: word.root_word ?? "",
      dialect_tag: word.dialect_tag ?? "",
    });
    setEditModalOpen(true);
  }, []);

  return (
    <RoleGate roles={["admin", "main_board"]}>
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: t("nav.dashboard"), href: "/dashboard" },
            { label: "Kurdish Lexicon" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">
              Kurdish Lexicon
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Manage Kurdish vocabulary words and their properties
            </p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
              Add Word
          </Button>
        </div>

        {/* Search */}
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search words..."
          className="w-64"
        />

        {/* Words List */}
        {isLoading && !data ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : words.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Languages className="h-12 w-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-muted">
                {search ? "No words match your search" : "No words in the lexicon yet"}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {words.map((word) => (
              <Card key={word.id} padding={false}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-foreground" dir="rtl">
                        {word.word}
                      </h3>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        {word.part_of_speech}
                      </span>
                      {word.dialect_tag && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                          {word.dialect_tag}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-text-muted">
                      <div className="flex gap-4 flex-wrap">
                        {word.etymology && (
                          <span>Etymology: {word.etymology}</span>
                        )}
                        {word.root_word && <span>Root: {word.root_word}</span>}
                        <span className="text-text-muted">
                          Added: {formatDate(word.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(word)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteId(word.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            <Pagination
              currentPage={data?.current_page ?? 1}
              lastPage={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}

        {/* Create Modal */}
        <WordFormModal
          open={createModalOpen}
          onClose={() => {
            setCreateModalOpen(false);
            setFormData({ word: "", part_of_speech: "", etymology: "", root_word: "", dialect_tag: "" });
          }}
          onSubmit={handleCreate}
          formData={formData}
          setFormData={setFormData}
          loading={isLoading}
          title="Add Kurdish Word"
        />

        {/* Edit Modal */}
        <WordFormModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingWord(null);
            setFormData({ word: "", part_of_speech: "", etymology: "", root_word: "", dialect_tag: "" });
          }}
          onSubmit={handleUpdate}
          formData={formData}
          setFormData={setFormData}
          loading={isLoading}
          title="Edit Kurdish Word"
        />

        {/* Delete Confirmation */}
        <ConfirmationDialog
          open={deleteId !== null}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Word"
          message="Are you sure you want to delete this word? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          loading={isLoading}
        />
      </div>
    </RoleGate>
  );
}

interface WordFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: { word: string; part_of_speech: string; etymology: string; root_word: string; dialect_tag: string };
  setFormData: (data: { word: string; part_of_speech: string; etymology: string; root_word: string; dialect_tag: string }) => void;
  loading: boolean;
  title: string;
}

function WordFormModal({
  open,
  onClose,
  onSubmit,
  formData,
  setFormData,
  loading,
  title,
}: WordFormModalProps) {
  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      onConfirm={onSubmit}
      title={title}
      message="Fill in the word details below."
      confirmLabel="Save"
      loading={loading}
    >
      <div className="space-y-3 mt-3">
        <Input
          label="Word (Kurdish)"
          value={formData.word}
          onChange={(e) => setFormData({ ...formData, word: e.target.value })}
          placeholder="Enter the Kurdish word"
          dir="rtl"
          autoFocus
        />
        <Select
          options={[
            { value: "", label: "Select part of speech" },
            ...PARTS_OF_SPEECH.map((pos) => ({ value: pos, label: pos.charAt(0).toUpperCase() + pos.slice(1) })),
          ]}
          value={formData.part_of_speech}
          onChange={(e) => setFormData({ ...formData, part_of_speech: e.target.value })}
          label="Part of Speech"
        />
        <Select
          options={[
            { value: "", label: "Select dialect (optional)" },
            ...DIALECTS.map((d) => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) })),
          ]}
          value={formData.dialect_tag}
          onChange={(e) => setFormData({ ...formData, dialect_tag: e.target.value })}
          label="Dialect"
        />
        <Input
          label="Etymology (optional)"
          value={formData.etymology}
          onChange={(e) => setFormData({ ...formData, etymology: e.target.value })}
          placeholder="Language of origin or derivation"
        />
        <Input
          label="Root Word (optional)"
          value={formData.root_word}
          onChange={(e) => setFormData({ ...formData, root_word: e.target.value })}
          placeholder="Root or base word"
          dir="rtl"
        />
      </div>
    </ConfirmationDialog>
  );
}
