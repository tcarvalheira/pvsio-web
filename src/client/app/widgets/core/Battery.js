/**
 * @module Battery
 * @version 1.0
 * @description Renders a battery widget based on Fontawesome icons
 *              This module provide APIs for setting up the visual appearance of the widget, e.g., font size and color.
 * @author Tiago Carvalheira
 * @date 2018/06/08
 *
 * @example <caption>Example use of the widget.</caption>
 // Example pvsio-web demo that uses Battery
 // The following configuration assumes the pvsio-web demo is stored in a folder within pvsio-web/examples/demo/
 require.config({
     baseUrl: "../../client/app",
     paths: { d3: "../lib/d3", text: "../lib/text" }
 });
 require(["widgets/core/Battery"], function (Battery) {
      "use strict";
      var disp = new Battery('battery_indicator',
                {
                    left:400,
                    top:40,
                    width: 50,
                    height: 30
                },
                {
                    fontColor: "green",
                    backgroundColor: "transparent",
                    fontsize: 11,
                    parent: "battery"
                }
            )
      disp.render();
 });
 *
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require, exports, module) {
    "use strict";
    var WidgetEVO = require("widgets/core/WidgetEVO");
    var BasicDisplayEVO = require("widgets/core/BasicDisplayEVO")
    /**
     * @function <a name="Battery">Battery</a>
     * @description Constructor.
     * @param id {String} The ID of the touchscreen button.
     * @param coords {Object} The four coordinates (top, left, width, height) of the display, specifying
     *        the left, top corner, and the width and height of the (rectangular) widget area.
     *        Default is { top: 0, left: 0, width: 32, height: 20 }.
     * @param {Object} opt - Optional values
     * @param {string} [opt.backgroundColor='white'] set the widget background 
     * @param {String} [opt.fontColor='black'] set the icon and text color
     * @param {Boolean} [opt.show_icon=true] whether if there should be a visible icon or not
     * @param {Boolean} [opt.show_text=true] whether if there should be a visible text or not
     * @param {Boolean} [opt.show_percentage=true] whether if there should be a visible percentage symbol in text or not
     * @param {Number} [opt.blinkingValue=10] if battery level is below this value, icon will blink
     * @param {Number} [opt.battery_level=100] Level of battery em percentage. This value should be between 0 and 100
     * @param {String} [opt.displayKey] set PVS key with battery level.
     * @param {Object} [opt.battery_limits] - lower limits to reveal battery states
     * @param {Integer} [opt.battery_limits.quarter=10] - shows battery with a quarter of charge 
     * @param {Integer} [opt.battery_limits.half=40] - shows battery with half charge
     * @param {Integer} [opt.battery_limits.three_quarters=70] - shows batter with 3/4 charge
     * @param {Integer} [opt.battery_limits.full=90] - shows battery full
     * @memberof module:Battery
     * @instance
     */
    function Battery(id, coords, opt) {
        coords = coords || {};
        this.coords = coords
        opt = this.normaliseOptions(opt);
        // set widget type & display key
        this.type = this.type || "Battery";
        this.displayKey = (typeof opt.displayKey === "string") ? opt.displayKey : id
        this.valueKey = (opt.valueKey !== undefined && typeof opt.valueKey === "string") ? opt.valueKey : this.displayKey

        // override default style options of WidgetEVO as necessary before creating the DOM element with the constructor of module WidgetEVO
        opt.backgroundColor = opt.backgroundColor || "black";
        opt.cursor = opt.cursor || "default";
        opt.overflow = "hidden";
        this.id = id
        this.opt = opt
        this.opt.fontColor = opt.fontColor || 'black'

        /*** optional parameters on opt*/
        this.battery_level = (parseInt(opt.battery_level) !== NaN && opt.battery_level !== undefined) ? opt.battery_level : 100
        this.show_icon = opt.show_icon !== undefined ? opt.show_icon : true
        this.show_text = opt.show_text !== undefined ? opt.show_text : true
        this.show_percentage = opt.show_percentage !== undefined ? opt.show_percentage : true
        this.blinkingValue = opt.blinkingValue || 10
        this.iconFontSize = opt.iconFontSize || 20
        this.textFontSize = opt.textFontSize || 10

        /* define limits */
        this.battery_limits = {
            'quarter' : (opt.battery_limits !== undefined && parseInt(opt.battery_limits.quarter) !== NaN && opt.battery_limits.quarter !== undefined) ? opt.battery_limits.quarter : 10,
            'half': (opt.battery_limits !== undefined && parseInt(opt.battery_limits.half) !== NaN && opt.battery_limits.half != undefined) ? opt.battery_limits.half : 40,
            'three_quarters': (opt.battery_limits !== undefined && parseInt(opt.battery_limits.three_quarters) !== NaN && opt.battery_limits.three_quarters != undefined) ? opt.battery_limits.three_quarters : 70,
            'full' : (opt.battery_limits !== undefined && parseInt(opt.battery_limits.full) !== NaN && opt.battery_limits.full != undefined) ? opt.battery_limits.full : 90
        }


        /* define icon states. With an object i can be switched to another library  */
        this.icon_states = {
            'level5': 'fa-battery-full',
            'level4': 'fa-battery-three-quarters',
            'level3': 'fa-battery-half',
            'level2': 'fa-battery-quarter',
            'level1': 'fa-battery-empty'
        }
        this.parent = (opt.parent) ? (`#${opt.parent}`) : 'body'
        
        // invoke WidgetEVO constructor to create the widget
        WidgetEVO.apply(this, [id, coords, opt]);

        if (this.show_icon) {
            this.createIcon()
            this.icon
                .attr('class', `battery-icon fa fa-2x`) // ${this.getIconClass()}`)
                .style('display', 'block')
                .style('color', `${opt.fontColor}`)
        }
        
        if (this.show_text) {
            this.createText(opt)
        }
        
        return this;
    }
    Battery.prototype = Object.create(WidgetEVO.prototype);
    Battery.prototype.parentClass = WidgetEVO.prototype;
    Battery.prototype.constructor = Battery;

    /**
    * @protected
    * @function <a name="getIconClass">getIconClass</a>
    * @description This method will return the fontawesome icon to use on battery, based on its level.
    * @return return a string to put on icon class. One of the following values: fa-battery-full || fa-battery-three-quarters || fa-batteryhalf || fa-battery-quarter || fa-battery-empty
    * @memberof module:Battery
    * @instance
    */
    Battery.prototype.getIconClass = function () {
        let icon = this.icon_states.level5 // 'fa-battery-full'
        if (this.battery_level > this.battery_limits.full) {
            icon = this.icon_states.level5 //'fa-battery-full'
        } else if (this.battery_level > this.battery_limits.three_quarters && this.battery_level <= this.battery_limits.full) {
            icon = this.icon_states.level4 //'fa-battery-three-quarters'
        } else if (this.battery_level > this.battery_limits.half && this.battery_level <= this.battery_limits.three_quarters) {
            icon = this.icon_states.level3 // 'fa-battery-half'
        } else if (this.battery_level > this.battery_limits.quarter && this.battery_level <= this.battery_limits.half) {
            icon = this.icon_states.level2 // 'fa-battery-quarter'
        } else if (this.battery_level <= this.battery_limits.quarter) {
            icon = this.icon_states.level1//'fa-battery-empty'
        }
        return icon
    }

    

    /** 
     * @protected
     * @function <a name="setIconClass">setIconClass</a>
     * @description This method will set the icon class to be shown
     * @return The object itself
     * @memberof module:Battery
     * @instance
    */
    Battery.prototype.setIconClass = function () {
        let iconClass = this.getIconClass()
        for(var level in this.icon_states){
            if(iconClass === this.icon_states[level]){
                this.icon.classed(this.icon_states[level], true)
            }else{
                this.icon.classed(this.icon_states[level], false)
            }            
        }
        return this
    }
    


    /**
    * @function <a name="setBatteryLevel">setBatteryLevel</a>
    * @description Sets the current battery level and render the widget with new value.
    * @param {Integer} level new level for the battery. If level is not an integer, previous value will be assumed
    * @return returns the self objet in order to make chained calls
    * @memberof module:Battery
    * @instance
    */
    Battery.prototype.setBatteryLevel = function (level) {
        let level_int = parseInt(level)
        if (level != NaN) {
            if (level_int >= 0 && level_int <= 100) {
                this.battery_level = parseInt(level_int)
            }
        }
        return this
    }


    /**
     * @function <a name="render">render</a>
     * @description Rendering function for button widgets.
     * @param state {Object} JSON object with the current value of the state attributes of the modelled system
     * @param {Object} opt Style options overriding the style attributes used when the widget was created.
     *                     The override style options are temporary, i.e., they are applied only for the present invocation of the render method.
     * @param {String} [opt.fontColor=] sets new font color. This color is overriden by red if value is smaller then blinkingValue 
     * @memberof module:Battery
     * @instance
     */
    Battery.prototype.render = function (state, opt) {
        // set style
        opt = this.normaliseOptions(opt);
        this.setBatteryLevel(this.evaluate(this.displayKey, state))
        opt.fontColor = opt.fontColor !== undefined ? opt.fontColor : this.opt.fontColor
        opt.fontColor = this.getIconClass() === 'fa-battery-empty' || this.getIconClass() === 'fa-battery-quarter' ? 'red' : opt.fontColor
        opt.fontsize = opt.textFontSize || this.textFontSize
        this.setStyle(opt)
        this.setIconClass()
        
        let battery_level = this.evaluate(this.displayKey, state)
        if(this.show_percentage && state !== undefined){
            state[this.displayKey] = battery_level + "%"
        }

        /* make icon blink if level is lower than blinkingValue */
        if (battery_level < this.blinkingValue) {
            this.icon.classed('blink', true)
        }
        if(this.levelText !== undefined){
            this.levelText.render(state, opt);
            this.icon.style('color', opt.fontColor)
        }
        this.reveal();
        return this;
    }

    /**
    * @protected
   * @function <a name="createIcon">createIcon</a>
   * @description This method creates the necessary HTML for the icon render
   * @return returns The object itself to do chained calls
   * @memberof module:Battery
   * @instance
   */
    Battery.prototype.createIcon = function () {
        if (this.icon === undefined) {
            this.icon = this.div
                .append('i')
                .attr('id', `${this.id}-battery-icon`)
                .attr('aria-hidden', 'true')
                .style('position', 'relative')
                .style('top', `0px`)
                .style('left', `0px`)
                .style('width', `${this.coords.width}px`)
                .style('height', `${this.coords.height/2}px`)
                .style('font-size', `${this.iconFontSize}pt`)
        }
        return this
    }

    /**
    * @protected 
   * @function <a name="createText">createText</a>
   * @description This method creates a BasicDisplayEVO widget to render the level text
   * @return The object itself for chained calls
   * @memberof module:Battery
   * @instance
   */
    Battery.prototype.createText = function (opt) {
        let iconCoords = this.icon.node().getBoundingClientRect()
        if (this.levelText !== undefined) {
            this.levelText.remove()
        }
        this.levelText = new BasicDisplayEVO(`${this.id}-battery-level`, {
            width: this.coords.width,
            height: this.coords.height/2,
            top: '0px',
            left: '0px'        
        }, {
                fontColor: "white",
                position: 'relative',
                backgroundColor: "transparent",
                fontsize: opt.fontsize,
                parent: this.div.node().id,
                displayKey: this.displayKey
            });
        return this
    }
    /**
   * @function <a name="showIcon">showIcon</a>
   * @description Show the icon on widget
   * @return return The object itself for chained calls
   * @memberof module:Battery
   * @instance
   */
    Battery.prototype.showIcon = function () {
        this.show_icon = true
        return this.render();
    }
    /**
   * @function <a name="hideIcon">hideIcon</a>
   * @description Hide widget icon
   * @return returns The object itself for chained calls
   * @memberof module:Battery
   * @instance
   */
    Battery.prototype.hideIcon = function () {
        this.show_icon = false
        this.icon.remove()
        return this.render()
    }

    /**
    * @function <a name="showText">showText</a>
    * @description shows text with battery level
    * @return returns The object itself for chained calls
    * @memberof module:Battery
    * @instance
    */
    Battery.prototype.showText = function () {
        this.show_text = true
        return this.render()
    }

    /**
    * @function <a name="hideText">hideText</a>
    * @description hides battery level text from the widget
    * @return returns The object itself for chained calls 
    * @memberof module:Battery
    * @instance
    */
    Battery.prototype.hideText = function () {
        this.show_text = false
        this.levelText.hide()
        return this.render()
    }

    module.exports = Battery
}
)