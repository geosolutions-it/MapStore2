# Managing Extensions

*******************

In [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/), the **Extensions Manager** is an administrative tool that lists the [extensions](../developer-guide/extensions.md#extensions) installed in the application. Extensions add new tools to MapStore: some of them are added to an [Application Context](application-context.md#application-context), others only provide content or configuration to the whole application.

As an admin user, it is possible to open the **Extensions Manager** by selecting **Manage Extensions** from the <img src="../img/button/logged.jpg" class="ms-docbutton"/> button on the [Homepage](home-page.md#home-page).

<img src="../img/managing-extensions/user-menu.jpg" class="ms-docimage" style="max-width:500px;"/>

## Installed extensions

The page shows one card for each installed extension, with:

* the icon of the extension, when it declares one;
* the title of the extension and, below it, its name;
* its version, when the extension declares one;
* its description;
* the plugins that the extension adds to MapStore, each one with its icon, its version and whether it can be added to an [Application Context](application-context.md#application-context). Plugins that only provide pages or configuration to the whole application cannot be added to a context, because they add no tool to it: this page is where their extension is managed.

<img src="../img/managing-extensions/extensions-list.jpg" class="ms-docimage"/>

## Install an extension

Click **Install extension** and drop the zip file of the extension in the window, or click the window to choose it. MapStore checks the file before installing it: a file that is not an extension is marked with an error and cannot be installed. Click **Install** to install the valid files.

<img src="../img/managing-extensions/install-dialog.jpg" class="ms-docimage" style="max-width:600px;"/>

The new extension is available in the application without reloading the page, and appears in the list. When it adds a tool to the maps, it can be added to an [Application Context](application-context.md#application-context).

## Update an extension

To update an extension, install the zip file of its new version. When the file contains an extension that is already installed, the window shows the installed version of the extension and the version that replaces it.

<img src="../img/managing-extensions/update-dialog.jpg" class="ms-docimage" style="max-width:600px;"/>

After the update, reload the page to use the new version.

## Uninstall an extension

Click **Uninstall** on the card of the extension and confirm. The extension and its files are removed, and the extension is removed from the application without reloading the page.

<img src="../img/managing-extensions/uninstall-confirm.jpg" class="ms-docimage" style="max-width:500px;"/>

!!! warning

    The [Application Contexts](application-context.md#application-context) that use the plugin of the extension do not show it any more.
