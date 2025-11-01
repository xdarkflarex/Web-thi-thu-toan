import { useTranslation } from "react-i18next";
import SelectField from "@/components/form-field/select-field";

export default function QuestionTypeFields() {
  const { t } = useTranslation(['common', 'question', 'teacher']);
  
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <SelectField
        name="type"
        label={t('questionType', { ns: 'question' })}
        placeholder={t('selectType', { ns: 'question' })}
        items={[
          { label: t('chooseOneAnswer', { ns: 'question' }), value: "multiple-choice" },
          {
            label: t('chooseManyAnswers', { ns: 'question' }),
            value: "multiple-select",
          },
          { label: t('inputShortAnswer', { ns: 'question' }), value: "short-answer" },
        ]}
      />
      <SelectField
        name="level"
        label={t('level', { ns: 'question' })}
        placeholder={t('selectLevel', { ns: 'question' })}
        items={[
          { label: t('recognize', { ns: 'teacher' }), value: "recognize" },
          { label: t('understand', { ns: 'teacher' }), value: "understand" },
          { label: t('apply', { ns: 'teacher' }), value: "apply" },
        ]}
      />
    </div>
  );
}
