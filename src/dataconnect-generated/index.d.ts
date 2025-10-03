import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AIService_Key {
  id: UUIDString;
  __typename?: 'AIService_Key';
}

export interface Alert_Key {
  id: UUIDString;
  __typename?: 'Alert_Key';
}

export interface CreateNewAlertData {
  alert_insert: Alert_Key;
}

export interface CreateNewAlertVariables {
  projectId: UUIDString;
  userId: UUIDString;
  name: string;
  description?: string | null;
  period: string;
  status: string;
  threshold: number;
  unit: string;
}

export interface CreateNewProjectData {
  project_insert: Project_Key;
}

export interface CreateNewProjectVariables {
  name: string;
  organizationId: UUIDString;
  description?: string | null;
}

export interface ListAlertsForProjectData {
  alerts: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    period: string;
    status: string;
    threshold: number;
    unit: string;
    triggeredAt?: TimestampString | null;
  } & Alert_Key)[];
}

export interface ListAlertsForProjectVariables {
  projectId: UUIDString;
}

export interface ListProjectsForOrganizationData {
  projects: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    createdAt: TimestampString;
  } & Project_Key)[];
}

export interface ListProjectsForOrganizationVariables {
  organizationId: UUIDString;
}

export interface Organization_Key {
  id: UUIDString;
  __typename?: 'Organization_Key';
}

export interface Project_Key {
  id: UUIDString;
  __typename?: 'Project_Key';
}

export interface TokenUsage_Key {
  id: UUIDString;
  __typename?: 'TokenUsage_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateNewProjectRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewProjectVariables): MutationRef<CreateNewProjectData, CreateNewProjectVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNewProjectVariables): MutationRef<CreateNewProjectData, CreateNewProjectVariables>;
  operationName: string;
}
export const createNewProjectRef: CreateNewProjectRef;

export function createNewProject(vars: CreateNewProjectVariables): MutationPromise<CreateNewProjectData, CreateNewProjectVariables>;
export function createNewProject(dc: DataConnect, vars: CreateNewProjectVariables): MutationPromise<CreateNewProjectData, CreateNewProjectVariables>;

interface ListProjectsForOrganizationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListProjectsForOrganizationVariables): QueryRef<ListProjectsForOrganizationData, ListProjectsForOrganizationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListProjectsForOrganizationVariables): QueryRef<ListProjectsForOrganizationData, ListProjectsForOrganizationVariables>;
  operationName: string;
}
export const listProjectsForOrganizationRef: ListProjectsForOrganizationRef;

export function listProjectsForOrganization(vars: ListProjectsForOrganizationVariables): QueryPromise<ListProjectsForOrganizationData, ListProjectsForOrganizationVariables>;
export function listProjectsForOrganization(dc: DataConnect, vars: ListProjectsForOrganizationVariables): QueryPromise<ListProjectsForOrganizationData, ListProjectsForOrganizationVariables>;

interface CreateNewAlertRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewAlertVariables): MutationRef<CreateNewAlertData, CreateNewAlertVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNewAlertVariables): MutationRef<CreateNewAlertData, CreateNewAlertVariables>;
  operationName: string;
}
export const createNewAlertRef: CreateNewAlertRef;

export function createNewAlert(vars: CreateNewAlertVariables): MutationPromise<CreateNewAlertData, CreateNewAlertVariables>;
export function createNewAlert(dc: DataConnect, vars: CreateNewAlertVariables): MutationPromise<CreateNewAlertData, CreateNewAlertVariables>;

interface ListAlertsForProjectRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAlertsForProjectVariables): QueryRef<ListAlertsForProjectData, ListAlertsForProjectVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListAlertsForProjectVariables): QueryRef<ListAlertsForProjectData, ListAlertsForProjectVariables>;
  operationName: string;
}
export const listAlertsForProjectRef: ListAlertsForProjectRef;

export function listAlertsForProject(vars: ListAlertsForProjectVariables): QueryPromise<ListAlertsForProjectData, ListAlertsForProjectVariables>;
export function listAlertsForProject(dc: DataConnect, vars: ListAlertsForProjectVariables): QueryPromise<ListAlertsForProjectData, ListAlertsForProjectVariables>;

