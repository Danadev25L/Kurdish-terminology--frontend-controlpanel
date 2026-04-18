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

export default function BoardAnalyticsPage() {
  const { data: dialectData, isLoading: dLoading } = useApi<DialectEquityData[]>(
    "/api/analytics/dialect-equity"
  );
  const { data: versatilityData, isLoading: vLoading } =
    useApi<WordVersatilityData[]>("/api/analytics/word-versatility");
  const { data: healthData, isLoading: hLoading } = useApi<DomainHealthData[]>(
    "/api/analytics/domain-health"
  );

  return (
    <RoleGate roles={["main_board", "admin"]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Platform Analytics
        </h1>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Dialect Equity */}
          <Card>
            <CardHeader>
              <CardTitle>Dialect Equity</CardTitle>
            </CardHeader>
            {dLoading ? (
              <Spinner />
            ) : dialectData && dialectData.length > 0 ? (
              <DialectEquityChart data={dialectData} />
            ) : (
              <p className="text-sm text-muted">No data available.</p>
            )}
          </Card>

          {/* Domain Health */}
          <Card>
            <CardHeader>
              <CardTitle>Domain Health</CardTitle>
            </CardHeader>
            {hLoading ? (
              <Spinner />
            ) : healthData && healthData.length > 0 ? (
              <DomainHealthChart data={healthData} />
            ) : (
              <p className="text-sm text-muted">No data available.</p>
            )}
          </Card>
        </div>

        {/* Word Versatility - full width */}
        <Card>
          <CardHeader>
            <CardTitle>Word Versatility</CardTitle>
          </CardHeader>
          <p className="mb-4 text-sm text-muted">
            Shows Kurdish words shared across multiple concepts.
          </p>
          {vLoading ? (
            <Spinner />
          ) : versatilityData && versatilityData.length > 0 ? (
            <WordVersatilityChart data={versatilityData} />
          ) : (
            <p className="text-sm text-muted">No data available.</p>
          )}
        </Card>
      </div>
    </RoleGate>
  );
}
