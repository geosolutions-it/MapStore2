# Resource Properties
------------------------------

What a user can do on a resource (both maps and dashboards) depends on its role.

* **Admin** users can manage accounts and can *view* and *edit* all the maps and dashboards, whoever created them

* **Users** can view and edit only those maps and dashboards which they have created. If they are neither administrators nor owners, what they can do depends on the *Rights* assigned to the group they belong to

* **Everyone** can view or edit the maps and dashboard according to the *rights* that have been assigned by the administrator or their owners

In order to customize the properties of a resource, the admin or an user with permission can access the **Edit properties** window from the **Edit properties** button <img src="../img/button/edit-icon.jpg" class="ms-docbutton"/> in [Homepage](https://mapstore.geo-solutions.it/mapstore/#/) or from the **Save**/**Save as** button inside the resource viewer.

<img src="../img/resource-properties/edit-properties.jpg" class="ms-docimage"  style="max-width:400px;"/>

Through the **Edit properties** window the user can perform the following operations:

* Add a **Thumbnail**

* Add **Name** and **Description**

* Add a **Permission** rule

!!! warning
    The name of a resource is the only mandatory field. Note that is not allowed to choose a name that has already been attributed to another resource.

## Thumbnail

It is possible to add an image as **thumbnail** dropping it or clicking inside the following box:

<img src="../img/resource-properties/thumb.jpg" class="ms-docimage"/>

!!! warning
    The image to be added must not be larger than 500 kb and its best dimensions are 300x180 px.

## Permission rule

In the **Add a rule...** section you can set one ore more permission rules in order to allow everyone and/or specific groups of users to access the resource. Moreover it is possible to choose between two different ways with witch the selected group can approach the resource:

* **View** the map and save a copy

* **Edit** the map and re-save it

In order to add a rule, the user can select the group and the access modality in the *Add a rule...* section. Once the rule is set, with the  **Add** button <img src="../img/button/add-rule-icon.jpg" class="ms-docbutton"/> it is possible to add it to the **Permissions Groups** list. <br>
For example, a resource that can be seen by everyone, should have a rule like the following:

<img src="../img/resource-properties/rule_added.jpg" class="ms-docimage" />

Once a rule is set, the user can always remove it through the **Remove** button <img src="../img/button/remove-rule-icon.jpg" class="ms-docbutton"/>. <br>
How to manage users and groups is a topic present in the [Managing Users](managing-users.md) and [Managing Groups](managing-groups.md) sections.

## Details

Only for map type resource, and only from the **Edit properties** button <img src="../img/button/edit-icon.jpg" class="ms-docbutton"/> in [Homepage](https://mapstore.geo-solutions.it/mapstore/#/), it is possible to add some details to the map. In this case the **Edit properties** window is the following:

<img src="../img/resource-properties/edit-map-properties-panel_details.jpg" class="ms-docimage"  style="max-width:400px;"/>

With a click on the **Add new details** button <img src="../img/button/add_details_button.jpg" class="ms-docbutton"/> it opens a panel where the user can write the details of the map. 

<img src="../img/resource-properties/details_panel.jpg" class="ms-docimage"/>

The text can be edit and some links and images can be added through the [Text Editor Toolbar](text-editor-details.md). Once the customization is done, the changes can be saved with the **Save** button <img src="../img/button/save_large_button.jpg" class="ms-docbutton"/> and other three buttons appears:

* Show the details preview <img src="../img/button/details_preview_button.jpg" class="ms-docbutton"/> 

* Edit the details <img src="../img/button/edit-details-button.jpg" class="ms-docbutton"/>

* Delete the details sheet <img src="../img/button/delete_white_button.jpg" class="ms-docbutton"/>

Once the details are saved, the **Show details** button <img src="../img/button/details_button.jpg" class="ms-docbutton"/> appears on the map card in [Homepage](https://mapstore.geo-solutions.it/mapstore/#/) (only for the users with the permission right)

<img src="../img/resource-properties/card-map-details-button.jpg" class="ms-docimage" style="max-width:400px;"/>

Through this button it is possible to take a look at the details:
    
<img src="../img/resource-properties/details-sheet.jpg" class="ms-docimage"/>

The details are also available from the Burger Menu <img src="../img/button/burger.jpg" class="ms-docbutton"/> inside the map viewer. Since details are added to a map, indeed, a new button called **About this map** <img src="../img/button/about-this-map.jpg" class="ms-docbutton"/> is listed between the Burger Menu options, allowing the user to access the details from a dedicated panel:

<img src="../img/resource-properties/about-this-map-in-map.jpg" class="ms-docimage"/>