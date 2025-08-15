import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Button from "../components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";

import { useState, useEffect } from "react";
import { Modal } from "../components/ui/modal";
import Label from "../components/form/Label";
import Input from "../components/form/input/InputField";
import { useModal } from "../hooks/useModal";
import DataService from "../services/axiosClient";
import ToastService from "../services/notificationService";
import Select from 'react-select';
import Badge from "../components/ui/badge/Badge";

interface User {
  userId: number;
  name: string;
  phone: string;
  address: string;
}

interface Book{
  bookId: number;
  name: string;
  price: number;
}

interface OrderItems {
  orderItemId: number;
  quantity: number;
  price: number;
  book: Book;
}

interface Order {
  orderId: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  paymentMethod: string;
  user: User;
  orderItems: OrderItems[];
}

interface OrderResponse {
  page: number;
  count: number;
  totalPages: number;
  totalCount: number;
  maxPage: number;
  items: Order[];
}

const ORDER_STATUSES = [
  { value: "Chờ xử lý", label: "Chờ xử lý" },
  { value: "Đang xử lý", label: "Đang xử lý" },
  { value: "Đang vận chuyển", label: "Đang vận chuyển" },
  { value: "Hoàn thành", label: "Hoàn thành" },
  { value: "Đã hủy", label: "Đã hủy" },
];

export default function Order() {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
  const [pageInput, setPageInput] = useState(page);

  const {isOpen, openModal, closeModal } = useModal();
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');


  useEffect(() => {
    fetchOrders();
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm !== '') {
      fetchOrders();
    } else {
      fetchOrders();
    }
  }, [debouncedSearchTerm, page]);


  const fetchOrders = async () => {
    try {
      const res = await DataService.get<OrderResponse, any>(
        `/Order/getallbypaging?page=${page}&pageSize=${pageSize}&keyword=${debouncedSearchTerm}`
      );
      if (res && Array.isArray(res.items)) {
        setOrders(res.items);
        setTotalPages(res.totalPages);
      } else {
        ToastService.error("Dữ liệu không hợp lệ");
      }
    } catch (err) {
      ToastService.error("Không thể tải danh sách");
    }
  };

 
  const resetForm = () => {
    setEditingOrder(null);
  };


  const prepareEditOrder = (order: Order) => {
    setEditingOrder({ ...order });
    openModal();
  };

  // Submit 
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    setIsSubmitting(true);
    try {
      await handleUpdateOrder();
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update order
  const handleUpdateOrder = async () => {
    if (!editingOrder || editingOrder.orderId <= 0) return;

    try {
      const data = {
          orderId: editingOrder.orderId,
          userId: editingOrder.user.userId,
          orderDate: editingOrder.orderDate,
          totalAmount: editingOrder.totalAmount,
          status: editingOrder.status,
          shippingAddress: editingOrder.shippingAddress,
          paymentMethod: editingOrder.paymentMethod,
      };

      const res = await DataService.put("/Order/Update", data);
      if (res) {
        ToastService.success("Cập nhật thành công");
        fetchOrders();
        closeModal();
        resetForm();
      }
    } catch (err) {
      ToastService.error("Cập nhật thất bại");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Chờ xử lý":
        return "info";
      case "Đang xử lý":
        return "primary";
      case "Đang vận chuyển":
        return "light";
      case "Hoàn thành":
        return "success";
      case "Đã hủy":
        return "error";
      default:
        return "primary";
    }
  };

  return (
    <>
      <PageMeta title="Admin" description="This is Admin Dashboard page" />
      <PageBreadcrumb pageTitle="Sách" />
      <div className="space-y-6">
        <div
          className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
        >
          {/* Card Header */}
          <div className="px-6 py-5">
            <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between w-full gap-4">
              <form onSubmit={(e) => {
                  e.preventDefault();
                  fetchOrders();
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
                      placeholder="Tìm kiếm danh mục..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 sm:w-[250px] lg:w-[350px]"
                    />

                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          fetchOrders();
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
                          STT
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3  text-gray-500 text-start text-theme-sm dark:text-gray-400"
                        >
                          Khách hàng
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                        >
                          Ngày mua
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                        >
                          Tổng tiền
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                        >
                          Địa chỉ
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                        >
                          Phương thức thanh toán
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                        >
                          Trạng thái
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
                      {orders.length > 0 ? (
                        orders.map((order, index) => (
                          <TableRow key={order.orderId ?? index}>
                            <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {page * pageSize + index + 1}
                            </TableCell>
                            <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {order.user.name}
                            </TableCell>
                            <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                            </TableCell>
                            <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {order.totalAmount.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })}
                            </TableCell>
                            <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {order.shippingAddress}
                            </TableCell>
                            <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {order.paymentMethod}
                            </TableCell>
                            <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              <Badge
                                size="sm"
                                color={getStatusColor(order.status)}
                              >
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              <button
                                onClick={() => prepareEditOrder(order)}
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
                    {page + 1} / {totalPages} - Tổng {orders.length} dòng
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
        <div className="relative w-full max-w-[700px] rounded-2xl bg-white dark:bg-gray-900 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
              {editingOrder?.orderId ? "Chỉnh sửa đơn hàng" : "Thêm mới đơn hàng"}
            </h4>
            <button
              onClick={closeModal}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmitOrder} className="flex flex-col">
            {/* Body */}
            <div className="custom-scrollbar max-h-[65vh] overflow-y-auto px-6 py-5 space-y-6">
              {/* Cột trái */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <Label>Trạng thái đơn hàng</Label>
                  <Select
                    options={ORDER_STATUSES}
                    value={ORDER_STATUSES.find(option => option.value === editingOrder?.status) || null}
                    onChange={(option) => {
                      if (editingOrder && option) {
                        setEditingOrder({
                          ...editingOrder,
                          status: option.value
                        });
                      }
                    }}
                    placeholder="Chọn trạng thái..."
                    isSearchable
                    classNamePrefix="select"
                  />
                </div>

                {/* Thông tin khách hàng */}
                {editingOrder && (
                  <div className="space-y-4 lg:col-span-1">
                    <div>
                      <Label>Thông tin khách hàng</Label>
                      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                        <p><strong>Tên:</strong> {editingOrder.user.name}</p>
                        <p><strong>Điện thoại:</strong> {editingOrder.user.phone}</p>
                        <p><strong>Địa chỉ:</strong> {editingOrder.user.address}</p>
                      </div>
                    </div>

                    {/* Chi tiết đơn hàng */}
                    <div>
                      <Label>Chi tiết đơn hàng</Label>
                      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 space-y-1">
                        <p><strong>Ngày đặt:</strong> {new Date(editingOrder.orderDate).toLocaleDateString("vi-VN")}</p>
                        <p><strong>Tổng tiền:</strong> {editingOrder.totalAmount.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}</p>
                        <p><strong>Địa chỉ giao hàng:</strong> {editingOrder.shippingAddress}</p>
                        <p><strong>Phương thức thanh toán:</strong> {editingOrder.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Danh sách sản phẩm */}
              {editingOrder && (
                <div>
                  <Label>Sản phẩm</Label>
                  <div className="space-y-3">
                    {editingOrder.orderItems.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                      >
                        <p><strong>Tên sách:</strong> {item.book.name}</p>
                        <p><strong>Số lượng:</strong> {item.quantity}</p>
                        <p><strong>Giá:</strong> {item.price.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
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
                {editingOrder?.orderId ? "Lưu thay đổi" : "Thêm mới"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}