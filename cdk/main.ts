import { Construct } from "constructs";
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
    super(scope, name);

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

const app = new App();
new MyStack(app, stackName);
app.synth();
