# Resource Properties

*********************

The **Properties** panel is accessible by the user through the *Open Properties* <img src="../img/button/properties_button.jpg" class="ms-docbutton"/> button in [Homepage](https://mapstore.geosolutionsgroup.com/mapstore/#/) or from the **Navigation bar** inside the resource viewer.

<img src="../img/resource-properties/edit-properties.jpg" class="ms-docimage"  style="max-width:600px;"/>

From the *Properties* panel the user can view the resource information through the **Info** tab, the resource's permissions, if the user has edit permissions on the resource, through the **Permissions** tab and the resource details through the **About** tab.

By clicking the **Edit properties** <img src="../img/button/edit_properties.jpg" class="ms-docbutton"/> button, the Admin or a Normal user with the necessary permissions can customize the resource by performing the following operations:

<img src="../img/resource-properties/edit-info-properties.jpg" class="ms-docimage"  style="max-width:600px;"/>

* **Upload** an image as a *Thumbnail* dropping it or clicking the <img src="../img/button/upload_new.jpg" class="ms-docbutton"/> button inside the *Thumbnail* box.

!!! warning
    The image to be added must not be larger than 500 kb and its best dimensions are 300x180 px. The supported formats are `jpg` (or `jpeg`) and `png`.

* Delete the *Thumbnail* clicking the <img src="../img/button/remove_new.jpg" class="ms-docbutton"/> button inside the *Thumbnail* box.

* Add **Name**,  **Description** and **Contact details**

!!! note
    The name of a resource is the only mandatory field. Note that is not allowed to choose a name that has already been assigned to another resource.

* Add [Tags](tags.md) to the resource

* Disable the **Advertised** option to make the owner of the resource or the MapStore admin the only ones who can see and search that resource in the [Home Page](home-page.md) or in the [Map Catalog](map-catalog.md) tool.

* Enable the **Featured** option to add the resource to the featured resources list on the [Home Page](home-page.md).

* From the **Permissions** tab, add a [**Permission** rule](resources-properties.md#permission-rules)

* From the **About** tab, add **Details**

Once a resource the user save the changes made using the **Save** <img src="../img/button/save_changes_button.jpg" class="ms-docbutton"/> button, the *Properties* panel shows the creation and the last modification dates. An example in the image below:

<img src="../img/resource-properties/resource_data.jpg" class="ms-docimage"  style="max-width:600px;"/>

Admin users can also see who created and modified the resource. An example in the image below:

<img src="../img/resource-properties/resource_creation.jpg" class="ms-docimage"  style="max-width:600px;"/>

## Permission rules

From the **Permissions** tab the Admin or a Normal user with the necessary permissions can set one or more permission rules in order to allow a group to access the resource. In particular it is possible to choose between a particular group of authenticated users or the *everyone* group that includes all authenticated users but also anonymous users (more information about different user types can be found in [Homepage](home-page.md#home-page) section). <br>
Moreover it is possible to choose between two different ways with which the selected group can approach the resource:

* *View* the resource and save a copy

* *Edit* the resource and re-save it

In order to add a rule, the user can click the **Add Permissions** <img src="../img/button/add-rules.jpg" class="ms-docbutton"/> button that open a **Groups** pop-up in witch the user can add to the *Permissions Groups* list a group through the <img src="../img/button/++++.jpg" class="ms-docbutton"/> button.

<img src="../img/resource-properties/rule_added.jpg" class="ms-docimage" style="max-width:600px;" />

Once the the selected group is on the *Permissions Groups* list, the user can choose between *View* and *Edit* permission option.

<img src="../img/resource-properties/rule_added_example.jpg" class="ms-docimage" style="max-width:600px;" />

Once a rule is set, the user can always remove it from the list through the **Remove** <img src="../img/button/remove-button.jpg" class="ms-docbutton"/> button or save the changes made using the **Save** <img src="../img/button/save_changes_button.jpg" class="ms-docbutton"/> button. <br>

!!! note
    How to manage users and groups is a topic present in the [Managing Users](managing-users.md#managing-users) and [Managing Groups](managing-groups.md#managing-groups) sections.

## Details

It is possible to add details as additional information in form of descriptive content for the resource itself. This is useful to associate some information to the resource and provide an overview of its content. To do that the user can can write the details of the resource from the **About** tab.

<img src="../img/resource-properties/edit-map-properties-panel_details.jpg" class="ms-docimage"  style="max-width:600px;"/>

The text can be edited and some links and images can be added through the [Text Editor Toolbar](text-editor-toolbar.md#text-editor-toolbar).
Once the editing is done, the map details can be saved using the **Save** <img src="../img/button/save_changes_button.jpg" class="ms-docbutton"/> button.

From the **Settings** tab the user is allowed to:

<img src="../img/resource-properties/details_sheet_buttons.jpg" class="ms-docimage" style="max-width:600px;"/>

* Enable the **Show as modal**, to show the details on a modal when the user clicks on <img src="../img/button/details2.jpg" class="ms-docbutton"/> button, which is listed in the [Side Toolbar](mapstore-toolbars.md#side-toolbar) options

<img src="../img/resource-properties/show-as-modal.jpg" class="ms-docimage" style="max-width:600px;"/>

!!! note
    If the **Show as modal** button is not activated once the user opens the *About this map* button, the details are displayed on a panel. <img src="../img/resource-properties/show-as-panel.jpg" class="ms-docimage"/>

!!! warning
    The *About this map* button is visible in the [Side Toolbar](mapstore-toolbars.md#side-toolbar) only when the details are present on the map.

* Enable the **Show at startup**. If active, when the user opens a resource with defined details, these are visualized in a descriptive panel.
