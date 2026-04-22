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
import { createSynonym, deleteSynonym } from "@/lib/api/synonyms";
import type { LexiconWord, PaginatedResponse, LexiconSynonym } from "@/lib/api/types";
import { useI18n } from "@/i18n/context";
import { Languages, Edit, Trash2, Plus, Network } from "lucide-react";
import { Modal } from "@/components/ui/modal";
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
  const [synonymsModalOpen, setSynonymsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingWord, setEditingWord] = useState<LexiconWord | null>(null);
  const [synonymsWord, setSynonymsWord] = useState<LexiconWord | null>(null);
  const [synonymSearch, setSynonymSearch] = useState("");
  const [selectedSynonymId, setSelectedSynonymId] = useState<number | null>(null);
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

    const payload = {
      word: formData.word.trim(),
      part_of_speech: formData.part_of_speech,
      ...(formData.etymology.trim() ? { etymology: formData.etymology.trim() } : {}),
      ...(formData.root_word.trim() ? { root_word: formData.root_word.trim() } : {}),
      ...(formData.dialect_tag.trim() ? { dialect_tag: formData.dialect_tag.trim() } : {}),
    };

    setIsLoading(true);
    try {
      await createLexiconWord("kurdish", payload);
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

    const payload = {
      word: formData.word.trim(),
      part_of_speech: formData.part_of_speech,
      ...(formData.etymology.trim() ? { etymology: formData.etymology.trim() } : {}),
      ...(formData.root_word.trim() ? { root_word: formData.root_word.trim() } : {}),
      ...(formData.dialect_tag.trim() ? { dialect_tag: formData.dialect_tag.trim() } : {}),
    };

    setIsLoading(true);
    try {
      await updateLexiconWord("kurdish", editingWord.id, payload);
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

  const openSynonymsModal = useCallback((word: LexiconWord) => {
    setSynonymsWord(word);
    setSynonymSearch("");
    setSelectedSynonymId(null);
    setSynonymsModalOpen(true);
  }, []);

  const handleAddSynonym = useCallback(async () => {
    if (!synonymsWord || !selectedSynonymId) return;

    setIsLoading(true);
    try {
      await createSynonym({
        word_id: synonymsWord.id,
        synonym_id: selectedSynonymId,
      });
      addToast({ type: "success", message: "Synonym added successfully" });
      setSelectedSynonymId(null);
      refetch();
    } catch {
      addToast({ type: "error", message: "Failed to add synonym" });
    } finally {
      setIsLoading(false);
    }
  }, [synonymsWord, selectedSynonymId, addToast, refetch]);

  const handleDeleteSynonym = useCallback(async (synonymId: number) => {
    setIsLoading(true);
    try {
      await deleteSynonym(synonymId);
      addToast({ type: "success", message: "Synonym removed" });
      refetch();
    } catch {
      addToast({ type: "error", message: "Failed to remove synonym" });
    } finally {
      setIsLoading(false);
    }
  }, [addToast, refetch]);

  return (
    <RoleGate roles={["admin", "main_board"]}>
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: t("nav.dashboard"), href: "/dashboard" },
            { label: t("lexicons_page.kurdish_title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">
              {t("lexicons_page.kurdish_title")}
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              {t("lexicons_page.kurdish_description")}
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
              <Languages className="h-12 w-12 text-text-muted mx-auto mb-3" />
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
                      variant="secondary"
                      size="sm"
                      onClick={() => openSynonymsModal(word)}
                    >
                      <Network className="h-4 w-4 mr-1" />
                      {t("lexicons.synonyms")}
                    </Button>
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
          title={t("lexicons_page.add_kurdish_word")}
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
          title={t("lexicons_page.edit_kurdish_word")}
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

        {/* Synonyms Modal */}
        {synonymsWord && (
          <SynonymsModal
            open={synonymsModalOpen}
            onClose={() => setSynonymsModalOpen(false)}
            word={synonymsWord}
            onAddSynonym={handleAddSynonym}
            onDeleteSynonym={handleDeleteSynonym}
            searchValue={synonymSearch}
            onSearchChange={setSynonymSearch}
            selectedId={selectedSynonymId}
            onSelectId={setSelectedSynonymId}
            loading={isLoading}
          />
        )}
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

interface SynonymsModalProps {
  open: boolean;
  onClose: () => void;
  word: LexiconWord;
  onAddSynonym: () => void;
  onDeleteSynonym: (id: number) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedId: number | null;
  onSelectId: (id: number | null) => void;
  loading: boolean;
}

function SynonymsModal({
  open,
  onClose,
  word,
  onAddSynonym,
  onDeleteSynonym,
  searchValue,
  onSearchChange,
  selectedId,
  onSelectId,
  loading,
}: SynonymsModalProps) {
  const { data: allWords } = useApi<PaginatedResponse<LexiconWord>>(
    `/api/v1/lexicons/kurdish?per_page=100`
  );

  // Filter out the current word and search results
  const availableWords = (allWords?.data ?? [])
    .filter(w => w.id !== word.id)
    .filter(w => !searchValue || w.word.toLowerCase().includes(searchValue.toLowerCase()));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Manage Synonyms for "${word.word}"`}
      className="max-w-lg"
    >
      <div className="space-y-4 mt-4">
        {/* Add Synonym Section */}
        <div className="border border-border-light rounded-lg p-3 bg-surface">
          <h4 className="text-sm font-semibold text-foreground mb-2">Add New Synonym</h4>
          <div className="flex gap-2">
            <Input
              placeholder="Search for a word..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1"
              dir="rtl"
            />
            <Button
              size="sm"
              onClick={onAddSynonym}
              disabled={!selectedId || loading}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          {searchValue && availableWords.length > 0 && (
            <div className="mt-2 max-h-32 overflow-y-auto rounded border border-border-light bg-surface-raised">
              {availableWords.slice(0, 10).map(w => (
                <button
                  key={w.id}
                  onClick={() => onSelectId(w.id)}
                  className={`w-full text-right px-3 py-2 text-sm hover:bg-surface/80 transition-colors ${
                    selectedId === w.id ? "bg-primary/10 text-primary" : ""
                  }`}
                >
                  <span dir="rtl" className="font-medium">{w.word}</span>
                  <span className="text-text-muted mr-2">({w.part_of_speech})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Existing Synonyms - Placeholder */}
        <div className="border border-border-light rounded-lg p-3 bg-surface">
          <h4 className="text-sm font-semibold text-foreground mb-2">
            Current Synonyms
            <span className="ml-2 text-xs font-normal text-text-muted">
              (Backend endpoint GET /api/v1/lexicons/kurdish/{word.id}/synonyms pending)
            </span>
          </h4>
          <p className="text-xs text-text-muted">
            Synonym relationships will be displayed here once the backend implements the word-specific synonyms endpoint.
          </p>
        </div>

        {/* Info */}
        <div className="text-xs text-text-muted bg-blue-50 dark:bg-blue-900/20 rounded p-2">
          <strong>Note:</strong> This feature uses global synonym links. Word-specific synonym viewing requires backend endpoint:{" "}
          <code className="text-xs bg-surface px-1 rounded">GET /api/v1/lexicons/kurdish/{word.id}/synonyms</code>
        </div>

        <div className="flex justify-end pt-2 border-t border-border-light">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
