/* eslint-disable */
(window.webpackJsonp = window.webpackJsonp || []).push([
    ["extensions/myplugin"], {
        "./web/client/examples/lazyplugins/plugins/MyPlugin.jsx": function(e, n, o) {
            "use strict";
            o.r(n);
            var t = o("./node_modules/react/index.js"),
                i = o.n(t),
                s = o("./node_modules/react-redux/es/index.js");
            n.default = {
                name: "My",
                component: Object(s.connect)(function(e) {
                    return {
                        value: e.myplugin && e.myplugin.value
                    }
                }, {
                    onIncrease: function() {
                        return {
                            type: "MYPLUGIN:INCREASE_COUNTER"
                        }
                    }
                })(function(e) {
                    var n = e.value,
                        o = void 0 === n ? 0 : n,
                        t = e.onIncrease;
                    return i.a.createElement("div", {
                        style: {
                            position: "absolute",
                            zIndex: 1000,
                            top: "600px"
                        }
                    }, i.a.createElement("span", null, o), i.a.createElement("button", {
                        onClick: t
                    }, "MyAdd"))
                }),
                reducers: {
                    myplugin: function(e, n) {
                        var o = 0 < arguments.length && void 0 !== e ? e : {
                            value: 1
                        };
                        return "MYPLUGIN:INCREASE_COUNTER" === (1 < arguments.length ? n : void 0).type ? {
                            value: o.value + 1
                        } : o
                    }
                }
            }
        }
    }
]);
/* eslint-enable */
