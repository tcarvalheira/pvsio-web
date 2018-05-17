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
    let d3 = require('d3/d3')
    /**
     * @function <a name="ImageRender">ImageRender</a>
     * @description Constructor.
     * @param id {String} The ID of the touchscreen button.
     * @param coords {Object} The four coordinates (top, left, width, height) of the display, specifying
     *        the left, top corner, and the width and height of the (rectangular) widget area.
     *        Default is { top: 0, left: 0, width: 32, height: 20 }.
     * @param opt {Object} Style options defining the visual appearance of the widget.
     *                     Options can be given either as standard html style attributes or using the following widget attributes:
     * @memberof module:ImageRender
     * @instance
     */
     function ImageRender(id, coords, opt) {
         coords = coords || {};
         opt = this.normaliseOptions(opt);
         // set widget type & display key
         this.type = this.type || "ImageRender";
         this.displayKey = (typeof opt.displayKey === "string") ? opt.displayKey : id;
         this.parent = (opt.parent) ? `#${opt.parent}` : "body";
         // override default style options of WidgetEVO as necessary before creating the DOM element with the constructor of module WidgetEVO
         opt.backgroundColor = opt.backgroundColor || "none";
         this.backColor = opt.backColor
         this.color = opt.color
         opt.cursor = opt.cursor || "default";
         opt.overflow = "hidden";
         this.width = coords.width || 100
         this.height = coords.height || 100
         opt.svg = opt.svg || 'alarmoff.svg'

         opt.position = opt.position || "absolute";
         opt.opacity = opt.opacity || 1;
         this.id = id
         
         var elemClass = id + " ImageRenderWidget" + " noselect ";
         this.div = d3.select(this.parent)
                         .append("div")
                         .attr("id", `${id}_widget`)
                         .style("position", opt.position)
                         .style("top", `${this.top}px`).style("left", `${this.left}px`)
                         .style("width", `${this.width}px`).style("height", `${this.height}px`)
                         .style("margin", 0).style("padding", 0).style("opacity", opt.opacity)
                         .attr("class", elemClass)
                         .style('z-index',100)
                         .style('display','block')
                         
 
          this.image = this.div.append("div").attr("id", id + "_drawnimage").html(imagesvg)
                            //.style('fill', '#00FF00')
                            .attr('display', 'block')
        
        this.image.select('svg')
                    .style('width', this.width).style('height',this.heigh)

        this.setBackgroundColor(this.backColor)
        this.setColor(this.color)
         // invoke WidgetEVO constructor to create the widget
         WidgetEVO.apply(this, [ id, coords, opt ]);
         return this;
     }
     ImageRender.prototype = Object.create(WidgetEVO.prototype);
     ImageRender.prototype.parentClass = WidgetEVO.prototype;
     ImageRender.prototype.constructor = ImageRender;

    /**
    * @function render
    * @description this method will render the widget
    * @param {*} level 
    * @param {*} opt 
    */
        ImageRender.prototype.render = function () {
            this.image.style('display','block') 
        }

    /**
    * @function <a name="hide">hide</a>
    * @description This method will hide the widget
    * @memberof module:ImageRender
    * @instance
    */
        ImageRender.prototype.hide = function () {
        this.image.style('display','none')
    }

    /**
    * @function <a name="setImage">setImage</a>
    * @description This method will change the rendered image to another passed by argument.
    * @param img {svg} The image should be a svg object that will be rendered
    * @memberof module:ImageRender
    * @instance
    */
    ImageRender.prototype.setImage = function (img) {
        let svg = img
        this.image.remove()
        this.image = this.div.append("div").attr("id", this.id + "_drawnimage").html(svg)
                        .style('fill', '#00FF00')    
                        .attr('display', 'block')
        
        return this
    }

    	/**
        * @function <a name="setColor">setColor</a>
        * @description Sets color of all image paths to the given color
        * @param color {string} color in hex. ex. #FF0000
        * @memberof module:ImageRender
        * @instance
        */
        ImageRender.prototype.setColor = function (color) {
            console.log(`Set color to ${this.color}`)
            if(this.isValidColor(color) && this.color !== undefined){
                this.image.selectAll('path')
                    .style('stroke',color) 
            }
            return this
    }  

    	/**
        * @function <a name="setBackgroundColor">setBackgroundColor</a>
        * @description Set the image background color
        * @param color {string} color in hex. Ex. #FF0000
        * @memberof module:ImageRender
        * @instance
        */
        ImageRender.prototype.setBackgroundColor = function (color) {
            console.log(`Set background color to ${color}`)
            if(this.isValidColor(color) && this.backColor !== undefined){
                this.image.select('svg')
                    .style('background-color',color)
            }
            return this
    }

    	/**
         * @privated
        * @function <a name="isValidColor">isValidColor</a>
        * @description Function for private usage that will check if color is a valid hex color. As three digit color in hex is 
        *                   corrctely interpreted by browser it will return true as well.
        * @param color {string} the string to test 
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