const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'my-first-mvp',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const createNewProjectRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewProject', inputVars);
}
createNewProjectRef.operationName = 'CreateNewProject';
exports.createNewProjectRef = createNewProjectRef;

exports.createNewProject = function createNewProject(dcOrVars, vars) {
  return executeMutation(createNewProjectRef(dcOrVars, vars));
};

const listProjectsForOrganizationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListProjectsForOrganization', inputVars);
}
listProjectsForOrganizationRef.operationName = 'ListProjectsForOrganization';
exports.listProjectsForOrganizationRef = listProjectsForOrganizationRef;

exports.listProjectsForOrganization = function listProjectsForOrganization(dcOrVars, vars) {
  return executeQuery(listProjectsForOrganizationRef(dcOrVars, vars));
};

const createNewAlertRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewAlert', inputVars);
}
createNewAlertRef.operationName = 'CreateNewAlert';
exports.createNewAlertRef = createNewAlertRef;

exports.createNewAlert = function createNewAlert(dcOrVars, vars) {
  return executeMutation(createNewAlertRef(dcOrVars, vars));
};

const listAlertsForProjectRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAlertsForProject', inputVars);
}
listAlertsForProjectRef.operationName = 'ListAlertsForProject';
exports.listAlertsForProjectRef = listAlertsForProjectRef;

exports.listAlertsForProject = function listAlertsForProject(dcOrVars, vars) {
  return executeQuery(listAlertsForProjectRef(dcOrVars, vars));
};
