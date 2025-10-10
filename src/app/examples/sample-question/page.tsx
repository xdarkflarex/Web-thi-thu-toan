"use client";

import * as React from "react";
import {
  useForm,
  FormProvider,
  useFieldArray,
  SubmitHandler,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Columns, Split } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import MathTextareaField from "@/components/form-field/math-textarea-field";
import TextField from "@/components/form-field/text-field";
import SelectField from "@/components/form-field/select-field";
import HierarchySelectField, { HierarchyNode } from "@/components/form-field/hierarchy-select-field";
import { MathJax, MathJaxContext } from "better-react-mathjax";

// Sample hierarchy data for categories
const categoryData: HierarchyNode[] = [
  {
    id: "mathematics",
    label: "Mathematics",
    children: [
      {
        id: "algebra",
        label: "Algebra",
        children: [
          { id: "linear-algebra", label: "Linear Algebra" },
          { id: "abstract-algebra", label: "Abstract Algebra" },
          { id: "polynomials", label: "Polynomials" },
          { id: "quadratic-equations", label: "Quadratic Equations" },
        ],
      },
      {
        id: "geometry",
        label: "Geometry",
        children: [
          { id: "euclidean-geometry", label: "Euclidean Geometry" },
          { id: "analytical-geometry", label: "Analytical Geometry" },
          { id: "differential-geometry", label: "Differential Geometry" },
          { id: "trigonometry", label: "Trigonometry" },
        ],
      },
      {
        id: "calculus",
        label: "Calculus",
        children: [
          { id: "differential-calculus", label: "Differential Calculus" },
          { id: "integral-calculus", label: "Integral Calculus" },
          { id: "multivariable-calculus", label: "Multivariable Calculus" },
          { id: "limits", label: "Limits" },
        ],
      },
      {
        id: "statistics",
        label: "Statistics",
        children: [
          { id: "descriptive-statistics", label: "Descriptive Statistics" },
          { id: "probability", label: "Probability" },
          { id: "inferential-statistics", label: "Inferential Statistics" },
        ],
      },
    ],
  },
  {
    id: "physics",
    label: "Physics",
    children: [
      {
        id: "mechanics",
        label: "Mechanics",
        children: [
          { id: "kinematics", label: "Kinematics" },
          { id: "dynamics", label: "Dynamics" },
          { id: "statics", label: "Statics" },
        ],
      },
      {
        id: "thermodynamics",
        label: "Thermodynamics",
        children: [
          { id: "heat-transfer", label: "Heat Transfer" },
          { id: "entropy", label: "Entropy" },
        ],
      },
      {
        id: "electromagnetism",
        label: "Electromagnetism",
        children: [
          { id: "electric-fields", label: "Electric Fields" },
          { id: "magnetic-fields", label: "Magnetic Fields" },
          { id: "electromagnetic-waves", label: "Electromagnetic Waves" },
        ],
      },
    ],
  },
  {
    id: "chemistry",
    label: "Chemistry",
    children: [
      {
        id: "organic-chemistry",
        label: "Organic Chemistry",
        children: [
          { id: "hydrocarbons", label: "Hydrocarbons" },
          { id: "functional-groups", label: "Functional Groups" },
        ],
      },
      {
        id: "inorganic-chemistry",
        label: "Inorganic Chemistry",
        children: [
          { id: "periodic-table", label: "Periodic Table" },
          { id: "chemical-bonding", label: "Chemical Bonding" },
        ],
      },
    ],
  },
];

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
    })
    .superRefine((data, ctx) => {
      if (data.type === "multiple-choice") {
        if (data.correctIndex == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["correctIndex"],
            message: "Select the correct answer",
          });
        } else if (
          data.correctIndex < 0 ||
          data.correctIndex >= data.answers.length
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["correctIndex"],
            message: "Correct answer out of range",
          });
        }
      } else if (data.type === "multiple-select") {
        const indices = data.correctIndices ?? [];
        if (indices.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["correctIndices"],
            message: "Select at least one correct answer",
          });
        }
        for (const idx of indices) {
          if (idx < 0 || idx >= data.answers.length) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
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
    },
  });

  const { control, watch, setValue } = form;
  const type = watch("type");
  const category = watch("category");
  const question = watch("question");
  const solutionGuide = watch("solutionGuide");
  const level = watch("level");
  const answers = watch("answers");
  const shortAnswer = watch("shortAnswer");
  const images = watch("images");
  const correctIndex = watch("correctIndex");
  const correctIndices = watch("correctIndices");
  const [isHorizontal, setIsHorizontal] = React.useState(true);

  const answersArray = useFieldArray({ control, name: "answers" as never });
  const imagesArray = useFieldArray({ control, name: "images" as never });

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

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    // For now we just log; integrate backend as needed
    console.log("Submit sample-question:", values);
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
                  <HierarchySelectField
                    name="category"
                    label="Category"
                    placeholder="Select a category..."
                    data={categoryData}
                    searchable
                    showPath
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField
                      name="type"
                      label="Question Type"
                      placeholder="Select type"
                      items={[
                        { label: "Choose 1 answer", value: "multiple-choice" },
                        {
                          label: "Choose many answers",
                          value: "multiple-select",
                        },
                        { label: "Input short answer", value: "short-answer" },
                      ]}
                    />
                    <SelectField
                      name="level"
                      label="Level"
                      placeholder="Select level"
                      items={[
                        { label: "Recognize", value: "recognize" },
                        { label: "Understand", value: "understand" },
                        { label: "Apply", value: "apply" },
                      ]}
                    />
                  </div>

                  <MathTextareaField
                    name="question"
                    label="Question"
                    placeholder="Type your question here. Supports LaTeX with $...$ or \\(...\\)."
                    hidePreview
                  />

                  <MathTextareaField
                    name="solutionGuide"
                    label="Solution Guide"
                    placeholder="Type the solution steps. Supports LaTeX with $...$ or \\(...\\)."
                    hidePreview
                  />

                  {type === "multiple-choice" ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Answers (choose one)</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => answersArray.append("")}
                        >
                          Add answer
                        </Button>
                      </div>

                      <RadioGroup
                        className="grid gap-3 sm:grid-cols-2"
                        value={
                          correctIndex == null
                            ? undefined
                            : String(correctIndex)
                        }
                        onValueChange={(v) =>
                          setValue("correctIndex", Number(v))
                        }
                      >
                        {answers.map((ans, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <RadioGroupItem
                              id={`correct-${i}`}
                              value={String(i)}
                            />
                            <label htmlFor={`correct-${i}`} className="sr-only">
                              Correct
                            </label>
                            <TextField
                              name={`answers.${i}`}
                              placeholder={`Answer ${String.fromCharCode(
                                65 + i
                              )}`}
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => answersArray.remove(i)}
                              disabled={answers.length <= 1}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ) : type === "multiple-select" ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Answers (choose many)</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => answersArray.append("")}
                        >
                          Add answer
                        </Button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {answers.map((ans, i) => {
                          const checked =
                            Array.isArray(correctIndices) &&
                            correctIndices.includes(i);
                          return (
                            <div key={i} className="flex items-center gap-2">
                              <Checkbox
                                id={`correct-multi-${i}`}
                                checked={!!checked}
                                onCheckedChange={(v) => {
                                  const current = Array.isArray(correctIndices)
                                    ? [...correctIndices]
                                    : [];
                                  if (v) {
                                    if (!current.includes(i)) current.push(i);
                                  } else {
                                    const idx = current.indexOf(i);
                                    if (idx >= 0) current.splice(idx, 1);
                                  }
                                  setValue("correctIndices", current);
                                }}
                              />
                              <label
                                htmlFor={`correct-multi-${i}`}
                                className="sr-only"
                              >
                                Correct
                              </label>
                              <TextField
                                name={`answers.${i}`}
                                placeholder={`Answer ${String.fromCharCode(
                                  65 + i
                                )}`}
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  answersArray.remove(i);
                                  const current = Array.isArray(correctIndices)
                                    ? [...correctIndices]
                                    : [];
                                  const next = current
                                    .filter((ci) => ci !== i)
                                    .map((ci) => (ci > i ? ci - 1 : ci));
                                  setValue("correctIndices", next);
                                }}
                                disabled={answers.length <= 1}
                              >
                                Remove
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <TextField
                      name="shortAnswer"
                      label="Short Answer"
                      placeholder="Type expected short answer"
                    />
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Images</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          imagesArray.append({ url: "", label: "", name: "" })
                        }
                      >
                        Add image
                      </Button>
                    </div>
                    {images.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        No images added.
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {images.map((img, i) => (
                          <div
                            key={i}
                            className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  setImageFile(i, e.target.files?.[0] ?? null)
                                }
                              />
                            </div>
                            <TextField
                              name={`images.${i}.label`}
                              placeholder="Image label"
                            />
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => imagesArray.remove(i)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => form.reset()}
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
                  <MathJaxContext
                    version={3}
                    config={{
                      loader: { load: ["input/tex", "output/chtml"] },
                      tex: {
                        inlineMath: [
                          ["$", "$"],
                          ["\\(", "\\)"],
                        ],
                      },
                    }}
                  >
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Category:</span> {category || "Not selected"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Level:</span> {level}
                      </div>
                      <div className="text-base leading-relaxed whitespace-pre-wrap break-words">
                        <MathJax dynamic>{question}</MathJax>
                      </div>
                      {type === "multiple-choice" ? (
                        <ul className="list-disc pl-6 space-y-1">
                          {answers.map((ans, i) => (
                            <li key={i}>
                              <span className="font-semibold">
                                {String.fromCharCode(65 + i)}.
                              </span>{" "}
                              {ans || (
                                <span className="text-muted-foreground">
                                  (empty)
                                </span>
                              )}
                              {correctIndex === i ? (
                                <span className="ml-2 text-emerald-600">
                                  (correct)
                                </span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : type === "multiple-select" ? (
                        <ul className="list-disc pl-6 space-y-1">
                          {answers.map((ans, i) => (
                            <li key={i}>
                              <span className="font-semibold">
                                {String.fromCharCode(65 + i)}.
                              </span>{" "}
                              {ans || (
                                <span className="text-muted-foreground">
                                  (empty)
                                </span>
                              )}
                              {Array.isArray(correctIndices) &&
                              correctIndices.includes(i) ? (
                                <span className="ml-2 text-emerald-600">
                                  (correct)
                                </span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="space-y-2">
                          <Label>Expected short answer</Label>
                          <div className="rounded-md border p-2 text-sm">
                            {shortAnswer || (
                              <span className="text-muted-foreground">
                                (empty)
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Solution Guide</Label>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words rounded-md border p-2">
                          {solutionGuide ? (
                            <MathJax dynamic>{solutionGuide}</MathJax>
                          ) : (
                            <span className="text-muted-foreground">(empty)</span>
                          )}
                        </div>
                      </div>

                      {images.length > 0 && (
                        <div className="space-y-2">
                          <Label>Images</Label>
                          <div className="grid gap-4 sm:grid-cols-2">
                            {images.map((img, i) => (
                              <figure key={i} className="rounded-md border p-2">
                                {img.url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={img.url}
                                    alt={img.label || `image-${i + 1}`}
                                    className="w-full h-auto rounded"
                                  />
                                ) : (
                                  <div className="aspect-video w-full rounded bg-muted" />
                                )}
                                <figcaption className="mt-2 text-sm text-muted-foreground">
                                  {img.label || img.name || "(no label)"}
                                </figcaption>
                              </figure>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </MathJaxContext>
                </CardContent>
              </Card>
              <div className="lg:hidden flex gap-2">
                <Button type="submit">Save</Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => form.reset()}
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
