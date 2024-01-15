# Printing a Map

In [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) it is possible to print a map by selecting the **Print** <img src="../img/button/print2.jpg" class="ms-docbutton"  style="max-height:20px;"/> button from [Side Toolbar](mapstore-toolbars.md#side-toolbar). The print process is composed by two main steps:

* *Print Settings* definition

* Result checking in *Preview* before download the printed file

## Print settings

As soon as the *Print* <img src="../img/button/print2.jpg" class="ms-docbutton"  style="max-height:20px;"/> button is chosen, the following window opens:

<img src="../img/print/print-page.jpg" class="ms-docimage"/>

Through this window it is possible to:

* Enter a **Title** and a **Description**, that will be shown on the print page

* Change the **Format** (`PDF`, `PNG`, `JPEG`)

* Change the **Coordinates System** (`EPSG:3857`, `EPSG:4326`)

* Change the **Rotation** of the map (value in degrees)

* Change the **Resolution** of the print (`96 dpi`, `150 dpi`, `300 dpi`)

* Accessing **Layout** settings

* Accessing **Legend options**

!!!note
    In *Print settings* preview there's the map portion that will be displayed on the print sheet. In order to center the map the user can pan it until the preview displays the desired extension

    <video class="ms-docimage" style="max-width:500px;" controls><source src="../img/print/print.mp4" /></video>

### Layout

Opening the **Layout** settings menu, the following menu appears:

<img src="../img/print/first-layout-print.jpg" class="ms-docimage"/>

From here, in particular, it is possible to:

* Select the *Sheet size* (choosing between A3 and A4 format)

* Choose to *Include legend*

* Choose to place the *Legend on distinct page* from the map

* Select the page orientation between *Landscape* and *Portrait*

### Legend options

The Legend can be customized through the **Legend options** menu:

<img src="../img/print/first-legend-options.jpg" class="ms-docimage"/>

Through this menu the user is allowed to:

* Configure labels by choosing font type and size, and by adding *Bold* and *Italic* style

* Enable the *Force Labels* option, that force the display of labels even if only one rule is present (by default, if only one rule is present, the label is not displayed)

* Enable the *Font Anti Aliasing* (when Anti Aliasing is on, the borders of the labels font are smoothed improving the image quality)

* Enable the *Override icon size* option to have the ability to change the *Height* and *Width* of the icons (by default, the icon sizes are `24x24`)

* Set the *Dpi* resolution of the legend

## Preview

When the print settings are chosen, it is possible to access the preview by clicking on the <img src="../img/button/print_button.jpg" class="ms-docbutton"/> button. A window similar to the following appears:

<img src="../img/print/preview.jpg" class="ms-docimage"/>

Here it is possible to:

* Zoom in/out int the preview <img src="../img/button/zoom-in-out.jpg" class="ms-docbutton"/>

* Navigate between pages (when more than one page is present) <img src="../img/button/navigate-preview.jpg" class="ms-docbutton"/>

* Download the file in .pdf format <img src="../img/button/download-layout.jpg" class="ms-docbutton"/>

A simple printed map could be, for example, like the following:

<img src="../img/print/print.jpg" class="ms-docimage"/>
