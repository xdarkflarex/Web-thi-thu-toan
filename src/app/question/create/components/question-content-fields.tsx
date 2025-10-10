import MathTextareaField from "@/components/form-field/math-textarea-field";

export default function QuestionContentFields() {
  return (
    <>
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
    </>
  );
}
