# node-red-project

node-red-project is a command line tool that can be used to create or clone a Node-RED in project mode, bypassing Node-RED's GUI wizard.
This is useful for CI tasks or to quickly get going.

## Usage

It is assumed that this command is run in the Node-RED `userDir`. It can be either global (`~/.node-red`) or local to a folder.

### Creating a project

```
npx natcl/node-red-project create projectName [OPTIONS]
```

| Options                  | Description                                            | Example                                   |
| ------------------------ | ------------------------------------------------------ | ----------------------------------------- |
| --remote                 | The remote repository                                  | git@github.com:natcl/node-red-project.git |
| --credentialSecret       | Credential Secret of the project                       | myPassword                                |
| --doNotFetchDependencies | If present, won't fetch dependencies from package.json |                                           |
| --flowFile               | The name of the desired flow file                      | myFlows                                   |

### Cloning an existing project

```
npx natcl/node-red-project clone projectName remoteRepository [OPTIONS]
```

| Options                  | Description                                            | Example    |
| ------------------------ | ------------------------------------------------------ | ---------- |
| --credentialSecret       | Credential Secret of the project                       | myPassword |
| --revision               | the git tag or hash to clone                           | myTag      |
| --doNotFetchDependencies | If present, won't fetch dependencies from package.json |            |


