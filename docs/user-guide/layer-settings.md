# Layer Settings
****************

In this section, you will learn how to manage the layer settings in terms of general information, display mode, style and feature Info. Once a layer is added to the [TOC](toc.md) it is possible to access its settings with the dedicated button <img src="../img/button/properties.jpg" class="ms-docbutton"/> that appears selecting a layer:

<img src="../img/layer-settings/layer-settings.jpg" class="ms-docimage"  style="max-width:300px;"/>

The layer settings panel is composed of four sections:

* General information

* Display

* Style

* Feature Info

!!!warning
    For WMTS layers the Style and the Feature Info sections are not implemented. Moreover the Display section is limited to the Transparency level parameter.

## General information

By default, as soon as the user opens the layer settings panel the General information section appears:

<img src="../img/layer-settings/layer_general_settings.jpg" class="ms-docimage"  style="max-width:500px;"/>

In this page it is possible to:

* Change the *Title*

* Set the *Title translations*, that will be switched changing the language

* Take a look at the *Name* of the layer

* Write a *Description*

* Set the layer *Group*

* Configure the *Tooltip* that appears moving the cursor over the layer. In this cas you can decide that the *Title*, the *Description*, both or nothing will be displayed. Moreover you can set the *Placement* of the tooltip, choosing between *Top*, *Right* or *Bottom*:

<img src="../img/layer-settings/tooltip_options.jpg" class="ms-docimage"  style="max-width:400px;"/>

Setting a tooltip that shows the Title and the Description on the Right, for example, the result can be similar to the following:

<img src="../img/layer-settings/custom_tooltip.jpg" class="ms-docimage"/>

## Display

The second section of the layer settings panel displays like the following:

<img src="../img/layer-settings/display.jpg" class="ms-docimage"  style="max-width:450px;"/>

In here the user is allowed to:

* Set the rendering image format between `png`, `png8`, `jpeg`, `vnd.jpeg-png` and `gif`

* Set the opacity (transparency) value of the layer

* Enable/disable the transparency for that layer

* Enable/disable the use of the cache rendering the image (if checked the *Tiled=true* URL parameter will be added to the WMS request)

* Decide to display the image as a single tile or as a multiple tile

## Style

The third section, dedicated to the layer style, displays like the following:

<img src="../img/layer-settings/ls-style.jpg" class="ms-docimage" style="max-width:450px"/>

In this case the user is allowed to:

* Take a look and search through the available layer styles and select the desired one

* Create a new style

* Edit an existing style

* Delete an existing style

!!!note
    The Style Editor tool, that allow the user to create a new style or edit/remove an existing one, provides functionalities on top of [GeoServer](http://geoserver.org/) REST APIs. This relationship implies that this tool:

    * Is available only for those layers that are loaded in [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) from [GeoServer](http://geoserver.org/)

    * Can be used only by Admin users because, by default, the GeoServer's REST APIs are available only for the GeoServer administrators. Take a look at the [User Integration with GeoServer](../../developer-guide/integrations/users/geoserver/) section of [Developer Guide](../../developer-guide) in order to understand how to configure the way MapStore and GeoServer share users, groups and roles

### Create a new style 

It is possible to create a new style with a click on the <img src="../img/button/style_editor_new_style_button.jpg" class="ms-docbutton"/> button. At this stage the user can choose between different types of template from which the customization will start:

* *CSS - Cascading Style Sheet* (a language used for describing the presentation of a document written in a markup language like the HTML)

* *SLD - Styled Layer Descriptor* (an XML schema specified by the [Open Geospatial Consortium (OGC)](http://www.opengeospatial.org/) for describing the appearance of map layers)

<img src="../img/layer-settings/style_editor_add_style_template.jpg" class="ms-docimage" style="max-width:500px;">

!!!note
    The availability of the style formats depends, firstly, from the [GeoServer](http://geoserver.org/). [MapStore](https://mapstore.geo-solutions.it/mapstore/#/), by default, will add all the supported format that the server provides.

Once the new style is chosen, with a click on the <img src="../img/button/style_editor_add_style_button.jpg" class="ms-docbutton"/> button the following window opens:

<img src="../img/layer-settings/style_editor_new_style_name.jpg" class="ms-docimage"  style="max-width:500px;">

In here the user can set the *Title* and the *Abstract* (optional), and through the **Save** button the new style will be added to the styles list.

### Edit an existing style

Existing styles can be edited clicking on the <img src="../img/button/style_editor_edit_button.jpg" class="ms-docbutton"/> button. The page that opens allows the user to customize the style through an xml text:

<img src="../img/layer-settings/style_editor_edit_new_style.gif" class="ms-docimage"  style="max-width:700px;">

The editor is easy to approach thanks also to the following functions:

* The *sintax control* highlights any possible error with a red underline (if error are detected an icon with a red exclamation point <img src="../img/button/style_editor_error_icon.jpg" class="ms-docbutton"/> will be shown in the top-right side of the editor)

<img src="../img/layer-settings/style_editor_syntax_error.jpg" class="ms-docimage">

* The *autocomplete* function suggests the possible style's properties and prevents syntax errors:

<img src="../img/layer-settings/style_editor_autocomplete.jpg" class="ms-docimage"  style="max-width:500px;">

* The *color picker*, that can be activated through the square filled icon (<img src="../img/button/style_editor_color_picker_icon.jpg" class="ms-docbutton" style="max-height:15px;"/>) near the color code, helps in choosing colors directly from the editor, showing an interface like the following:
<img src="../img/layer-settings/style_editor_color_picker.jpg" class="ms-docimage"  style="max-width:500px;">

## Feature Info Form

On the last section of the layer settings panel, it is possible to decide the format of the information that appears querying a layer with the [Identify Tool](side-bar.md#identify-tool):

<img src="../img/layer-settings/feature-info-form.jpg" class="ms-docimage"  style="max-width:500px;"/>

In particular, the user can choose between:

* **Text**

* **HTML**

* **Properties**

* **Template**

!!!note
    Without selecting any format here, the Identify tool will return the layers information with the format chosen in Map Settings (a [Burger Menu](menu-bar.md#burger-menu) option). If a user specifies the information format in layers settings, instead, that format will take precedence over the map settings for that specific layer.

### Text

An example of layer information in text format can be:

<img src="../img/layer-settings/GFI_text.jpg" class="ms-docimage"  style="max-width:600px;"/>

### HTML

An example of layer information in HTML format can be:

<img src="../img/layer-settings/GFI_html.jpg" class="ms-docimage"/>

### Properties

An example of layer information in properties format can be:

<img src="../img/layer-settings/GFI_properties.jpg" class="ms-docimage"  style="max-width:600px;"/>

### Templates

In this case the user can customize the information format:

<img src="../img/layer-settings/GFI_template.jpg" class="ms-docimage"  style="max-width:500px;"/>

In particular, by clicking on the <img src="../img/button/edit_button.jpg" class="ms-docbutton"/> button, the following text editor appears:

<img src="../img/layer-settings/edit_custom_format.jpg" class="ms-docimage"  style="max-width:600px;"/>

In here the user can insert the text to be displayed getting feature Info, with the possibility to wrap the desired properties. For example, if the goal is to inform about the States name, an option could be to insert the following text:

<img src="../img/layer-settings/GFI_template_ex.jpg" class="ms-docimage"  style="max-width:400px;"/>

In this case, by clicking on the map, the feature information returns:

<img src="../img/layer-settings/GFI_template_ex1.jpg" class="ms-docimage"/>
