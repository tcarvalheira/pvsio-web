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
    const PVSioStateParser = require("util/PVSioStateParser");
    /**
     * @function <a name="Plug">Plug</a>
     * @description Constructor.
     * @param id {String} The ID of the touchscreen button.
     * @param {Integer} [coords.top='0'] Coordinate for top corner of the widget. Defaulta is 0px
     * @param {Integer} [coords.left='0'] Coordinate for left corner of widget. Default is 0px
     * @param {Integer} [coords.width=100] Coordinate with width for widget
     * @param {Integer} [coords.height=100] Coordinate defining height for widget
     * @param {Integer} [coords.top_plug=100] Coordinate defining top corner for unplugged plugs rest. This coordinate must be relative to original widget's top coordinate.
     * @param {Integer} [coords.loeft_plug=0] Coordinate defining left corner for unplugged plugs rest. This coordinate must be relative to original widget's left coordinate.
     * @param {Object} opt Style options defining the visual appearance of the widget.
     *                     Options can be given either as standard html style attributes or using the following widget attributes:
     * @param {String} opt.image_plugged path for the pugged image
     * @param {String} opt.image_unplugged path for the unplugged image
     * @param {String} opt.image_socket path for the socket image
     * @param {Boolean} [opt.isPlugged=false] set if the plug should be plugged in ou unplugged from the socket. Default is false
     * @param {String} [opt.displayKey] set key in pvs model that sets if widget is pluged or unpluged
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
        this.displayKey = opt.displayKey
        this.visibleWhen = opt.visibleWhen || 'true'

        // invoke WidgetEVO constructor to create the widget
        WidgetEVO.apply(this, [ id, coords, opt ]);

        this.parentDiv = document.getElementById(opt.parent)
        this.div_widget = this.base //d3.select(this.parent)
                    .append("div")
                    .attr('id', `${id}_widget_div`)

        /* create the socket div and image */
        this.socketDiv = this.div_widget //d3.select(this.parent)
                        .append("div")
                        .attr('id',`${id}_socket_div`)
                        .attr('data-code', `${id}`)
                        .attr('data-type','socket')
                        .style('position','relative')
                        .style('top','0px')
                        .style('left','0px')
                        .attr('class', `socket`)
                        .style('width', `${this.width}px`)
                        .style('height', `0px`)
                        .style('z-index','1')

        this.socket = this.socketDiv.append('img')
                        .attr('id', `${id}_socket_img`)
                        .attr('class', `drag-socket ${id}`)
                        .attr('data-code',`${id}`)
                        .attr('data-type','socket')
                        .attr('draggable', 'true')
                        .style('width','100%')
                        .style('z-index','2')
                        .attr("src", `${this.image_socket}`)

        /* create the plugged div and image, this will be placed on same location of the socket and will toggle visibility with socket */
        this.plug_pluggedDiv = this.div_widget //d3.select(this.parent)
                        .append('div')
                        .attr('id',`${id}_plugged_div`)
                        .attr('data-code', `${id}`)
                        .attr('data-type','plugged')
                        .style('position','relative')
                        .style('top',`0px`)
                        .style('left','0px')
                        .attr('class','plug_plugged')
                        .style('width', `${this.width}px`)
                        .style('height', `0px`)
                        .style('background-color', 'none')
                        .style('z-index','-2')
                        
        this.plug_plugged = this.plug_pluggedDiv.append('img')
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
        this.plug_unpluggedDiv = this.div_widget //d3.select(this.parent)
                        .append('div')
                        .attr('id',`${id}_unplugged_div`)
                        .attr('data-code', id)    
                        .attr('data-type','unplugged')                  
                        .style('position', 'relative')
                        .style('top', `${this.top_plug}px`)
                        .style('left', `${this.left_plug}px`)
                        .attr('class','plug_unplugged')
                        .style('width', `${this.width}px`)
                        .style('height', `${this.height}px`)
                        .style('border','dashed')
                        .style('color','grey')
                        .style('z-index','1')
                        
        this.plug_unplugged = this.plug_unpluggedDiv.append('img')
                        .attr('id',`${id}_unplugged_img`)
                        .attr('class', `drag-unplugged ${id}`)
                        .attr('data-code',`${id}`)
                        .attr('data-type','unplugged')
                        .attr('draggable', 'true')
                        .style('width','100%')
                        .attr("src", `${this.image_unplugged}`)
                        .style('z-index', '2')

        if(this.socketDiv.node() !== undefined && this.socketDiv.node() !== null){
            this.socketDiv.node().addEventListener('drop', event => this.drop(event, this))
        }

        if(this.socketDiv.node() !== undefined && this.socketDiv !== null){
            this.socketDiv.node().addEventListener('dragover', event => this.allowDrop(event, this))
        }

        if(this.plug_pluggedDiv.node() !== undefined && this.plug_pluggedDiv.node() !== null){
            this.plug_pluggedDiv.node().addEventListener('drop', event => this.drop(event, this))
        }

        if(this.plug_pluggedDiv.node() !== undefined && this.plug_pluggedDiv.node() !== null){
            this.plug_pluggedDiv.node().addEventListener('dragover', event => this.allowDrop(event, this))
        }

        if(this.plug_unpluggedDiv.node() !== undefined && this.plug_unpluggedDiv.node() !== null){
            this.plug_unpluggedDiv.node().addEventListener('drop', event => this.drop(event, this))
        }

        if(this.plug_unpluggedDiv.node() !== undefined && this.plug_unpluggedDiv.node() !== null){
            this.plug_unpluggedDiv.node().addEventListener('dragover', event => this.allowDrop(event, this))
        }
        
        /* add listeners to set the images that can be dragged */
        if(this.plug_plugged.node() !== undefined && this.plug_plugged.node() !== null){
            this.plug_plugged.node().addEventListener('dragstart', event => this.drag(event, this) )
        }
        if(this.plug_unplugged.node() !== undefined && this.plug_unplugged.node() !== null){
            this.plug_unplugged.node().addEventListener('dragstart', event => this.drag(event, this))
        }
        
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

        if(state !== undefined && state !== null){
            /* TODO: check if ther is a better way of doing this. */
            // calculate the value with PVSioStateParser and parse it with JSON to get a boolean value
            this.isPlugged = JSON.parse(PVSioStateParser.simpleExpressionParser(this.evaluate(this.displayKey,state)).res.constant)
        }

        if(this.isPlugged){
            this.connectPlug(this.id)
        }else{
            this.deconnectPlug(this.id)
        }

        if(this.evalViz(state)){
            this.reveal()
        }else{
            this.hide()
        }
         
         return this;
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
            this.socket
                .style('display','none')
                .style('z-index','-1')
            this.socketDiv
                .style('z-index','-2')
                .style('display','none')

            this.plug_plugged
                .style('display','block')
                .style('z-index','2')
            this.plug_pluggedDiv
                .style('z-index','1')
                .style('display','block')

            this.plug_unplugged 
                .style('display','none')

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
            this.socket
                .style('display','block')
                .style('z-index','2')
            this.plug_plugged
                .style('display','none')
                .style('z-index','-1')
            this.plug_unplugged
                .style('display','block')
            
            this.socketDiv
                .style('z-index','1')
                .style('display','block')
            this.plug_pluggedDiv
                .style('z-index','-2')
                .style('display','none')
            
    
            /* set as unplugged */
            this.isPlugged = true

            return this
    }

     module.exports = Plug
   }
)