import {
  addCategory,
  deleteCategoryApi,
  editCategoryApi,
} from "@/api/category";
import DataTable from "@/components/reactTable";
import { Button } from "@/components/ui/button";
import { baseURL, customAxios } from "@/config/axios";
import { useCategoryStore } from "@/store/useCategoryStore";
import getErrorMessage from "@/utils/getErrorMsg";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { PlusCircle, PencilLine, Trash2 } from "lucide-react";

const ManageCategory = () => {
  const { loading, error, category, fetchCategories } = useCategoryStore();

  useEffect(() => {
    if (category.length === 0) {
      fetchCategories();
    }
  }, []);

  const [selected, setSelected] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [edited, setEdited] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const columns = [
    {
      header: "ID",
      accessorKey: "value",
      meta: { maxWidth: 150 },
    },
    {
      header: "Category Name",
      accessorKey: "label",
    },
    {
      header: "Actions",
      meta: { noTruncate: true, minWidth: 200 },
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleEdit(row.original)}
            className="px-3 py-1 h-8 bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200 hover:text-indigo-800 rounded"
          >
            <PencilLine size={14} className="mr-1" /> Edit
          </Button>
          {/* <Button
            variant="destructive"
            size="sm"
            onClick={() => confirmDelete(row.original.value)}
            className="px-3 py-1 h-8 bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200 hover:text-rose-800 rounded"
          >
            <Trash2 size={14} className="mr-1" /> Delete
          </Button> */}
        </div>
      ),
    },
  ];

  const toggleEdit = (data) => {
    setSelected(data);
    setEdited(data.label);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelected(null);
    setEdited("");
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteConfirmOpen(false);
    setDeleteId(null);
  };

  const editCategory = async () => {
    if (!edited.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    if (edited.trim() === selected.label.trim()) {
      toast.info("No changes detected");
      closeModal();
      return;
    }

    try {
      await editCategoryApi({
        id: selected.value,
        categoryName: edited,
      });
      await fetchCategories();
      toast.success("Category updated successfully!");
      closeModal();
    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error));
    }
  };

  const deleteCategory = async () => {
    try {
      await deleteCategoryApi(deleteId);
      await fetchCategories();
      toast.success("Category deleted successfully!");
      closeDeleteModal();
    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Categories</h1>
        <Button
          onClick={() => {
            setSelected(null);
            setEdited("");
            setIsOpen(true);
          }}
          className="bg-gradient-to-t from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600"
        >
          <PlusCircle className="mr-1 h-5 w-5" /> Add New Category
        </Button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <DataTable data={category} columns={columns} isLoading={loading} />
      </div>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 shadow-lg w-96 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-semibold mb-4">
              {selected ? "Edit Category" : "Add New Category"}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={edited}
                onChange={(e) => setEdited(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter category name"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={
                  selected
                    ? editCategory
                    : async () => {
                        if (!edited.trim()) {
                          toast.error("Category name cannot be empty");
                          return;
                        }

                        try {
                          await addCategory(edited);
                          await fetchCategories();
                          toast.success("Category added successfully!");
                          closeModal();
                        } catch (error) {
                          console.log(error);
                          toast.error(getErrorMessage(error));
                        }
                      }
                }
              >
                {selected ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 shadow-lg w-96 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-semibold mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this category? This action cannot
              be undone.
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeDeleteModal}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={deleteCategory}
                className="bg-rose-600 hover:bg-rose-700"
              >
                <Trash2 size={16} className="mr-1" /> Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategory;
