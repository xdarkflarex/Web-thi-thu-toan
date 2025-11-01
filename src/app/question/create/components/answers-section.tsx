import * as React from "react";
import { useTranslation } from "react-i18next";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import TextField from "@/components/form-field/text-field";

interface FormValues {
  type: "multiple-choice" | "multiple-select" | "short-answer";
  answers: string[];
  shortAnswer: string;
  correctIndex: number | null;
  correctIndices: number[];
}

export default function AnswersSection() {
  const { t } = useTranslation(['common', 'question']);
  const { control, watch, setValue } = useFormContext<FormValues>();
  const type = watch("type");
  const answers = watch("answers");
  const shortAnswer = watch("shortAnswer");
  const correctIndex = watch("correctIndex");
  const correctIndices = watch("correctIndices");

  const answersArray = useFieldArray({ control, name: "answers" as never });

  if (type === "multiple-choice") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{t('answersChooseOne', { ns: 'question' })}</Label>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => answersArray.append("")}
          >
            {t('addAnswer', { ns: 'question' })}
          </Button>
        </div>

        <RadioGroup
          className="grid gap-3 sm:grid-cols-2"
          value={
            correctIndex == null ? undefined : String(correctIndex)
          }
          onValueChange={(v) => setValue("correctIndex", Number(v))}
        >
          {answers.map((ans, i) => (
            <div key={i} className="flex items-center gap-2">
              <RadioGroupItem id={`correct-${i}`} value={String(i)} />
              <label htmlFor={`correct-${i}`} className="sr-only">
                {t('correct', { ns: 'question' })}
              </label>
              <TextField
                name={`answers.${i}`}
                placeholder={`${t('answer', { ns: 'question' })} ${String.fromCharCode(65 + i)}`}
              />
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => answersArray.remove(i)}
                disabled={answers.length <= 1}
              >
                {t('remove', { ns: 'question' })}
              </Button>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  }

  if (type === "multiple-select") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{t('answersChooseMany', { ns: 'question' })}</Label>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => answersArray.append("")}
          >
            {t('addAnswer', { ns: 'question' })}
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {answers.map((ans, i) => {
            const checked =
              Array.isArray(correctIndices) && correctIndices.includes(i);
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
                <label htmlFor={`correct-multi-${i}`} className="sr-only">
                  {t('correct', { ns: 'question' })}
                </label>
                <TextField
                  name={`answers.${i}`}
                  placeholder={`${t('answer', { ns: 'question' })} ${String.fromCharCode(65 + i)}`}
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
                  {t('remove', { ns: 'question' })}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <TextField
      name="shortAnswer"
      label={t('shortAnswer', { ns: 'question' })}
      placeholder={t('typeExpectedAnswer', { ns: 'question' })}
    />
  );
}
