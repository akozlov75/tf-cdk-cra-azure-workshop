# Terraform CDK + Azure + CRA Workshop

## Good to know

- [Typescript](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- [Azure Storage](https://docs.microsoft.com/en-us/azure/storage/common/storage-introduction)
- [Terraform CDK](https://www.terraform.io/cdktf)
- [ReactJS](https://reactjs.org/docs/getting-started.html)

## Step Five

Now main fun part start... let's add Remote Backend for save and share state of our deployments

```ts
...
import { App, AzurermBackend, TerraformStack } from "cdktf";
import * as dotenv from "dotenv";


import { AzurermProvider } from "./.gen/providers/azurerm";

dotenv.config();

/**
 * More documentation here: https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs
 */
const subscriptionId = process.env.SUBSCRIPTION_ID || ''
const tenantId = process.env.ARM_TENANT_ID || ''
const tags = {
  environment: process.env.ENVIRONMENT || '',
  managedBy: process.env.MANAGED_BY || '',
  projectCode: process.env.PROJECT_CODE || '',
  projectName: process.env.PROJECT_NAME || '',
}
const stackName = `${tags.projectCode}-${tags.environment}-${tags.projectName}`

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    ...

    new AzurermProvider(this, `${stackName}-ap`, {
      features: {},
      subscriptionId,
    });

    // TODO: Automatization need to be added
    // MANUAL STEPS:
    // * Go to subscription
    // * Add resource -> 'Resource group' -> stwe-cdk-test-tstate
    // * Add resource -> 'Storage account' -> stwecdktesttstatesa
    //   - Containers -> Add new `Container` -> 'tfstate'

    // https://www.terraform.io/cdktf/concepts/remote-backends
    // Save state to storage account
    const resourceGroupName = `stwe-cdk-${tags.environment}-tstate`;
    const storageAccountName = `stwecdk${tags.environment}tstatesa`;
    new AzurermBackend(this, {
      containerName: "tfstate",
      key: stackName,
      resourceGroupName,
      storageAccountName,
      subscriptionId,
      tenantId,
    });
  }
}

...
new MyStack(app, stackName);
...
```

If you try to run some CDK command, you will see a error... so let's fix it.
Now we have to create missing "Resource group", "Storage account" and "Container" by hands. Why we do it by hands?

## Step Four

Time to create needed variables

- Create `.env` file in cdk root base on `.env.example`
- Goto 'Azure Education & Testing' subscription on `https://portal.azure.com/`
- Copy and paste `Subscription Id` into `.env`
- In 'Azure Active Directory' properties copy `Tenant Id` and add it to `.env` file
- Add rest of the variables


## Step Three

Time to add necessary files

- Let's add azure provider to CDK part

```shell
cd cdk
npm install @cdktf/provider-azurerm dotenv
```

- Let's add needed data to `cdk/cdktf.json`

```json
{
  ...
  "terraformProviders": ["azurerm@~>3.7.0"],
  ...
}
```

- Now we can get provider constructs

```shell
npm run get
```

## Step Two

- Let's add Terraform CDK -> https://learn.hashicorp.com/tutorials/terraform/cdktf-install?in=terraform/cdktf

```shell
npm install -g cdktf-cli@latest
````

- Now initialize a new project

```shell
mkdir cdk
cd cdk
cdktf init --template=typescript
```


## Step One

- Install [Azure-CLI](https://docs.microsoft.com/en-us/cli/azure/get-started-with-azure-cli)
- Install [Terraform](https://learn.hashicorp.com/tutorials/terraform/install-cli)
- Create SPA application with this command

```shell
npx create-react-app <NAME OF YOUR APPPLICATION> --template typescript
```
