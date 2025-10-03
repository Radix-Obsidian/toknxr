# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListProjectsForOrganization*](#listprojectsfororganization)
  - [*ListAlertsForProject*](#listalertsforproject)
- [**Mutations**](#mutations)
  - [*CreateNewProject*](#createnewproject)
  - [*CreateNewAlert*](#createnewalert)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListProjectsForOrganization
You can execute the `ListProjectsForOrganization` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listProjectsForOrganization(vars: ListProjectsForOrganizationVariables): QueryPromise<ListProjectsForOrganizationData, ListProjectsForOrganizationVariables>;

interface ListProjectsForOrganizationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListProjectsForOrganizationVariables): QueryRef<ListProjectsForOrganizationData, ListProjectsForOrganizationVariables>;
}
export const listProjectsForOrganizationRef: ListProjectsForOrganizationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listProjectsForOrganization(dc: DataConnect, vars: ListProjectsForOrganizationVariables): QueryPromise<ListProjectsForOrganizationData, ListProjectsForOrganizationVariables>;

interface ListProjectsForOrganizationRef {
  ...
  (dc: DataConnect, vars: ListProjectsForOrganizationVariables): QueryRef<ListProjectsForOrganizationData, ListProjectsForOrganizationVariables>;
}
export const listProjectsForOrganizationRef: ListProjectsForOrganizationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listProjectsForOrganizationRef:
```typescript
const name = listProjectsForOrganizationRef.operationName;
console.log(name);
```

### Variables
The `ListProjectsForOrganization` query requires an argument of type `ListProjectsForOrganizationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListProjectsForOrganizationVariables {
  organizationId: UUIDString;
}
```
### Return Type
Recall that executing the `ListProjectsForOrganization` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListProjectsForOrganizationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListProjectsForOrganizationData {
  projects: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    createdAt: TimestampString;
  } & Project_Key)[];
}
```
### Using `ListProjectsForOrganization`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listProjectsForOrganization, ListProjectsForOrganizationVariables } from '@dataconnect/generated';

// The `ListProjectsForOrganization` query requires an argument of type `ListProjectsForOrganizationVariables`:
const listProjectsForOrganizationVars: ListProjectsForOrganizationVariables = {
  organizationId: ..., 
};

// Call the `listProjectsForOrganization()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listProjectsForOrganization(listProjectsForOrganizationVars);
// Variables can be defined inline as well.
const { data } = await listProjectsForOrganization({ organizationId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listProjectsForOrganization(dataConnect, listProjectsForOrganizationVars);

console.log(data.projects);

// Or, you can use the `Promise` API.
listProjectsForOrganization(listProjectsForOrganizationVars).then((response) => {
  const data = response.data;
  console.log(data.projects);
});
```

### Using `ListProjectsForOrganization`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listProjectsForOrganizationRef, ListProjectsForOrganizationVariables } from '@dataconnect/generated';

// The `ListProjectsForOrganization` query requires an argument of type `ListProjectsForOrganizationVariables`:
const listProjectsForOrganizationVars: ListProjectsForOrganizationVariables = {
  organizationId: ..., 
};

// Call the `listProjectsForOrganizationRef()` function to get a reference to the query.
const ref = listProjectsForOrganizationRef(listProjectsForOrganizationVars);
// Variables can be defined inline as well.
const ref = listProjectsForOrganizationRef({ organizationId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listProjectsForOrganizationRef(dataConnect, listProjectsForOrganizationVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.projects);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.projects);
});
```

## ListAlertsForProject
You can execute the `ListAlertsForProject` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAlertsForProject(vars: ListAlertsForProjectVariables): QueryPromise<ListAlertsForProjectData, ListAlertsForProjectVariables>;

interface ListAlertsForProjectRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAlertsForProjectVariables): QueryRef<ListAlertsForProjectData, ListAlertsForProjectVariables>;
}
export const listAlertsForProjectRef: ListAlertsForProjectRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAlertsForProject(dc: DataConnect, vars: ListAlertsForProjectVariables): QueryPromise<ListAlertsForProjectData, ListAlertsForProjectVariables>;

interface ListAlertsForProjectRef {
  ...
  (dc: DataConnect, vars: ListAlertsForProjectVariables): QueryRef<ListAlertsForProjectData, ListAlertsForProjectVariables>;
}
export const listAlertsForProjectRef: ListAlertsForProjectRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAlertsForProjectRef:
```typescript
const name = listAlertsForProjectRef.operationName;
console.log(name);
```

### Variables
The `ListAlertsForProject` query requires an argument of type `ListAlertsForProjectVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListAlertsForProjectVariables {
  projectId: UUIDString;
}
```
### Return Type
Recall that executing the `ListAlertsForProject` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAlertsForProjectData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListAlertsForProject`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAlertsForProject, ListAlertsForProjectVariables } from '@dataconnect/generated';

// The `ListAlertsForProject` query requires an argument of type `ListAlertsForProjectVariables`:
const listAlertsForProjectVars: ListAlertsForProjectVariables = {
  projectId: ..., 
};

// Call the `listAlertsForProject()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAlertsForProject(listAlertsForProjectVars);
// Variables can be defined inline as well.
const { data } = await listAlertsForProject({ projectId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAlertsForProject(dataConnect, listAlertsForProjectVars);

console.log(data.alerts);

// Or, you can use the `Promise` API.
listAlertsForProject(listAlertsForProjectVars).then((response) => {
  const data = response.data;
  console.log(data.alerts);
});
```

### Using `ListAlertsForProject`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAlertsForProjectRef, ListAlertsForProjectVariables } from '@dataconnect/generated';

// The `ListAlertsForProject` query requires an argument of type `ListAlertsForProjectVariables`:
const listAlertsForProjectVars: ListAlertsForProjectVariables = {
  projectId: ..., 
};

// Call the `listAlertsForProjectRef()` function to get a reference to the query.
const ref = listAlertsForProjectRef(listAlertsForProjectVars);
// Variables can be defined inline as well.
const ref = listAlertsForProjectRef({ projectId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAlertsForProjectRef(dataConnect, listAlertsForProjectVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.alerts);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.alerts);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateNewProject
You can execute the `CreateNewProject` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNewProject(vars: CreateNewProjectVariables): MutationPromise<CreateNewProjectData, CreateNewProjectVariables>;

interface CreateNewProjectRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewProjectVariables): MutationRef<CreateNewProjectData, CreateNewProjectVariables>;
}
export const createNewProjectRef: CreateNewProjectRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNewProject(dc: DataConnect, vars: CreateNewProjectVariables): MutationPromise<CreateNewProjectData, CreateNewProjectVariables>;

interface CreateNewProjectRef {
  ...
  (dc: DataConnect, vars: CreateNewProjectVariables): MutationRef<CreateNewProjectData, CreateNewProjectVariables>;
}
export const createNewProjectRef: CreateNewProjectRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNewProjectRef:
```typescript
const name = createNewProjectRef.operationName;
console.log(name);
```

### Variables
The `CreateNewProject` mutation requires an argument of type `CreateNewProjectVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateNewProjectVariables {
  name: string;
  organizationId: UUIDString;
  description?: string | null;
}
```
### Return Type
Recall that executing the `CreateNewProject` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNewProjectData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNewProjectData {
  project_insert: Project_Key;
}
```
### Using `CreateNewProject`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNewProject, CreateNewProjectVariables } from '@dataconnect/generated';

// The `CreateNewProject` mutation requires an argument of type `CreateNewProjectVariables`:
const createNewProjectVars: CreateNewProjectVariables = {
  name: ..., 
  organizationId: ..., 
  description: ..., // optional
};

// Call the `createNewProject()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNewProject(createNewProjectVars);
// Variables can be defined inline as well.
const { data } = await createNewProject({ name: ..., organizationId: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNewProject(dataConnect, createNewProjectVars);

console.log(data.project_insert);

// Or, you can use the `Promise` API.
createNewProject(createNewProjectVars).then((response) => {
  const data = response.data;
  console.log(data.project_insert);
});
```

### Using `CreateNewProject`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNewProjectRef, CreateNewProjectVariables } from '@dataconnect/generated';

// The `CreateNewProject` mutation requires an argument of type `CreateNewProjectVariables`:
const createNewProjectVars: CreateNewProjectVariables = {
  name: ..., 
  organizationId: ..., 
  description: ..., // optional
};

// Call the `createNewProjectRef()` function to get a reference to the mutation.
const ref = createNewProjectRef(createNewProjectVars);
// Variables can be defined inline as well.
const ref = createNewProjectRef({ name: ..., organizationId: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNewProjectRef(dataConnect, createNewProjectVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.project_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.project_insert);
});
```

## CreateNewAlert
You can execute the `CreateNewAlert` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNewAlert(vars: CreateNewAlertVariables): MutationPromise<CreateNewAlertData, CreateNewAlertVariables>;

interface CreateNewAlertRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewAlertVariables): MutationRef<CreateNewAlertData, CreateNewAlertVariables>;
}
export const createNewAlertRef: CreateNewAlertRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNewAlert(dc: DataConnect, vars: CreateNewAlertVariables): MutationPromise<CreateNewAlertData, CreateNewAlertVariables>;

interface CreateNewAlertRef {
  ...
  (dc: DataConnect, vars: CreateNewAlertVariables): MutationRef<CreateNewAlertData, CreateNewAlertVariables>;
}
export const createNewAlertRef: CreateNewAlertRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNewAlertRef:
```typescript
const name = createNewAlertRef.operationName;
console.log(name);
```

### Variables
The `CreateNewAlert` mutation requires an argument of type `CreateNewAlertVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateNewAlert` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNewAlertData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNewAlertData {
  alert_insert: Alert_Key;
}
```
### Using `CreateNewAlert`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNewAlert, CreateNewAlertVariables } from '@dataconnect/generated';

// The `CreateNewAlert` mutation requires an argument of type `CreateNewAlertVariables`:
const createNewAlertVars: CreateNewAlertVariables = {
  projectId: ..., 
  userId: ..., 
  name: ..., 
  description: ..., // optional
  period: ..., 
  status: ..., 
  threshold: ..., 
  unit: ..., 
};

// Call the `createNewAlert()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNewAlert(createNewAlertVars);
// Variables can be defined inline as well.
const { data } = await createNewAlert({ projectId: ..., userId: ..., name: ..., description: ..., period: ..., status: ..., threshold: ..., unit: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNewAlert(dataConnect, createNewAlertVars);

console.log(data.alert_insert);

// Or, you can use the `Promise` API.
createNewAlert(createNewAlertVars).then((response) => {
  const data = response.data;
  console.log(data.alert_insert);
});
```

### Using `CreateNewAlert`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNewAlertRef, CreateNewAlertVariables } from '@dataconnect/generated';

// The `CreateNewAlert` mutation requires an argument of type `CreateNewAlertVariables`:
const createNewAlertVars: CreateNewAlertVariables = {
  projectId: ..., 
  userId: ..., 
  name: ..., 
  description: ..., // optional
  period: ..., 
  status: ..., 
  threshold: ..., 
  unit: ..., 
};

// Call the `createNewAlertRef()` function to get a reference to the mutation.
const ref = createNewAlertRef(createNewAlertVars);
// Variables can be defined inline as well.
const ref = createNewAlertRef({ projectId: ..., userId: ..., name: ..., description: ..., period: ..., status: ..., threshold: ..., unit: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNewAlertRef(dataConnect, createNewAlertVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.alert_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.alert_insert);
});
```

