import { CreateNewProjectData, CreateNewProjectVariables, ListProjectsForOrganizationData, ListProjectsForOrganizationVariables, CreateNewAlertData, CreateNewAlertVariables, ListAlertsForProjectData, ListAlertsForProjectVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateNewProject(options?: useDataConnectMutationOptions<CreateNewProjectData, FirebaseError, CreateNewProjectVariables>): UseDataConnectMutationResult<CreateNewProjectData, CreateNewProjectVariables>;
export function useCreateNewProject(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNewProjectData, FirebaseError, CreateNewProjectVariables>): UseDataConnectMutationResult<CreateNewProjectData, CreateNewProjectVariables>;

export function useListProjectsForOrganization(vars: ListProjectsForOrganizationVariables, options?: useDataConnectQueryOptions<ListProjectsForOrganizationData>): UseDataConnectQueryResult<ListProjectsForOrganizationData, ListProjectsForOrganizationVariables>;
export function useListProjectsForOrganization(dc: DataConnect, vars: ListProjectsForOrganizationVariables, options?: useDataConnectQueryOptions<ListProjectsForOrganizationData>): UseDataConnectQueryResult<ListProjectsForOrganizationData, ListProjectsForOrganizationVariables>;

export function useCreateNewAlert(options?: useDataConnectMutationOptions<CreateNewAlertData, FirebaseError, CreateNewAlertVariables>): UseDataConnectMutationResult<CreateNewAlertData, CreateNewAlertVariables>;
export function useCreateNewAlert(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNewAlertData, FirebaseError, CreateNewAlertVariables>): UseDataConnectMutationResult<CreateNewAlertData, CreateNewAlertVariables>;

export function useListAlertsForProject(vars: ListAlertsForProjectVariables, options?: useDataConnectQueryOptions<ListAlertsForProjectData>): UseDataConnectQueryResult<ListAlertsForProjectData, ListAlertsForProjectVariables>;
export function useListAlertsForProject(dc: DataConnect, vars: ListAlertsForProjectVariables, options?: useDataConnectQueryOptions<ListAlertsForProjectData>): UseDataConnectQueryResult<ListAlertsForProjectData, ListAlertsForProjectVariables>;
