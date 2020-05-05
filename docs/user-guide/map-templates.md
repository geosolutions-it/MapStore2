# Map Templates
*******************

This extension allows to browse **Map Templates** in a MapStore's viewer. Supported Map Templates formats in MapStore are [WMC](https://mapstore.readthedocs.io/en/latest/developer-guide/maps-configuration/#web-map-context) and [MapStore's native JSON](https://mapstore.readthedocs.io/en/latest/developer-guide/maps-configuration/#map-options). The <img src="../img/button/map-templates-button.jpg" class="ms-docbutton"/> button, present in *Burger Menu* <img src="../img/button/burger.jpg" class="ms-docbutton" />, provides to the user the list of the available templates. 

<img src="../img/map-templates/map-templates-panel.jpg" class="ms-docimage"/>

For each template in the *Map Templates* list the following buttons are displayed:

<img src="../img/map-templates/map-templates-buttons.jpg" class="ms-docimage" style="max-width:500px;"/>

* The **Replace** button <img src="../img/button/replace-button.jpg" class="ms-docbutton" /> allows the user to entirely replace the current map with the one defined in the template, as follows:

<img src="../img/map-templates/replace-map.gif" class="ms-docimage"/>

* The **Add Template** button <img src="../img/button/add_to_map_button.jpg" class="ms-docbutton" /> allows the user to add the map template contents (layers) to current map without replacing it (by default a new group is created in that case in TOC, on top of the other ones, to contains layers coming from the template to better identify them), as follows:

<img src="../img/map-templates/add-templates.gif" class="ms-docimage"/>

* The **Add to favorites** button <img src="../img/button/favourites-button.jpg" class="ms-docbutton" /> allows the user to add the template to favorites on top of the list

## Enabling the Map templates in a context

The *Map templates* extension is enabled by the admin in the [Application Context](application-context.md) wizard. In particular, this is possible in the [third step](application-context.md#configure-plugins) of the wizard and after the extension is added to the *Enabled Plugins* list.

<img src="../img/map-templates/configure-templates.jpg" class="ms-docimage" style="max-width:500px;"/>

As soon as the **Configure templates** button <img src="../img/button/configure-templates-button.jpg" class="ms-docbutton" /> is selected the *Configure templates* modal window opens, it allows the admin to manage the map templates.

<img src="../img/map-templates/map-templates-window.jpg" class="ms-docimage" style="max-width:500px;"/>

Through the *Configure Template* tool, the administrator can browse existing templates in MapStore and enable them for the context simply by moving the desired ones from the *Available Templates* list to the *Enabled Templates* list: this is possible with the central bar, as follows:

<img src="../img/map-templates/moving-templates.jpg" class="ms-docimage" style="max-width:500px;"/>

### Uploading the template

It is possible for the administrator to create new Map Templates in MapStore by uploading new template files. In order to upload a new template the admin can select the **Upload new template** button <img src="../img/button/upload-button.jpg" class="ms-docbutton"/> to open the **Upload new template** window:

<img src="../img/map-templates/upload-map-template.jpg" class="ms-docimage" style="max-width:300px;"/>

Here the admin, in order to import a template file, can drag and drop it inside the import area or simply click on that area to select it from the folders of the local machine.

<img src="../img/map-templates/import-screen.jpg" class="ms-docimage" style="max-width:300px;"/>

!!! warning
    
    The file that the admin can upload are:

    * The [MapStore native map definition](https://mapstore.readthedocs.io/en/latest/developer-guide/maps-configuration/#map-options) `json` format

    * The [WMC](https://mapstore.readthedocs.io/en/latest/developer-guide/maps-configuration/#web-map-context) (Web Map Context) file in `xml` format

The admin can also add **Thumbnail**, **Name**, **Description** and **Groups permissions** as describe [here](resources-properties.md)

### Customize the template

The admin can also delete or modify an existing template through the buttons that are available on the left side of each templates item inside the *Configure templates* UI.

<img src="../img/map-templates/costomize-button.jpg" class="ms-docimage" style="max-width:500px;"/>

In particular, the admin can:

* Modify the template using the [Edit properties](resources-properties.md) that opens by clicking on the **Edit properties** button <img src="../img/button/edit-details-button.jpg" class="ms-docbutton"/>

* Delete the template through the **Delete** button <img src="../img/button/delete_white_button.jpg" class="ms-docbutton" />