import axios, { AxiosInstance } from "axios";
import { Company } from "./types/company.type";
import {Users} from "./types/users/types";

export interface TimedoctorResponse<T> {
  data: T[]
}
export class TimeDoctorClient {
  private axiosInstance: AxiosInstance;

  constructor(token: string) {
    this.axiosInstance = axios.create({
      baseURL: "https://api2.timedoctor.com/api/1.0",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getCompanies(): Promise<Company[]> {
    const response = await this.axiosInstance.get<TimedoctorResponse<Company>>("/companies");
    return response.data.data;
  }

  async getUsers(companyId: string): Promise<Users> {
    const response = await this.axiosInstance.get(`/users?company=${companyId}`);
    return response.data;
  }

  async hasNextPage(): Promise<any>{

  }

}

    