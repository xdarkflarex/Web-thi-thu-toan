import * as React from "react";
import { useTranslation } from "react-i18next";
import HierarchySelectField, {
  HierarchyNode,
} from "@/components/form-field/hierarchy-select-field";

interface CategoryFromAPI {
  id: string;
  slug: string;
  name_en: string;
  name_vi: string;
  parent_id: string | null;
  children?: CategoryFromAPI[];
}

// Fallback data in case API fails
export const getCategoryData = (t: (key: string, options?: { ns: string }) => string): HierarchyNode[] => [
  {
    id: "mathematics",
    label: t('mathematics', { ns: 'category' }),
    children: [
      {
        id: "algebra",
        label: t('algebra', { ns: 'category' }),
        children: [
          { id: "linear-algebra", label: t('linear-algebra', { ns: 'category' }) },
          { id: "abstract-algebra", label: t('abstract-algebra', { ns: 'category' }) },
          { id: "polynomials", label: t('polynomials', { ns: 'category' }) },
          { id: "quadratic-equations", label: t('quadratic-equations', { ns: 'category' }) },
        ],
      },
      {
        id: "geometry",
        label: t('geometry', { ns: 'category' }),
        children: [
          { id: "euclidean-geometry", label: t('euclidean-geometry', { ns: 'category' }) },
          { id: "analytical-geometry", label: t('analytical-geometry', { ns: 'category' }) },
          { id: "differential-geometry", label: t('differential-geometry', { ns: 'category' }) },
          { id: "trigonometry", label: t('trigonometry', { ns: 'category' }) },
        ],
      },
      {
        id: "calculus",
        label: t('calculus', { ns: 'category' }),
        children: [
          { id: "differential-calculus", label: t('differential-calculus', { ns: 'category' }) },
          { id: "integral-calculus", label: t('integral-calculus', { ns: 'category' }) },
          { id: "multivariable-calculus", label: t('multivariable-calculus', { ns: 'category' }) },
          { id: "limits", label: t('limits', { ns: 'category' }) },
        ],
      },
      {
        id: "statistics",
        label: t('statistics', { ns: 'category' }),
        children: [
          { id: "descriptive-statistics", label: t('descriptive-statistics', { ns: 'category' }) },
          { id: "probability", label: t('probability', { ns: 'category' }) },
          { id: "inferential-statistics", label: t('inferential-statistics', { ns: 'category' }) },
        ],
      },
    ],
  },
  {
    id: "physics",
    label: t('physics', { ns: 'category' }),
    children: [
      {
        id: "mechanics",
        label: t('mechanics', { ns: 'category' }),
        children: [
          { id: "kinematics", label: t('kinematics', { ns: 'category' }) },
          { id: "dynamics", label: t('dynamics', { ns: 'category' }) },
          { id: "statics", label: t('statics', { ns: 'category' }) },
        ],
      },
      {
        id: "thermodynamics",
        label: t('thermodynamics', { ns: 'category' }),
        children: [
          { id: "heat-transfer", label: t('heat-transfer', { ns: 'category' }) },
          { id: "entropy", label: t('entropy', { ns: 'category' }) },
        ],
      },
      {
        id: "electromagnetism",
        label: t('electromagnetism', { ns: 'category' }),
        children: [
          { id: "electric-fields", label: t('electric-fields', { ns: 'category' }) },
          { id: "magnetic-fields", label: t('magnetic-fields', { ns: 'category' }) },
          { id: "electromagnetic-waves", label: t('electromagnetic-waves', { ns: 'category' }) },
        ],
      },
    ],
  },
  {
    id: "chemistry",
    label: t('chemistry', { ns: 'category' }),
    children: [
      {
        id: "organic-chemistry",
        label: t('organic-chemistry', { ns: 'category' }),
        children: [
          { id: "hydrocarbons", label: t('hydrocarbons', { ns: 'category' }) },
          { id: "functional-groups", label: t('functional-groups', { ns: 'category' }) },
        ],
      },
      {
        id: "inorganic-chemistry",
        label: t('inorganic-chemistry', { ns: 'category' }),
        children: [
          { id: "periodic-table", label: t('periodic-table', { ns: 'category' }) },
          { id: "chemical-bonding", label: t('chemical-bonding', { ns: 'category' }) },
        ],
      },
    ],
  },
];

// Transform API categories to HierarchyNode format
const transformCategories = (categories: CategoryFromAPI[], language: string): HierarchyNode[] => {
  return categories.map(cat => ({
    id: cat.slug,
    label: language === 'vi' ? cat.name_vi : cat.name_en,
    children: cat.children ? transformCategories(cat.children, language) : []
  }));
};

export default function CategoryField() {
  const { t, i18n } = useTranslation(['common', 'question', 'category']);
  const [categoryData, setCategoryData] = React.useState<HierarchyNode[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const result = await res.json();
        
        if (result.success && result.data) {
          const transformed = transformCategories(result.data, i18n.language);
          setCategoryData(transformed);
        } else {
          // Fallback to hardcoded data
          setCategoryData(getCategoryData(t));
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback to hardcoded data
        setCategoryData(getCategoryData(t));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [i18n.language, t]);
  
  if (loading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('category', { ns: 'question' })}</label>
        <div className="text-sm text-muted-foreground">{t('loadingCategories', { ns: 'category' })}</div>
      </div>
    );
  }

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
