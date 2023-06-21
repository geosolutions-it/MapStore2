# Create your own MapStore project

!!! note
    From version 2021.02.xx MapStore introduced a new project system. Take a look [here](https://github.com/geosolutions-it/MapStore2/issues/6314) to learn more about the new project system.

To create a new MapStore based project you can use the createProject script.
First of all, if you don't have done it before, clone the MapStore2 repository master branch into a local folder:

```sh
git clone https://github.com/geosolutions-it/MapStore2
```

Then, move into the folder that has just been created, containing MapStore2:

```sh
cd MapStore2
```

Choose from which branch you want the mapstore revision to be aligned, we suggest to use latest release or latest stable available (if you know which is)

```sh
git checkout <stable-branch>
```

or

```sh
git checkout v2022.02.02
```

Install dependencies for MapStore:

```sh
npm install
```

Finally, to create the project, use the following command:

```sh
node ./createProject.js
```

The command line will ask some questions about the project to create. (You can press enter to accept the default value, indicated between parenthesis, or type a new one):

* **projectName**: short project name that will be used as the repository name on github, webapp path and name in package.json
* **branch/tag**: the base branch/tag to use for the project (e.g. v2022.02.02, or master)
* **projectType**: type of project to create, currently one type of projects is supported:
  * **standard**: is a copy of the standard MapStore project, ready to be used and customized
* **projectVersion**: project version in package.json (X.Y.Z)
* **projectDescription**: project description, used in sample index page and as description in package.json
* **gitRepositoryUrl**: full url to the github repository where the project will be published
* **outputFolder**: folder where the project will be created

Usage:

```sh
node ./createProject.js

Project Type (standard):
MapStore base branch (master):v2023.01.01
Project Name: my_project
Project Version (1.0.0):
Project Description (Project Name):
Repository URL:
Output folder: ../my_project
```

At the end of the script execution, the given outputFolder will be populated by all the configuration files needed to start working on the project. Moreover, the local git repository will be initialized and the MapStore sub-module added and downloaded.

If you create a *standard* project, you can customize it editing **js/app.jsx**: look at the comments for hints and the MapStore documentation for more details.

The following steps are:

* `npm install` to download dependencies
* `npm start` to test the project
* `./build.sh` to build the full .war

## Create a new project type

If you are not happy with the available project types (*standard*), you can extend them adding a new folder in **project**.

The folder will contain two sub-folders:

* **static**: for static content, to be copied as is to the project folder
* **templates**: for template files, containing project-dependent variables that will be replaced by the createProject script. You can use the following variables:
  * **\_\_PROJECTNAME\_\_**: \<projectName\> parameter value
  * **\_\_PROJECTDESCRIPTION\_\_**: \<projectDescription\> parameter value
  * **\_\_PROJECTVERSION\_\_**: \<projectVersion\> parameter value
  * **\_\_REPOURL\_\_**: \<gitRepositoryUrl\> parameter value

In addition to static and templates, the following files from the root MapStore folder will be copied:

* .babelrc
* .editorconfig
* LICENSE.txt

## Update MapStore2 version in a project

To update MapStore2 version enter the MapStore2 folder and pull desired git version.
If MapStore2 devDependencies have been changed you can manually update these in the project package.json file or run the script updateDevDeps

```sh
npm run updateDevDeps
```

The script will automatically copy the devDependencies from MapStore2 package.json to the project package.json file. All the project existing devDependencies will be overwritten.

To sync MapStore2 dependencies just run npm install from project root folder.

```sh
npm install
```

Also make sure to follow the migration guidelines [here](mapstore-migration-guide.md#migration-guidelines).
