import { useTranslation } from "react-i18next";
import MathTextareaField from "@/components/form-field/math-textarea-field";

export default function QuestionContentFields() {
  const { t } = useTranslation(['common', 'question']);
  
  return (
    <>
      <MathTextareaField
        name="question"
        label={t('question', { ns: 'question' })}
        placeholder={t('questionPlaceholder', { ns: 'question' })}
        hidePreview
      />

      <MathTextareaField
        name="solutionGuide"
        label={t('solutionGuide', { ns: 'question' })}
        placeholder={t('solutionPlaceholder', { ns: 'question' })}
        hidePreview
      />
    </>
  );
}
