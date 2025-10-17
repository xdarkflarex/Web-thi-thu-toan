"use client";

import * as React from "react";
import {
  useForm,
  FormProvider,
  SubmitHandler,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
 


export default function Page() {
  const schema = z
    .object({
      type: z.enum(["multiple-choice", "multiple-select", "short-answer"]),
      category: z.string().min(1, "Category is required"),
      question: z.string().min(1, "Question is required"),
      solutionGuide: z.string().optional(),
      level: z.enum(["recognize", "understand", "apply"]),
      answers: z.array(z.string()).min(1, "At least one answer"),
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
            message: "Select the correct answer",
          });
        } else if (
          data.correctIndex < 0 ||
          data.correctIndex >= data.answers.length
        ) {
          ctx.addIssue({
            code: "custom",
            path: ["correctIndex"],
            message: "Correct answer out of range",
          });
        }
      } else if (data.type === "multiple-select") {
        const indices = data.correctIndices ?? [];
        if (indices.length === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["correctIndices"],
            message: "Select at least one correct answer",
          });
        }
        for (const idx of indices) {
          if (idx < 0 || idx >= data.answers.length) {
            ctx.addIssue({
              code: "custom",
              path: ["correctIndices"],
              message: "A selected answer is out of range",
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

  const { watch, setValue } = form;
  const images = watch("images");
  const isSubmitting = watch("isSubmitting");
  const [isHorizontal, setIsHorizontal] = React.useState(true);

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

      const res = await fetch('/api/questions', {
        method: 'POST',
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

      console.log('Question created successfully:', json.data);
      form.reset();
      alert('Question created successfully!');
    } catch (error) {
      console.error('Error creating question:', error);
      alert(`Error creating question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      form.setValue('isSubmitting', false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Sample Question Builder
        </h1>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsHorizontal((prev) => !prev)}
          title={
            isHorizontal
              ? "Switch to stacked layout"
              : "Switch to side-by-side layout"
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
                  <CardTitle>Editor</CardTitle>
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => form.reset()}
                  disabled={isSubmitting}
                >
                  Reset
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <QuestionPreview />
                </CardContent>
              </Card>
              <div className="lg:hidden flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => form.reset()}
                  disabled={isSubmitting}
                >
                  Reset
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </Form>
    </div>
  );
}
