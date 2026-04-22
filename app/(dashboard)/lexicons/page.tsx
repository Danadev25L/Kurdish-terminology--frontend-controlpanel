import Link from "next/link";
import { RoleGate } from "@/components/auth/role-gate";
import { Card } from "@/components/ui/card";
import { BookOpen, Languages } from "lucide-react";

export default function LexiconsPage() {
  return (
    <RoleGate roles={["admin", "main_board"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">
            Lexicons
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage the English and Kurdish vocabulary databases
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/lexicons/english">
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">English Lexicon</h2>
                  <p className="mt-1 text-sm text-text-muted">
                    Manage English words, parts of speech, etymology, and root words.
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/lexicons/kurdish">
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Languages className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Kurdish Lexicon</h2>
                  <p className="mt-1 text-sm text-text-muted">
                    Manage Kurdish words, parts of speech, dialects, and etymology.
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </RoleGate>
  );
}
