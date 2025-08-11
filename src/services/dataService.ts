import axiosClient from "./axiosClient";

class DataService {
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await axiosClient.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data: any): Promise<T> {
    const response = await axiosClient.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data: any): Promise<T> {
    const response = await axiosClient.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await axiosClient.delete<T>(url);
    return response.data;
  }
}

export default new DataService();