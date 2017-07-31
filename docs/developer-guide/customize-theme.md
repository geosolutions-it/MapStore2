# How to Customize the Theme

The look and feel is completely customizable either using one of the included themes, or building your own. Themes are built using [less](http://lesscss.org/).  
You can find the default theme here: https://github.com/geosolutions-it/MapStore2/tree/master/web/client/themes/default

In the [themes folder](https://github.com/geosolutions-it/MapStore2/tree/master/web/client/themes) you can also find other ones that you can study.

To add a new theme:
1. create a new folder in the themes folder with the name of your theme
1. create less files in the folder (at least `theme.less`, the main file, and `variables.less`, to customize standard variables)
1. add the new theme to the [index file](https://github.com/geosolutions-it/MapStore2/blob/master/web/client/themes/index.js), with the id corresponding to the theme folder name

You can then switch your application to use the theme adding a new section in the `appConfig.js` file:

```
initialState: {
    defaultState: {
        ...
        theme: {
            selectedTheme: {
                id: <your theme id>
            }
        },
        ...
     }
}
```
