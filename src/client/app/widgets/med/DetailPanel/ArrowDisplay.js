/**
 * @module ArrowDisplay
 * @version 1.0
 * @description Renders a digital display for rendering text.
 *              This module provide APIs for setting up the visual appearance of the widget, e.g., font size and color.
 * @author Tiago Carvalheira
 * @date 2018/04/04
 *
 * @example <caption>Example use of the widget.</caption>
 // Example pvsio-web demo that uses ArrowDisplay
 // The following configuration assumes the pvsio-web demo is stored in a folder within pvsio-web/examples/demo/
 require.config({
     baseUrl: "../../client/app",
     paths: { d3: "../lib/d3", text: "../lib/text" }
 });
 require(["widgets/med/DetailPanel/ArrowDisplay"], function (ArrowDisplay) {
      "use strict";
      var disp = new ArrowDisplay("disp", {
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
    var BasicDisplay = require('widgets/core/BasicDisplayEVO')
    /**
     * @function <a name="ArrowDisplay">ArrowDisplay</a>
     * @description Constructor.
     * @param id {String} The ID of the touchscreen button.
     * @param coords {Object} The four coordinates (top, left, width, height) of the display, specifying
     *        the left, top corner, and the width and height of the (rectangular) widget area.
     *        Default is { top: 0, left: 0, width: 32, height: 20 }.
     * @param opt {Object} Style options defining the visual appearance of the widget.
     *                     Options can be given either as standard html style attributes or using the following widget attributes:
     * @memberof module:ArrowDisplay
     * @instance
     */
     function ArrowDisplay(id, coords, opt) {
         coords = coords || {};
         opt = this.normaliseOptions(opt);
         // set widget type & display key
         this.type = this.type || "ArrowDisplay";
         this.displayKey = (typeof opt.displayKey === "string") ? opt.displayKey : id;

         // override default style options of WidgetEVO as necessary before creating the DOM element with the constructor of module WidgetEVO
        opt.backgroundColor = opt.backgroundColor || "black";
        opt.cursor = opt.cursor || "default";
        opt.overflow = "hidden";

        var elemClass = id + " arrow" + " noselect ";
         this.div = d3.select(this.parent)
         .append("div")

        // invoke WidgetEVO constructor to create the widget
        WidgetEVO.apply(this, [ id, coords, opt ]);


        let optBasic = opt
        optBasic.zIndex = '5'
        this.basicDisplay = new BasicDisplay(id+'_basic', coords, optBasic)
                
        return this;
     }
     ArrowDisplay.prototype = Object.create(WidgetEVO.prototype);
     ArrowDisplay.prototype.parentClass = WidgetEVO.prototype;
     ArrowDisplay.prototype.constructor = ArrowDisplay;

     /**
      * @function <a name="render">render</a>
      * @description Rendering function for button widgets.
      * @param state {Object} JSON object with the current value of the state attributes of the modelled system
      * @param opt {Object} Style options overriding the style attributes used when the widget was created.
      *                     The override style options are temporary, i.e., they are applied only for the present invocation of the render method.
      *                     Available options are either html style attributes or the following widget attributes:
      * @memberof module:ArrowDisplay
      * @instance
      */
     ArrowDisplay.prototype.render = function (angle, opt) {
         // set style
         opt = this.normaliseOptions(opt);

         this.setStyle(opt);

        this.basicDisplay.setStyle({
            'filter': 'progid:DXImageTransform.Microsoft.BasicImage(rotation=1)',
            '-webkit-transform': `rotate(${angle}deg)`,
            '-moz-transform': `rotate(${angle}deg)`,
            '-ms-transform': `rotate(${angle}deg)`,
            '-o-transform': `rotate(${angle}deg)`,
            'transform': `rotate(${angle}deg)`,
            'backgroundColor':'rgba(0, 0, 0, 0)'
        })
         
        this.reveal();
        this.basicDisplay.renderGlyphicon('glyphicon glyphicon-arrow-up',{'blinking':false})
         
         return this;
     }
     module.exports = ArrowDisplay
   }
)