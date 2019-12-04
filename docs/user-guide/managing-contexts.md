# Managing Contexts
***************** 

The contexts are used for customize the map viewer. Only the administrator is allowed to define the parametric viewer and so chooses the extencios to insert on the context. At a later time those contexts can be chosen to create a new map.
 

## Creating New Contexts

In order to customize the contexts, the administrator can access the **managing contexts** window from the <img src="../img/button/new-context-button.jpg" class="ms-docbutton"/> button. Now a new window opens where you can **create a new context for the app** by following the three steps that will be explained later.

<img src="../img/managing-contexts/three-step.jpg" class="ms-docimage"/>

## General Settings

Through the **General settings** window the admin can define the generalities of the context. 

<img src="../img/managing-contexts/general-settings.jpg" class="ms-docimage"/>

It is necessary to insert:

 * The name for the viewer 

 * The title for the broswer window  

<img src="../img/managing-contexts/step_one.jpg" class="ms-docimage" style="max-width:400px;"/>

!!! warning
    The name of a context is the only mandatory field. Note that is not allowed to choose a name that has already been assigned to another context.


Once the generalities are inserted, you can click on the <img src="../img/button/next-button.jpg" class="ms-docbutton"/> button to access the second step.

## Configure Plugins

Through the **Configure Plugins** window the admin can choose the extensions to be inserted in the context.

<img src="../img/managing-contexts/configure-plugins.jpg" class="ms-docimage"/> 

To do this you need to select a pluging from list of **Available plugins**, click on the **Add** button <img src="../img/button/add_arrow_button.jpg" class="ms-docbutton"/> so the pluging can be added to the **Enabled Plugins**

<img src="../img/managing-contexts/add-plugin.gif" class="ms-docimage" style="max-width:700px;"/>

If you need to add all available plugins you have to click on the **Add all** button <img src="../img/button/add-all-button.jpg" class="ms-docbutton"/> and if you want remove all the plugins you need to use **Remove all** button <img src="../img/button/remove-all-button.jpg" class="ms-docbutton"/> or **Remove** button <img src="../img/button/remove_button.jpg" class="ms-docbutton"/> for remove just a few plugins.

Moreover, it is possible **Upload new plugin** with this button <img src="../img/button/upload-button.jpg" class="ms-docbutton"/> or choose from the available plugins, that are: 

* **Catalog** offers demo services that allow you to extract the data and add them to the map from GeoServer or to create connections to other geospatial services (supported services are WMS, WMTS and CSW)

* **Map Templates** offers the possibility to choose the types of map

* **Scale** offers the possibility to view the metric scale

* **List of Layers** offers the possibility to enable/disable the **Attribute table** and the **Layer settings**. In the Table of Contents (TOC) where each layer are show and it allows you to manage the order and the visibility of the added layers. Moreover, it contains tools to edit and analyst on the layers

* **Zoom in** and **Zoom out** offers the possibility to increase/decrease the map zoom

When the **Enabled Plugins** list is personalized to your liking, it is possible:

* **Enable/Disable** the plugin for the user <img src="../img/button/enable-disable-button.jpg" class="ms-docbutton"/>

* **Change plugin configuration** <img src="../img/button/change-button.jpg" class="ms-docbutton"/> trought witch you can configurate the plugin

<img src="../img/managing-contexts/change-configuration.jpg" class="ms-docimage" style="max-width:500px;"/>

Once the extencios are inserted, you can click on the <img src="../img/button/next-button.jpg" class="ms-docbutton"/> button to access the third step.


## Configure Map

Through the **Configure Map** window the admin can choose and viewed the custumize map.

<img src="../img/managing-contexts/configure-map.jpg" class="ms-docimage"/>

Once the map has been customized, you can click on the **Save** button <img src="../img/button/save-blu-button.jpg" class="ms-docbutton"/> and the new context will be stored into the *Contexts* container.

<img src="../img/managing-contexts/context-card.jpg" class="ms-docimage" style="max-width:500px;"/>


## Contexts container

The contexts container is where will be store seved contexts. Each context is represented by a card. 

<img src="../img/managing-contexts/context-card-tool.jpg" class="ms-docimage" style="max-width:500px;"/>

You can use the configuration buttons visible on each card, which are:

* <img src="../img/button/delete.jpg" class="ms-docbutton" style="max-width:30px;"/>, allows you to delete context

* <img src="../img/button/edit_button.jpg" class="ms-docbutton"/>, allows you to edit name and window title context

* <img src="../img/button/properties.jpg" class="ms-docbutton"/>, allows you to edit the properties of the context such as the thumbnail, name, description and permissions. You will learn more about [here](resources-properties.md).

* <img src="../img/button/share-button.jpg" class="ms-docbutton" style="max-width:30px;"/>, allows you to share the context
