# Background Selector
*********************

The background selector, located in the bottom left corner of the *Viewer*, allows the user to add, manage and remove map backgrounds.

<img src="../img/background/background.jpg" class="ms-docimage"/>

By clicking on the background selector several miniatures will be displayed. Those miniatures can be selected in order to switch from a background to another (the map backgrounds set by default in MapStore are *Open Street Map*, *NASAGIBS*, *OpenTopoMap*, *Sentinel 2* and the *Empty Background*).

<img src="../img/background/bck-available.jpg" class="ms-docimage" style="max-width:500px;"/>

For example choosing *OpenTopoMap*, the map background will change like in the following image:

<img src="../img/background/back-selector.jpg" class="ms-docimage"/>

If the user has editing permissions on the map (independently on the role, see [Resource Properties](resources-properties.md) section for more information about permissions), it is also possible to add, edit or remove backgrounds.

## Add background

A new background can be added through the <img src="../img/button/+++.jpg" class="ms-docbutton"/> button on the top of the background selector main card. Performing this operation the [Catalog](catalog.md) panel opens with the possibility to access the *Remote Services*:

<img src="../img/background/bck-catalog.jpg" class="ms-docimage" style="max-width:500px;"/>

!!! warning
    *Default Backgrounds* service is available only accessing the [Catalog](catalog.md) from the background selector, but if you add a new Remote Service from there, it will be available also accessing [Catalog](catalog.md) from [Buger Menu](menu-bar.md#burger-menu) or from [TOC](toc.md). *Default Backgrounds* represent a list of backgrounds that can be configured from MapStore's configuration files (more information about that can be found in Developer Guide's [Map Configuration](../developer-guide/maps-configuration.md) section).

From the [Catalog](catalog.md) the user can choose the layers to add to the list of backgrounds:

<img src="../img/background/add-ocean.jpg" class="ms-docimage" style="max-width:500px;"/>

As soon as a layer is selected, the **Add New Background** window opens:

<img src="../img/background/add-new-bck.jpg" class="ms-docimage" style="max-width:500px;" />

In particular, from this window, the user can perform the following operations:

* Add a **Thumbnail** choosing the desired local file by clicking on image preview area, or simply with the drag and drop function

* Set the **Title**

* Set the **Format** (between `png`, `png8`, `jpeg`, `vnd.jpeg-png` or `gif`)

* Choose the **Style**, between the ones available for that layer

* Add **Additional Parameters** of three different types: *String*, *Number* or *Boolean* (these parameters will be added to the WMS request).

!!! warning
    The thumbnail image size should be a square of 98x98px or 128x128px, max 500kb and the supported format are `jpg` (or `jpeg`) and `png`

Once the options are chosen, with the <img src="../img/button/add_group_confirm_button.jpg" class="ms-docbutton"/> button the new background layer is definitively added to the background selector as a card and automatically set as the current one.

## Edit background

It is possible to edit backgrounds by clicking on settings icon on top of each background card:

<img src="../img/background/edit-back-window.jpg" class="ms-docimage" style="max-width:600px;"/>

!!! warning
    *Default Backgrounds* layers can't be edited, with an exception for *Sentinel 2: only WMS Layers can be edited&/configured through the Background Selector*.

The **Edit Current Background** window opens, allowing the user to customize the same set of information when adding a new background (see [previous section](#add-background)).

## Remove background

It is possible to remove a background from the background selector by clicking on remove icon on top-right of each card

<img src="../img/background/bck-delete.jpg" class="ms-docimage" style="max-width:500px;"/>

!!! note
    By default, for new maps, all backgrounds from *Default Backgrounds* Service are added to the background selector, and in [Catalog](catalog.md) they appear grayed (it's not allowed to add the same default background twice): as soon as you remove one from the background selector, it becomes selectable from the [Catalog](catalog.md).

    <img src="../img/background/bck-unselectable.jpg" class="ms-docimage"/>
