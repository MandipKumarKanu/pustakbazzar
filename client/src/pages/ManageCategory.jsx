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
import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

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
      header: "Id",
      accessorKey: "value",
      meta: { maxWidth: 250 },
    },
    {
      header: "Name",
      accessorKey: "label",
    },
    {
      header: "Actions",
      meta: { noTruncate: true, minWidth: 250 },
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toggleEdit(row.original)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => confirmDelete(row.original.value)}
          >
            Delete
          </Button>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading categories: {getErrorMessage(error)}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <Button
          onClick={() => {
            setSelected(null);
            setEdited("");
            setIsOpen(true);
          }}
        >
          Add New Category
        </Button>
      </div>

      <DataTable data={category} columns={columns} />

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-md w-96">
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
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter category name"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button
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
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-6">
              Are you sure you want to delete this category? This action cannot
              be undone.
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeDeleteModal}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={deleteCategory}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategory;
