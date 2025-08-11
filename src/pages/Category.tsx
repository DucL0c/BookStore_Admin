import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Button from "../components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table"

import Badge from "../components/ui/badge/Badge";
import { useState, useEffect } from "react";
import { Modal } from "../components/ui/modal";
import Label from "../components/form/Label";
import Input from "../components/form/input/InputField";
import { useModal } from "../hooks/useModal";
import DataService from "../services/axiosClient";
import ToastService from "../services/notificationService";

interface Category {
  categoryId: number;
  name: string;
  isLeaf: boolean;
}

export default function Category() {
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const {isOpen, openModal, closeModal } = useModal();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await DataService.get<Category[]>("/Category/getall");
      if (res && Array.isArray(res)) {
        setCategories(res);
      } else {
        ToastService.error("Dữ liệu danh mục không hợp lệ");
      }
    } catch (err) {
      ToastService.error("Không thể tải danh sách danh mục");
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setSelectedIds([]);
    setSelectAll(false);
  };

  const prepareAddCategory = () => {
    setEditingCategory({
      categoryId: 0,
      name: "",
      isLeaf: false
    });
    openModal();
  };

  const prepareEditCategory = (category: Category) => {
    setEditingCategory({ ...category });
    openModal();
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setIsSubmitting(true);
    try {
      if (editingCategory.categoryId > 0) {
        // Update existing category
        await handleUpdateCategory();
      } else {
        // Create new category
        await handleAddCategory();
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = async () => {
    if (!editingCategory) return;
    
    try {
      const data = {
        Name: editingCategory.name,
        IsLeaf: editingCategory.isLeaf
      };
      
      const res = await DataService.post("/Category/create", data);
      if (res) {
        ToastService.success("Thêm danh mục thành công");
        fetchCategories();
        closeModal();
        resetForm();
      }
    } catch (err) {
      ToastService.error("Thêm danh mục thất bại");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || editingCategory.categoryId <= 0) return;
    
    try {
      const data = {
        CategoryId: editingCategory.categoryId,
        Name: editingCategory.name,
        IsLeaf: editingCategory.isLeaf
      };
      
      const res = await DataService.put("/Category/update", data);
      if (res) {
        ToastService.success("Cập nhật danh mục thành công");
        fetchCategories();
        closeModal();
        resetForm();
      }
    } catch (err) {
      ToastService.error("Cập nhật danh mục thất bại");
    }
  };

  const handleDeleteCategory = async () => {
    if (selectedIds.length === 0) {
      ToastService.error("Vui lòng chọn ít nhất một danh mục để xóa");
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} danh mục đã chọn?`)) {
      return;
    }

    try {
      let data = JSON.stringify(selectedIds);
      const res = await DataService.delete("/Category/deletemulti?checkedList=" + data);
      if (res) {
        ToastService.success(`Đã xóa thành công ${selectedIds.length} danh mục`);
        fetchCategories();
        resetForm();
      }
    } catch (err) {
      ToastService.error("Xóa danh mục thất bại");
    }
  };


  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(categories.map((category) => category.categoryId));
    }
    setSelectAll(!selectAll);
  };

  const handleCheckboxChange = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <>
      <PageMeta
        title="Admin"
        description="This is Admin Dashboard page"
      />
      <PageBreadcrumb pageTitle="Danh mục sản phẩm" />
      <div className="space-y-6">
        <div
          className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
        >
          {/* Card Header */}
          <div className="px-6 py-5">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="primary" onClick={prepareAddCategory}>
                Thêm mới
              </Button>
              <Button size="sm" variant="danger" onClick={handleDeleteCategory} disabled={selectedIds.length === 0}>
                Xoá
              </Button>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
            <div className="space-y-6">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                  <Table>
                    {/* Table Header */}
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        <TableCell
                          isHeader
                          className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                        >
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                        >
                          STT
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3  text-gray-500 text-start text-theme-sm dark:text-gray-400"
                        >
                          Tên danh mục
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                        >
                          Is_leaf
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3  text-gray-500 text-start text-theme-sm dark:text-gray-400 w-[250px]"
                        >
                          Thao tác
                        </TableCell>
                      </TableRow>
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    
                      {categories.length > 0 ? ( categories.map((category, index) => (
                        <TableRow key={category.categoryId ?? index}>
                          <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(category.categoryId)}
                              onChange={() => handleCheckboxChange(category.categoryId)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </TableCell>
                          <TableCell  className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {index + 1}
                          </TableCell>
                          <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {category.name}
                          </TableCell>
                          <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            <Badge
                              size="sm"
                              color={
                                category.isLeaf === false
                                  ? "success"
                                  : category.isLeaf === true
                                    ? "warning"
                                    : "error"
                              }
                            >
                              {category.isLeaf ? "Có" : "Không"}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            <button
                              onClick={() => prepareEditCategory(category)}
                              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-xs font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                            >
                              <svg
                                className="fill-current"
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                                  fill=""
                                />
                              </svg>
                              Chỉnh sửa
                            </button>
                          </TableCell>
                        </TableRow> 
                      )) ) : (
                      <TableRow>
                          <TableCell className="text-center py-4">
                            Không có danh mục nào
                          </TableCell>
                        </TableRow>)
                      }
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {editingCategory?.categoryId ? "Chỉnh sửa danh mục" : "Thêm mới danh mục"}
            </h4>
          </div>
          <form
            className="flex flex-col"
            onSubmit={handleSubmitCategory}
          >
            <div className="custom-scrollbar h-[90px] overflow-y-auto px-2 pb-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Tên danh mục</Label>
                  <Input
                    type="text"
                    value={editingCategory?.name || ""}
                    onChange={(e) =>
                      setEditingCategory((prev) =>
                        prev ? { ...prev, name: e.target.value } : null
                      )
                    }
                  />
                </div>

                <div>
                  <Label>Is_leaf</Label>
                  <select
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 border-gray-300"
                    value={editingCategory?.isLeaf ? "true" : "false"}
                    onChange={(e) =>
                      setEditingCategory((prev) =>
                        prev ? { ...prev, isLeaf: e.target.value === "true" } : null
                      )
                    }
                  >
                    <option value="true">Có</option>
                    <option value="false">Không</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
    <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={closeModal}
                    type="button"
                  >
                    Đóng
                  </Button>
                  <Button 
                    size="sm" 
                    type="submit" 
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    {editingCategory?.categoryId ? "Lưu thay đổi" : "Thêm mới"}
                  </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
