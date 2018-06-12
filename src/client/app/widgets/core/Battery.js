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
         opt = this.normaliseOptions(opt);
         // set widget type & display key
         this.type = this.type || "Battery";
         this.displayKey = (typeof opt.displayKey === "string") ? opt.displayKey : id;

         // override default style options of WidgetEVO as necessary before creating the DOM element with the constructor of module WidgetEVO
         opt.backgroundColor = opt.backgroundColor || "black";
         opt.cursor = opt.cursor || "default";
         opt.overflow = "hidden";

         // invoke WidgetEVO constructor to create the widget
         WidgetEVO.apply(this, [ id, coords, opt ]);
         return this;
     }
     Battery.prototype = Object.create(WidgetEVO.prototype);
     Battery.prototype.parentClass = WidgetEVO.prototype;
     Battery.prototype.constructor = Battery;


    	/**
        * @function <a name="createHTML">createHTML</a>
        * @description 
        * @param ... {Object} ... 
        * @memberof module:Battery
        * @instance
        */
        Battery.prototype.createHTML = function () {
            
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

         this.setStyle(opt);

         this.reveal();
         return this;
     }
     module.exports = Battery
   }
)