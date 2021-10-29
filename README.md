# node-red-project

node-red-project is a command line tool that can be used to create or clone a Node-RED in project mode, bypassing Node-RED's GUI wizard.
This is useful for CI tasks or to quickly get going.

## Usage

### Creating a project

Syntax: npx natcl/node-red-project create projectName [remoteRepository] [credentialSecret] [flowFileName]

Note: use `null` to skip arguments.

### Cloning an existing project

Syntax: npx natcl/node-red-project create projectName remoteRepository [credentialSecret]

Note: use `null` to skip arguments.