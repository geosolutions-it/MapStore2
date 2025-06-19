# Managing Groups

*****************

On the **Groups** tab of the *Manage Accounts* page, the following is displayed

<img src="../img/managing-groups/groups-man.jpg" class="ms-docimage"  style="max-width:700px;"/>

Similar to what happens for the [Users Manager](managing-users.md#managing-users), in this page the Admin can:

* Perform a search among the existing groups

<img src="../img/managing-groups/search-groups.jpg" class="ms-docimage" style="max-width:500px;"/>

* Create a new group with the **New Group** button <img src="../img/button/new-group.jpg" class="ms-docbutton"/>

* Edit or remove an existing one, through the **Edit group** <img src="../img/button/edit-icon.jpg" class="ms-docbutton"/> and **Delete group** <img src="../img/button/delete2.jpg" class="ms-docbutton" /> buttons on each group card:

<img src="../img/managing-groups/edit-group.jpg" class="ms-docimage"/>

Both the **New Group** <img src="../img/button/new-group.jpg" class="ms-docbutton"/> and the **Edit group** <img src="../img/button/edit-icon.jpg" class="ms-docbutton"/> buttons, open the *Group editor* window that is composed of two sections:

* *Group ID*

* *Members manager*

* *>Attributes*

## Group ID

As soon as the *New Group* window opens, the *Group ID* section is displayed:

<img src="../img/managing-groups/popup-group.jpg" class="ms-docimage"/>

In this section the Admin is allowed to:

* Set the *Group Name*

* Set the group *Description*

!!! warning
    The *Group Name* is the only mandatory field.

## Members manager

Through the *Members manager* section it is possible to choose which users are part of the group:

<video class="ms-docimage" controls><source src="../img/managing-groups/sel-users.mp4"/></video>

## Attributes

On the *Attributes* tab the admin can associate some attributes to user groups. By default MapStore allows to enter a "notes" attribute for each group. The attributes list can be configured by editing the [plugin configuration](https://mapstore.geosolutionsgroup.com/mapstore/docs/api/plugins#plugins.GroupManager) in `localConfig.json`.

<img src="../img/managing-groups/notes.jpg" class="ms-docimage"/>
