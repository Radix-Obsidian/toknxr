# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreateNewProject, useListProjectsForOrganization, useCreateNewAlert, useListAlertsForProject } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreateNewProject(createNewProjectVars);

const { data, isPending, isSuccess, isError, error } = useListProjectsForOrganization(listProjectsForOrganizationVars);

const { data, isPending, isSuccess, isError, error } = useCreateNewAlert(createNewAlertVars);

const { data, isPending, isSuccess, isError, error } = useListAlertsForProject(listAlertsForProjectVars);

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createNewProject, listProjectsForOrganization, createNewAlert, listAlertsForProject } from '@dataconnect/generated';


// Operation CreateNewProject:  For variables, look at type CreateNewProjectVars in ../index.d.ts
const { data } = await CreateNewProject(dataConnect, createNewProjectVars);

// Operation ListProjectsForOrganization:  For variables, look at type ListProjectsForOrganizationVars in ../index.d.ts
const { data } = await ListProjectsForOrganization(dataConnect, listProjectsForOrganizationVars);

// Operation CreateNewAlert:  For variables, look at type CreateNewAlertVars in ../index.d.ts
const { data } = await CreateNewAlert(dataConnect, createNewAlertVars);

// Operation ListAlertsForProject:  For variables, look at type ListAlertsForProjectVars in ../index.d.ts
const { data } = await ListAlertsForProject(dataConnect, listAlertsForProjectVars);


```