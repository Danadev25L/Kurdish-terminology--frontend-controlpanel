"use client";

import { useState, useEffect, useMemo } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { updateSetting } from "@/lib/api/settings";
import type { Setting } from "@/lib/api/types";

export default function AdminSettingsPage() {
  const { data: rawSettings, isLoading, refetch } = useApi<Record<string, Setting[]>>("/api/v1/admin/settings");
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Flatten grouped settings into a single array (memoized to stabilize effect deps)
  const settings = useMemo(
    () => rawSettings ? Object.values(rawSettings).flat() : null,
    [rawSettings]
  );

  useEffect(() => {
    if (rawSettings) {
      const map: Record<string, string> = {};
      Object.values(rawSettings).flat().forEach((s) => {
        map[s.key] = s.value;
      });
      setEdited(map);
    }
  }, [rawSettings]);

  const handleSave = async (key: string) => {
    setSaving(true);
    try {
      await updateSetting({ key, value: edited[key] });
      refetch();
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">System Settings</h1>

      <Card>
        <div className="space-y-4">
          {settings?.map((setting) => (
            <div
              key={setting.key}
              className="flex items-end gap-4 border-b border-border-light pb-4 last:border-0"
            >
              <div className="flex-1">
                <Input
                  label={setting.key}
                  value={edited[setting.key] ?? setting.value}
                  onChange={(e) =>
                    setEdited((prev) => ({
                      ...prev,
                      [setting.key]: e.target.value,
                    }))
                  }
                />
              </div>
              <Button
                size="sm"
                onClick={() => handleSave(setting.key)}
                loading={saving}
              >
                Save
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
