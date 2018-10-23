/**
 * @module ImageRender
 * @version 1.0
 * @description Renders a svg image.
 *              This module provide APIs setting and changing the image and the color of the image.
 * @author Tiago Carvalheira
 * @date 2018/05/08
 *
 * @example <caption>Example use of the widget.</caption>
 // Example pvsio-web demo that uses ImageRender
 // The following configuration assumes the pvsio-web demo is stored in a folder within pvsio-web/examples/demo/
 require.config({
     baseUrl: "../../client/app",
     paths: { d3: "../lib/d3", text: "../lib/text" }
 });
 require(["widgets/med/ImageRender"], function (ImageRender) {
      "use strict";
      var disp = new ImageRender("disp", {
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
    let property = require("util/property");
    var imagesvg = require("text!widgets/med/ImageRender/alarmoff.svg");
    //var svgImages = require("text!img/");
    let d3 = require('d3/d3')
    /**
     * @function <a name="ImageRender">ImageRender</a>
     * @description Constructor.
     * @param id {String} The ID of the touchscreen button.
     * @param coords {Object} The four coordinates (top, left, width, height) of the display, specifying
     *        the left, top corner, and the width and height of the (rectangular) widget area.
     *        Default is { top: 0, left: 0, width: 32, height: 20 }.
     * @param {Object} opt
     * @param {String} [opt.svg='alarmoff.svg'] svg file
     * @param {String} [opt.position='absolute'] set the position style
     * @param {Number} [opt.opacity] value between 0 and 1
     * @param {String} [opt.displayKey] set PVS state value for the image to render. The image should exist on img folder inside prototype folder.
     * @param {String} [opt.visibleWhen='true'] sets when widget should be rendered
     * @param {String} [opt.backgroundColor='transparent'] set background widget color
     * @memberof module:ImageRender
     * @instance
     */
     function ImageRender(id, coords, opt) {
         coords = coords || {};
         opt = this.normaliseOptions(opt);
         // set widget type & display key
         this.id = id
         this.type = this.type || "ImageRender";
         this.displayKey = (typeof opt.displayKey === "string") ? opt.displayKey : id;
         this.visibleWhen = opt.visibleWhen || 'true'
         this.parent = (opt.parent) ? `#${opt.parent}` : "body";
         // override default style options of WidgetEVO as necessary before creating the DOM element with the constructor of module WidgetEVO
         this.backgroundColor = opt.backgroundColor || "transparent";
         this.backColor = opt.backColor
         this.color = opt.color
         opt.cursor = opt.cursor || "default";
         opt.overflow = "hidden";
         this.width = coords.width || 100
         this.height = coords.height || 100
         //opt.svg = opt.svg || 'alarmoff.svg'

         this.svg = opt.svg || 'img/alarmoff.svg'
         this.imageAbsolutePath = opt.imageAbsolutePath || false

         opt.position = opt.position || "absolute";
         opt.opacity = opt.opacity || 1;
         this.id = id

         // invoke WidgetEVO constructor to create the widget
         WidgetEVO.apply(this, [ id, coords, opt ]);
         // var imagesvg = svgImages[opt.svg]


         var elemClass = id + " ImageRenderWidget" + " noselect ";
         /* this.div = d3.select(this.parent)
                         .append("div")
                         .attr("id", `${id}_widget`)
                         .style("position", opt.position)
                         .style("top", `${this.top}px`).style("left", `${this.left}px`)
                         .style("width", `${this.width}px`).style("height", `${this.height}px`)
                         .style("margin", 0).style("padding", 0).style("opacity", opt.opacity)
                         .attr("class", elemClass)
                         .style('z-index',100)
                         .style('display','block') */
                                 
        if(this.svg !== undefined){
            this.image = this.base.append('object')
                            .attr('id',`${id}_svg_object`)
                            .style('width','100%')
                            .style('height','100%')
                            //.style('background-color','yellow')
                            .attr('type','image/svg+xml')
                            .attr("data", `img/${this.svg}`)
        }
                                                            

        this.image.select("svg")

         return this;
     }
     ImageRender.prototype = Object.create(WidgetEVO.prototype);
     ImageRender.prototype.parentClass = WidgetEVO.prototype;
     ImageRender.prototype.constructor = ImageRender;

    /**
    * @function render
    * @description this method will render the widget
    */
        ImageRender.prototype.render = function (state, opt={}) {
            var imagePath = ''
            /* if displayKey is defined then use it, else use default svg */
            if(this.displayKey !== undefined && this.displayKey !== null && this.displayKey !== ''){
                imagePath = this.evaluate(this.displayKey,state)                
            }else{
                imagePath = this.svg
            }
            this.backgroundColor = opt.backgroundColor || this.backgroundColor || 'transparent'

            this.image.remove()
            this.image = this.div.append('object')
                            .attr('id',`${this.id}_plugged_img`)
                            .style('width','100%')
                            .style('height','100%')
                            //.style('font-size','10px')
                            .style('background-color',`transparent`)
                            .attr('type','image/png')
                            .attr("data", `${imagePath}`) 

            if(this.evalViz(state)){
                this.reveal()
            }else{
                this.hide()
            }
            
            return this
        }
        
    	/**
        * @private
        * @function <a name="isValidColor">isValidColor</a>
        * @description Function for private usage that will check if color is a valid hex color. As three digit color in hex is 
        *                   corrctely interpreted by browser it will return true as well.
        * @param {String} color the string to test 
        * @memberof module:ImageRender
        * @instance
        */
        ImageRender.prototype.isValidColor = function (color) {
            let regExp = new RegExp(/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i)
            return regExp.test(color)
    }

    module.exports = ImageRender
   }
)