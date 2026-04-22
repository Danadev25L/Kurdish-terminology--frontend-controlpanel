"use client";

import { useApi } from "@/lib/hooks/use-api";
import { RoleGate } from "@/components/auth/role-gate";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { DialectEquityChart } from "@/components/analytics/dialect-equity-chart";
import { WordVersatilityChart } from "@/components/analytics/word-versatility-chart";
import { DomainHealthChart } from "@/components/analytics/domain-health-chart";
import type {
  DialectEquityData,
  WordVersatilityData,
  DomainHealthData,
} from "@/lib/api/types";
import { useI18n } from "@/i18n/context";

export default function BoardAnalyticsPage() {
  const { t } = useI18n();
  const { data: dialectData, isLoading: dLoading } = useApi<DialectEquityData[]>(
    "/api/v1/analytics/dialect-equity"
  );
  const { data: versatilityData, isLoading: vLoading } =
    useApi<WordVersatilityData[]>("/api/v1/analytics/word-versatility");
  const { data: healthData, isLoading: hLoading } = useApi<DomainHealthData[]>(
    "/api/v1/board/analytics"
  );

  return (
    <RoleGate roles={["main_board", "admin"]}>
      <div className="space-y-6">
        <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">
          {t("board.analytics.title")}
        </h1>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Dialect Equity */}
          <Card>
            <CardHeader>
              <CardTitle>{t("board.analytics.dialect_equity")}</CardTitle>
            </CardHeader>
            {dLoading ? (
              <Spinner />
            ) : dialectData && dialectData.length > 0 ? (
              <DialectEquityChart data={dialectData} />
            ) : (
              <p className="text-[13px] text-text-muted">{t("common.no_data")}</p>
            )}
          </Card>

          {/* Domain Health */}
          <Card>
            <CardHeader>
              <CardTitle>{t("board.analytics.domain_health")}</CardTitle>
            </CardHeader>
            {hLoading ? (
              <Spinner />
            ) : healthData && healthData.length > 0 ? (
              <DomainHealthChart data={healthData} />
            ) : (
              <p className="text-[13px] text-text-muted">{t("common.no_data")}</p>
            )}
          </Card>
        </div>

        {/* Word Versatility - full width */}
        <Card>
          <CardHeader>
            <CardTitle>{t("board.analytics.word_versatility")}</CardTitle>
          </CardHeader>
          <p className="mb-4 text-[13px] text-text-muted">
            {t("board.word_versatility_desc")}
          </p>
          {vLoading ? (
            <Spinner />
          ) : versatilityData && versatilityData.length > 0 ? (
            <WordVersatilityChart data={versatilityData} />
          ) : (
            <p className="text-[13px] text-text-muted">{t("common.no_data")}</p>
          )}
        </Card>
      </div>
    </RoleGate>
  );
}
