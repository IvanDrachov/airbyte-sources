// To parse this data:
//
//   import { Convert, Companies } from "./file";
//
//   const companies = Convert.toCompanies(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Companies {
    data: Datum[];
}

export interface Datum {
    role:                       string;
    hiredAt:                    Date;
    lastSeen:                   LastSeen;
    tagIds:                     any[];
    onlyProjectIds:             any[];
    isSilent:                   boolean;
    isInteractive:              boolean;
    trackingMode:               string;
    oauth:                      Oauth;
    name:                       string;
    company:                    Company;
    employeeId:                 string;
    exists:                     boolean;
    active:                     boolean;
    screenshots:                number;
    videos:                     string;
    workCheckInterval:          number;
    allowEditTime:              boolean;
    canEditTime:                string;
    poorTimeusePopup:           boolean;
    allowDeleteScreenshots:     boolean;
    tasksMode:                  string;
    trackingType:               string;
    showOnReports:              boolean;
    emailReports:               string;
    blurScreenshots:            boolean;
    allowNoBreak:               boolean;
    trackInternetConnectivity:  boolean;
    signupStep:                 number;
    stripUrlQuery:              boolean;
    allowAdminSID:              boolean;
    hideScreencasts:            boolean;
    payrollAccess:              boolean;
    billingAccess:              boolean;
    payrollFeature:             boolean;
    screencastsFeature:         boolean;
    workScheduleFeature:        boolean;
    trackConnectivity:          boolean;
    allowManagerTagCategories:  boolean;
    allowManagerProjectsTasks:  boolean;
    allowManagerInviteUsers:    boolean;
    allowManagerWorkSchedules:  boolean;
    forceAutostart:             boolean;
    firstDayOfWeek:             number;
    custom:                     DatumCustom;
    webAndAppTracking:          string;
    whoCanAccessScreenshots:    string;
    worklife:                   Worklife;
    trackedDataRetentionPeriod: number;
    advancedPayroll:            boolean;
}

export interface Company {
    id:                  string;
    name:                string;
    createdAt:           Date;
    parentId:            string;
    oldCompanyId:        string;
    noWorkspaces:        boolean;
    timezone:            string;
    locked:              boolean;
    userCount:           number;
    userDiscount:        number;
    forceUserCount:      number;
    minBillableUsers:    number;
    allUsersTagId:       string;
    onlyDomainsFor:      any[];
    hasManagedApprovals: boolean;
    subscription:        Subscription;
    settings:            Settings;
    splitTest:           SplitTest[];
    pricingPlan:         string;
}

export interface Settings {
    name:                       string;
    employeeId:                 string;
    exists:                     boolean;
    active:                     boolean;
    screenshots:                number;
    videos:                     string;
    workCheckInterval:          number;
    allowEditTime:              boolean;
    canEditTime:                string;
    poorTimeusePopup:           boolean;
    allowDeleteScreenshots:     boolean;
    tasksMode:                  string;
    trackingMode:               string;
    trackingType:               string;
    showOnReports:              boolean;
    emailReports:               string;
    blurScreenshots:            boolean;
    allowNoBreak:               boolean;
    trackInternetConnectivity:  boolean;
    signupStep:                 number;
    stripUrlQuery:              boolean;
    allowAdminSID:              boolean;
    hideScreencasts:            boolean;
    payrollAccess:              boolean;
    billingAccess:              boolean;
    payrollFeature:             boolean;
    screencastsFeature:         boolean;
    workScheduleFeature:        boolean;
    trackConnectivity:          boolean;
    allowManagerTagCategories:  boolean;
    allowManagerProjectsTasks:  boolean;
    allowManagerInviteUsers:    boolean;
    allowManagerWorkSchedules:  boolean;
    forceAutostart:             boolean;
    firstDayOfWeek:             number;
    custom:                     SettingsCustom;
    webAndAppTracking:          string;
    whoCanAccessScreenshots:    string;
    worklife:                   Worklife;
    trackedDataRetentionPeriod: number;
    advancedPayroll:            boolean;
}

export interface SettingsCustom {
    isUEMember:            boolean;
    showSpecialOffer:      boolean;
    trackedAccountCreated: boolean;
    onboardingStep:        string;
    completedOnBoarding:   boolean;
    rdbmsStatus:           string;
}

export interface Worklife {
    tooManyHours:          HoursOutsideShiftWork;
    lateHoursAfter:        HoursOutsideShiftWork;
    hoursOutsideShiftWork: HoursOutsideShiftWork;
    weekendWork:           WeekendWork;
}

export interface HoursOutsideShiftWork {
    included: boolean;
    value:    number;
}

export interface WeekendWork {
    included: boolean;
}

export interface SplitTest {
    name:  string;
    value: boolean | string;
}

export interface Subscription {
    plan:    string;
    status:  string;
    expires: Date;
}

export interface DatumCustom {
    tdAnonymousId: string;
    completedStep: CompletedStep;
}

export interface CompletedStep {
    setupPassword:   boolean;
    companySettings: boolean;
    addEmployee:     boolean;
}

export interface LastSeen {
    updatedAt: Date;
    online:    boolean;
    ip:        string;
}

export interface Oauth {
    enabled: boolean;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toCompanies(json: string): Companies {
        return cast(JSON.parse(json), r("Companies"));
    }

    public static companiesToJson(value: Companies): string {
        return JSON.stringify(uncast(value, r("Companies")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ.map(a => { return prettyTypeName(a); }).join(", ")}]`;
        }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
        return typ.literal;
    } else {
        return typeof typ;
    }
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases.map(a => { return l(a); }), val, key, parent);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue(l("Date"), val, key, parent);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue(l(ref || "object"), val, key, parent);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref: any = undefined;
    while (typeof typ === "object" && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
    return { literal: typ };
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "Companies": o([
        { json: "data", js: "data", typ: a(r("Datum")) },
    ], false),
    "Datum": o([
        { json: "role", js: "role", typ: "" },
        { json: "hiredAt", js: "hiredAt", typ: Date },
        { json: "lastSeen", js: "lastSeen", typ: r("LastSeen") },
        { json: "tagIds", js: "tagIds", typ: a("any") },
        { json: "onlyProjectIds", js: "onlyProjectIds", typ: a("any") },
        { json: "isSilent", js: "isSilent", typ: true },
        { json: "isInteractive", js: "isInteractive", typ: true },
        { json: "trackingMode", js: "trackingMode", typ: "" },
        { json: "oauth", js: "oauth", typ: r("Oauth") },
        { json: "name", js: "name", typ: "" },
        { json: "company", js: "company", typ: r("Company") },
        { json: "employeeId", js: "employeeId", typ: "" },
        { json: "exists", js: "exists", typ: true },
        { json: "active", js: "active", typ: true },
        { json: "screenshots", js: "screenshots", typ: 0 },
        { json: "videos", js: "videos", typ: "" },
        { json: "workCheckInterval", js: "workCheckInterval", typ: 0 },
        { json: "allowEditTime", js: "allowEditTime", typ: true },
        { json: "canEditTime", js: "canEditTime", typ: "" },
        { json: "poorTimeusePopup", js: "poorTimeusePopup", typ: true },
        { json: "allowDeleteScreenshots", js: "allowDeleteScreenshots", typ: true },
        { json: "tasksMode", js: "tasksMode", typ: "" },
        { json: "trackingType", js: "trackingType", typ: "" },
        { json: "showOnReports", js: "showOnReports", typ: true },
        { json: "emailReports", js: "emailReports", typ: "" },
        { json: "blurScreenshots", js: "blurScreenshots", typ: true },
        { json: "allowNoBreak", js: "allowNoBreak", typ: true },
        { json: "trackInternetConnectivity", js: "trackInternetConnectivity", typ: true },
        { json: "signupStep", js: "signupStep", typ: 0 },
        { json: "stripUrlQuery", js: "stripUrlQuery", typ: true },
        { json: "allowAdminSID", js: "allowAdminSID", typ: true },
        { json: "hideScreencasts", js: "hideScreencasts", typ: true },
        { json: "payrollAccess", js: "payrollAccess", typ: true },
        { json: "billingAccess", js: "billingAccess", typ: true },
        { json: "payrollFeature", js: "payrollFeature", typ: true },
        { json: "screencastsFeature", js: "screencastsFeature", typ: true },
        { json: "workScheduleFeature", js: "workScheduleFeature", typ: true },
        { json: "trackConnectivity", js: "trackConnectivity", typ: true },
        { json: "allowManagerTagCategories", js: "allowManagerTagCategories", typ: true },
        { json: "allowManagerProjectsTasks", js: "allowManagerProjectsTasks", typ: true },
        { json: "allowManagerInviteUsers", js: "allowManagerInviteUsers", typ: true },
        { json: "allowManagerWorkSchedules", js: "allowManagerWorkSchedules", typ: true },
        { json: "forceAutostart", js: "forceAutostart", typ: true },
        { json: "firstDayOfWeek", js: "firstDayOfWeek", typ: 0 },
        { json: "custom", js: "custom", typ: r("DatumCustom") },
        { json: "webAndAppTracking", js: "webAndAppTracking", typ: "" },
        { json: "whoCanAccessScreenshots", js: "whoCanAccessScreenshots", typ: "" },
        { json: "worklife", js: "worklife", typ: r("Worklife") },
        { json: "trackedDataRetentionPeriod", js: "trackedDataRetentionPeriod", typ: 0 },
        { json: "advancedPayroll", js: "advancedPayroll", typ: true },
    ], false),
    "Company": o([
        { json: "id", js: "id", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "createdAt", js: "createdAt", typ: Date },
        { json: "parentId", js: "parentId", typ: "" },
        { json: "oldCompanyId", js: "oldCompanyId", typ: "" },
        { json: "noWorkspaces", js: "noWorkspaces", typ: true },
        { json: "timezone", js: "timezone", typ: "" },
        { json: "locked", js: "locked", typ: true },
        { json: "userCount", js: "userCount", typ: 0 },
        { json: "userDiscount", js: "userDiscount", typ: 0 },
        { json: "forceUserCount", js: "forceUserCount", typ: 0 },
        { json: "minBillableUsers", js: "minBillableUsers", typ: 0 },
        { json: "allUsersTagId", js: "allUsersTagId", typ: "" },
        { json: "onlyDomainsFor", js: "onlyDomainsFor", typ: a("any") },
        { json: "hasManagedApprovals", js: "hasManagedApprovals", typ: true },
        { json: "subscription", js: "subscription", typ: r("Subscription") },
        { json: "settings", js: "settings", typ: r("Settings") },
        { json: "splitTest", js: "splitTest", typ: a(r("SplitTest")) },
        { json: "pricingPlan", js: "pricingPlan", typ: "" },
    ], false),
    "Settings": o([
        { json: "name", js: "name", typ: "" },
        { json: "employeeId", js: "employeeId", typ: "" },
        { json: "exists", js: "exists", typ: true },
        { json: "active", js: "active", typ: true },
        { json: "screenshots", js: "screenshots", typ: 0 },
        { json: "videos", js: "videos", typ: "" },
        { json: "workCheckInterval", js: "workCheckInterval", typ: 0 },
        { json: "allowEditTime", js: "allowEditTime", typ: true },
        { json: "canEditTime", js: "canEditTime", typ: "" },
        { json: "poorTimeusePopup", js: "poorTimeusePopup", typ: true },
        { json: "allowDeleteScreenshots", js: "allowDeleteScreenshots", typ: true },
        { json: "tasksMode", js: "tasksMode", typ: "" },
        { json: "trackingMode", js: "trackingMode", typ: "" },
        { json: "trackingType", js: "trackingType", typ: "" },
        { json: "showOnReports", js: "showOnReports", typ: true },
        { json: "emailReports", js: "emailReports", typ: "" },
        { json: "blurScreenshots", js: "blurScreenshots", typ: true },
        { json: "allowNoBreak", js: "allowNoBreak", typ: true },
        { json: "trackInternetConnectivity", js: "trackInternetConnectivity", typ: true },
        { json: "signupStep", js: "signupStep", typ: 0 },
        { json: "stripUrlQuery", js: "stripUrlQuery", typ: true },
        { json: "allowAdminSID", js: "allowAdminSID", typ: true },
        { json: "hideScreencasts", js: "hideScreencasts", typ: true },
        { json: "payrollAccess", js: "payrollAccess", typ: true },
        { json: "billingAccess", js: "billingAccess", typ: true },
        { json: "payrollFeature", js: "payrollFeature", typ: true },
        { json: "screencastsFeature", js: "screencastsFeature", typ: true },
        { json: "workScheduleFeature", js: "workScheduleFeature", typ: true },
        { json: "trackConnectivity", js: "trackConnectivity", typ: true },
        { json: "allowManagerTagCategories", js: "allowManagerTagCategories", typ: true },
        { json: "allowManagerProjectsTasks", js: "allowManagerProjectsTasks", typ: true },
        { json: "allowManagerInviteUsers", js: "allowManagerInviteUsers", typ: true },
        { json: "allowManagerWorkSchedules", js: "allowManagerWorkSchedules", typ: true },
        { json: "forceAutostart", js: "forceAutostart", typ: true },
        { json: "firstDayOfWeek", js: "firstDayOfWeek", typ: 0 },
        { json: "custom", js: "custom", typ: r("SettingsCustom") },
        { json: "webAndAppTracking", js: "webAndAppTracking", typ: "" },
        { json: "whoCanAccessScreenshots", js: "whoCanAccessScreenshots", typ: "" },
        { json: "worklife", js: "worklife", typ: r("Worklife") },
        { json: "trackedDataRetentionPeriod", js: "trackedDataRetentionPeriod", typ: 0 },
        { json: "advancedPayroll", js: "advancedPayroll", typ: true },
    ], false),
    "SettingsCustom": o([
        { json: "isUEMember", js: "isUEMember", typ: true },
        { json: "showSpecialOffer", js: "showSpecialOffer", typ: true },
        { json: "trackedAccountCreated", js: "trackedAccountCreated", typ: true },
        { json: "onboardingStep", js: "onboardingStep", typ: "" },
        { json: "completedOnBoarding", js: "completedOnBoarding", typ: true },
        { json: "rdbmsStatus", js: "rdbmsStatus", typ: "" },
    ], false),
    "Worklife": o([
        { json: "tooManyHours", js: "tooManyHours", typ: r("HoursOutsideShiftWork") },
        { json: "lateHoursAfter", js: "lateHoursAfter", typ: r("HoursOutsideShiftWork") },
        { json: "hoursOutsideShiftWork", js: "hoursOutsideShiftWork", typ: r("HoursOutsideShiftWork") },
        { json: "weekendWork", js: "weekendWork", typ: r("WeekendWork") },
    ], false),
    "HoursOutsideShiftWork": o([
        { json: "included", js: "included", typ: true },
        { json: "value", js: "value", typ: 0 },
    ], false),
    "WeekendWork": o([
        { json: "included", js: "included", typ: true },
    ], false),
    "SplitTest": o([
        { json: "name", js: "name", typ: "" },
        { json: "value", js: "value", typ: u(true, "") },
    ], false),
    "Subscription": o([
        { json: "plan", js: "plan", typ: "" },
        { json: "status", js: "status", typ: "" },
        { json: "expires", js: "expires", typ: Date },
    ], false),
    "DatumCustom": o([
        { json: "tdAnonymousId", js: "tdAnonymousId", typ: "" },
        { json: "completedStep", js: "completedStep", typ: r("CompletedStep") },
    ], false),
    "CompletedStep": o([
        { json: "setupPassword", js: "setupPassword", typ: true },
        { json: "companySettings", js: "companySettings", typ: true },
        { json: "addEmployee", js: "addEmployee", typ: true },
    ], false),
    "LastSeen": o([
        { json: "updatedAt", js: "updatedAt", typ: Date },
        { json: "online", js: "online", typ: true },
        { json: "ip", js: "ip", typ: "" },
    ], false),
    "Oauth": o([
        { json: "enabled", js: "enabled", typ: true },
    ], false),
};
