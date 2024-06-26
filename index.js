#!/usr/bin/env node

const fs = require('fs')
const exec = require('child_process').execSync
const argv = require('minimist')(process.argv.slice(2))

const verbose = argv.v || argv.verbose
if (verbose) {
  console.log(argv)
}

const mode = argv._[0]
if (mode !== 'create' && mode !== 'clone') {
  console.log('First argument should be either "create" or "clone", exiting.')
  process.exit(1)
}

const projectName = argv._[1]
if (!projectName) {
  console.log('A project name should be provided as second argument, exiting.')
}

const remote = argv._[2] || argv.remote
if (mode === 'clone' && typeof remote !== 'string') {
  console.log('When cloning a project, a repository should be specified as third argument, exiting.')
}

const doNotFetchDependencies = argv.doNotFetchDependencies ? true : false

const credentialSecret = argv.credentialSecret || null
if (credentialSecret === null || credentialSecret === true) console.log('Warning: credentialSecret is null, is this intended?')

let flowFileName = 'flow'
if (argv.flowFile) {
  flowFileName = argv.flowFile.replace('.json', '')
}

const revision = argv.revision
let cloneMode = null
if (typeof revision === 'string' && revision.match(/\b[0-9a-f]{40}\b/)) {
  cloneMode = 'hash'
} else if (typeof revision === 'string') {
  cloneMode = 'tag'
}

if (verbose) {
  console.log('mode', mode)
  console.log('projectName', projectName)
  console.log('remote', remote)
  console.log('credentialSecret', credentialSecret)
  console.log('doNotFetchDependencies', doNotFetchDependencies)
  console.log('flowFile', flowFileName)
  console.log('revision', revision)
  console.log('cloneMode', cloneMode)
}

createConfigFile(projectName, credentialSecret)
initRepository(mode, projectName, remote)
if (!doNotFetchDependencies) fetchDependencies(projectName)

function createConfigFile (projectName, credentialSecret) {
  let configProjectFile = {
    activeProject: projectName,
    projects: {
      [projectName]: {
        credentialSecret: credentialSecret
      }
    }
  }

  try {
    configProjectFile = JSON.parse(fs.readFileSync('./.config.projects.json', 'utf-8'))
    configProjectFile.activeProject = projectName
    configProjectFile.projects[projectName] = {
      credentialSecret: credentialSecret
    }
    console.log('Using existing .config.projects.json file')
  } catch (error) {
    console.log(".config.projects.json file doesn't exists, creating a new one")
  }

  fs.writeFileSync('.config.projects.json', JSON.stringify(configProjectFile, null, 2))
}

function initRepository (mode, projectName, remote) {
  try {
    fs.mkdirSync('projects', { recursive: true })
    if (mode === 'create') {
      exec(`cd projects && mkdir ${projectName} && cd ${projectName} && git init`)
      createProjectFiles(projectName)
      initializeRepository(projectName)

      if (remote && remote !== 'null') {
        console.log('Adding remote', remote)
        exec(`cd projects/${projectName} && git remote add origin ${remote}`)
      }
    } else if (mode === 'clone') {
      if (cloneMode === 'hash') {
        exec(`cd projects && mkdir ${projectName} && cd ${projectName} && git init && git remote add origin ${remote} && git fetch --depth 1 origin ${revision} && git checkout FETCH_HEAD`)
      } else if (cloneMode === 'tag') {
        exec(`cd projects && git clone --depth 1 --single-branch --branch ${revision} ${remote} ${projectName}`)
      } else {
        exec(`cd projects && git clone ${remote} ${projectName}`)
      }
    }
  } catch (error) {
    console.log('Project already cloned, ignoring')
    if (verbose) {
      console.error(error)
    }
  }
}

function createProjectFiles (projectName) {
  console.log('Creating the default project files')
  const packageTemplate = {
    name: projectName,
    description: 'A Node-RED Project',
    version: '0.0.1',
    dependencies: {},
    'node-red': {
      settings: {
        flowFile: `${flowFileName}.json`,
        credentialsFile: `${flowFileName}_cred.json`
      }
    }
  }
  fs.writeFileSync(`./projects/${projectName}/.gitignore`, '*.backup\n')
  fs.writeFileSync(`./projects/${projectName}/package.json`, JSON.stringify(packageTemplate, null, 2))
  fs.writeFileSync(`./projects/${projectName}/${flowFileName}.json`, JSON.stringify([], null, 2))
  fs.writeFileSync(`./projects/${projectName}/${flowFileName}_cred.json`, JSON.stringify({}, null, 2))
}

function initializeRepository (projectName) {
  console.log('Creating the first commit')
  exec(`cd projects/${projectName} && git add .gitignore package.json ${flowFileName}.json ${flowFileName}_cred.json && git commit -m 'Create project'`)
}

function fetchDependencies (projectName) {
  console.log('Installing project dependencies...')
  try {
    const dependencies = JSON.parse(fs.readFileSync(`./projects/${projectName}/package.json`, 'utf-8')).dependencies
    for (const dependency in dependencies) {
      console.log(`Installing ${dependency}@${dependencies[dependency]}`)
      exec(`npm install --save-exact ${dependency}@${dependencies[dependency]}`)
    }
  } catch (error) {
    console.log('No package file found in project, skipping dependency installation')
  }
}
