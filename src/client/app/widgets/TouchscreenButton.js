/**
 * @module TouchscreenButton
 * @version 2.0
 * @description Renders a touchscreen button. The button label is static, and defined when the button is created.
 *              This module provide APIs for setting up user interactions captured by the button,
 *              as well as the visual appearance of the button.
 *              Note that the button can also be transparent and without label: this is useful for creating
 *              interactive areas over pictures of a user interface.
 * @author Paolo Masci
 * @date May 24, 2015
 *
 * @example <caption>Example use of the widget.</caption>
 // Example pvsio-web demo that uses TouchscreenButton
 // The following configuration assumes the pvsio-web demo is stored in a folder within pvsio-web/examples/demo/
 require.config({
     baseUrl: "../../client/app",
     paths: {
         d3: "../lib/d3",
         lib: "../lib"
     }
 });
 require(["widgets/TouchscreenButton"], function (TouchscreenButton) {
      "use strict";
      var device = {};
      device.touchscreenOk = new TouchscreenButton("touchscreenOk", {
        top: 200, left: 120, height: 24, width: 120
      }, {
        softLabel: "Ok",
        fontColor: "black",
        backgroundColor: "blue",
        fontsize: 16,
        callback: function (err, data) { console.log("Ok button clicked"); console.log(data); }
      });
     device.touchscreenOk.render(); // The touchscreen button is rendered. Clicking the button has the effect of sending a command "click_touchscreenOk(<current state>)" to the pvs back-end
 });
 *
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, dimColor */

define(function (require, exports, module) {
    "use strict";

    var d3 = require("d3/d3"),
        property = require("util/property"),
        StateParser = require("util/PVSioStateParser"),
        Widget = require("widgets/Widget"),
        Button = require("widgets/Button"),
        // mtouchEvents = require("widgets/mtouchEvents"),
        ButtonHalo2 = require("widgets/ButtonHalo2"),
        BasicDisplay = require("widgets/BasicDisplay");

    /**
     * @function <a name="TouchscreenButton">TouchscreenButton</a>
     * @description Constructor.
     * @param id {String} The ID of the touchscreen button.
     * @param coords {Object} The four coordinates (top, left, width, height) of the display, specifying
     *        the left, top corner, and the width and height of the (rectangular) display.
     *        Default is { top: 0, left: 0, width: 32, height: 20 }.
     * @param opt {Object} Options:
     *          <li>backgroundColor (String): background display color (default is black, "#000")</li>
     *          <li>blinking (bool): whether the button blinks (default is false, i.e., does not blink)</li>
     *          <li>borderWidth (Number): border width (default is 0, i.e., no border, unless option borderColor has been specified -- in this case, the border is 2px)</li>
     *          <li>borderStyle (String): border style, must be a valid HTML5 border style, e.g., "solid" (default is "none")</li>
     *          <li>borderColor (String): border color, must be a valid HTML5 color (default color used in the widget is "black")</li>
     *          <li>buttonReadback (String): playback text reproduced with synthesised voice wheneven an action is performed with the button.</li>
     *          <li>displayKey (String): name of the state attribute defining the display content. This information will be used by the render method. Default is the ID of the display.</li>
     *          <li>evts (Array[String]): events triggered by the widget. Can be either "click", or "press/release" (default is "click").
     *                                    The PVS function associated with the widget is given by the widget name prefixed with the event name.
     *                                    In the case of "press/release", the widget is associated to two PVS functions,
     *                                    one modelling the button being pressed, the other modelling the button being released.</li>
     *          <li>fontfamily (String): font type (default is "sans-serif")</li>
     *          <li>fontsize (Number): font size (default is 0.8 * height)</li>
     *          <li>fontfamily (String): font family, must be a valid HTML5 font name (default is "sans-serif")</li>
     *          <li>fontColor (String): font color, must be a valid HTML5 color (default is "white", i.e., "#fff")</li>
     *          <li>functionText (String): option for overriding the default binding with PVS functions.
     *                                     Note that this option requires the specification of the full name of the PVS function (e.g., click_ok).</li>
     *          <li>keyCode (Number): binds the widget to keyboard keyCodes. Use e.g., http://keycode.info/, to see keyCodes</li>
     *          <li>opacity (Number): opacity of the button. Valid range is [0..1], where 0 is transparent, 1 is opaque (default is opaque)</li>
     *          <li>parent (String): the HTML element where the display will be appended (default is "body")</li>
     *          <li>softLabel (String): the button label (default is blank).
     *          <li>visibleWhen (string): boolean expression indicating when the display is visible. The expression can use only simple comparison operators (=, !=) and boolean constants (true, false). Default is true (i.e., always visible).</li>
     * @memberof module:TouchscreenButton
     * @instance
     */
    function TouchscreenButton(id, coords, opt) {
        opt = opt || {};
        this.id = id;
        this.parent = (opt.parent) ? ("#" + opt.parent) : "body";
        this.top = coords.top || 0;
        this.left = coords.left || 0;
        this.width = coords.width || 32;
        this.height = coords.height || 10;
        this.fontsize = opt.fontsize || (this.height * 0.9);
        this.fontfamily = opt.fontfamily || "sans-serif";
        this.font = [this.fontsize, "px ", this.fontfamily];
        this.smallFont = [(this.fontsize * 0.7), "px ", this.fontfamily];
        this.backgroundColor = opt.backgroundColor || "black";
        this.fontColor = opt.fontColor || "#fff"; //white
        this.cursor = opt.cursor || "pointer";
        this.blinking = opt.blinking || false;
        this.textBaseline = "middle";
        this.btnClass = opt.btnClass || "primary";
        var elemClass = id + " noselect";
        if (this.blinking) { elemClass += " blink"; }
        opt.position = opt.position || "absolute";
        this.div = d3.select(this.parent)
                        .append("div").style("position", opt.position)
                        .style("top", this.top + "px").style("left", this.left + "px")
                        .style("width", this.width + "px").style("height", this.height + "px")
                        .style("margin", 0).style("padding", 0).style("border-width", 0)
                        .style("display", "none").attr("id", id).attr("class", elemClass)
                        .style("cursor", this.cursor);

        opt.functionText = opt.functionText || id;
        this.functionText = property.call(this, opt.functionText);
        opt.evts = opt.evts || [ "click" ];
        this.evts = property.call(this, opt.evts);
        opt.buttonReadback = opt.buttonReadback || "";
        this.buttonReadback = property.call(this, opt.buttonReadback);
        this.toggleButton = opt.toggleButton;
        this.pushButton = opt.pushButton;

        this.overlayButton = new Button(id + "_overlayButton", {
            left: 0, top: 0, height: 0, width: 0
        }, {
            functionText: opt.functionText,
            customFunctionText: opt.customFunctionText,
            callback: opt.callback,
            buttonReadback: opt.buttonReadback,
            evts: opt.evts,
            keyCode: opt.keyCode,
            area: this.div,
            parent: id
        });

        ButtonHalo2.getInstance().installKeypressHandler(this, {
            keyCode: opt.keyCode,
            coords: { left: this.left, top: this.top, height: this.height, width: this.width },
            evts: opt.evts,
            noHalo: opt.noHalo
        });

        opt.displayKey = opt.displayKey || id;
        this.displayKey = property.call(this, opt.displayKey);
        this.opacity = opt.opacity;
        this.overlayDisplay = new BasicDisplay(id + "_overlayDisplay", {
            height: this.height, width: this.width
        }, {
            displayKey: opt.displayKey,
            fontsize: this.fontsize,
            fontColor: this.fontColor,
            backgroundColor: this.backgroundColor,
            borderWidth: opt.borderWidth,
            borderStyle: opt.borderStyle,
            borderColor: opt.borderColor,
            cursor: this.cursor,
            position: "relative",
            borderRadius: opt.borderRadius,
            opacity: opt.opacity,
            blinking: opt.blinking,
            parent: id
        });
        var _this = this;
        _this.hover = false;
        function mousedown_handler () {
            if (_this.backgroundColor !== "transparent") {
                _this.overlayDisplay.setColors({
                    backgroundColor: "black",
                    fontColor: "white"
                });
            }
            if (_this.evts() && _this.evts()[0] === "press/release") {
                _this.overlayButton.pressAndHold();
                _this.is_pressed = true;
            }
            if (_this.toggleButton || _this.pushButton) {
                _this.isSelected = (_this.pushButton)? true : !_this.isSelected;
                if (_this.isSelected) {
                    _this.select();
                } else {
                    _this.deselect();
                }
            }
        }
        function mouseup_handler () {
            if (_this.backgroundColor !== "transparent") {
                _this.overlayDisplay.setColors({
                    backgroundColor: _this.backgroundColor,
                    fontColor: _this.fontColor,
                    opacity: _this.opacity
                });
            }
            if (_this.evts() && _this.evts()[0] === "press/release") {
                _this.overlayButton.release();
                _this.is_pressed = false;
            } else {
                _this.overlayButton.click();
            }
            if (_this.isSelected || (_this.hover && !_this.toggleButton)) {
                _this.select();
            } else {
                _this.deselect();
            }
        }
        d3.select("#" + id + "_overlayDisplay").on("mouseover", function () {
            if (!(_this.toggleButton || _this.pushButton)) {
                _this.select();
            }
            _this.hover = true;
        }).on("mouseout", function () {
            if (!_this.isSelected) {
                _this.deselect();
            }
            if (_this.is_pressed && _this.evts() && _this.evts()[0] === "press/release") {
                _this.overlayButton.release();
                _this.is_pressed = false;
            }
            _this.hover = false;
        })// -- the following events will eventually be replaced by taphold and release
        .on("mousedown", mousedown_handler)
        .on("mouseup", mouseup_handler);

        // this.mtouch = mtouchEvents()
        //     .on("taphold", function (d) {
        //         console.log("taphold");
        //         mousedown_handler();
        //     }).on("release", function (d) {
        //         console.log("release");
        //         mouseup_handler();
        //     });
        // d3.select("#" + id + "_overlayDisplay").call(this.mtouch);

        if (_this.evts() && _this.evts()[0] === "press/release") {
            this.is_pressed = false;
        }

        opt.visibleWhen = opt.visibleWhen || "true"; // default: always enabled/visible
        this.visibleWhen = property.call(this, opt.visibleWhen);
        opt.softLabel = opt.softLabel || "";
        this.softLabel = property.call(this, opt.softLabel);
        this.example = opt.example || "btn";
        Widget.call(this, id, "touchscreenbutton");
        return this;
    }
    TouchscreenButton.prototype = Object.create(Widget.prototype);
    TouchscreenButton.prototype.constructor = TouchscreenButton;
    TouchscreenButton.prototype.parentClass = Widget.prototype;

    /**
     * @function <a name="select">select</a>
     * @description Selects the widget -- useful to highlight the widget programmaticaly.
     * @param opt {Object} Options:
     *          <li>backgroundColor (String): background color when the button is selected. Overrides the default background color of the widget.</li>
     *          <li>borderColor (String): border color when the button is selected. Overrides the default border color of the widget.</li>
     *          <li>classed (String): CSS style to be assigned to the widget to customise its visual appearance.
     *                                The CSS stylesheet needs to be included in the html file of the pvsio-web prototype.</li>
     * @memberof module:TouchscreenButton
     * @instance
     */
    TouchscreenButton.prototype.select = function (opt) {
        opt = opt || {};
        var color = opt.backgroundColor || this.backgroundColor;
        if (color === "transparent" || this.opacity < 0.4 ) {
            this.overlayDisplay.setColors({ backgroundColor: dimColor("steelblue"), opacity: 0.4 });
        } else {
            this.overlayDisplay.setColors({ backgroundColor: dimColor(color) });
        }
        if (opt.borderColor) {
            this.div.style("border", "solid 2px " + opt.borderColor);
        }
        if (opt.classed) {
            this.div.classed(opt.classed, true);
        }
        return this;
    };

    /**
     * @function <a name="deselect">deselect</a>
     * @description Deselects the widget -- useful to highlight the widget programmaticaly.
     * @memberof module:TouchscreenButton
     * @instance
     */
    TouchscreenButton.prototype.deselect = function () {
        if (this.backgroundColor !== "transparent") {
            this.overlayDisplay.setColors({
                backgroundColor: this.backgroundColor,
                fontColor: this.fontColor,
                opacity: this.opacity
            });
        }
        this.div.style("border", "");
        return this;
    };

    /**
     * @function <a name="click">click</a>
     * @description Clicks the button -- useful to trigger button events programmaticaly.
     * @memberof module:TouchscreenButton
     * @instance
     */
    TouchscreenButton.prototype.click = function (opt) {
        this.overlayButton.click(opt);
        if ((this.toggleButton || this.pushButton) && this.isSelected) {
            this.select();
        } else {
            this.deselect();
        }
    };
    /**
     * @function <a name="release">release</a>
     * @description Releases the button -- useful to trigger button events programmaticaly.
     * @memberof module:TouchscreenButton
     * @instance
     */
    TouchscreenButton.prototype.release = function () {
        this.overlayButton.release();
        this.deselect();
    };
    /**
     * @function <a name="pressAndHold">pressAndHold</a>
     * @description Press and Holds down the button -- useful to trigger button events programmaticaly.
     * @memberof module:TouchscreenButton
     * @instance
     */
    TouchscreenButton.prototype.pressAndHold = function () {
        this.overlayButton.pressAndHold();
    };

    /**
     * @function <a name="toJSON">toJSON</a>
     * @description Returns a serialised version of the widget in JSON format.
     *              This is useful for saving/loading a specific instance of the widget.
     *              In the current implementation, the following attributes are included in the JSON object:
     *              <li> type (string): widget type, i.e., "touchscreenbutton" in this case
     *              <li> id (string): the unique identifier of the widget instance
     *              <li> softLabel (string): the label of the button
     *              <li> evts (array of strings): the type of events generated by the button (click, press/release)
     *              <li> fontsize (string): the font size of the button
     *              <li> fontColor (string): the font color of the button
     *              <li> backgroundColor (string): the background color of the button
     *              <li> boundFunctions (string): the name of the command that will be sent to the pvs back-end when the button is pressed.
     *              <li> visibleWhen (string): a booloan expression defining when the condition under which the widget is visible
     *              <li> auditoryFeedback (string): whether auditory feedback is enabled
     * @returns JSON object
     * @memberof module:TouchscreenButton
     * @instance
     */
    TouchscreenButton.prototype.toJSON = function () {
        return {
            type: this.type(),
            id: this.id(),
            evts: this.evts(),
            displayKey: this.displayKey(),
            functionText: this.functionText(),
            boundFunctions: this.overlayButton.boundFunctions(),
            buttonReadback: this.buttonReadback(),
            visibleWhen: this.visibleWhen(),
            softLabel: this.softLabel(),
            fontsize: this.fontsize,
            fontColor: this.fontColor,
            backgroundColor: this.backgroundColor
        };
    };
    /**
    * Updates the location and size of the widget according to the given position and size
     */
    TouchscreenButton.prototype.updateLocationAndSize = function (pos, opt) {
        opt = opt || {};
        if (opt.imageMap) {
            TouchscreenButton.prototype.parentClass.updateLocationAndSize.apply(this, arguments);
        }
        this.top = pos.y || 0;
        this.left = pos.x || 0;
        this.width = pos.width || 200;
        this.height = pos.height || 80;
        // this.fontsize = this.height * 0.9;
        // this.font = [this.fontsize, "px ", this.fontfamily];
        // this.smallFont = [(this.fontsize * 0.7), "px ", this.fontfamily];
        d3.select("div." + this.id()).style("left", this.left + "px").style("top", this.top + "px")
            .style("width", this.width + "px").style("height", this.height + "px").style("font-size", this.fontsize + "px");
        // only resize is needed (and not translation x y), because we have already moved the div element containing the display and button areas
        this.overlayDisplay.updateLocationAndSize({ width: pos.width, height: pos.height });
        this.overlayButton.updateLocationAndSize({ width: pos.width, height: pos.height });
        return this.render(this.example, opt);
    };
    TouchscreenButton.prototype.updateStyle = function (data) {
        data = data || {};
        this.fontsize = data.fontsize || this.fontsize;
        this.font = [this.fontsize, "px ", this.fontfamily];
        this.smallFont = [(this.fontsize * 0.7), "px ", this.fontfamily];
        this.fontColor = data.fontColor || this.fontColor;
        this.backgroundColor = data.backgroundColor || this.backgroundColor;
        return this;
    };
    TouchscreenButton.prototype.updateWithProperties = function (props) {
        TouchscreenButton.prototype.parentClass.updateWithProperties.apply(this, arguments);
        this.overlayButton.updateWithProperties(props);
        return this;
    };
    /**
     * @function <a name="remove">remove</a>
     * @description Removes the div elements of the widget from the html page -- useful to programmaticaly remove widgets from a page.
     * @memberof module:TouchscreenButton
     * @instance
     */
    TouchscreenButton.prototype.remove = function () {
        TouchscreenButton.prototype.parentClass.remove.apply(this);
        d3.select("div." + this.id()).remove();
    };

    /**
     * @function <a name="render">render</a>
     * @param data {Object} JSON object representing the touchscreen button to be rendered.
     * @param opt {Object} Override options for the display style, useful to dynamically change the display style during simulations. Available options include:
     *              <li> fontsize (string): the font size of the display
     *              <li> fontColor (string): the font color of the display
     *              <li> backgroundColor (string): the background color of the display
     *              <li> blinking (Bool): true means the text is blinking
     * @memberof module:TouchscreenButton
     * @instance
     */
    TouchscreenButton.prototype.render = function (state, opt) {
        // state is used to check whether the button is visible/enabled
        // the expression visibleWhen() is the condition we need to check on the state
        opt = opt || {};
        var isVisible = false;
        var visibleWhen = opt.visibleWhen || this.visibleWhen();
        var expr = StateParser.simpleExpressionParser(visibleWhen);
        if (expr && expr.res) {
            if (expr.res.type === "constexpr" && expr.res.constant === "true") {
                isVisible = true;
            } else if (expr.res.type === "boolexpr" && expr.res.binop) {
                var str = StateParser.resolve(state, expr.res.attr);
                if (str) {
                    str = StateParser.evaluate(str);
                    if ((expr.res.binop === "=" && str === expr.res.constant) ||
                         (expr.res.binop === "!=" && str !== expr.res.constant)) {
                             isVisible = true;
                    }
                }
            }
        }
        if (isVisible) {
            if (this.div.style("display") === "none" || !opt.blinking || (opt.blinking && !this.div.selectAll("div").classed("blink"))) {
                this.overlayDisplay.render(this.softLabel(), opt);
            }
            this.overlayButton.reveal(opt);
            return this.reveal();
        }
        return this.hide();
    };
    TouchscreenButton.prototype.renderSample = function (opt) {
        opt = opt || {};
        var txt = opt.txt || this.softLabel();
        return this.render(txt, { visibleWhen: "true" });
    };


    TouchscreenButton.prototype.renderGlyphicon = function (icon, opt) {
        opt = opt || {};
        var button = document.getElementById(this.id + "_button");
        this.txt = icon;
        button.setAttribute("class", "glyphicon " + icon + " btn btn-" + this.btnClass + " center");
        button.style.width = this.width;
        button.style.height = this.height;
        button.style.fontSize = 0.8 * this.height + "px";
        button.textContent = opt.txt || this.txt;
        d3.select("#" + this.id + "_button").style("display", "block");
        return this.reveal();
    };

    /**
     * @function <a name="hide">hide</a>
     * @description Hides the widget
     * @memberof module:TouchscreenButton
     * @instance
     */
    TouchscreenButton.prototype.hide = function (opt) {
        opt = opt || {};
        this.overlayButton.hide(); //FIXME: the mouse cursor is still a pointer when hovering the button area, because of map#prototypeMap
        this.div.style("display", "none");
        this.cursor = opt.pointer || "default";
        return this;
    };

    /**
     * @function <a name="reveal">reveal</a>
     * @description Makes the widget visible
     * @memberof module:TouchscreenButton
     * @instance
     */
    TouchscreenButton.prototype.reveal = function (opt) {
        opt = opt || {};
        this.div.style("display", "block");
        this.cursor = opt.pointer || "pointer";
        return this;
    };

    /**
     * @function <a name="move">move</a>
     * @description Changes the position of the widget according to the coordinates given as parameter.
     * @param data {Object} Coordinates indicating the new position of the widget. The coordinates are given in the form { top: (number), left: (number) }
     * @memberof module:TouchscreenButton
     * @instance
     */
    TouchscreenButton.prototype.move = function (data) {
        data = data || {};
        if (data.top) {
            this.top = data.top;
            this.div.style("top", this.top + "px");
        }
        if (data.left) {
            this.left = data.left;
            this.div.style("left", this.left + "px");
        }
        return this;
    };

    module.exports = TouchscreenButton;
});
