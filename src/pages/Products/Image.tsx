import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { useModal } from "../../hooks/useModal";
import DataService from "../../services/axiosClient";
import ToastService from "../../services/notificationService";
import Select from 'react-select';
import Badge from "../../components/ui/badge/Badge";

interface Book {
  bookId: number
  name: string;
  description: string;
}

interface BookImage {
  imageId: number;
  bookId: number;
  baseUrl: string;
  smallUrl: string;
  mediumUrl: string;
  largeUrl: string;
  thumbnailUrl: string;
  isGallery: boolean;
  book: Book;
}

interface BookImageResponse {
  page: number;
  count: number;
  totalPages: number;
  totalCount: number;
  maxPage: number;
  items: BookImage[];
}

export default function Image() {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
  const [pageInput, setPageInput] = useState(page);

  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const {isOpen, openModal, closeModal } = useModal();
  const [bookImages, setBookImages] = useState<BookImage[]>([]);
  const [editingBookImage, setEditingBookImage] = useState<BookImage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [books, setBooks] = useState<Book[]>([]);
  const [, setSelectedBook] = useState<number | "">("");

  useEffect(() => {
    fetchBookImages();
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm !== '') {
      fetchBookImages();
    } else {
      fetchBookImages();
    }
  }, [debouncedSearchTerm, page]);

  useEffect(() => {
    if(isOpen) {
      fetchBooks();
    }
  }, [isOpen]);


  const fetchBookImages = async () => {
    try {
      const res = await DataService.get<BookImageResponse, any>(
        `/BookImage/getallbypaging?page=${page}&pageSize=${pageSize}&keyword=${debouncedSearchTerm}`
      );
      if (res && Array.isArray(res.items)) {
        setBookImages(res.items);
        setTotalPages(res.totalPages);
      } else {
        ToastService.error("Dữ liệu không hợp lệ");
      }
    } catch (err) {
      ToastService.error("Không thể tải danh sách");
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await DataService.get<Book[], any>("/Book/getall");
      if (res && Array.isArray(res)) {
        setBooks(res.map(b => ({
          bookId: b.bookId ?? b.id ?? 0,
          name: b.name ?? b.title ?? "",
          description: b.description ?? ""
        })));
      } else {
        ToastService.error("Dữ liệu không hợp lệ");
      }
    } catch (err) {
      ToastService.error("Không thể tải danh sách");
    }
  };

  // Reset Form
  const resetForm = () => {
    setEditingBookImage(null);
    setSelectedIds([]);
    setSelectAll(false);
  };

  const prepareAddBookImage = () => {
    setEditingBookImage({
        imageId: 0,
        bookId: 0,
        baseUrl: '',
        smallUrl: '',
        mediumUrl: '',
        largeUrl: '',
        thumbnailUrl: '',
        isGallery: false,
        book: { bookId: 0, name: '', description: '' }
    });
    openModal();
  };

  const prepareEditBookImage = (bookImage: BookImage) => {
    setEditingBookImage({ ...bookImage });
    openModal();
  };

  // Submit book image
  const handleSubmitBookImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBookImage) return;

    setIsSubmitting(true);
    try {
      if (editingBookImage.imageId > 0) {
        // Update existing book image
        await handleUpdateBookImage();
      } else {
        // Create new book image
        await handleAddBookImage();
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  // Add book image
  const handleAddBookImage = async () => {
    if (!editingBookImage) return;

    try {
      const data = {
        BookId: editingBookImage.bookId,
        BaseUrl: editingBookImage.baseUrl,
        SmallUrl: editingBookImage.smallUrl,
        MediumUrl: editingBookImage.mediumUrl,
        LargeUrl: editingBookImage.largeUrl,
        ThumbnailUrl: editingBookImage.thumbnailUrl,
        IsGallery: editingBookImage.isGallery
      };

      const res = await DataService.post("/BookImage/create", data);
      if (res) {
        ToastService.success("Thêm thành công");
        fetchBookImages();
        closeModal();
        resetForm();
      }
    } catch (err) {
      ToastService.error("Thêm thất bại");
    }
  };


  // Update book image
  const handleUpdateBookImage = async () => {
    if (!editingBookImage || editingBookImage.imageId <= 0) return;

    try {
      const data = {
        ImageId: editingBookImage.imageId,
        BookId: editingBookImage.bookId,
        BaseUrl: editingBookImage.baseUrl,
        SmallUrl: editingBookImage.smallUrl,
        MediumUrl: editingBookImage.mediumUrl,
        LargeUrl: editingBookImage.largeUrl,
        ThumbnailUrl: editingBookImage.thumbnailUrl,
        IsGallery: editingBookImage.isGallery
      };

      const res = await DataService.put("/BookImage/Update", data);
      if (res) {
        ToastService.success("Cập nhật thành công");
        fetchBookImages();
        closeModal();
        resetForm();
      }
    } catch (err) {
      ToastService.error("Cập nhật thất bại");
    }
  };


  // Delete book image
  const handleDeleteBookImage = async () => {
    if (selectedIds.length === 0) {
      ToastService.error("Vui lòng chọn ít nhất một dòng để xóa");
      return;
    }

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa ${selectedIds.length} dòng đã chọn?`
      )
    ) {
      return;
    }

    try {
      let data = JSON.stringify(selectedIds);
      const res = await DataService.delete<any>(
        "/BookImage/deletemulti?checkedList=" + data
      );
      if (res) {
        if (Array.isArray(res) && res.length > 0) {
          if(res[0] == 0){
            ToastService.error("Không thể xóa vì có sản phẩm liên quan");
          }
          else{
            ToastService.success(
              `Đã xóa thành công ${selectedIds.length} dòng`
            );
          }
        }
        fetchBookImages();
        resetForm();
      }
    } catch (err) {
      ToastService.error("Xóa thất bại");
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(bookImages.map((bookImage) => bookImage.imageId));
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
      <PageMeta title="Admin" description="This is Admin Dashboard page" />
      <PageBreadcrumb pageTitle="Ảnh bìa" />
      <div className="space-y-6">
        <div
          className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
        >
          {/* Card Header */}
          <div className="px-6 py-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="primary" onClick={prepareAddBookImage}>
                  Thêm mới
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={handleDeleteBookImage}
                  disabled={selectedIds.length === 0}
                >
                  Xoá
                </Button>
              </div>

              <form onSubmit={(e) => {
                  e.preventDefault();
                  fetchBookImages();
                }} className="w-full sm:w-auto">
                  <div className="relative">
                    <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
                      <svg
                        className="fill-gray-500 dark:fill-gray-400"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                          fill=""
                        />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Tìm kiếm sách..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 sm:w-[250px] lg:w-[350px]"
                    />

                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          fetchBookImages();
                        }}
                        className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    )}

                    <button
                      type="submit"
                      className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"
                    >
                      <span>⌘</span>
                      <span>K</span>
                    </button>
                  </div>
                </form>
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
                          Tên sách
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                        >
                          Ảnh mặc định
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                        >
                          Ảnh nhỏ
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                        >
                          Ảnh trung bình
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                        >
                          Ảnh lớn
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                        >
                          Ảnh thu nhỏ
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                        >
                          Is Gallery
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
                      {bookImages.length > 0 ? (
                        bookImages.map((bookImage, index) => (
                          <TableRow key={bookImage.imageId ?? index}>
                            <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(
                                  bookImage.imageId
                                )}
                                onChange={() =>
                                  handleCheckboxChange(bookImage.imageId)
                                }
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                            </TableCell>
                            <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {page * pageSize + index + 1}
                            </TableCell>
                            <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {bookImage.book.name}
                            </TableCell>
                            <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              <div className="w-10 h-10 overflow-hidden rounded-full">
                                <img
                                  width={40}
                                  height={40}
                                  src={bookImage.baseUrl || "/images/default-avatar.png"}
                                  alt="baseUrl"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              <div className="w-10 h-10 overflow-hidden rounded-full">
                                <img
                                  width={40}
                                  height={40}
                                  src={bookImage.smallUrl || "/images/default-avatar.png"}
                                  alt="smallUrl"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              <div className="w-10 h-10 overflow-hidden rounded-full">
                                <img
                                  width={40}
                                  height={40}
                                  src={bookImage.mediumUrl || "/images/default-avatar.png"}
                                  alt="mediumUrl"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              <div className="w-12 h-12 overflow-hidden rounded-full">
                                <img
                                  width={48}
                                  height={48}
                                  src={bookImage.largeUrl || "/images/default-avatar.png"}
                                  alt="largeUrl"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              <div className="w-8 h-8 overflow-hidden rounded-full">
                                <img
                                  width={32}
                                  height={32}
                                  src={bookImage.thumbnailUrl || "/images/default-avatar.png"}
                                  alt="thumbnailUrl"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              <Badge
                                size="sm"
                                color={
                                  bookImage.isGallery === true
                                    ? "success"
                                    : bookImage.isGallery === false
                                    ? "warning"
                                    : "error"
                                }
                              >
                                {bookImage.isGallery ? "Có" : "Không"}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              <button
                                onClick={() => prepareEditBookImage(bookImage)}
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
                        ))
                      ) : (
                        <TableRow>
                          <TableCell className="text-center py-4">
                            Không có dữ liệu
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              {totalPages >= 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {page + 1} / {totalPages} - Tổng {bookImages.length} dòng
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page === 0}
                      onClick={() => setPage(0)}
                      className="disabled:opacity-50"
                    >
                      Đầu
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page === 0}
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      className="disabled:opacity-50"
                    >
                      Trước
                    </Button>
                    
                    {/* Hiển thị số trang với logic thông minh */}
                    {(() => {
                      const pages = [];
                      const maxVisiblePages = 5;
                      let startPage = Math.max(0, page - Math.floor(maxVisiblePages / 2));
                      let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
                      
                      if (endPage - startPage + 1 < maxVisiblePages) {
                        startPage = Math.max(0, endPage - maxVisiblePages + 1);
                      }
                      
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <Button
                            key={i}
                            size="sm"
                            variant={page === i ? "primary" : "outline"}
                            onClick={() => setPage(i)}
                          >
                            {i + 1}
                          </Button>
                        );
                      }
                      return pages;
                    })()}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page === totalPages - 1}
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      className="disabled:opacity-50"
                    >
                      Sau
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page === totalPages - 1}
                      onClick={() => setPage(totalPages - 1)}
                      className="disabled:opacity-50"
                    >
                      Cuối
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Đến trang:</span>
                    <Input
                      type="number"
                      min="1"
                      max={totalPages.toString()}
                      value={pageInput}
                      onChange={(e) => setPageInput(parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border rounded"
                    />
                    <Button 
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        const newPage = Math.max(1, Math.min(totalPages, pageInput));
                        setPage(newPage - 1);
                        setPageInput(newPage);
                      }}
                    >
                      Đi
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto  rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {editingBookImage?.imageId
                ? "Chỉnh sửa"
                : "Thêm mới"}
            </h4>
          </div>
          <form className="flex flex-col" onSubmit={handleSubmitBookImage}>
            <div className="custom-scrollbar h-[340px] overflow-y-auto  px-2 pb-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Chọn sách</Label>
                  <Select
                    options={books.map(book => ({
                      value: book.bookId,
                      label: book.name
                    }))}
                    value={books
                      .map(book => ({ value: book.bookId, label: book.name }))
                      .find(option => option.value === editingBookImage?.bookId) || null}
                    onChange={option => {
                      setSelectedBook(option ? option.value : "");
                      if (editingBookImage) {
                        setEditingBookImage({
                          ...editingBookImage,
                          bookId: option ? option.value : 0
                        });
                      }
                    }}
                    placeholder="Tìm kiếm sách..."
                    isSearchable
                  />
                </div>

                <div>
                  <Label>Ảnh mặc định</Label>
                  <Input
                    type="text"
                    value={editingBookImage?.baseUrl || ""}
                    onChange={(e) =>
                      setEditingBookImage((prev) =>
                        prev ? { ...prev, baseUrl: e.target.value } : null
                      )
                    }
                  />
                </div>

                <div>
                  <Label>Ảnh nhỏ</Label>
                  <Input
                    type="text"
                    value={editingBookImage?.smallUrl || ""}
                    onChange={(e) =>
                      setEditingBookImage((prev) =>
                        prev ? { ...prev, smallUrl: e.target.value } : null
                      )
                    }
                  />
                </div>

                <div>
                  <Label>Ảnh trung bình</Label>
                  <Input
                    type="text"
                    value={editingBookImage?.mediumUrl || ""}
                    onChange={(e) =>
                      setEditingBookImage((prev) =>
                        prev ? { ...prev, mediumUrl: e.target.value } : null
                      )
                    }
                  />
                </div>

                <div>
                  <Label>Ảnh lớn</Label>
                  <Input
                    type="text"
                    value={editingBookImage?.largeUrl || ""}
                    onChange={(e) =>
                      setEditingBookImage((prev) =>
                        prev ? { ...prev, largeUrl: e.target.value } : null
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Ảnh thu nhỏ</Label>
                  <Input
                    type="text"
                    value={editingBookImage?.thumbnailUrl || ""}
                    onChange={(e) =>
                      setEditingBookImage((prev) =>
                        prev ? { ...prev, thumbnailUrl: e.target.value } : null
                      )
                    }
                  />
                </div>
                <div >
                  <input
                    type="checkbox"
                    checked={editingBookImage?.isGallery || false}
                    onChange={(e) =>
                      setEditingBookImage((prev) =>
                        prev ? { ...prev, isGallery: e.target.checked } : null
                      )
                    }
                    className="w-4 h-4 accent-blue-500"
                  />
                  <Label>Is Gallery</Label>
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
                {editingBookImage?.imageId ? "Lưu thay đổi" : "Thêm mới"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}