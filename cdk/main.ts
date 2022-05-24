import { Construct } from "constructs";
import { App, AzurermBackend, TerraformOutput, TerraformStack } from "cdktf";
import * as dotenv from "dotenv";
import * as path from "path";
import * as mime from "mime-types";
import * as md5file from "md5-file";

import {
  AzurermProvider,
  ResourceGroup,
  StorageAccount,
  StorageBlob,
} from "./.gen/providers/azurerm";

const readdir = require("@folder/readdir"); // eslint-disable-line @typescript-eslint/no-var-requires

interface FileProps {
  name: string;
  depth: number;
  cwd: string;
  base: string;
  folder: string | null;
  dirname: string;
  path: string;
  relative: string;
}

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
const uiBasePath = path.resolve("../build");

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new AzurermProvider(this, `${stackName}-ap`, {
      features: {},
      subscriptionId,
    });

    /** Create resource group */
    const resourceGroup = new ResourceGroup(this, `${stackName}-rg`, {
      location: "westeurope",
      name: `stwe-${stackName}-rg`,
      tags,
    });

    /** Create storage account */
    const storageAccount = new StorageAccount(this, `${stackName}-sa`, {
      accountReplicationType: "LRS",
      accountTier: "Standard",
      dependsOn: [resourceGroup],
      location: resourceGroup.location,
      minTlsVersion: "TLS1_2",
      name: `stwe${stackName.replace(/-/gi, "")}sa`, // JUST NUMBERS AND CHARACTERS AND LENGTH 3 - 23 CHARACTERS!
      resourceGroupName: resourceGroup.name,
      staticWebsite: {
        error404Document: "index.html",
        indexDocument: "index.html",
      },
      tags,
    });

    readdir
      .sync(uiBasePath, {
        absolute: true,
        dot: false,
        recursive: true,
        objects: true,
        nodir: true,
      })
      .forEach((file: FileProps) => {
        const { name, path, relative } = file;

        /** Create storage blob for each file */
        new StorageBlob(this, name, {
          contentType: mime.lookup(path) || "text/plain",
          contentMd5: md5file.sync(path),
          dependsOn: [storageAccount],
          name: relative, // relative path with directory name
          source: path, // absolute path to file
          storageAccountName: storageAccount.name,
          storageContainerName: "$web",
          type: "Block",
        });
      });

    new TerraformOutput(this, `${stackName}-stack-vars`, {
      value: {
        url: storageAccount.primaryWebEndpoint,
      },
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
