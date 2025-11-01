"use client";

import * as React from "react";
import {
  useForm,
  FormProvider,
  SubmitHandler,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Columns, Split } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  CategoryField,
  QuestionTypeFields,
  QuestionContentFields,
  AnswersSection,
  ImagesSection,
  QuestionPreview,
} from "./components";
import { supabase } from "@/lib/supabase";
import { QuestionService } from "@/lib/question-service";
import { useSearchParams } from "next/navigation";
 


export default function Page() {
  const { t } = useTranslation(['common', 'question']);
  const searchParams = useSearchParams();
  const questionId = searchParams.get('id');
  const isEditMode = Boolean(questionId);

  const schema = z
    .object({
      type: z.enum(["multiple-choice", "multiple-select", "short-answer"]),
      category: z.string().min(1, t('categoryRequired', { ns: 'question' })),
      question: z.string().min(1, t('questionRequired', { ns: 'question' })),
      solutionGuide: z.string().optional(),
      level: z.enum(["recognize", "understand", "apply"]),
      answers: z.array(z.string()).min(1, t('atLeastOneAnswer', { ns: 'question' })),
      shortAnswer: z.string().optional(),
      images: z.array(
        z.object({
          url: z.string().optional(),
          label: z.string().optional(),
          name: z.string().optional(),
        })
      ),
      correctIndex: z.number().nullable().optional(),
      correctIndices: z.array(z.number()).optional(),
      isSubmitting: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.type === "multiple-choice") {
        if (data.correctIndex == null) {
          ctx.addIssue({
            code: "custom",
            path: ["correctIndex"],
            message: t('selectCorrectAnswer', { ns: 'question' }),
          });
        } else if (
          data.correctIndex < 0 ||
          data.correctIndex >= data.answers.length
        ) {
          ctx.addIssue({
            code: "custom",
            path: ["correctIndex"],
            message: t('correctAnswerOutOfRange', { ns: 'question' }),
          });
        }
      } else if (data.type === "multiple-select") {
        const indices = data.correctIndices ?? [];
        if (indices.length === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["correctIndices"],
            message: t('selectAtLeastOneCorrect', { ns: 'question' }),
          });
        }
        for (const idx of indices) {
          if (idx < 0 || idx >= data.answers.length) {
            ctx.addIssue({
              code: "custom",
              path: ["correctIndices"],
              message: t('selectedAnswerOutOfRange', { ns: 'question' }),
            });
            break;
          }
        }
      }
    });
  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "multiple-choice",
      category: "",
      question: "Find the value of $x$ such that $x^2 - 5x + 6 = 0$.",
      solutionGuide: "Factor the quadratic: $(x-2)(x-3)=0$ so $x=2$ or $x=3$.",
      level: "recognize",
      answers: ["x = 1", "x = 2", "x = 3", "x = 6"],
      shortAnswer: "",
      images: [],
      correctIndex: 0,
      correctIndices: [],
      isSubmitting: false,
    },
  });

  const { watch, setValue, reset } = form;
  const images = watch("images");
  const isSubmitting = watch("isSubmitting");
  const [isHorizontal, setIsHorizontal] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(isEditMode);

  // Load question data when in edit mode
  React.useEffect(() => {
    if (isEditMode && questionId) {
      const loadQuestion = async () => {
        try {
          setIsLoading(true);
          const question = await QuestionService.getQuestionById(questionId);
          
          // Transform the question data to match form structure
          const formData = {
            type: question.type,
            category: question.category,
            question: question.question,
            solutionGuide: question.solution_guide || "",
            level: question.level,
            answers: question.answers?.map((answer: { answer_text: string }) => answer.answer_text) || [],
            shortAnswer: question.short_answer || "",
            images: question.images?.map((img: { image_url: string; image_label: string | null; image_name: string | null }) => ({
              url: img.image_url,
              label: img.image_label || "",
              name: img.image_name || "",
            })) || [],
            correctIndex: question.correct_index,
            correctIndices: question.correct_indices || [],
            isSubmitting: false,
          };
          
          reset(formData);
        } catch (error) {
          console.error('Error loading question:', error);
          alert(t('errorLoading', { ns: 'question' }));
        } finally {
          setIsLoading(false);
        }
      };
      
      loadQuestion();
    }
  }, [isEditMode, questionId, reset]);

  React.useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img?.url && img.url.startsWith("blob:"))
          URL.revokeObjectURL(img.url);
      });
    };
  }, [images]);

  const setImageFile = (idx: number, file: File | null) => {
    const current = images[idx] ?? {};
    if (current.url && current.url.startsWith("blob:"))
      URL.revokeObjectURL(current.url);
    if (!file) {
      setValue(`images.${idx}.url` as const, "");
      setValue(`images.${idx}.name` as const, "");
      return;
    }
    const url = URL.createObjectURL(file);
    setValue(`images.${idx}.url` as const, url);
    setValue(`images.${idx}.name` as const, file.name);
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      form.setValue('isSubmitting', true);

      const payload = {
        type: values.type,
        category: values.category,
        question: values.question,
        solutionGuide: values.solutionGuide,
        level: values.level,
        answers: values.answers,
        shortAnswer: values.shortAnswer,
        images: values.images
          .filter((img) => img.url)
          .map((img) => ({ url: img.url as string, label: img.label, name: img.name })),
        correctIndex: values.correctIndex,
        correctIndices: values.correctIndices,
      };

      // Get Supabase access token to authenticate API route
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      const url = isEditMode ? `/api/questions/${questionId}` : '/api/questions';
      const method = isEditMode ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({ success: false, message: 'Invalid server response' }));

      if (!res.ok || !json?.success) {
        const message = json?.message || `Request failed with status ${res.status}`;
        throw new Error(message);
      }

      const action = isEditMode ? 'updated' : 'created';
      console.log(`Question ${action} successfully:`, json.data);
      
      if (!isEditMode) {
        form.reset();
      }
      
      alert(isEditMode ? t('questionUpdated', { ns: 'question' }) : t('questionCreated', { ns: 'question' }));
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} question:`, error);
      alert(`${isEditMode ? t('errorUpdating', { ns: 'question' }) : t('errorCreating', { ns: 'question' })}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      form.setValue('isSubmitting', false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl py-8 space-y-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight mb-4">
              {t('loading', { ns: 'question' })}
            </h1>
            <div className="text-muted-foreground">
              {t('loadingDescription', { ns: 'question' })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isEditMode ? t('edit', { ns: 'question' }) : t('sampleBuilder', { ns: 'question' })}
        </h1>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsHorizontal((prev) => !prev)}
          title={
            isHorizontal
              ? t('switchToStacked', { ns: 'question' })
              : t('switchToSideBySide', { ns: 'question' })
          }
        >
          {isHorizontal ? (
            <Split className="h-4 w-4" />
          ) : (
            <Columns className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Form {...form}>
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={
              isHorizontal
                ? "grid gap-6 grid-cols-1 lg:grid-cols-2"
                : "space-y-6"
            }
          >
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('editor', { ns: 'question' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <CategoryField />

                  <QuestionTypeFields />

                  <QuestionContentFields />

                  <AnswersSection />

                  <ImagesSection setImageFile={setImageFile} />
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting || isLoading}>
                  {isSubmitting ? (isEditMode ? t('updating', { ns: 'question' }) : t('saving', { ns: 'question' })) : (isEditMode ? t('update', { ns: 'question' }) : t('save', { ns: 'question' }))}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => form.reset()}
                  disabled={isSubmitting || isLoading}
                >
                  {t('reset', { ns: 'question' })}
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('preview', { ns: 'question' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <QuestionPreview />
                </CardContent>
              </Card>
              <div className="lg:hidden flex gap-2">
                <Button type="submit" disabled={isSubmitting || isLoading}>
                  {isSubmitting ? (isEditMode ? t('updating', { ns: 'question' }) : t('saving', { ns: 'question' })) : (isEditMode ? t('update', { ns: 'question' }) : t('save', { ns: 'question' }))}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => form.reset()}
                  disabled={isSubmitting || isLoading}
                >
                  {t('reset', { ns: 'question' })}
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </Form>
    </div>
  );
}
