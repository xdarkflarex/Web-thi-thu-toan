import SelectField from "@/components/form-field/select-field";

export default function QuestionTypeFields() {
  return (
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
  );
}
