# Street View

*******************

The **Street View** tool allows the user to browse 360 imagery in [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) from different supported providers such as [Google Street View](https://www.google.com/streetview/) or  [Cyclomedia Street Smart](https://www.cyclomedia.com/en/street-smart).

!!! note
    The **Street View** plugin is not active by default in MapStore due to licensing reasons. It is anyway ready to be configured for [application contexts](application-context.md#configure-plugins) using the desired provider.

## Google Street View

 Through the <img src="../img/button/street-view-button.jpg" class="ms-docbutton"/> button available in the [Side Toolbar](mapstore-toolbars.md#side-toolbar), the tool can be activated so that it is possible to navigate the map with [Google Street View](https://www.google.com/streetview/).

<img src="../img/street-view/streetview-popup.jpg" class="ms-docimage" width="500px"/>

When the tool is activated, a window opens and the streets highlighted on the map so that the user can select one of them with a simple click of the mouse.

<video class="ms-docimage" controls><source src="../img/street-view/add-street.mp4"/></video>

By clicking on a street in the map, the tool window displays the Street View and the user can navigate it.

* **Zoom in/out** on the street

<video class="ms-docimage" controls><source src="../img/street-view/zoom-street.mp4"/></video>

* Use the **Pan Interaction** to navigate all-around the street

<video class="ms-docimage" controls><source src="../img/street-view/pan-street.mp4"/></video>

* Enable/disable the **Full Screen** <img src="../img/button/full-screen-street.jpg">

## Cyclomedia Street Smart

If the [Cyclomedia Street Smart](https://www.cyclomedia.com/en/street-smart) has been configured as a provider for the MS Street View tool, the user experience is the same: the tool can be activated through the same button <img src="../img/button/street-view-button.jpg" class="ms-docbutton"/> in [Side Toolbar](mapstore-toolbars.md#side-toolbar).

<img src="../img/street-view/cyclomedia-popup.jpg" class="ms-docimage" width="500px"/>

!!! note
    The **[Cyclomedia Street Smart](https://www.cyclomedia.com/en/street-smart)** provider can be configured on the *Street View* plugin as documented [here](https://mapstore.geosolutionsgroup.com/mapstore/docs/api/plugins#plugins.StreetView)

When the tool is activated, the user must enter *Username* and *Password* and click <img src="../img/button/submit-button.jpg" class="ms-docbutton"/>.

<img src="../img/street-view/credentials_api.jpg" class="ms-docimage" width="500px"/>

!!! warning
    The credentials are necessary to visualize the street layer while the usual authkey is needed in plugin config to interact with the street smart APIs (see plugin config page [here](https://mapstore.geosolutionsgroup.com/mapstore/docs/api/plugins#plugins.StreetView))

After that a window opens and the street layer is visualized in form of dots to highlight streets on the map so that the user can select one of them with a simple click of the mouse.

<video class="ms-docimage" controls><source src="../img/street-view/add-point.mp4"/></video>

By clicking on a highlighted point on the map, the tool window displays the Street View and the user can navigate it as usual or interact with the *Navigation Toolbar*.

<img src="../img/street-view/cyclomedia_navigation_bar.jpg" class="ms-docimage" width="500px"/>

Through the navigation toolbar it is possible to:

* Open the **Overlays** pop-up, through the <img src="../img/button/overlays-button.jpg" class="ms-docbutton"/> button, to:<br>
  **-** View and enable/disable the layers present in the view from the **Layers** tab<br>
  **-** Enable/disable the *Show Mouse position* and the *Show Compass* from the **Viewer** tab

* Open the **Display** pop-up, through the <img src="../img/button/display-button.jpg" class="ms-docbutton"/> button, to:<br>
    **-** Set the *Brightness* of the view<br>
    **-** Set the *Contrast* of the view

* See the **Object Information** through the <img src="../img/button/object-nformation-button.jpg" class="ms-docbutton"/> button.

* Open the **Cross Section** pop-up, through the <img src="../img/button/cross-section-button.jpg" class="ms-docbutton"/> button.

* See the **Elevation** through the <img src="../img/button/elevation-button.jpg" class="ms-docbutton"/> button.

* Open the **Report issue** pop-up, through the <img src="../img/button/report-issue-button.jpg" class="ms-docbutton"/> button.

* Open the **Point Cloud** pop-up, through the <img src="../img/button/point-cloud-button.jpg" class="ms-docbutton"/> button.

* Open the **Oblique viewer** pop-up, through the <img src="../img/button/oblique-viewer-button.jpg" class="ms-docbutton"/> button.

* Open the **Measurements** pop-up, through the <img src="../img/button/cyclomedia-measurements-button.jpg" class="ms-docbutton"/> button.

* **Download** the cyclorama image in `png` format through the <img src="../img/button/cyclomedia-download-button.jpg" class="ms-docbutton"/> button.

* Open the **Image Info** pop-up, through the <img src="../img/button/image-info-button.jpg" class="ms-docbutton"/> button to access image metadata such as: general image information as well as geospatial references of the image itself.
