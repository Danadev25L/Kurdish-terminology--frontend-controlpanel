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
import { BookOpen, Edit, Trash2, Plus } from "lucide-react";
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

export default function EnglishLexiconPage() {
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
  });

  const { data, refetch } = useApi<PaginatedResponse<LexiconWord>>(
    `/api/v1/lexicons/english?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`
  );

  const words = data?.data ?? [];
  const totalPages = data?.last_page ?? 1;

  const handleCreate = useCallback(async () => {
    if (!formData.word.trim() || !formData.part_of_speech) return;

    const payload = {
      word: formData.word.trim(),
      part_of_speech: formData.part_of_speech,
      ...(formData.etymology.trim() ? { etymology: formData.etymology.trim() } : {}),
      ...(formData.root_word.trim() ? { root_word: formData.root_word.trim() } : {}),
    };

    setIsLoading(true);
    try {
      await createLexiconWord("english", payload);
      setCreateModalOpen(false);
      setFormData({ word: "", part_of_speech: "", etymology: "", root_word: "" });
      addToast({ type: "success", message: t("messages.source_created") });
      refetch();
    } catch {
      addToast({ type: "error", message: t("messages.source_create_failed") });
    } finally {
      setIsLoading(false);
    }
  }, [formData, addToast, refetch]);

  const handleUpdate = useCallback(async () => {
    if (!editingWord || !formData.word.trim() || !formData.part_of_speech) return;

    const payload = {
      word: formData.word.trim(),
      part_of_speech: formData.part_of_speech,
      ...(formData.etymology.trim() ? { etymology: formData.etymology.trim() } : {}),
      ...(formData.root_word.trim() ? { root_word: formData.root_word.trim() } : {}),
    };

    setIsLoading(true);
    try {
      await updateLexiconWord("english", editingWord.id, payload);
      setEditModalOpen(false);
      setEditingWord(null);
      setFormData({ word: "", part_of_speech: "", etymology: "", root_word: "" });
      addToast({ type: "success", message: t("messages.source_updated") });
      refetch();
    } catch {
      addToast({ type: "error", message: t("messages.source_update_failed") });
    } finally {
      setIsLoading(false);
    }
  }, [editingWord, formData, addToast, refetch, t]);

  const handleDelete = useCallback(async () => {
    if (deleteId === null) return;

    setIsLoading(true);
    try {
      await deleteLexiconWord("english", deleteId);
      setDeleteId(null);
      addToast({ type: "success", message: t("messages.source_deleted") });
      refetch();
    } catch {
      addToast({ type: "error", message: t("messages.source_delete_failed") });
    } finally {
      setIsLoading(false);
    }
  }, [deleteId, addToast, refetch, t]);

  const openEditModal = useCallback((word: LexiconWord) => {
    setEditingWord(word);
    setFormData({
      word: word.word ?? "",
      part_of_speech: word.part_of_speech ?? "",
      etymology: word.etymology ?? "",
      root_word: word.root_word ?? "",
    });
    setEditModalOpen(true);
  }, []);

  return (
    <RoleGate roles={["admin", "main_board"]}>
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: t("nav.dashboard"), href: "/dashboard" },
            { label: t("lexicons_page.english_title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">
              {t("lexicons_page.english_title")}
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              {t("lexicons_page.english_description")}
            </p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("lexicons.add_word")}
          </Button>
        </div>

        {/* Search */}
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder={t("lexicons_page.search_words")}
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
              <BookOpen className="h-12 w-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-muted">
                {search ? t("lexicons_page.no_search_match") : t("lexicons_page.no_words")}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {words.map((word) => (
              <Card key={word.id} padding={false}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {word.word}
                      </h3>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {word.part_of_speech}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-text-muted">
                      <div className="flex gap-4">
                        {word.etymology && (
                          <span>{t("lexicons.etymology")}: {word.etymology}</span>
                        )}
                        {word.root_word && <span>{t("lexicons.root_word")}: {word.root_word}</span>}
                        <span className="text-text-muted">
                          {t("common.created")}: {formatDate(word.created_at)}
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
            setFormData({ word: "", part_of_speech: "", etymology: "", root_word: "" });
          }}
          onSubmit={handleCreate}
          formData={formData}
          setFormData={setFormData}
          loading={isLoading}
          title={t("lexicons_page.add_english_word")}
        />

        {/* Edit Modal */}
        <WordFormModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingWord(null);
            setFormData({ word: "", part_of_speech: "", etymology: "", root_word: "" });
          }}
          onSubmit={handleUpdate}
          formData={formData}
          setFormData={setFormData}
          loading={isLoading}
          title={t("lexicons_page.edit_english_word")}
        />

        {/* Delete Confirmation */}
        <ConfirmationDialog
          open={deleteId !== null}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title={t("lexicons.delete_word")}
          message={t("lexicons_page.delete_message")}
          confirmLabel={t("common.delete")}
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
  formData: { word: string; part_of_speech: string; etymology: string; root_word: string };
  setFormData: (data: { word: string; part_of_speech: string; etymology: string; root_word: string }) => void;
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
  const { t } = useI18n();
  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      onConfirm={onSubmit}
      title={title}
      message={t("lexicons_page.add_english_word")}
      confirmLabel={t("common.save")}
      loading={loading}
    >
      <div className="space-y-3 mt-3">
        <Input
          label={t("lexicons.word")}
          value={formData.word}
          onChange={(e) => setFormData({ ...formData, word: e.target.value })}
          placeholder={t("lexicons.word")}
          autoFocus
        />
        <Select
          options={[
            { value: "", label: t("lexicons.parts_of_speech") },
            ...PARTS_OF_SPEECH.map((pos) => ({ value: pos, label: pos.charAt(0).toUpperCase() + pos.slice(1) })),
          ]}
          value={formData.part_of_speech}
          onChange={(e) => setFormData({ ...formData, part_of_speech: e.target.value })}
          label={t("lexicons.parts_of_speech")}
        />
        <Input
          label={`${t("lexicons.etymology")} (${t("common.notes_optional").replace(/[()]/g, "")})`}
          value={formData.etymology}
          onChange={(e) => setFormData({ ...formData, etymology: e.target.value })}
          placeholder={t("lexicons.etymology")}
        />
        <Input
          label={`${t("lexicons.root_word")} (${t("common.notes_optional").replace(/[()]/g, "")})`}
          value={formData.root_word}
          onChange={(e) => setFormData({ ...formData, root_word: e.target.value })}
          placeholder={t("lexicons.root_word")}
        />
      </div>
    </ConfirmationDialog>
  );
}
