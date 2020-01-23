# Developing with MapStore

MapStore is both an application and a framework. This guide is both for developers who want to extend MapStore and for those who want to create their custom application using MapStore as a framework.

## MapStore as an application

MapStore is 99% client side, and uses some Java back-end services

Back-end mainly consists in services included from external projects (GeoStore, MapFish Print, HTTP-Proxy...) plus some small service owned by MapStore, all written in Java.

Developing with MapStore as an application means to develop directly on the project. You can add plugins or improve the existing code base and, hopefully, send pull requests on GitHub to include your improvements in the main project.

## MapStore as a Framework

The recommended way to use MapStore as a framework is to create a project that includes MapStore as a sub-folder. For this purpose we created a script that generates the main folder structure and the necessary files [Project Creation Script](../project-creation-script).

This setup allows to create your application or customizations inside the `js` directory and/or add custom back-end services (the set-up allows to create a project that builds a Java WAR package).
Keeping your customization separated and MapStore as a git sub-modules has the followind advantages:

- **Clear separation between the framework and your customization**
- **Easy framework update**: updating the git sub-module.
- **Easy customization of MapStore**: You can fork the project, if you need hard customization. If your customization can be included in MapStore, you can do a pull request to the main project and work on a branch while waiting the pull request merge.

### Build application using examples

Another way to do your application is to create your custom files in a folder (like mapstore examples).
If you want to learn how to develop a simple MapStore based application in this way you can follow the [tutorial](../application-tutorial)
