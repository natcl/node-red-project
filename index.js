#!/usr/bin/env node

const fs = require('fs')
const exec = require('child_process').execSync

const mode = process.argv[2]
const projectName = process.argv[3]
const repository = process.argv[4]
const credentialSecret = process.argv[5] || null
const flowFileName = process.argv[6] || 'flow'

createConfigFile(projectName, credentialSecret)
cloneRepository(mode, projectName, repository)
fetchDependencies(projectName)

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

function cloneRepository (mode, projectName, repository) {
  try {
    fs.mkdirSync('projects', { recursive: true })
    if (mode === 'create') {
      exec(`cd projects && mkdir ${projectName} && cd ${projectName} && git init`)
      createProjectFiles(projectName)
      initializeRepository(projectName)

      if (repository && repository !== 'null') {
        console.log('Adding remote', repository)
        exec(`cd projects/${projectName} && git remote add origin ${repository}`)
      }
    } else if (mode === 'clone') {
      exec(`cd projects && git clone ${repository} ${projectName}`)
    }
  } catch (error) {
    console.log('Project already cloned, ignoring')
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
