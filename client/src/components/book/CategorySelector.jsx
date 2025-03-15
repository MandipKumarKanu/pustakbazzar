import MultiSelect from "../ui/multi-select";
import { categories } from "./bookConstant";

export const CategorySelector = ({
  selectedCategories,
  onCategoryChange,
  error,
  categoryData,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Category
    </label>
    <MultiSelect
      options={categoryData}
      onValueChange={onCategoryChange}
      placeholder="Select up to 3 categories..."
      maxCount={3}
      value={selectedCategories}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
  </div>
);
