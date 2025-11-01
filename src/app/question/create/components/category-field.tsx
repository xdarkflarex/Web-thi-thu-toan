import { useTranslation } from "react-i18next";
import HierarchySelectField, {
  HierarchyNode,
} from "@/components/form-field/hierarchy-select-field";

// Sample hierarchy data for categories
export const categoryData: HierarchyNode[] = [
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

export default function CategoryField() {
  const { t } = useTranslation(['common', 'question']);
  
  return (
    <HierarchySelectField
      name="category"
      label={t('category', { ns: 'question' })}
      placeholder={t('selectCategory', { ns: 'question' })}
      data={categoryData}
      searchable
      showPath
    />
  );
}
