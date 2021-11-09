# node-red-project

node-red-project is a command line tool that can be used to create or clone a Node-RED in project mode, bypassing Node-RED's GUI wizard.
This is useful for CI tasks or to quickly get going.

## Usage

### Creating a project

Syntax: npx natcl/node-red-project create projectName 

Options:

--remote : The remote repository  
--credentialSecret: Credential Secret of the project  
--flowFile: The name of the desired flow file
### Cloning an existing project

Syntax: npx natcl/node-red-project clone projectName remoteRepository 

Options:

--credentialSecret: Credential Secret of the project  
--revision: the git tag or hash to clone
