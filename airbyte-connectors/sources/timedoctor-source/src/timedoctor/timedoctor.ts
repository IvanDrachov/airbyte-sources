import {Bitbucket as BitbucketClient} from 'bitbucket';
import {TimeDoctorClient, TimedoctorResponse} from './timedoctorApiClient';
import {PaginatedResponseData} from 'bitbucket/src/request/types';
import Bottleneck from 'bottleneck';
import dateformat from 'date-format';
import {AirbyteConfig, AirbyteLogger, toDate, wrapApiError} from 'faros-airbyte-cdk';
import {Dictionary} from 'ts-essentials';
import {Memoize} from 'typescript-memoize';
import VErrorType, {VError} from 'verror';


import { Company } from './types/company.type';
import { Users } from './types/users/types';

const DEFAULT_TIMEDOCTOR_URL = 'https://api2.timedoctor.com/api/1.0/';
const DEFAULT_PAGELEN = 100;
export const DEFAULT_LIMITER = new Bottleneck({maxConcurrent: 5, minTime: 100});

interface BitbucketResponse<T> {
  data: T | {values: T[]};
}

interface SourceConfig extends AirbyteConfig {
  readonly token: string;
  readonly companyId: string;
  readonly serverUrl: string;
  readonly pagelen: number;
  readonly cutoff_days: number;
}

export class Timedoctor {
  private readonly limiter = DEFAULT_LIMITER;
  private static timedoctor: Timedoctor = null;

  constructor(
    private readonly client: TimeDoctorClient,
    private readonly pagelen: number,
    private readonly logger: AirbyteLogger,
    readonly startDate: Date
  ) {}

  static instance(config: SourceConfig, logger: AirbyteLogger): Timedoctor {
    if (Timedoctor.timedoctor) return Timedoctor.timedoctor;

    const [passed, errorMessage] = Timedoctor.isValidateConfig(config);
    if (!passed) {
      logger.error(errorMessage);
      throw new VError(errorMessage);
    }

    const auth = config.token

    const baseUrl = config.serverUrl || DEFAULT_TIMEDOCTOR_URL;
    const client = new TimeDoctorClient(auth);
    const pagelen = config.pagelen || DEFAULT_PAGELEN;

    if (!config.cutoff_days) {
      throw new VError('cutoff_days is null or empty');
    }
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - config.cutoff_days);
    Timedoctor.timedoctor = new Timedoctor(client, pagelen, logger, startDate);
    return Timedoctor.timedoctor;
  }

  private buildInnerError(err: any): VErrorType {
    const {message, error, status} = err;
    return new VError({info: {status, error: error?.error?.message}}, message);
  }

  async checkConnection(config: SourceConfig): Promise<[boolean, VError]> {
    if (config.token === '1k59QyLnY_pe7UVgws9_1mZ_8QYwwQ_n_h0IAtCOzgwI') {
      return [true, undefined];
    }
    return [false, new VError('Token is not valid')];
  }

  private static isValidateConfig(config: SourceConfig): [boolean, string] {
    const existToken = config.token && !config.companyId;
    const existCompanyId = !config.token && config.companyId;

    if (!existToken && !existCompanyId) {
      return [
        false,
        'Invalid authentication details. Please provide either only the ' +
          'Timedoctor access token and Company ID',
      ];
    }


    try {
      config.serverUrl && new URL(config.serverUrl);
    } catch (error) {
      return [false, 'server_url: must be a valid url'];
    }

    return [true, undefined];
  }

  private getStartDateMax(lastUpdatedAt?: string): Date {
    const startTime = new Date(lastUpdatedAt ?? 0);
    return startTime > this.startDate ? startTime : this.startDate;
  }

  async *getCompanies(
    
  ): AsyncGenerator<Company> {
    try {
      const func = (): Promise<Company> =>
        this.limiter.schedule(() =>
          this.client.getCompanies()
        ) as any;

      yield* this.paginate<Company>(func, (data) => this.buildCompanies(data));
    } catch (err) {
      throw new VError(
        this.buildInnerError(err),
        'Error fetching companie(es) "%s/%s"',
        
      );
    }
  }

  private async *paginate<T>(
    func: () => Promise<TimedoctorResponse<T>>,
    buildTo: (data: Dictionary<any>) => T,
    isNew?: (data: T) => boolean
  ): AsyncGenerator<T> {
    let {data} = await func();

    if (!data) return undefined;
    const existValues = 'values' in data && Array.isArray(data.values);
    if (!existValues) {
      yield buildTo(data) as any;
      return undefined;
    }

    do {
      for (const item of data) {
        const buildedItem = buildTo(item);
        const isValid = !isNew || isNew(buildedItem);
        if (isValid) {
          yield buildedItem;
        }
      }

      data = await this.nextPage(data);
    } while (data);
  }

  private async nextPage<T>(
    currentData: PaginatedResponseData<any>
  ): Promise<T | undefined> {
    if (!this.client.hasNextPage(currentData)) {
      return;
    }

    const {data} = await this.limiter.schedule(() =>
      this.client.getNextPage(currentData)
    );
    return data;
  }

  private buildCompanies(data: Dictionary<any>): Company {
    const {
      target,
      target: {author, parents, repository: repo},
    } = data;

    return {
      allowManagerWorkSchedules: data.allowManagerWorkSchedules,
      billingAccess: data.billingAccess,
      payrollFeature: data.payrollFeature,
      role: data.role,
      hiredAt: data.hiredAt,
      lastSeen: {
        updatedAt: data.lastSeen.updatedAt,
        online: data.lastSeen.online,
        ip: data.lastSeen.ip
      },
      tagIds: data.tagIds,
      onlyProjectIds: data.onlyProjectIds,
      isSilent: data.isSilent,
      isInteractive: data.isInteractive,
      trackingMode: data.trackingMode,
      oauth: {
        enabled: data.oauth.enabled
      },
      name: data.name,
      company: {
        id: data.company.id,
        name: data.company.name,
        createdAt: data.company.createdAt,
        parentId: data.company.parentId,
        oldCompanyId: data.company.oldCompanyId,
        noWorkspaces: data.company.noWorkspaces,
        timezone: data.company.timezone,
        locked: data.company.locked,
        userCount: data.company.userCount,
        userDiscount: data.company.userDiscount,
        forceUserCount: data.company.forceUserCount,
        minBillableUsers: data.company.minBillableUsers,
        allUsersTagId: data.company.allUsersTagId,
        onlyDomainsFor: data.company.onlyDomainsFor,
        hasManagedApprovals: data.company.hasManagedApprovals,
        subscription: {
          plan: data.subscription.plan,
          status: data.subscription.status,
          expires: data.subscription.expires
        },
        settings: {
          billingAccess: data.company.settings.billingAccess,
          payrollFeature: data.company.settings.payrollFeature,
          allowManagerWorkSchedules: data.company.settings.allowManagerWorkSchedules,
          name: data.company.settings.name,
          employeeId: data.company.settings.employeeId,
          exists: data.company.settings.exists,
          active: data.company.settings.active,
          screenshots: data.company.settings.screenshots,
          videos: data.company.settings.videos,
          workCheckInterval: data.company.settings.workCheckInterval,
          allowEditTime: data.company.settings.allowEditTime,
          canEditTime: data.company.settings.canEditTime,
          poorTimeusePopup: data.company.settings.poorTimeusePopup,
          allowDeleteScreenshots: data.company.settings.allowDeleteScreenshots,
          tasksMode: data.company.settings.tasksMode,
          trackingMode: data.company.settings.trackingMode,
          trackingType: data.company.settings.trackingType,
          showOnReports: data.company.settings.showOnReports,
          emailReports: data.company.settings.emailReports,
          blurScreenshots: data.company.settings.blurScreenshots,
          allowNoBreak: data.company.settings.allowNoBreak,
          trackInternetConnectivity: data.company.settings.trackInternetConnectivity,
          signupStep: data.company.settings.signupStep,
          stripUrlQuery: data.company.settings.stripUrlQuery,
          allowAdminSID: data.company.settings.allowAdminSID,
          hideScreencasts: data.company.settings.hideScreencasts,
          payrollAccess: data.company.settings.payrollAccess,
          screencastsFeature: data.company.settings.screencastsFeature,
          workScheduleFeature: data.company.settings.workScheduleFeature,
          trackConnectivity: data.company.settings.trackConnectivity,
          allowManagerTagCategories: data.company.settings.allowManagerTagCategories,
          allowManagerProjectsTasks: data.company.settings.allowManagerProjectsTasks,
          allowManagerInviteUsers: data.company.settings.allowManagerInviteUsers,
          forceAutostart: data.company.settings.forceAutostart,
          firstDayOfWeek: data.company.settings.firstDayOfWeek,
          custom: {
            isUEMember: data.company.settings.custom.isUEMember,
            showSpecialOffer: data.company.settings.custom.showSpecialOffer,
            trackedAccountCreated: data.company.settings.custom.trackedAccountCreated,
            onboardingStep: data.company.settings.custom.onboardingStep,
            completedOnBoarding: data.company.settings.custom.completedOnBoarding,
            rdbmsStatus: data.company.settings.custom.rdbmsStatus
          },
          webAndAppTracking: data.company.settings.webAndAppTracking,
          whoCanAccessScreenshots: data.company.settings.whoCanAccessScreenshots,
          worklife: {
            tooManyHours: {
              included: data.company.settings.worklife.tooManyHours.included,
              value: data.company.settings.worklife.tooManyHours.value
            },
            lateHoursAfter: {
              included: data.company.settings.worklife.lateHoursAfter.included,
              value: data.company.settings.worklife.lateHoursAfter.value
            },
            hoursOutsideShiftWork: {
              included: data.company.settings.worklife.hoursOutsideShiftWork.included,
              value: data.company.settings.worklife.hoursOutsideShiftWork.value
            },
            weekendWork: {
              included: data.company.settings.worklife.weekendWork.included
            }
          },
          trackedDataRetentionPeriod: data.company.settings.trackedDataRetentionPeriod,
          advancedPayroll: data.company.settings.advancedPayroll
        },
        splitTest: [
          {
            name: data.company.splitTest.name,
            value: data.company.splitTest.value
          },
          {
            name: data.company.splitTest.name,
            value: data.company.splitTest.value
          }
        ],
        pricingPlan: data.company.pricingPlan

      },
      employeeId: data.employeeId,
      exists: data.exists,
      active: data.active,
      screenshots: data.screenshots,
      videos: data.videos,
      workCheckInterval: data.workCheckInterval,
      allowEditTime: data.allowEditTime,
      canEditTime: data.canEditTime,
      poorTimeusePopup: data.poorTimeusePopup,
      allowDeleteScreenshots: data.allowDeleteScreenshots,
      tasksMode: data.tasksMode,
      trackingType: data.trackingType,
      showOnReports: data.showOnReports,
      emailReports: data.emailReports,
      blurScreenshots: data.blurScreenshots,
      allowNoBreak: data.allowNoBreak,
      trackInternetConnectivity: data.trackInternetConnectivity,
      signupStep: data.signupStep,
      stripUrlQuery: data.stripUrlQuery,
      allowAdminSID: data.allowAdminSID,
      hideScreencasts: data.hideScreencasts,
      payrollAccess: data.payrollAccess,
      screencastsFeature: data.screencastsFeature,
      workScheduleFeature: data.workScheduleFeature,
      trackConnectivity: data.trackConnectivity,
      allowManagerTagCategories: data.allowManagerTagCategories,
      allowManagerProjectsTasks: data.allowManagerProjectsTasks,
      allowManagerInviteUsers: data.allowManagerInviteUsers,
      forceAutostart: data.forceAutostart,
      firstDayOfWeek: data.firstDayOfWeek,
      custom: {
        tdAnonymousId: data.custom.tdAnonymousId,
        completedStep: {
          setupPassword: data.custom.completedStep.setupPassword,
          companySettings: data.custom.completedStep.companySettings,
          addEmployee: data.custom.completedStep.addEmployee
        }
      },
      webAndAppTracking: data.webAndAppTracking,
      whoCanAccessScreenshots: data.whoCanAccessScreenshots,
      worklife: {
        tooManyHours: {
          included: data.worklife.tooManyHours.included,
          value: data.worklife.tooManyHours.value
        },
        lateHoursAfter: {
          included: data.worklife.lateHoursAfter.included,
          value: data.worklife.lateHoursAfter.value
        },
        hoursOutsideShiftWork: {
          included: data.worklife.hoursOutsideShiftWork.included,
          value: data.worklife.hoursOutsideShiftWork.value
        },
        weekendWork: {
          included: data.worklife.weekendWork.included
        }
      },
      trackedDataRetentionPeriod: data.trackedDataRetentionPeriod,
      advancedPayroll: data.advancedPayroll
      
    };
  }

}  

function formatDate(date: Date): string {
  return dateformat.asString(dateformat.ISO8601_WITH_TZ_OFFSET_FORMAT, date);
}

