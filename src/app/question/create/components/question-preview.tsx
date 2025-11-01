import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { MathJax, MathJaxContext } from "better-react-mathjax";

interface ImageData {
  url?: string;
  label?: string;
  name?: string;
}

interface FormValues {
  type: "multiple-choice" | "multiple-select" | "short-answer";
  category: string;
  question: string;
  solutionGuide: string;
  level: string;
  answers: string[];
  shortAnswer: string;
  images: ImageData[];
  correctIndex: number | null;
  correctIndices: number[];
}

export default function QuestionPreview() {
  const { watch } = useFormContext<FormValues>();
  const { t } = useTranslation(['question']);
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

  return (
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
          <span className="font-medium">{t("category")}:</span>{" "}
          {category || t("notSelected")}
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">{t("level")}:</span> {level}
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
                  <span className="text-muted-foreground">{t("empty")}</span>
                )}
                {correctIndex === i ? (
                  <span className="ml-2 text-emerald-600">{t("correctLabel")}</span>
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
                  <span className="text-muted-foreground">{t("empty")}</span>
                )}
                {Array.isArray(correctIndices) &&
                correctIndices.includes(i) ? (
                  <span className="ml-2 text-emerald-600">{t("correctLabel")}</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-2">
            <Label>{t("expectedShortAnswer")}</Label>
            <div className="rounded-md border p-2 text-sm">
              {shortAnswer || (
                <span className="text-muted-foreground">{t("empty")}</span>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>{t("solutionGuide")}</Label>
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words rounded-md border p-2">
            {solutionGuide ? (
              <MathJax dynamic>{solutionGuide}</MathJax>
            ) : (
              <span className="text-muted-foreground">{t("empty")}</span>
            )}
          </div>
        </div>

        {images.length > 0 && (
          <div className="space-y-2">
            <Label>{t("images")}</Label>
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
                    {img.label || img.name || t("noLabel")}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}
      </div>
    </MathJaxContext>
  );
}
