# Basemap Switcher
******************

The Basemap Switcher situated in the bottom left corner of the Data Frame allows you to change the world map background.

* **Click** on the map miniature on the bottom left corner.

<p style="text-align:center;"><img src="../img/background.jpg" style="max-width:600px;" /></p>

* Several miniatures will be displayed that can be chosen in order to change the map background, such as *Open Street Map*, *NASAGIBS*, *OpenTopoMap*, *Sentinel 2* and the *Empty Background*. For example, **Choose** the *OpenTopoMap* basemap. The background of the map will change consequently.

<p style="text-align:center;"><img src="../img/back-selector.jpg" style="max-width:600px;" /></p>

Since the Basemap Switcher editor is present, it is also possible to add, edit and remove backgrounds.

Add background
-------------------

* In order to add a new backgound, **Click** on the plus button on top of the Basemap Switcher's main card.

<p style="text-align:center;"><img src="../img/add-back.jpg" style="max-width:600px;" /></p>

The catalog window opens, with the possibility of access the Remote Services.

!!! warning
    *Default Backgrounds* service is available only accessing the catalog from the Basemap Switcher, but if you add a new Remote Service accessing catalog from the Basemap Switcher, that Remote Service is available also from Burger Menu. More information about Remote Services can be found in [Catalog](catalog.md) section. 

* **Switch** the Remote Service to *GeoSolutions GeoServer WMS* and **Search** for the following layer: *ne_110m_ocean*. 

<p style="text-align:center;"><img src="../img/search-ocean.jpg" style="max-width:600px;"></p>

* **Click** on Add to Map, in order to add the selected layer as a new background.

<p style="text-align:center;"><img src="../img/add-ocean.jpg" style="max-width:600px;" /></p>

The Add New Background window opens, allowing the user to assign the following set of information to the layer: Thumbnail, Title, Format, Style and Additional Parameters.

* **Add** a Thumbnail choosing the desired file from your folder by clicking on image preview area, or simply with the drag and drop function;

* **Write** *Ocean* as Title;

* **Choose** *image/jpeg* as format (the supported formats are the following: png, png8, jpeg or vnd.jpeg-png);

* **Choose** *gs:ocean* as style (it's the only available for this layer, but there could be more than one);

* **Add** a String Parameter called *interpolation* with *nearest neighbor* as Value, a Number Parameter called *buffer* with *100* as Value and a Boolean Parameter called *tiled* with *True* as Value (these parameters will be added to the WMS request). 

<p style="text-align:center;"><img src="../img/add-bck-ocean.jpg" style="max-width:400px;" /></p>

* **Click** on Add and **Close** the Catalog. The new *Ocean* background is now added to the Basemap Switcher, and set as map background.

<p style="text-align:center;"><img src="../img/bck-setted.jpg" style="max-width:600px;" /></p>

Edit background
-------------------

It is possible to edit only current backgrounds by clicking on settings icon on top of the Basemap Switcher's main card. 

<p style="text-align:center;"><img src="../img/bck-settings.jpg" style="max-width:600px;" /></p>

The Edit Current Background window opens, allowing the user to costumize the same set of informations costumizable adding a new background (see [previous section](#add-background)).

<p style="text-align:center;"><img src="../img/edit-back-window.jpg" style="max-width:400px;" /></p>

!!! warning
    *Default Backgrounds* Service's layers can't be edited, with an exception for *Sentinel 2*.

Remove background
-------------------

It is possible to remove a background from Basemap Switcher by clicking on Remove icon on top-right of each Basemap Switcher's background card.

<p style="text-align:center;"><img src="../img/bck-delete.jpg" style="max-width:400px;" /></p>

!!! note
    By default, creating a new map, all backgrounds from *Default Backgrounds* Service are added to the Basemap Switcher, and in catalog they appear unselectable (it's not allowed to add the same default background more than once). As soon as you remove one from the Basemap Switcher, it becomes again selectable from the catalog.

    <p style="text-align:center;"><img src="../img/bck-unselectable.jpg" style="max-width:600px;" /></p>
