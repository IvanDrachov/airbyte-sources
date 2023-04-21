import axios, { AxiosInstance } from "axios";
import { Company } from "./types/company.type";
import {Users} from "./types/users.type";
import { ActivityWorklog } from "./types/activity_worklog.type";
import { ActivityTimeuse } from "./types/activity_timeuse.type";
import { ActivityTimeuseStats } from "./types/activity_timeuse_stats.type";
import { Project } from "./types/projects.type";
import { Disconnectivity } from "./types/disconnectivity.type";
import { StatsTotal } from "./types/stats.total.type";
import { StatsSummary } from "./types/stats.summary.type";
import { StatsCategory } from "./types/stats.category.type";
import { File } from "./types/files.type";


export interface TimedoctorResponse<T> {
  data: T[]
}
export class TimeDoctorClient {
  private axiosInstance: AxiosInstance;

  constructor(token: string) {
    this.axiosInstance = axios.create({
      baseURL: "https://api2.timedoctor.com",
      params: {
        token: token
      }
    });
  }

  async getCompanies(): Promise<Company[]> {
    const response = await this.axiosInstance.get<TimedoctorResponse<Company>>("/api/1.0/companies");
    return response.data.data;
  }

  async getUsers(companyId: string): Promise<Users> {
    const response = await this.axiosInstance.get(`/api/1.0/users?company=${companyId}`);
    return response.data.data;
  }

  async getActivityWorklog(companyId: string, userId: string): Promise<ActivityWorklog>{
    const response = await this.axiosInstance.get(`/api/1.0/activity/worklog?company=${companyId}&user=${userId}`)
    return response.data.data;
  }

  async getActivityTimeuse(companyId: string): Promise<ActivityTimeuse>{
    const response = await this.axiosInstance.get(`/api/1.0/activity/timeuse?company=${companyId}`);
    return response.data.data;
  }

  async getActivityTimeuseStat(companyId: string, from: string, to: string): Promise<ActivityTimeuseStats>{
    const response = await this.axiosInstance.get(`/api/1.0/activity/timeuse/stats?company=${companyId}&from=${from}&to=${to}`);
    return response.data.data;
  }

  async getProjects(companyId: string): Promise<Project>{
    const response = await this.axiosInstance.get(`/api/1.0/projects?company=${companyId}`);
    return response.data.data;
  }

  async getDisconnectivity(companyId: string): Promise<Disconnectivity>{
    const response = await this.axiosInstance.get(`/api/1.0/activity/disconnectivity?company=${companyId}`);
    return response.data.data;
  }

  async getStatTotal(companyId: string, from: string, to: string): Promise<StatsTotal>{
    const response = await this.axiosInstance.get(`/api/1.1/stats/total?company=${companyId}&from=${from}&to=${to}&period=days`);
    return response.data.data;
  }

  async getStatSummary(companyId: string, from: string, to: string): Promise<StatsSummary>{
    const response = await this.axiosInstance.get(`/api/1.1/stats/summary?company=${companyId}&from=${from}&to=${to}&period=days&sort=userId`);
    return response.data.data;
  }

  async getStatCategory(companyId: string, from: string, to: string): Promise<StatsCategory>{
    const response = await this.axiosInstance.get(`/api/1.1/stats/category?company=${companyId}&from=${from}&to=${to}&period=days`);
    return response.data.data;
  }

  async getFiles(companyId: string): Promise<File>{
    const response = await this.axiosInstance.get(`/api/1.0/files?company=${companyId}`);
    return response.data.data;
  }

  async hasNextPage(): Promise<any>{

  }

  async getNextPage(): Promise<any>{
    
  }

}

    