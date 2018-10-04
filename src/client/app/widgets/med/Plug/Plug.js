/**
 * @module Plug
 * @version 1.0
 * @description Renders a plug and a socket and simulates the plug in an unplug actions
 *              It will be necessary three images for this widget. One with the plug unplugged, one with the free socket and one with the plug plugged into the socket

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
      vgaPlug: new Plug(
                'vga_plug',
                { top: 70, left: 30, width: 100, heigh:100, top_plug: 70, left_plug: 500 },
                { 
                    parent: 'plug-container', 
                    image_unplugged: 'img/vga_small_unplugged.png',
                    image_plugged: 'img/vga_small_plugged.png',
                    image_socket: 'img/vga_small_socket.png',
                    isPlugged: true
                 }
            )
      vgaPlug.render();
 });
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require, exports, module) {
    "use strict";
    var WidgetEVO = require("widgets/core/WidgetEVO");
    let d3 = require('d3/d3')
 
    /**
     * @function <a name="Plug">Plug</a>
     * @description Constructor.
     * @param id {String} The ID of the touchscreen button.
     * @param coords {Object} The six coordinates (top, left, width, height, top_plug, left_plug) of the display, specifying
     *        the left, top corner, and the width and height of the (rectangular) widget area and the adicional area for the plug rest.
     *        Default is { top: 0, left: 0, width: 32, height: 20, top_plug: 0, left_plug: 200 }.
     * @param {Object} opt Style options defining the visual appearance of the widget.
     *                     Options can be given either as standard html style attributes or using the following widget attributes:
     * @param {String} opt.image_plugged path for the pugged image
     * @param {String} opt.image_unplugged path for the unplugged image
     * @param {String} opt.image_socket path for the socket image
     * @param {Boolean} [opt.isPlugged=false] set if the plug should be plugged in ou unplugged from the socket. Default is false
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
        this.Wvisible = opt.visible || true



        this.parentDiv = document.getElementById(opt.parent)
        this.div = d3.select(this.parent)
                    .append("div")
                    .attr('id', `${id}_widget_div`)

        /* create the socket div and image */
        this.socket = this.div //d3.select(this.parent)
                        .append("div")
                        .attr('id',`${id}_socket_div`)
                        .attr('data-code', `${id}`)
                        .attr('data-type','socket')
                        .style('position', 'absolute')
                        .style('top', `${this.top}px`)
                        .style('left', `${this.left}px`)
                        .attr('class', `socket`)
                        .style('width', `${this.width}px`)
                        .style('height', `${this.height}px`)
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

        /* create the plugged div and image, this will be placed on same location of the socket and will toggle visibility with socket */
        this.plug_plugged = this.div //d3.select(this.parent)
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
                        .style('background-color', 'none')
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

        /* create the unplugged div and img. The image will toggle visibility with plugged image. 
            The border is dashed so that one can drag back into rest */
        this.plug_unplugged = this.div //d3.select(this.parent)
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

        
        /* add listeners to set the DIV's where the image can be droped */
        if(this.socket_div !== undefined && this.socket_div !== null){
            this.socket_div.addEventListener('drop', event => this.drop(event, this))
        }
        if(this.socket_div !== undefined && this.socket_div !== null){
            this.socket_div.addEventListener('dragover', event => this.allowDrop(event, this))
        }
        if(this.plugged_div !== undefined && this.socket_div !== null){
            this.plugged_div.addEventListener('drop', event => this.drop(event, this))
        }
        if(this.plugged_div !== undefined && this.socket_div !== null){
            this.plugged_div.addEventListener('dragover', event => this.allowDrop(event, this))
        }
        if(this.unplugged_div !== undefined && this.socket_div !== null){
            this.unplugged_div.addEventListener('drop', event => this.drop(event, this))
        }
        if(this.unplugged_div !== undefined && this.socket_div !== null){
            this.unplugged_div.addEventListener('dragover', event => this.allowDrop(event, this))
        }
        
        /* add listeners to set the images that can be dragged */
        //this.socket_img.addEventListener('dragstart', event => this.drag(event, this))
        if(this.plugged_img !== undefined && this.plugged_img !== null){
            this.plugged_img.addEventListener('dragstart', event => this.drag(event, this) )
        }
        if(this.unplugged_img !== undefined && this.unplugged_img !== null){
            this.unplugged_img.addEventListener('dragstart', event => this.drag(event, this))
        }

         // invoke WidgetEVO constructor to create the widget
         WidgetEVO.apply(this, [ id, coords, opt ]);
        
         /* set the initial state */
        if(this.isPlugged){
            this.connectPlug(this.id)
        }else{
            this.deconnectPlug(this.id)
        }

        return this;
     }
     Plug.prototype = Object.create(WidgetEVO.prototype);
     Plug.prototype.parentClass = WidgetEVO.prototype;
     Plug.prototype.constructor = Plug;

     /**
      * @function <a name="render">render</a>
      * @description Rendering function for button widgets.
      * @param {Object} state JSON object with the current value of the state attributes of the modelled system
      * @memberof module:Plug
      * @instance
      */
     Plug.prototype.render = function (state) {
         this.reveal()
         return this;
     }

     	/**
         * @function <a name="reveal">reveal</a>
         * @description Turn the widget visible 
         * @memberof module:Plug
         * @instance
         */
         Plug.prototype.reveal = function () {
            d3.select(this.parent)
                .style('display', 'block')
            return this
        }

        	/**
            * @function <a name="hide">hide</a>
            * @description hidden the widget 
            * @memberof module:Plug
            * @instance
            */
            Plug.prototype.hide = function () {
                d3.select(this.parent).style('display', 'none')
                return this
            }

     	/**
         * @private
         * @function <a name="drag">drag</a>
         * @description Set the border of the dragged object.
         * @param {Object} ev the drag event object
         * @param {Object} obj the plug object it self 
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
          * @private
         * @function <a name="allowDrag">allowDrag</a>
         * @description This method sets if the target objet allows drop event
         * @param {Object} ev the drag event object
         * @param {Object} obj the plug object it self 
         * @memberof module:Plug
         * @instance
         */
         Plug.prototype.allowDrop = function (ev, obj) {
             /* the default behaviour is not allow */
             ev.preventDefault()
        }

     	/**
          * @private
         * @function <a name="drop">drop</a>
         * @description Set what should be done when drop an object over other object
         * @param {Object} ev drag event object
         * @param {Object} plug Plug object it self 
         * @memberof module:Plug
         * @instance
         */
         Plug.prototype.drop = function (ev, plug) {
            ev.preventDefault();
            var data = ev.dataTransfer.getData("text")

            let dragged = document.getElementById(data)
            if(dragged !== null){
                dragged.style.border="none";
            }
            let code = dragged.getAttribute('data-code')
            let socket_code = ev.target.getAttribute('data-code')
            if( code === socket_code && ev.target.getAttribute('data-type') === 'socket' && dragged.getAttribute('data-type') === 'unplugged'){
                plug.connectPlug(code)
            }else if(ev.target.getAttribute('data-type') === 'unplugged' && dragged.getAttribute('data-type') === 'plugged'){
                plug.deconnectPlug(code)
            }
     }
     
     
     	/**
         * @function <a name="isPlugged">isPlugged</a>
         * @description This method returns a boolean value whether the plug is or not connected to its socket
         * @return (boolean) whether plug is or not connected
         * @memberof module:Plug
         * @instance
         */
         Plug.prototype.isPlugged = function () {
            return this.isPlugged
        }

     	/**
         * @function <a name="plug">plug</a>
         * @description This method connects a plug to its socket.
         * @memberof module:Plug
         * @instance
         */
         Plug.prototype.plug = function () {
            this.connectPlug(this.id)
            return this
     }

     	/**
         * @function <a name="unplug">unplug</a>
         * @description This method deconnects a plug from its socket
         * @memberof module:Plug
         * @instance
         */
         Plug.prototype.unplug = function () {
            this.deconnectPlug(this.id)
            return this
        }

    	/**
         * @private
        * @function <a name="connectPlug">connectPlug</a>
        * @description This method performs the necessary operations to connect a plug into a socket
        * @param {String} code the reference code to deconnect the plug. This code will be, usually, the plug id 
        * @memberof module:Plug
        * @instance
        */
        Plug.prototype.connectPlug = function (code) {

            let socket = document.getElementsByClassName(`drag-socket ${code}`)[0]
            let plugged = document.getElementsByClassName(`drag-plugged ${code}`)[0]
            let unplugged = document.getElementsByClassName(`drag-unplugged ${code}`)[0]

            

            /* If some of the images are undefined i can't do the procedures */
            if(socket === undefined || plugged === undefined || unplugged === undefined){
                return this
            }

            let socket_div = socket.parentElement
            let plugged_div = plugged.parentElement
            let unplugged_div = unplugged.parentElement
            
            socket.hidden = true
            plugged.hidden = false
            unplugged.hidden = true

            /* in order to drag and drop the correct element, it is needed to change z-index of the elements */
            /* socket goes back and plugged come to front*/
            socket_div.style.zIndex = -2
            socket.style.zIndex = -1
            plugged_div.style.zIndex = 1
            plugged.style.zIndex = 2
            
            /* set as plugged in */
            this.isPlugged = true

            return this
    }

    	/**
         * @private
        * @function <a name="deconnectPlug">deconnectPlug</a>
        * @description This method performs the needed operations to deconnect a plug from a socket
        * @param {String} code the reference code to deconnect the plug. This code will be, usually, the plug id 
        * @memberof module:Plug 
        * @instance
        */
        Plug.prototype.deconnectPlug = function (code) {
            let socket = document.getElementsByClassName(`drag-socket ${code}`)[0]
            let plugged = document.getElementsByClassName(`drag-plugged ${code}`)[0]
            let unplugged = document.getElementsByClassName(`drag-unplugged ${code}`)[0]

            


            if(socket === undefined || plugged === undefined || unplugged === undefined){
                return this
            }

            let socket_div = socket.parentElement
            let plugged_div = plugged.parentElement
            let unplugged_div = unplugged.parentElement

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

            return this
    }

     module.exports = Plug
   }
)