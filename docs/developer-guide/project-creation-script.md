### Create your own MapStore2 project

To create a new MapStore2 based project you can use the createProject script:

```
node ./createProject.js <projectType> <projectName> <projectVersion> <projectDescription> <gitRepositoryUrl> <outputFolder>
```

All the arguments are mandatory:
 * **projectName**: short project name that will be used as the repository name on github, webapp path and name in package.json
 * **projectType**: type of project to create, currently two types of projects are supported:
  - **standard**: is a copy of the standard MapStore2 project, ready to be used and customized
  - **custom**: is a simple (skeleton) project, useful if you want to build a custom application using the SDK
 * **projectVersion**: project version in package.json (X.Y.Z)
 * **projectDescription**: project description, used in sample index page and as description in package.json
 * **gitRepositoryUrl**: full url to the github repository where the project will be published
 * **outputFolder**: folder where the project will be created

At the end of the script execution, the given outputFolder will be populated by all the configuration files needed to start working on the project. Moreover, the local git repo will be initialized and the MapStore2 submodule added and downloaded.

If you create a *standard* project, you can customize it editing **js/app.jsx**: look at the comments for hints and the MapStore2 documentation for more details.

If you create a *custom* project, you will find a simple application in the **js** folder (app.jsx is the entry point) with two pages (home and main).

The following steps are:
 * npm install to download dependencies
 * npm start to test the project
 * git add / push to publish the initial project on the git repo
 * ./build.sh to build the full war

### Create a new project type
If you are not happy with the available project types (*standard* and *custom*), you can extend them adding a new folder in **project**.

The folder will contain two subfolders:
 * **static**: for static content, to be copied as is to the project folder
 * **templates**: for template files, containing project-dependent variables that will be replaced by the createProject script. You can use the following variables:
   - **\_\_PROJECTNAME\_\_**: \<projectName\> parameter value
   - **\_\_PROJECTDESCRIPTION\_\_**: \<projectDescription\> parameter value
   - **\_\_PROJECTVERSION\_\_**: \<projectVersion\> parameter value
   - **\_\_REPOURL\_\_**: \<gitRepositoryUrl\> parameter value

In addition to static and templates, the following files from the root MapStore2 folder will be copied:
 * .babelrc
 * .editorconfig
 * .eslintrc
 * .eslintignore
 * LICENSE.txt
