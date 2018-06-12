/**
 * @module Battery
 * @version 1.0
 * @description Renders a digital display for rendering text.
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
      var disp = new Battery("disp", {
        top: 200, left: 120, height: 24, width: 120
      }, {
          ... 
      });
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
     * @param opt {Object} Style options defining the visual appearance of the widget.
     *                     Options can be given either as standard html style attributes or using the following widget attributes:
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
        this.battery_level = opt.battery_level !== undefined ? opt.battery_level : 100
        this.show_icon = opt.show_icon !== undefined ? opt.show_icon : true
        this.show_text = opt.show_text !== undefined ? opt.show_text : true
        this.blinkingValue = opt.blinkingValue || 10

        
        this.parent =(opt.parent) ? (`#${opt.parent}`) : 'body'
        this.div = d3.select(this.parent)
                            .append('div')
                            .attr('id',this.id)
                            // add icon
        this.icon = this.div
                        .append('i')
                        .attr('id',`${this.id}-battery-icon`)
                        .attr('aria-hidden', 'true')
                        .style('position', 'absolute')
                        .style('top', `${this.coords.top}px`)
                        .style('left', `${this.coords.left}px`)
                        .style('width', `${this.coords.width}px`)
                        .style('height', `${this.coords.height}px`)
                            // add text

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
        * @description 
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
        * @description 
        * @param {Integer} level new level for the battery 
        * @memberof module:Battery
        * @instance
        */
        Battery.prototype.setBatteryLevel = function (level) {
            let level_int = parseInt(level)
            if(level != NaN){
                this.battery_level = parseInt(level)
                this.render()
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
        this.icon
               .attr('class',`battery-icon fas fa-2x ${this.getIconClass()}`)
               .style('display','block')
               .style('color',`${opt.fontColor}`)
               
        if(this.battery_level < this.blinkingValue){
            this.icon.classed('blink', true)
        }       
               
        this.levelText.render(this.battery_level + "%", opt);
        this.reveal();
        return this;
     }
     module.exports = Battery
   }
)