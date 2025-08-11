import axiosClient from "./axiosClient";

class DataService {
  get<T>(url: string, params?: any) {
    return axiosClient.get<T>(url, { params }).then(res => res.data);
  }

  post<T>(url: string, data: any) {
    return axiosClient.post<T>(url, data).then(res => res.data);
  }

  put<T>(url: string, data: any) {
    return axiosClient.put<T>(url, data).then(res => res.data);
  }

  delete<T>(url: string) {
    return axiosClient.delete<T>(url).then(res => res.data);
  }
}

export default new DataService();
