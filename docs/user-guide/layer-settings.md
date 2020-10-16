# Layer Settings
****************

In this section, you will learn how to manage the layer settings in terms of general information, display mode, style and feature Info. <br>
Since a layer is added to the [TOC](toc.md) it is possible to access its settings with the dedicated button <img src="../img/button/properties.jpg" class="ms-docbutton"/> that appears selecting a layer:

<img src="../img/layer-settings/layer-settings.jpg" class="ms-docimage"  style="max-width:300px;"/>

The layer settings panel is composed of four sections:

<img src="../img/layer-settings/panel_sections.jpg" class="ms-docimage"  style="max-width:500px;"/>

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

* Set the *Title translations*, that will be switched by changing the language

* Take a look at the *Name* of the layer

* Edit the layer's *Description*

* Set the layer *Group*

* Configure the *Tooltip* that appears moving the cursor over the layer's item in TOC. In this case the user can decide that the *Title*, the *Description*, both or nothing will be displayed. Moreover you can set the *Placement* of the tooltip, choosing between *Top*, *Right* or *Bottom*:

<img src="../img/layer-settings/tooltip_options.jpg" class="ms-docimage"  style="max-width:400px;"/>

Setting a tooltip that shows the Title and the Description on the Right, for example, it can be similar to the following:

<img src="../img/layer-settings/custom_tooltip.jpg" class="ms-docimage"/>

## Display

Through the second section of the layer settings panel it is possible to change the display settings:

<img src="../img/layer-settings/display.jpg" class="ms-docimage"  style="max-width:450px;"/>

In particular, the user is allowed to:

* Set the rendering image format: choosing between `png`, `png8`, `jpeg`, `vnd.jpeg-png` and `gif` 

* Set the size of the layer tile: choosing between `256` or `512`

* Set the opacity value of the layer (in %)

* Enable/disable the transparency for that layer

* Enable/disable the use of the layer cached tiles  (if checked, the *Tiled=true* URL parameter will be added to the WMS request and to [use tiles cached with GeoWebCache](https://docs.geoserver.org/latest/en/user/geowebcache/using.html#direct-integration-with-geoserver-wms))

* Decide to display the image as a single tile or as multiple tiles

* Enable/disable the localized style. If enabled allows to include the MapStore's locale in each **GetMap**, **GetLegendGraphic** and **GetFeatureInfo** requests to the server, as explained in the [WMS Catalog Settings](catalog.md#wms/wmtscatalog)

* Set the layer *Legend* with custom *Width* and *Height* options. Both of these field values if greater than the default legend's size of 12, then the custom values gets applied on the legend width and height display property

* A preview of the legend is shown with the applied custom values from Legend fields above.

!!!Warning
    The *Format* and *Layer tile size* options are available only for the layer added by CSW and WMS services. 

## Style

The third section, dedicated to the layer style, displays like the following:

<img src="../img/layer-settings/ls-style.jpg" class="ms-docimage" style="max-width:450px"/>

In this case the user is allowed to:

* Search through the available layer styles and select the desired one

* Create a new style

* Edit an existing style

* Delete an existing style

!!!note
    By the default [service security rules](https://docs.geoserver.org/stable/en/user/security/service.html#service-security) the GeoServer's REST APIs are available only for the GeoServer administrators, so a basic authentication form will appears in MapStore to enter the *Admin* credentials. Without Admin rights, the editing capabilities on styles are not available and only the list of available styles will appear to allow the user to select one of them to the layer.

    Take a look at the [User Integration with GeoServer](../developer-guide/integrations/users/geoserver.md) section of [Developer Guide](../developer-guide/index.md) in order to understand how to configure the way MapStore and GeoServer share users, groups and roles. If the users integration between GeoServer and MapStore is configured, the editing functionalities of the styles will be available according to the role of the authenticated user in MapStore in a more transparent way.

### Create a new style 

It is possible to create a new style with a click on the <img src="../img/button/style_editor_new_style_button.jpg" class="ms-docbutton"/> button. At this stage the user can choose between different types of template from which the customization will start:

* *CSS - Cascading Style Sheet* (a language used for describing the presentation of a document written in a markup language like the HTML)

* *SLD - Styled Layer Descriptor* (an XML schema specified by the [Open Geospatial Consortium OGC](http://www.opengeospatial.org/) for describing the appearance of map layers)

<img src="../img/layer-settings/style_editor_add_style_template.jpg" class="ms-docimage" style="max-width:500px;">

!!!note
    The availability of the style formats depends, firstly, from the [GeoServer](http://geoserver.org/). [MapStore](https://mapstore.geo-solutions.it/mapstore/#/), by default, will add all the supported format that the server provides. To edit or create styles using the CSS format the [CSS extension](https://docs.geoserver.org/latest/en/user/styling/css/install.html) must be installed in GeoServer

Once the new style is chosen, with a click on the <img src="../img/button/style_editor_add_style_button.jpg" class="ms-docbutton"/> button the following window opens:

<img src="../img/layer-settings/style_editor_new_style_name.jpg" class="ms-docimage"  style="max-width:500px;">

Here the user can set the *Title* and the *Abstract* (optional), and through the **Save** button the new style will be automatically added to the styles list.

### Edit an existing style

Existing styles can be edited clicking on the <img src="../img/button/style_editor_edit_button.jpg" class="ms-docbutton"/> button. The page that opens allows the user to customize the style in the related format:

<img src="../img/layer-settings/style_editor_edit_new_style.gif" class="ms-docimage"  style="max-width:700px;">

The editor is easy to approach thanks also to the following functions:

* The *sintax control* highlights any possible error with a red underline (if error are detected an icon with a red exclamation point <img src="../img/button/style_editor_error_icon.jpg" class="ms-docbutton"/> will be shown in the top-right side of the editor)

<img src="../img/layer-settings/style_editor_syntax_error.jpg" class="ms-docimage">

* The *autocomplete* function suggests the possible style's properties in order to prevents syntax errors:

<img src="../img/layer-settings/style_editor_autocomplete.jpg" class="ms-docimage"  style="max-width:500px;">

* The *color picker*, that can be activated through the square filled icon (<img src="../img/button/style_editor_color_picker_icon.jpg" class="ms-docbutton" style="max-height:15px;"/>) near the color code, helps in choosing colors directly from the editor, showing an interface like the following:

<img src="../img/layer-settings/style_editor_color_picker.jpg" class="ms-docimage"  style="max-width:500px;">

!!!warning
    The *autocomplete* and the *color picker* functions are available only in the CSS editor.

### Visual Editor Style

[MapStore](https://mapstore.geo-solutions.it/mapstore/#/) also allows to edit the layers style using the *Visual editor*: clicking on the <img src="../img/button/visual_editor_style_button.jpg" class="ms-docbutton"/> button a page opens allows the user to customize the style through the symbolizers, which can be: *Mark*, *Icon*, *Line*, *Fill* and *Text*. 

<img src="../img/layer-settings/visual_editor_style.jpg" class="ms-docimage"  style="max-width:500px;">

Once a symbolizer has been added and customized, you can:

<img src="../img/layer-settings/style_options.jpg" class="ms-docimage"  style="max-width:500px;">

* **Filter** the symbolizer, as explained [here](filtering-layers.md#attribute-filter), by clicking the <img src="../img/button/filter_white_button.jpg" class="ms-docbutton"/> button.

* Add a **Scale denominator filter** (`max` and `min` scale) within which the level will be displayed on the map by clicking the <img src="../img/button/scale_denominator_button.jpg" class="ms-docbutton"/> button.

* **Remove** the symbolizer by clicking the <img src="../img/button/delete_white_button.jpg" class="ms-docbutton"/> button.

#### Mark

The mark type allows you to add a mark to the layer: clicking on the <img src="../img/button/add_mark_button.jpg" class="ms-docbutton"/> button a mark panel appears: 

<img src="../img/layer-settings/mark_panel.jpg" class="ms-docimage"  style="max-width:500px;">

The mark can have different `Shape`, `Color`, `Stroke` with different `Color` and `Width` and customizable `Radius` and `Rotation`. Take a look at the following example.

<img src="../img/layer-settings/mark_style_ex.jpg" class="ms-docimage">

#### Icon 

With the icon panel, which opens by clicking on <img src="../img/button/add_icon_button.jpg" class="ms-docbutton"/> button, the editor is allowed to add an image as an icon (via its *URL*) and customize the icon `Opacity`, `Size` and `Rotation` angle:

<img src="../img/layer-settings/icon_panel.jpg" class="ms-docimage"  style="max-width:500px;">

#### Line

The line types allows you to customize the lines of the layer: clicking on the <img src="../img/button/add_line_button.jpg" class="ms-docbutton"/> button a line panel appears: 

<img src="../img/layer-settings/line_panel.jpg" class="ms-docimage"  style="max-width:500px;">

The editor can change a `Stroke color`, a `Stroke width`, a `Line style` (*continuous*, *dashed*, etc), the `Line cap` (*Butt*, *Round*, *Square*) and the `Line join` (*Bevel*, *Round*, *Miter*). En example can be the following one:

<img src="../img/layer-settings/ex_line_style.gif" class="ms-docimage">

#### Fill

With the fill panel, which opens by clicking on <img src="../img/button/add_fill_button.jpg" class="ms-docbutton"/> button, the editor is allowed to customize the `Fill color`, the `Outline color` and the `Outline width`:

<img src="../img/layer-settings/ex_fill_style.gif" class="ms-docimage">

#### Text

The text types display a formatted text on a layer: clicking on the <img src="../img/button/add_text_button.jpg" class="ms-docbutton"/> button a text panel appears: 

<img src="../img/layer-settings/text_panel.jpg" class="ms-docimage"  style="max-width:500px;">

The editor is allowed to edit or choose the attribute of the `Label`, customized the `Font` (*DejaVu Sans*, *Serif*, etc , choose the font `Color`, `Size`, `Style` (*Normal* or *Italic*) and `Weight` (*Normal* or *Bold*) and select the desire `Halo color` and `Halo weight`. You can also choose the text `Rotation` and `Offset` (*x* and *y*). En example can be the following one:

<img src="../img/layer-settings/ex_text_style.gif" class="ms-docimage">

### Style Methods 

Different styles methods can be used for each symbolizer: by clicking on the <img src="../img/button/options_button.jpg" class="ms-docbutton"/> button, present on the panel of each symbolizer, the editor can choose between:

* *Simple style*

* *Classification style*

* *Pattern mark style*

* *Patter icon style*

#### Simple style

The Simple style is the default style described above for each symbolizer. 

#### Classification style

[MapStore](https://mapstore.geo-solutions.it/mapstore/#/) allows you to classify the style based on the attributes of the layer. The *Classification style* is available for *Marker*, *Line*, *Fill* and *Text* by clicking on the <img src="../img/button/options_button.jpg" class="ms-docbutton"/> button and choosing the <img src="../img/button/classification_style_button.jpg" class="ms-docbutton"/> options from the dropdown menu. 

<img src="../img/layer-settings/classification_styl_panel.jpg" class="ms-docimage"  style="max-width:500px;">

It this case the editor is allowed to choose a `Color ramp` and `Reverse order` of the color, the `Attribute` with which to classify the level, the `Method` (*Quantile*, *Equal interval*, *Natural breaks* and *Standard deviation*), the `Intervals` (px) and the `Opacity` (%). En example of the *Classification style* for a *Fill* can be the following one:

<img src="../img/layer-settings/classification_style_ex.jpg" class="ms-docimage">

#### Pattern mark style

With the *Pattern mark style* you can edit the *Line* or the *Fill* and add a mark by clicking on the <img src="../img/button/options_button.jpg" class="ms-docbutton"/> button and choosing the <img src="../img/button/pattern_mark_style_button.jpg" class="ms-docbutton"/> options from the dropdown menu. 

<img src="../img/layer-settings/classify_mark_panel.jpg" class="ms-docimage"  style="max-width:500px;">

The editor can modify the *Mark* as explained [here](layer-settings.md#mark) and the basic [line](layer-settings.md#line) or [fill](layer-settings.md#fill) options. Take a look at the following example of the *Pattern mark style* for the *Line*.

<img src="../img/layer-settings/classify_mark_ex.jpg" class="ms-docimage">

#### Patter icon style

With the *Pattern icon style* you can edit the *Line* or the *Fill* and add an icon by clicking on the <img src="../img/button/options_button.jpg" class="ms-docbutton"/> button and choosing the <img src="../img/button/pattern_icon_style_button.jpg" class="ms-docbutton"/> options from the dropdown menu. 

<img src="../img/layer-settings/classify_icon_style_panel.jpg" class="ms-docimage"  style="max-width:500px;">

The editor can modify the *Icon* as explained [here](layer-settings.md#icon) and the basic [line](layer-settings.md#line) or [fill](layer-settings.md#fill) options. Take a look at the following example of the *Pattern icon style* for the *Fill*.

<img src="../img/layer-settings/classify_icon_ex.jpg" class="ms-docimage">

## Feature Info Form

Through the last section of the layer settings panel, it is possible to decide the information format that appears querying a layer with the [Identify Tool](side-bar.md#identify-tool):

<img src="../img/layer-settings/feature-info-form.jpg" class="ms-docimage"  style="max-width:500px;"/>

In particular, the user can choose between:

* **Text**

* **HTML**

* **Properties**

* **Template**

!!!note
    Without selecting any format here, the [Identify Tool](side-bar.md#identify-tool) will return the layers information with the format chosen in Map Settings (a [Burger Menu](menu-bar.md#burger-menu) option). Once a user specifies the information format in layers settings, instead, that format will take precedence over the map settings only for that specific layer.

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

Here it is possible to insert the text to be displayed through the [Identify Tool](side-bar.md#identify-tool), with the possibility to wrap the desired properties. <br>
Let's make an example: we assume to have a layer where each record corresponds to a USA State geometry in the map. In the [Attribute Table](attributes-table.md) of this layer there's the `STATE_NAME` field that, for each record, contains a text value with the name of the State. <br>
If the goal is to show, performing the [Identify Tool](side-bar.md#identify-tool), only the State name, an option could be to insert the following text on the Template text editor:

<img src="../img/layer-settings/GFI_template_ex.jpg" class="ms-docimage"  style="max-width:400px;"/>

In this case, by clicking on the map, the [Identify Tool](side-bar.md#identify-tool) returns:

<img src="../img/layer-settings/GFI_template_ex1.jpg" class="ms-docimage"/>

Using the `${properties.NAME_OF_THE_FIELD}` syntax, MapStore is able to parse the response to the [Identify Tool](side-bar.md#identify-tool) request by matching the configured placeholder.
