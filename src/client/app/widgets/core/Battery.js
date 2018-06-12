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
     * @param {Number} [opt.blinkingValue=10] if battery level is below this value, icon will blink
     * @param {Number} [opt.battery_level=100] Level of battery em percentage. This value should be between 0 and 100
     * @memberof module:Battery
     * @instance
     */
     function Battery(id, coords, opt) {
         coords = coords || {};
         this.coords = coords
         opt = this.normaliseOptions(opt);
         // set widget type & display key
         this.type = this.type || "Battery";
         this.displayKey = (typeof opt.displayKey === "string") ? opt.displayKey : id;

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
        this.blinkingValue = opt.blinkingValue || 10

        
        this.parent =(opt.parent) ? (`#${opt.parent}`) : 'body'
        this.div = d3.select(this.parent)
                            .append('div')
                            .attr('id',this.id)
        
        // invoke WidgetEVO constructor to create the widget
        WidgetEVO.apply(this, [ id, coords, opt ]);
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
            let icon  = 'fa-battery-full'
            if(this.battery_level > 90){
                icon = 'fa-battery-full'
            }else if(this.battery_level > 70 && this.battery_level <= 90){
                icon = 'fa-battery-three-quarters'
            }else if(this.battery_level > 40 && this.battery_level <= 70){
                icon = 'fa-battery-half'
            }else if(this.battery_level > 10 && this.battery_level <= 40){
                icon = 'fa-battery-quarter'
            }else if(this.battery_level <= 10){
                icon = 'fa-battery-empty'
            }
            return icon
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
            if(level != NaN){
                if(level_int >= 0 && level_int <= 100){
                    this.battery_level = parseInt(level_int)
                    this.render()
                }
            }
            return this            
    }


     /**
      * @function <a name="render">render</a>
      * @description Rendering function for button widgets.
      * @param state {Object} JSON object with the current value of the state attributes of the modelled system
      * @param opt {Object} Style options overriding the style attributes used when the widget was created.
      *                     The override style options are temporary, i.e., they are applied only for the present invocation of the render method.
      *                     Available options are either html style attributes or the following widget attributes:
      * @memberof module:Battery
      * @instance
      */
     Battery.prototype.render = function (state, opt) {
         // set style
        opt = this.normaliseOptions(opt);
        
        opt.fontColor = opt.fontColor !== undefined ? opt.fontColor : this.opt.fontColor
        opt.fontColor = this.getIconClass() === 'fa-battery-empty' || this.getIconClass() === 'fa-battery-quarter' ? 'red' : opt.fontColor
        this.setStyle(opt);
        if(this.show_icon){
            this.createIcon()
            this.icon
               .attr('class',`battery-icon fas fa-2x ${this.getIconClass()}`)
               .style('display','block')
               .style('color',`${opt.fontColor}`)
            
            if(this.battery_level < this.blinkingValue){
                this.icon.classed('blink', true)
            }
        }

        if(this.show_text){
            this.createText(opt)
            this.levelText.render(this.battery_level + "%", opt);
        }
               
        this.reveal();
        return this;
     }

     	/**
          * @protected
         * @function <a name="createIcon">createIcon</a>
         * @description This method creates the necessary HTML for the icon render
         * @return returns self object to do chained calls
         * @memberof module:Battery
         * @instance
         */
         Battery.prototype.createIcon = function () {
             if(this.icon === undefined){
                this.icon = this.div
                .append('i')
                .attr('id',`${this.id}-battery-icon`)
                .attr('aria-hidden', 'true')
                .style('position', 'absolute')
                .style('top', `${this.coords.top}px`)
                .style('left', `${this.coords.left}px`)
                .style('width', `${this.coords.width}px`)
                .style('height', `${this.coords.height}px`)
             }
            return this
     }
     
     	/**
          * @protected 
         * @function <a name="createText">createText</a>
         * @description This method creates a BasicDisplayEVO widget to render the level text
         * @return self object for chained calls
         * @memberof module:Battery
         * @instance
         */
         Battery.prototype.createText = function (opt) {
            if(this.levelText === undefined){
                this.levelText = new BasicDisplayEVO(`${this.id}-battery-level`, {
                    width: this.coords.width,
                    height: this.coords.height,
                    top: this.coords.top + 30,
                    left: this.coords.left
                }, {
                    fontColor: "white",
                    backgroundColor: "transparent",
                    fontsize: opt.fontsize,
                    parent: "battery"
                });
            }
            return this
     }
     	/**
         * @function <a name="showIcon">showIcon</a>
         * @description Show the icon on widget
         * @return return self object for chained calls
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
         * @return returns self object for chained calls
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
        * @return returns self object for chained calls
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
        * @return returns self object for chained calls 
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