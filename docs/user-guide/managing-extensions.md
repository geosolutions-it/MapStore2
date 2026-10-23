# Managing Extensions

*******************

In [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/), the **Extensions Manager** is an administrative tool that lists the [extensions](../developer-guide/extensions.md#extensions) installed in the application. Extensions add new tools to MapStore: some of them are added to an [Application Context](application-context.md#application-context), others only provide content or configuration to the whole application.

As an admin user, it is possible to open the **Extensions Manager** by selecting **Manage Extensions** from the <img src="../img/button/logged.jpg" class="ms-docbutton"/> button on the [Homepage](home-page.md#home-page).

## Installed extensions

The page shows one row for each installed extension, with:

* the title of the extension and, below it, its name;
* its description;
* its version, when the extension declares one.

## Install an extension

Click **Install extension** and drop the zip file of the extension in the window, or click the window to choose it. MapStore checks the file before installing it: a file that is not an extension is marked with an error and cannot be installed. Click **Install** to install the valid files.

The new extension is available in the application without reloading the page, and appears in the list. When it adds a tool to the maps, it can be added to an [Application Context](application-context.md#application-context).

## Update an extension

To update an extension, install the zip file of its new version. When the file contains an extension that is already installed, the window shows the installed version and the version that replaces it.

After the update, reload the page to use the new version.
