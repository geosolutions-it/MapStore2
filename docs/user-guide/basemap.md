# Basemap Switcher
******************

The Basemap Switcher situated in the bottom left corner of the Data Frame allows you to change the world map background.

* **Click** on the map miniature on the bottom left corner.

<img src="../img/basemap/background.jpg" class="ms-docimage"/>

* Several miniatures will be displayed that can be chosen in order to change the map background, such as *Open Street Map*, *NASAGIBS*, *OpenTopoMap*, *Sentinel 2* and the *Empty Background*. For example, **Choose** the *OpenTopoMap* basemap. The background of the map will change consequently.

<img src="../img/basemap/back-selector.jpg" class="ms-docimage"/>

Since the Basemap Switcher editor is present, it is also possible to add, edit and remove backgrounds.

Add background
-------------------

* In order to add a new backgound, **Click** on the plus button on top of the Basemap Switcher's main card.

<img src="../img/basemap/add-back.jpg" class="ms-docimage" />

The catalog window opens, with the possibility of access the Remote Services.

!!! warning
    *Default Backgrounds* service is available only accessing the catalog from the Basemap Switcher, but if you add a new Remote Service accessing catalog from the Basemap Switcher, that Remote Service is available also from Burger Menu. More information about Remote Services can be found in [Catalog](catalog.md) section. 

* **Switch** the Remote Service to *GeoSolutions GeoServer WMS* and **Search** for the following layer: *ne_110m_ocean*. 

<img src="../img/basemap/search-ocean.jpg" class="ms-docimage"/>

* **Click** on Add to Map, in order to add the selected layer as a new background.

<img src="../img/basemap/add-ocean.jpg" class="ms-docimage" style="max-width:500px;"/>

The Add New Background window opens, allowing the user to assign the following set of information to the layer: Thumbnail, Title, Format, Style and Additional Parameters.

* **Add** a Thumbnail choosing the desired file from your folder by clicking on image preview area, or simply with the drag and drop function;

* **Write** *Ocean* as Title;

* **Choose** *image/jpeg* as format (the supported formats are the following: png, png8, jpeg or vnd.jpeg-png);

* **Choose** *gs:ocean* as style (it's the only available for this layer, but there could be more than one);

* **Add** a String Parameter called *interpolation* with *nearest neighbor* as Value, a Number Parameter called *buffer* with *100* as Value and a Boolean Parameter called *tiled* with *True* as Value (these parameters will be added to the WMS request). 

<img src="../img/basemap/add-bck-ocean.jpg" class="ms-docimage"/>

* **Click** on Add and **Close** the Catalog. The new *Ocean* background is now added to the Basemap Switcher, and set as map background.

<img src="../img/basemap/bck-setted.jpg" class="ms-docimage"/>

Edit background
-------------------

It is possible to edit only current backgrounds by clicking on settings icon on top of the Basemap Switcher's main card. 

<img src="../img/basemap/bck-settings.jpg" class="ms-docimage" style="max-width:500px;"/>

The Edit Current Background window opens, allowing the user to customize the same set of information when adding a new background (see [previous section](#add-background)).

<img src="../img/basemap/edit-back-window.jpg" class="ms-docimage"/>

!!! warning
    *Default Backgrounds* Service's layers can't be edited, with an exception for *Sentinel 2*.

Remove background
-------------------

It is possible to remove a background from Basemap Switcher by clicking on Remove icon on top-right of each Basemap Switcher's background card.

<img src="../img/basemap/bck-delete.jpg" class="ms-docimage" style="max-width:500px;"/>

!!! note
    By default, when creating a new map, all backgrounds from *Default Backgrounds* Service are added to the Basemap Switcher, and in Catalog they appear unselectable (it's not allowed to add the same default background twice). As soon as you remove one from the Basemap Switcher, it becomes selectable from the Catalog.

    <img src="../img/basemap/bck-unselectable.jpg" class="ms-docimage" style="max-width:500px;"/>
