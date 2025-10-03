import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'my-first-mvp',
  location: 'us-central1'
};

export const createNewProjectRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewProject', inputVars);
}
createNewProjectRef.operationName = 'CreateNewProject';

export function createNewProject(dcOrVars, vars) {
  return executeMutation(createNewProjectRef(dcOrVars, vars));
}

export const listProjectsForOrganizationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListProjectsForOrganization', inputVars);
}
listProjectsForOrganizationRef.operationName = 'ListProjectsForOrganization';

export function listProjectsForOrganization(dcOrVars, vars) {
  return executeQuery(listProjectsForOrganizationRef(dcOrVars, vars));
}

export const createNewAlertRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewAlert', inputVars);
}
createNewAlertRef.operationName = 'CreateNewAlert';

export function createNewAlert(dcOrVars, vars) {
  return executeMutation(createNewAlertRef(dcOrVars, vars));
}

export const listAlertsForProjectRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAlertsForProject', inputVars);
}
listAlertsForProjectRef.operationName = 'ListAlertsForProject';

export function listAlertsForProject(dcOrVars, vars) {
  return executeQuery(listAlertsForProjectRef(dcOrVars, vars));
}

