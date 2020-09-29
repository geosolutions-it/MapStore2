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

* Set the rendering image format (choosing between `png`, `png8`, `jpeg`, `vnd.jpeg-png` and `gif`)

* Set the opacity value of the layer (in %)

* Enable/disable the transparency for that layer

* Enable/disable the use of the layer cached tiles  (if checked, the *Tiled=true* URL parameter will be added to the WMS request and to [use tiles cached with GeoWebCache](https://docs.geoserver.org/latest/en/user/geowebcache/using.html#direct-integration-with-geoserver-wms))

* Decide to display the image as a single tile or as multiple tiles

* Enable/disable the localized style. If enabled allows to include the MapStore's locale in each **GetMap**, **GetLegendGraphic** and **GetFeatureInfo** requests to the server, as explained in the [WMS Catalog Settings](catalog.md#wms/wmtscatalog)

* Set the layer *Legend* with custom *Width* and *Height* options. Both of these field values if greater than the default legend's size of 12, then the custom values gets applied on the legend width and height display property

* A preview of the legend is shown with the applied custom values from Legend fields above.

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

[MapStore](https://mapstore.geo-solutions.it/mapstore/#/) also allows to edit the layers style using the **Visual edior**.
It is accessible by clicking on the <img src="../img/button/visual_editor_style_button.jpg" class="ms-docbutton"/> button. The page that opens allows the user to customize the style through the symbolizers, witch can be: **Mark**, **Icon**, **Line**, **Fill** and **Text**. 

<img src="../img/layer-settings/visual_editor_style.jpg" class="ms-docimage"  style="max-width:500px;">

Different styles methods can be used for each symbolizers: by clicking on the <img src="../img/button/options_button.jpg" class="ms-docbutton"/> button, present on the panel of each symbolizers, the editor can choose between:

* **Simple style**

* **Classification style**

* **Pattern mark style**

* **Patter icon style**

### Simple style

The Simple style is the default one usable for each simbolizers. 

#### Mark

Mark type allows to choose the icons of the layer: clicking on the <img src="../img/button/add_mark_button.jpg" class="ms-docbutton"/> button a mark panel appears. During the style editing a preview placed on top of the styler form shows a preview of the edited style:

<img src="../img/layer-settings/mark_panel.jpg" class="ms-docimage"  style="max-width:500px;">

The mark can have different `Shape`, `Color`, `Stroke` with different `Color` and `Width` and custimizable `Radius` and `Rotation`. 

### Icon 

With Icon panel, opening by clicking on <img src="../img/button/add_icon_button.jpg" class="ms-docbutton"/> button, the editor is allowed to add an image as an icon, through its *URL*, and customized the icon `Opacity`, `Size` and `Rotation` angle:

<img src="../img/layer-settings/icon_panel.jpg" class="ms-docimage"  style="max-width:500px;">

### Line

Line types allows to customize the lines of the layer: clicking on the <img src="../img/button/add_line_button.jpg" class="ms-docbutton"/> button a line panel appears: 

<img src="../img/layer-settings/line_panel.jpg" class="ms-docimage"  style="max-width:500px;">

The editor can change a `Stroke color`, a `Stroke width`, a `Line style` (*continuous*, *dashed*, etc), the `Line cap` (*Butt*, *Round*, *Square*) and the `Line join` (*Bevel*, *Round*, *Miter*). En example can be the following one:

<img src="../img/layer-settings/ex_line_style.gif" class="ms-docimage">

### Fill

With Icon panel, opening by clicking on <img src="../img/button/add_fill_button.jpg" class="ms-docbutton"/> button, the editor is allowed to customize the `Fill color`, the `Outline color` and the `Outline width`:

<img src="../img/layer-settings/ex_fill_style.gif" class="ms-docimage">

### Text

The text types display a formatted text on a layer: clicking on the <img src="../img/button/add_text_button.jpg" class="ms-docbutton"/> button a text panel appears: 

<img src="../img/layer-settings/text_panel.jpg" class="ms-docimage"  style="max-width:500px;">

The editor is allowed to edit or choose the attribute of the `Label`, customized the `Font` (*DejaVu Sans*, *Serif*, etc , choose the font `Color`, `Size`, `Style` (*Normal* or *Italic*) and `Weight` (*Normal* or *Bold*) and select the desire `Halo color` and `Halo weight`. You can also choose the text `Rotation` and `Offset` (*x* and *y*). En example can be the following one:

<img src="../img/layer-settings/ex_text_style.gif" class="ms-docimage">

Different styles methods can be used for each symbolizers: by clicking on the <img src="../img/button/options_button.jpg" class="ms-docbutton"/> button, present on the panel of each symbolizers, the editor can choose between:

* **Simple style**

* **Classification style**

* **Pattern mark style**

* **Patter icon style**

## Classification style

[MapStore](https://mapstore.geo-solutions.it/mapstore/#/) allows you to classify the mark style by clicking on the <img src="../img/button/options_button.jpg" class="ms-docbutton"/> button. Choosing the <img src="../img/button/classification_style_button.jpg" class="ms-docbutton"/> options from the dropdown menu a classification panel opens: 

<img src="../img/layer-settings/classify_mark_panel.jpg" class="ms-docimage"  style="max-width:500px;">

It this case the editor is allowed to choose a `Color ramp` and `Reverse order` of the color, the `Attribute` with which to classify the level, the `Method` (*Quantile*, *Equal interval* and *Natural breaks*), the `Intervals` (px) and the `Opacity` (%).

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
