# Resource Properties

*********************

In order to customize the properties of a resource, the Admin or a normal user with permission can access the *Edit properties* window from the **Edit properties** button <img src="../img/button/edit-icon.jpg" class="ms-docbutton"/> in [Homepage](https://mapstore.geosolutionsgroup.com/mapstore/#/) or from the **Save** and the **Save as** buttons inside the resource viewer.

<img src="../img/resource-properties/edit-properties.jpg" class="ms-docimage"  style="max-width:400px;"/>

Through the *Edit properties* window the user can perform the following operations:

* Add an image as a **Thumbnail** dropping it or clicking inside the *Thumbnail* box.

!!! warning
    The image to be added must not be larger than 500 kb and its best dimensions are 300x180 px. The supported formats are `jpg` (or `jpeg`) and `png`.

* Add a **Name** and a **Description**

!!! note
    The name of a resource is the only mandatory field. Note that is not allowed to choose a name that has already been assigned to another resource.

* Enable the **Unadvertised** option to make the owner of the resource or the MapStore admin the only ones who can see and search that resource in the [Home Page](home-page.md) or in the [Map Catalog](map-catalog.md) tool.

* Add a [**Permission** rule](resources-properties.md#permission-rules)

* Add **Details** (only for *Maps* and *Dashboard*)

Once a resource is saved, the *Edit properties* panel shows the creation and the last modification dates. An example in the image below:

<img src="../img/resource-properties/resource_data.jpg" class="ms-docimage"  style="max-width:400px;"/>

Admin users can also see who created and modified the resource. An example in the image below:

<img src="../img/resource-properties/resource_creation.jpg" class="ms-docimage"  style="max-width:400px;"/>

## Permission rules

In the *Add a rule...* section you can set one ore more permission rules in order to allow a group to access the resource. In particular it is possible to choose between a particular group of authenticated users or the *everyone* group that includes all authenticated users but also anonymous users (more information about different user types can be found in [Homepage](home-page.md#home-page) section). <br>
Moreover it is possible to choose between two different ways with which the selected group can approach the resource:

* *View* the map and save a copy

* *Edit* the map and re-save it

In order to add a rule, the user can select the group and set permissions inside the *Add a rule...* section. Once the rule is set, with the  **Add** button <img src="../img/button/add-rule-icon.jpg" class="ms-docbutton"/> it is possible to add it to the *Permissions Groups* list. <br>
For example, a resource that can be seen by *everyone*, should have a rule like the following:

<img src="../img/resource-properties/rule_added.jpg" class="ms-docimage" />

Once a rule is set, the user can always remove it through the **Remove** button <img src="../img/button/remove-rule-icon.jpg" class="ms-docbutton"/>. <br>
How to manage users and groups is a topic present in the [Managing Users](managing-users.md#managing-users) and [Managing Groups](managing-groups.md#managing-groups) sections.

## Details

Only for resources of type *map* and *dashboard*, it is possible to add details as additional information in form of descriptive content for the resource itself. This is useful to associate some information to the resource and provide an overview of its content. In this case the *Edit properties* window is the following:

<img src="../img/resource-properties/edit-map-properties-panel_details.jpg" class="ms-docimage"  style="max-width:400px;"/>

With a click on the **Add new details** button <img src="../img/button/add_details_button.jpg" class="ms-docbutton"/> a panel opens and the user can write the details of the resource.

<img src="../img/resource-properties/details_panel.jpg" class="ms-docimage"/>

The text can be edited and some links and images can be added through the [Text Editor Toolbar](text-editor-toolbar.md#text-editor-toolbar).
Once the editing is done, the map details can be saved with the **Save** button <img src="../img/button/save_large_button.jpg" class="ms-docbutton"/> and other buttons appear on the *Edit properties* panel.

<img src="../img/resource-properties/details_sheet_buttons.jpg" class="ms-docimage"/>

Here, the user is allowed to:

* Show the details **preview** <img src="../img/button/details_preview_button.jpg" class="ms-docbutton"/>

* **Edit** the details <img src="../img/button/edit-details-button.jpg" class="ms-docbutton"/>

* Enable the **Show as modal** <img src="../img/button/show-as-modal-button.jpg" class="ms-docbutton"/> button, to show the details on a modal when the user clicks on <img src="../img/button/about_this_map.jpg" class="ms-docbutton"/> button, which is listed in the [Side Toolbar](mapstore-toolbars.md#side-toolbar) options

<img src="../img/resource-properties/show-as-modal.jpg" class="ms-docimage"/>

!!! note
    If the **Show as modal** button is not activated once the user opens the *About this map* button, the details are displayed on a panel. <img src="../img/resource-properties/show-as-panel.jpg" class="ms-docimage"/>

!!! warning
    The *About this map* button is visible in the [Side Toolbar](mapstore-toolbars.md#side-toolbar) only when the details are present on the map.

* Enable the **Show at startup** <img src="../img/button/show-at-starup-button.jpg" class="ms-docbutton"/> button. If active, when the user opens a resource with defined details, these are visualized in a descriptive panel.

* **Delete** the details sheet <img src="../img/button/delete_white_button.jpg" class="ms-docbutton"/>

Once the details are saved, the **Show details** button <img src="../img/button/details_button.jpg" class="ms-docbutton"/> appears also on the map card in [Homepage](https://mapstore.geosolutionsgroup.com/mapstore/#/)

<img src="../img/resource-properties/card-map-details-button.jpg" class="ms-docimage" style="max-width:400px;"/>

Through this, it is possible to open the details panel also from the home page.

<img src="../img/resource-properties/details-sheet.jpg" class="ms-docimage"/>
