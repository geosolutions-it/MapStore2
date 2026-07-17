# Footer

********

In [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) some of the map information are reported in the *Footer*. By default, as soon as the user opens the map, the **Scale Bar** and the **Scale Switcher** are showed so that the user can change the scale bar by zooming in/out the map or by selecting a map scale through the scale switcher.

<img src="../img/footer/show_scale1.jpg" class="ms-docimage" />

In order to visualize the map coordinates corresponding to the mouse pointer in the selected *Coordinate Reference System* of the map, the user can click on the button <img src="../img/button/mouse-icon.jpg" class="ms-docbutton"/>

<img src="../img/footer/show_coordinates1.jpg" class="ms-docimage" />

## CRS Selector

 [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) also allows the user to change the map's *Coordinate Reference System*. To do so, simply click on the current CRS displayed in the footer.

A selector will appear, allowing you to choose from the available systems as shown below:

<video class="ms-docimage" controls><source src="../img/footer/CRS_selector.mp4" /></video>

It is also possible to *Zoom to the maximum extent* of the current projection by clicking the <img src="../img/button/zoom-extent.jpg" class="ms-docbutton"/> button.

To customize the list of projections available in the CRS tool dropdown menu, click the <img src="../img/button/settings2.jpg" class="ms-docbutton"/> button to open the *Available Projections* panel.

<img src="../img/footer/searchCRS.jpg" class="ms-docimage"/>

In this panel, the user can:

* Use the search bar to quickly locate a specific projection within the list of available systems

* Toggle the checkboxes to choose which projections will be visible in the CRS tool dropdown list

* Select the default projection for the map by clicking the <img src="../img/button/list-view.jpg" class="ms-docbutton"/> button; once selected, the icon will change to <img src="../img/button/star.jpg" class="ms-docbutton"/> to indicate the current default setting.

!!! warning
    The list of available CRSs depends on the [CRS Selector configuration](../developer-guide/local-config.md#crs-selector-configuration).

!!! Note
    If the map viewer mode is set to [3D Navigation](navigation-toolbar-md#3d-navigation) the user can view the **Camera Position** in the *Footer*. By clicking the <img src="../img/button/camera-button.jpg" class="ms-docbutton"/> button, the user can access the following options:

    <img src="../img/footer/camera-position.jpg" class="ms-docimage"/>

    * View the camera coordinates (`Lat`, `Lng`, and `Alt`), which update dynamically as the camera position changes in the viewer

    * Select the available CRS

    * Select the available Height options

    !!! warning
        The *Camera Position* tool is not enabled by default in MapStore. However, it can be configured within [application contexts](application-context.md#configure-plugins) if needed.

!!! Note
    [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) can be configured to connect to a GeoServer endpoint exposing thousands of standard CRS definitions. This enables users to search for the desired CRS and its definition dynamically by fetching ti from GeoServer instead of manually defining it and so without redeploying the application or editing configuration files.
    This capability is disabled by default and requires additional configuration of the CRS plugin. For details on how to enable it, refer to the documentation [here](https://dev-mapstore.geosolutionsgroup.com/mapstore/docs/api/plugins#plugins.CRSSelector).
