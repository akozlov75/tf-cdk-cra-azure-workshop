# Terraform CDK + Azure + CRA Workshop

## Good to know

- [Typescript](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- [Azure Storage](https://docs.microsoft.com/en-us/azure/storage/common/storage-introduction)
- [Terraform CDK](https://www.terraform.io/cdktf)
- [ReactJS](https://reactjs.org/docs/getting-started.html)

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
