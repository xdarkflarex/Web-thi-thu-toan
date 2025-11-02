"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/custom/data-table";
import { QuestionService } from "@/lib/question-service";
import { Database } from "@/types/database";
import { useAuth } from "@/hooks/use-auth";

type Question = Database["public"]["Tables"]["questions"]["Row"];

export default function QuestionListing() {
  const { t } = useTranslation(['common', 'question', 'teacher', 'category']);
  const { isCheckingAuth } = useAuth();
  const router = useRouter();
  const [data, setData] = React.useState<Question[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState<number | undefined>(undefined);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const page = pageIndex + 1;
      const take = pageSize;
      const result = await QuestionService.getQuestions(page, take);
      setData(result.items as Question[]);
      setPageCount(result.pageCount);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize]);

  const columns = React.useMemo<ColumnDef<Question>[]>(
    () => [
      {
        accessorKey: "category",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t('category', { ns: 'question' })}
            <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => {
          const categoryPath = row.getValue("category") as string;
          // Translate category path (e.g., "mathematics/algebra" or just "algebra")
          const categoryParts = categoryPath.split('/');
          const lastPart = categoryParts[categoryParts.length - 1];
          const translated = t(lastPart, { ns: 'category', defaultValue: categoryPath });
          return <div>{translated}</div>;
        },
      },
      {
        accessorKey: "type",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t('questionType', { ns: 'question' })}
            <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => {
          const type = row.getValue("type") as string;
          const typeMap: Record<string, string> = {
            'multiple-choice': t('chooseOneAnswer', { ns: 'question' }),
            'multiple-select': t('chooseManyAnswers', { ns: 'question' }),
            'short-answer': t('inputShortAnswer', { ns: 'question' }),
          };
          return <div>{typeMap[type] || type}</div>;
        },
      },
      {
        accessorKey: "level",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t('level', { ns: 'question' })}
            <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => {
          const level = row.getValue("level") as string;
          const levelMap: Record<string, string> = {
            'recognize': t('recognize', { ns: 'teacher' }),
            'understand': t('understand', { ns: 'teacher' }),
            'apply': t('apply', { ns: 'teacher' }),
          };
          return <div>{levelMap[level] || level}</div>;
        },
      },
      {
        accessorKey: "question",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t('question', { ns: 'question' })}
            <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="max-w-[640px] truncate">{row.getValue("question")}</div>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const q = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{t('openMenu', { ns: 'question' })}</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('actions', { ns: 'question' })}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(q.id)}>
                  {t('copyId', { ns: 'question' })}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/question/create?id=${q.id}`)}>
                  {t('edit')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    const ok = window.confirm(t('deleteQuestion', { ns: 'question' }));
                    if (!ok) return;
                    try {
                      setDeletingId(q.id);
                      await QuestionService.deleteQuestion(q.id);
                      await load();
                    } finally {
                      setDeletingId(null);
                    }
                  }}
                >
                  {t('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, load]
  );

  React.useEffect(() => {
    if (!isCheckingAuth) {
      load();
    }
  }, [load, isCheckingAuth]);

  if (isCheckingAuth) {
    return (
      <main className="container mx-auto max-w-7xl p-6 space-y-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('loading', { ns: 'common' })}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto max-w-7xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('questions', { ns: 'question' })}</h1>
        <Button onClick={() => router.push("/question/create")}>
          {t('addQuestion', { ns: 'question' })}
        </Button>
      </div>
      <DataTable<Question, unknown>
        columns={columns}
        data={data}
        searchableColumnId="question"
        pageCount={pageCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={(index) => setPageIndex(index)}
        onPageSizeChange={undefined}
      />
      {loading ? <div className="text-sm text-muted-foreground">{t('loading')}</div> : null}
      {deletingId ? <div className="text-sm text-muted-foreground">{t('deleting', { ns: 'question' })}</div> : null}
    </main>
  );
}
