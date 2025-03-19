import MultipleSelector from "../ui/multi-select";
// import MultiSelect from "../ui/multi-select";
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
    {/* <MultiSelect
      options={categoryData}
      placeholder="Select up to 3 categories..."
      maxCount={3}
      /> */}

    <MultipleSelector
      defaultOptions={categoryData}
      maxSelected={3}
      onChange={onCategoryChange}
      value={selectedCategories}
      placeholder="Select categories you like atmost 3..."
      emptyIndicator={
        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
          no results found.
        </p>
      }
    />
    {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
  </div>
);
