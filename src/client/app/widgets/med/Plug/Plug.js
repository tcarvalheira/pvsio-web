/**
 * @module Plug
 * @version 1.0
 * @description Renders a digital display for rendering text.
 *              This module provide APIs for setting up the visual appearance of the widget, e.g., font size and color.
 * @author Tiago Carvalheira
 * @date 2018/05/15
 *
 * @example <caption>Example use of the widget.</caption>
 // Example pvsio-web demo that uses Plug
 // The following configuration assumes the pvsio-web demo is stored in a folder within pvsio-web/examples/demo/
 require.config({
     baseUrl: "../../client/app",
     paths: { d3: "../lib/d3", text: "../lib/text" }
 });
 require(["widgets/med/Plug"], function (Plug) {
      "use strict";
      var disp = new Plug("disp", {
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
    let d3 = require('d3/d3')
    let d3_dispatch = require('d3/../d3_drag/d3-dispatch')
    let d3_selection = require('d3/../d3_drag/d3-selection')
    let d3_drag = require('d3/../d3_drag/d3_drag')
    /**
     * @function <a name="Plug">Plug</a>
     * @description Constructor.
     * @param id {String} The ID of the touchscreen button.
     * @param coords {Object} The six coordinates (top, left, width, height) of the display, specifying
     *        the left, top corner, and the width and height of the (rectangular) widget area and the adicional area for the plug rest.
     *        Default is { top: 0, left: 0, width: 32, height: 20, top_plug: 0, left_plug: 200 }.
     * @param opt {Object} Style options defining the visual appearance of the widget.
     *                     Options can be given either as standard html style attributes or using the following widget attributes:
     *                     <li>image_plugged</li> (string) path for the pugged image
     *                     <li>image_unplugged</li> (string) path for the unplugged image
     *                     <li>image_socket</li> (string) path for the socket image
     *                     <li>isPlugged</li> (boolean) default is false
     * @memberof module:Plug
     * @instance
     */
     function Plug(id, coords, opt) {
        coords = coords || {};
        opt = this.normaliseOptions(opt);
        // set widget type & display key
        this.type = this.type || "Plug";
        this.displayKey = (typeof opt.displayKey === "string") ? opt.displayKey : id;
        this.parent = (opt.parent) ? `#${opt.parent}` : "body"
         // override default style options of WidgetEVO as necessary before creating the DOM element with the constructor of module WidgetEVO
        opt.backgroundColor = opt.backgroundColor || "black";
        opt.cursor = opt.cursor || "default";
        opt.overflow = "hidden";
        this.width = coords.width || 100
        this.height = coords.height || 100
        this.top = coords.top || '20px'
        this.left = coords.left || '20px'
        this.top_plug = coords.top_plug || '20px'
        this.left_plug = coords.left_plug || '20px'
        this.image_plugged = opt.image_plugged
        this.image_unplugged = opt.image_unplugged
        this.image_socket = opt.image_socket
        this.isPlugged = opt.isPlugged || false


        this.parentDiv = document.getElementById(opt.parent)

        this.socket = d3.select(this.parent)
                        .append("div")
                        .attr('id',`${id}_socket_div`)
                        .attr('data-code', `${id}`)
                        .attr('data-type','socket')
                        .style('position', 'absolute')
                        .style('top', `${this.top}px`)
                        .style('left', `${this.left}px`)
                        .attr('class', `socket`)
                        .style('width', `${this.width}px`)
                        .style('height', `${this.height + 50}px`)
                        .style('background-color', `yellow`)
                        .style('z-index','1')

                        .append('img')
                        .attr('id', `${id}_socket_img`)
                        .attr('class', `drag-socket ${id}`)
                        .attr('data-code',`${id}`)
                        .attr('data-type','socket')
                        .attr('draggable', 'true')
                        .style('width','100%')
                        .style('z-index','2')
                        .attr("src", `${this.image_socket}`)

        this.plug_plugged = d3.select(this.parent)
                        .append('div')
                        .attr('id',`${id}_plugged_div`)
                        .attr('data-code', `${id}`)
                        .attr('data-type','plugged')
                        .style('position', 'absolute')                        
                        .style('top', `${this.top}px`)
                        .style('left', `${this.left}px`)
                        .attr('class','plug_plugged')
                        .style('width', `${this.width}px`)
                        .style('height', `${this.height}px`)
                        .style('z-index','-2')
                        
                        .append('img')
                        .attr('id',`${id}_plugged_img`)
                        .attr('class', `drag-plugged ${id}`)
                        .attr('data-code',`${id}`)
                        .attr('data-type','plugged')
                        .attr('draggable', 'true')
                        .attr('hidden', true)
                        .style('width','100%')
                        .attr("src", `${this.image_plugged}`)
                        .style('z-index','-1')

        this.plug_unplugged = d3.select(this.parent)
                        .append('div')
                        .attr('id',`${id}_unplugged_div`)
                        .attr('data-code', id)    
                        .attr('data-type','unplugged')                  
                        .style('position', 'absolute')
                        .style('top', `${this.top_plug}px`)
                        .style('left', `${this.left_plug}px`)
                        .attr('class','plug_unplugged')
                        .style('width', `${this.width}px`)
                        .style('height', `${this.height}px`)
                        .style('border','dashed')
                        .style('z-index','1')
                        
                        .append('img')
                        .attr('id',`${id}_unplugged_img`)
                        .attr('class', `drag-unplugged ${id}`)
                        .attr('data-code',`${id}`)
                        .attr('data-type','unplugged')
                        .attr('draggable', 'true')
                        .style('width','100%')
                        .attr("src", `${this.image_unplugged}`)
                        .style('z-index', '2')

        
        this.socket_div = document.getElementById(`${id}_socket_div`)
        this.socket_img = document.getElementById(`${id}_socket_img`)
        this.plugged_div = document.getElementById(`${id}_plugged_div`)
        this.plugged_img = document.getElementById(`${id}_plugged_img`)
        this.unplugged_div = document.getElementById(`${id}_unplugged_div`)
        this.unplugged_img = document.getElementById(`${id}_unplugged_img`)                

        
        /* DIV's where the image can be droped */
        //ondrop="drop(event)" ondragover="allowDrop(event)"
        this.socket_div.addEventListener('drop', this.drop)
        this.socket_div.addEventListener('dragover', this.allowDrop)
        this.plugged_div.addEventListener('drop', this.drop)
        this.plugged_div.addEventListener('dragover', this.allowDrop)
        this.unplugged_div.addEventListener('drop', this.drop)
        this.unplugged_div.addEventListener('dragover', this.allowDrop)
        
        /* the images that can be dragged */
        this.socket_img.addEventListener('dragstart', this.drag)
        this.plugged_img.addEventListener('dragstart', this.drag )
        this.unplugged_img.addEventListener('dragstart', event => this.drag(event, this))



         // invoke WidgetEVO constructor to create the widget
         WidgetEVO.apply(this, [ id, coords, opt ]);
         return this;
     }
     Plug.prototype = Object.create(WidgetEVO.prototype);
     Plug.prototype.parentClass = WidgetEVO.prototype;
     Plug.prototype.constructor = Plug;

     /**
      * @function <a name="render">render</a>
      * @description Rendering function for button widgets.
      * @param state {Object} JSON object with the current value of the state attributes of the modelled system
      * @param opt {Object} Style options overriding the style attributes used when the widget was created.
      *                     The override style options are temporary, i.e., they are applied only for the present invocation of the render method.
      *                     Available options are either html style attributes or the following widget attributes:
      * @memberof module:Plug
      * @instance
      */
     Plug.prototype.render = function (state, opt) {
         // set style
         opt = this.normaliseOptions(opt);

         this.setStyle(opt);
         //this.div.style('display','block')

         // this.reveal();
         return this;
     }

     	/**
         * @function <a name="drag">drag</a>
         * @description 
         * @param ... {Object} ... 
         * @memberof module:Plug
         * @instance
         */
         Plug.prototype.drag = function (ev, obj) {
            ev.currentTarget.style.border = "dashed";
            ev.currentTarget.style.borderColor = "coral";
            ev.dataTransfer.setData("text", ev.target.id)
            return obj
     }  

     	/**
         * @function <a name="allowDrag">allowDrag</a>
         * @description 
         * @param ... {Object} ... 
         * @memberof module:Plug
         * @instance
         */
         Plug.prototype.allowDrop = function (ev) {
             ev.preventDefault()
     }

     	/**
         * @function <a name="drop">drop</a>
         * @description 
         * @param ... {Object} ... 
         * @memberof module:Plug
         * @instance
         */
         Plug.prototype.drop = function (ev) {
            ev.preventDefault();
            var data = ev.dataTransfer.getData("text")

            let dragged = document.getElementById(data)
            if(dragged !== null){
                dragged.style.border="none";
            }
            let code = dragged.getAttribute('data-code')
            console.log(`Target: ${ev.target.getAttribute('data-type')} Dragged: ${dragged.getAttribute('data-type')}`)
            if(ev.target.getAttribute('data-type') === 'socket' && dragged.getAttribute('data-type') === 'unplugged'){
                connectPlug(code)
            }else if(ev.target.getAttribute('data-type') === 'unplugged' && dragged.getAttribute('data-type') === 'plugged'){
                console.log(`Vou tentar desligar`)
                deconnectPlug(code)
            }
     }
     
     
     	/**
         * @function <a name="isPlugged">isPlugged</a>
         * @description Thos method will return a boolean value whether the plug is or not connected to its socket
         * @return (boolean) whether plug is or not connected
         * @memberof module:Plug
         * @instance
         */
         Plug.prototype.isPlugged = function () {
            return this.isPlugged
     }

     	/**
         * @function <a name="plug">plug</a>
         * @description This method will connect the plug to its socket.
         * @memberof module:Plug
         * @instance
         */
         Plug.prototype.plug = function () {
            connectPlug(this.id)
     }

     	/**
         * @function <a name="unplug">unplug</a>
         * @description 
         * @memberof module:Plug
         * @instance
         */
         Plug.prototype.unplug = function () {
        deconnectPlug(this.id)
     }

    	/**
        * @function <a name="connectPlug">connectPlug</a>
        * @description This method will perform the necessary operations to connect a plug into a socket
        * @param code {String} the reference code to deconnect the plug. This code will be, usually, the plug id 
        * @memberof module:Plug
        * @instance
        */
        let connectPlug = function (code) {

            let socket = document.getElementsByClassName(`drag-socket ${code}`)[0]
            let plugged = document.getElementsByClassName(`drag-plugged ${code}`)[0]
            let unplugged = document.getElementsByClassName(`drag-unplugged ${code}`)[0]

            let socket_div = socket.parentElement
            let plugged_div = plugged.parentElement
            let unplugged_div = unplugged.parentElement

            /* If some of the images are undefined i can't do the procedures */
            if(socket === undefined || plugged === undefined || unplugged === undefined){
                return
            }
            
            socket.hidden = true
            plugged.hidden = false
            unplugged.hidden = true

            /* in order to drag and drop the correct element, it is needed to change z-index of the elements */
            /* socket goes back and plugged come to front*/
            socket_div.style.zIndex = -2
            socket.style.zIndex = -1
            plugged_div.style.zIndex = 1
            plugged.style.zIndex = 2
            
            /* set as plugged */
            this.isPlugged = true
    }

    	/**
        * @function <a name="deconnectPlug">deconnectPlug</a>
        * @description This method will perform the needed operations to deconnect a plug from a socket
        * @param code {String} the reference code to deconnect the plug. This code will be, usually, the plug id 
        * @memberof module:Plug 
        * @instance
        */
        let deconnectPlug = function (code) {
            let socket = document.getElementsByClassName(`drag-socket ${code}`)[0]
            let plugged = document.getElementsByClassName(`drag-plugged ${code}`)[0]
            let unplugged = document.getElementsByClassName(`drag-unplugged ${code}`)[0]

            let socket_div = socket.parentElement
            let plugged_div = plugged.parentElement
            let unplugged_div = unplugged.parentElement


            if(socket === undefined || plugged === undefined || unplugged === undefined){
                return
            }

            socket.hidden = false
            plugged.hidden = true
            unplugged.hidden = false
            /* in order to drag and drop the correct element, it is needed to change z-index of the elements */
            /* socket goes back and plugged come to front*/
            socket_div.style.zIndex = 1
            socket.style.zIndex = 2
            plugged_div.style.zIndex = -2
            plugged.style.zIndex = -1

            /* set as unplugged */
            this.isPlugged = true
    }

     module.exports = Plug
   }
)