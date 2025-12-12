# Sharing Resources

*******************

[MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) provides the possibility to share resources through two different ways:

* Directly from the MapStore [Homepage](home-page.md#home-page) by selecting the <img src="../img/button/share2.jpg" class="ms-docbutton"/> option from the <img src="../img/button/three-dots-button.jpg" class="ms-docbutton"/> button in the upper right corner of each resource.

<img src="../img/share/resources-share-option.jpg" class="ms-docimage"  style="max-width:400px;"/>

* Inside the resource by selecting the <img src="../img/button/share2.jpg" class="ms-docbutton" style="max-height:25px;"/> option from the [Side Toolbar](mapstore-toolbars.md#side-toolbar)

From the *Share panel* the user is allowed to share a resource in different ways:

* With a **Direct Link**

* Through a **Social Network**

* Through a **Permalink** to shares current user session (only available from the [Side Toolbar](mapstore-toolbars.md#side-toolbar))

* With **Embedded code** or **APIs** (only available for *maps*)

## Link

As soon as the *Share panel* opens, the **Link** section is the one visible by default:

<img src="../img/share/share_window.jpg" class="ms-docimage"  style="max-width:400px;"/>

Here, the user can copy the resource **URL link** or share it through the **QR code**.

## Social

The **Social** section allows the user to share the resource on the most common social networks like **Facebook**, **Twitter** and **LinkedIn** simply by clicking on the social icon.

<img src="../img/share/social.jpg" class="ms-docimage"  style="max-width:400px;"/>

## Permalink

The **Permalink** section allows to save the current overall viewer state of the resource and share it as a permalink.

<img src="../img/share/permalink.jpg" class="ms-docimage"  style="max-width:400px;"/>

A permalink is a new resource belonging to a dedicated category in [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) for which the user must enter the **Title** and **Description** (the last one is not mandatory) and choose whether the resource will be public by checking the **Public** option (this will generate a public map permalink so that everyone can access it).

!!! Warning
    [Map Details](resources-properties.md#details) as well as other resources connected to a map or context, if present, will not be available in the final permalink resource.

When all options are filled, the user can **Generate permalink** through the <img src="../img/button/generate_permalink.jpg" class="ms-docbutton"/> button to get the **Permalink URL** or the **QR code** to share it.

<img src="../img/share/permalink_generated.jpg" class="ms-docimage"  style="max-width:400px;"/>

## Embed

The **Embed** section provides to the user the needed snippets, **embedded code** or the **MS APIs** (only available for *maps*) to embed MapStore in a third party web page.

<img src="../img/share/embed.jpg" class="ms-docimage"  style="max-width:400px;"/>

In addition, [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) provides options to customize a bit the *embedded code*:

* The user can configure **height** and **width** of the embedded resource by choosing `Small` (*600x500*), `Medium` (*800x600*), `Large` (*1000x800*) and `Custom` (it is possible to choose the desired size).

<img src="../img/share/embed_maps_size.jpg" class="ms-docimage"  style="max-width:400px;"/>

* For maps, the user can choose to show the [TOC](toc.md#table-of-contents) in the embedded map by enabling the **Shown TOC** option

<img src="../img/share/embed_maps_toc.jpg" class="ms-docimage"  style="max-width:400px;"/>

* For dashboards, the user can show the [connections](connecting-widgets.md#connecting-widgets) between widgets on the embedded dashboard by enabling the **Show connections**

<img src="../img/share/embed-dash.jpg" class="ms-docimage"  style="max-width:400px;"/>

## Advanced options

Some **Advanced options** are available for maps and geostories inside the **Share** tool.

!!!note
    Some **Advanced options** are available only opening *Share tool* from the [Side Toolbar](mapstore-toolbars.md#side-toolbar) and not from the MapStore home page.

### Advanced options for sharing maps

In case of maps, enabling the **Advanced options** in the *Share tool* the user can include the following to the share URL:

<img src="../img/share/share_window_map_options.jpg" class="ms-docimage"  style="max-width:400px;"/>

* The **bounding box** parameter to share the current viewport of the map visualized by the user

* The desired center and zoom of the map by enabling the **Add center and zoom**

<img src="../img/share/share_window_center_zoom.jpg" class="ms-docimage"  style="max-width:400px;"/>

The related available options allow the user to:

* Center the shared map to specific coordinates by typing them in two different formats (*Decimal* or *Aeronautical* that can be chosen through the <img src="../img/button/change-search-tool.jpg" class="ms-docbutton"/> button) or by clicking on the map to set automatically the coordinate fields.

* Share the map at a specific **Zoom level** (`Min:1` and `Max:35`)

* **Add marker on loaded map** to show the center point in the shared map

### Advanced options for sharing 3D maps

Once the [3D Navigation](navigation-toolbar.md#3d-navigation) is active on map, the user can include the following to the share URL by enabling the **Advanced options** in the *Share tool*:

<img src="../img/share/share_window_3d_map_options.jpg" class="ms-docimage"  style="max-width:400px;"/>

* The desired center and zoom of the map by enabling the **Add center and zoom to sharing link**

<img src="../img/share/share_3d_map.jpg" class="ms-docimage"  style="max-width:400px;"/>

The related available options allow the user to:

* Center the shared map to specific coordinates by typing them in two different formats (*Decimal* or *Aeronautical* that can be chosen through the <img src="../img/button/change-search-tool.jpg" class="ms-docbutton"/> button) or by clicking on the map to set automatically the coordinate fields.

* Share the map at a specific **Zoom level** (`Min:1` and `Max:35`), **Heading** (`Min:0°` and `Max:360°`), **Roll** (`Min:-90°` and `Max:90°`) and **Pitch** (`Min:-90°` and `Max:90°`)

### Advanced options for sharing GeoStories

In case of GeoStories, enabling the **Advanced options** in the *Share tool* the user can include the following to the share URL:

<img src="../img/share/share_options.jpg" class="ms-docimage" width="400px"/>

* The **Home button** to allow the possibility to bring the user to the MapStore Home Page if needed: that button will be automatically included in view mode inside the story toolbar just beside the navigation bar.

<img src="../img/exploring-stories/share-page.jpg" class="ms-docimage"/>

* The **scroll position** allows to share the URL of the current section of the story visualized by the user

<img src="../img/exploring-stories/share_section.jpg" class="ms-docimage"/>
