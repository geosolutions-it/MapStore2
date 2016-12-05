# Migration Hints
We are migrating MapStore 2 to use the newest 0.14.x version of ReactJS.

There are some differences in the new release that require some boring steps to make things working. [Here](https://facebook.github.io/react/blog/2015/10/07/react-v0.14.html) you can find the full release notes document from Facebook.

Here are some quick tips:
 * Wherever you use React.render(...), React.findDOMNode(...) or React.umountComponentAtNode(...) you should:
  * import the new react-dom library
  * use ReactDOM.render(...), ReactDOM.findDOMNode(...) or ReactDOM.umountComponentAtNode(...)

```javascript
const ReactDOM = require('react-dom');
...
ReactDOM.render(..., ...);
```

 * you should not do these things anymore (they are deprecated):
  * component.getDOMNode(...) (use React.findDOMNode(component) instead)
  * component.setProps(...), component.replaceProps(...) (you should re-render the component with the new props instead)
  * require('react/addons') (require the new react-addon-<module> for each of the needed addons instead)
  * component.cloneWithProps(...) (use React.cloneElement instead)
 * Context enabled containers (Provider, Localized, etc.) have a simpler syntax:

```html
// old syntax
<Provider store={store}>
  {() => <App/>}
</Provider>

// new syntax
<Provider store={store}>
  <App/>
</Provider>
```
 * new Debug component usage: the Debug component is not a wrapper anymore:

```html
// old syntax
<Debug store={store}>
  <Provider store={store}>
    <App/>
  </Provider>
</Debug>

// new syntax
<Provider store={store}>
  <App/>
  <Debug/>
</Provider>
```