/**
 * @module ButtonImage
 * @version 1.0
 * @description Renders a digital display for rendering text.
 *              This module provide APIs for setting up the visual appearance of the widget, e.g., font size and color.
 * @author Tiago Carvalheira
 * @date 2018/07/27
 *
 * @example <caption>Example use of the widget.</caption>
 // Example pvsio-web demo that uses ButtonImage
 // The following configuration assumes the pvsio-web demo is stored in a folder within pvsio-web/examples/demo/
 require.config({
     baseUrl: "../../client/app",
     paths: { d3: "../lib/d3", text: "../lib/text" }
 });
 require(["widgets/core/ButtonImage"], function (ButtonImage) {
      "use strict";
      var disp = new ButtonImage("disp", {
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
    var ButtonEVO = require("widgets/core/ButtonEVO");
    var ImageRender = require("widgets/med/ImageRender/ImageRender")
    var BasicDisplayEVO = require("widgets/core/BasicDisplayEVO")
    let d3 = require('d3/d3')
     /**
     * @function <a name="ButtonImage">ButtonImage</a>
     * @description Constructor.
     * @param id {String} The ID of the touchscreen button.
     * @param coords {Object} The four coordinates (top, left, width, height) of the display, specifying
     *        the left, top corner, and the width and height of the (rectangular) widget area.
     *        Default is { top: 0, left: 0, width: 32, height: 20 }.
     * @param opt {Object} Options:
     * @param {Boolean} [opt.blinking=false] : whether the button is blinking (default is false, i.e., does not blink)</li>
     * @param {String} [opt.align='center'] : text align: "center", "right", "left", "justify" (default is "center")</li>
     * @param {String} [opt.background='transparent'] : background display color (default is transparent)</li>
     * @param {String} [opt.borderColor='steelblue'] : border color, must be a valid HTML5 color (default is "steelblue")</li>
     * @param {Number | String} [opt.borderRadius=0] : border radius, must be a number or a valid HTML5 border radius, e.g., 2, "2px", etc. (default is 0, i.e., square border)</li>
     * @param {String} [opt.berderStyle='none'] : border style, must be a valid HTML5 border style, e.g., "solid", "dotted", "dashed", etc. (default is "none")</li>
     * @param {Number} [opt.borderWidth='0px'] : border width (if option borderColor !== null then the default border is 2px, otherwise 0px, i.e., no border)</li>
     * @param {String} [opt.buttonReadback] : playback text reproduced with synthesised voice wheneven an action is performed with the button.</li>
     * @param {String} [opt.fontColor='white'] : font color, must be a valid HTML5 color (default is "white", i.e., "#fff")</li>
     * @param {String} [opt.fontFamily='sans-serif'] : font family, must be a valid HTML5 font name (default is "sans-serif")</li>
     * @param {Number} [opt.fontSize='coords.height - opt.borderWidth) / 2'] : font size (default is (coords.height - opt.borderWidth) / 2 )</li>
     * @param {Number} [opt.opacity='1'] : opacity of the button. Valid range is [0..1], where 0 is transparent, 1 is opaque (default is opaque)</li>
     * @param {String} [opt.overlayColor='steelblue'] : color of the semi-transparent overlay layer used indicating mouse over button, button pressed, etc (default is steelblue)</li>
     * @param {String} [opt.parent='body'] : the HTML element where the display will be appended (default is "body")</li>
     * @param {String} [opt.position='absolute'] : standard HTML position attribute indicating the position of the widget with respect to the parent, e.g., "relative", "absolute" (default is "absolute")</li>
     * @param {Boolean} [opt.pushButton] : if true, the visual aspect of the button resembles a push button, i.e., the button remains selected after clicking the button</li>
     * @param {String} [opt.softLabel=''] : the button label (default is blank).</li>
     * @param {Number} [opt.dblclick_timeout='350'] : timeout, in milliseconds, for detecting double clicks (default is 350ms)</li>
     * @param {Boolaen} [opt.toggleButton] : if true, the visual aspect of the button resembles a toggle button, i.e., the button remains selected after clicking the button</li>
     * @param {String} [opt.visibleWhen='true'] : boolean expression indicating when the display is visible. The expression can use only simple comparison operators (=, !=) and boolean constants (true, false). Default is true (i.e., always visible).</li>
     * @param {String} [opt.zIndex='1'] : z-index property of the widget (default is 1)</li>
     *                  The following additional attributes define which events are triggered when the button is activated:
     * @param {String|Array<String>} [opt.evts] : actions associated to the widget. Can be either "click", or "press/release" (default is "click").
     *                             Actions can be specified either as a string and using an array of strings (this is useful for backwards compatibility with old prototypes)
     *                             The function associated with the widget is given by the widget name prefixed with the action name.
     *                             In the case of "press/release", the widget is associated to two functions: press_<id> and release_<id>.</li>
     * @param {String} [opt.customFunctionText] : overrides the standard action name associated with click events.</li>
     * @param {String} [opt.functionText] : defines the action names associated with the widget.
     *                                     The indicated name is prefixed with the string indicated in opt.evts.</li>
     * @param {Number} [opt.keyCode] : binds the widget to keyboard keyCodes. Use e.g., http://keycode.info/, to see keyCodes</li>
     * @param {Number} [opt.rate] : interval, in milliseconds, for repeating button clicks when the button is pressed and held down (default is 250ms)</li>
     * @param {'bottom' | 'top' | 'left' | 'rigth'} [opt.imagePosition='bottom'] : relative position of the image to the label
     * @param {String} [opt.imageDisplayKey] - sets PVS state variable that olds image path
     * @param {String} [opt.textDisplayKey] - sets PVS state variable that olds button label path
     * @memberof module:ButtonEVO
     * @instance
     */
     function ButtonImage(id, coords, opt) {
        coords = coords || {};
        opt = this.normaliseOptions(opt);
        // set widget type & display key
        this.type = this.type || "ButtonImage";
        this.displayKey = (typeof opt.displayKey === "string") ? opt.displayKey : id;
        // override default style options of WidgetEVO as necessary before creating the DOM element with the constructor of module WidgetEVO
        opt.backgroundColor = opt.backgroundColor || "black";
        opt.cursor = opt.cursor || "default";
        opt.overflow = "hidden";
        this.imagePosition = opt.imagePosition || 'top'

         //this.div = d3.select(`#${opt.parent}`)
          //              .append('div')
          //              .attr('id',`${id}-btnImg`)

        WidgetEVO.apply(this, [ id, coords, opt ]);

        let newLeft = 0
        if(opt.align === 'center'){
            newLeft = (coords.width - (coords.width/2 ))/2
        }else if(opt.right === 'right'){
            newLeft = coords.width - (coords.width/2 )
        }

        // calculate image and text coordinates. Default value 'top' divive button in two vertically, image comes on top and text on bottom
        let topImage = 0
        let leftImage = newLeft // should i center or should i implement align on image?
        let topText = coords.height/2
        let leftText = 0 // text will center automatically if setted
 
        if(this.imagePosition === 'bottom'){
            // divive button in two vertically, image comes on top and text on bottom
            topImage = coords.height/2
            leftImage = newLeft
            topText = 0
            leftText = 0
        }else if(this.imagePosition === 'left'){
            // divide button in two, vertically and put image on left
            topImage = 0
            leftImage = 0
            topText = 0
            leftText = coords.width/2
        }else if(this.imagePosition === 'right'){
            topImage = 0
            leftImage = coords.width/2
            topText = 0
            leftText = 0
        }

        this.image = new ImageRender(`${id}-image`, {...coords,top:topImage, left:leftImage, width: coords.width/2, height: coords.height/2}, {...opt, displayKey: opt.imageDisplayKey, parent: `${id}`, backgroundColor: 'transparent', position: 'relative'})
        this.text = new BasicDisplayEVO(`${id}-label`,{...coords, top: topText, left: leftText, height: coords.height/2}, {...opt, displayKey: opt.textDisplayKey, parent: `${id}`, backgroundColor: 'transparent', position: 'relative'})
        this.button = new ButtonEVO(`${id}-button`, {...coords, top:0, left:0}, {...opt, parent: `${id}`, backgroundColor: 'transparent', position:'relative', zIndex:999})
        
        
         return this;
     }
     ButtonImage.prototype = Object.create(WidgetEVO.prototype);
     ButtonImage.prototype.parentClass = WidgetEVO.prototype;
     ButtonImage.prototype.constructor = ButtonImage;

     /**
      * @function <a name="render">render</a>
      * @description Rendering function for button widgets.
      * @param state {Object} JSON object with the current value of the state attributes of the modelled system
      * @param opt {Object} Style options overriding the style attributes used when the widget was created.
      *                     The override style options are temporary, i.e., they are applied only for the present invocation of the render method.
      *                     Available options are either html style attributes or the following widget attributes:
      * @memberof module:ButtonImage
      * @instance
      */
     ButtonImage.prototype.render = function (state, opt) {
         // set style
         opt = this.normaliseOptions(opt);

         this.setStyle(opt);

         if(this.evalViz(state)){
            this.image.render(state)
            this.text.render(state)
            this.button.render(state)
            this.reveal();
         }else{
             this.hide()    
         }
         
         return this;
     }
     module.exports = ButtonImage
   }
)