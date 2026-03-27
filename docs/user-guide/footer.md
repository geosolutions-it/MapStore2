# Footer

********

In [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) some of the map information are reported in the *Footer*. By default, as soon as the user opens the map, the scale bar and the scale switcher are showed so that the user can change the scale bar by zooming in/out the map or by selecting a map scale through the scale switcher.

<img src="../img/footer/show_scale1.jpg" class="ms-docimage" />

In order to visualize the map coordinates corresponding to the mouse pointer in the selected *Coordinate Reference System* of the map, the user can click on the button <img src="../img/button/mouse-icon.jpg" class="ms-docbutton"/>

<img src="../img/footer/show_coordinates1.jpg" class="ms-docimage" />

## CRS Selector

 [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) allows also to change the *Coordinate Reference System* of the map by clicking on the **Select Projection** button <img src="../img/button/crs_selector_icon.jpg" class="ms-docbutton"/>. A CRS selector opens to select one of the available CRSs, as follows:

<video class="ms-docimage" controls><source src="../img/footer/CRS_selector.mp4" /></video>

!!! Note
    The list of available CRSs depends on the [CRS Selector configuration](https://mapstore.readthedocs.io/en/latest/developer-guide/local-config/#crs-selector-configuration).

In order to search a desired CRS, the user can also filter the CRS list by typing in a search input field.

<img src="../img/footer/searchCRS.jpg" class="ms-docimage" style="max-width:200px;"/>

!!! Note
    If the map viewer is set to [3D Navigation](navigation-toolbar-md#3d-navigation) the user can view the **Camera Position** in the *Footer*. By clicking the <img src="../img/button/camera-button.jpg" class="ms-docbutton"/> button, the user can access the following options:

    <img src="../img/footer/camera-position.jpg" class="ms-docimage"/>

    * View the camera coordinates (`Lat`, `Lng`, and `Alt`), which update dynamically as the camera position changes in the viewer

    * Select the available CRS

    * Select the available Height options

    !!! warning
        The *Camera Position* tool is not enabled by default in MapStore. However, it can be configured within [application contexts](application-context.md#configure-plugins) using the desired provider.
