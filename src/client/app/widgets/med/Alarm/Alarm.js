/**
 * @module Alarm
 * @version 1.0.0
 * @author Tiago Carvalheira
 * @desc This module will allow playing alarms, mute, unmute set volume up and down
 * 
 * @date Mar 21, 2018
 * 
 * @example <caption>Usage of Alarm within a PVSio-web demo.</caption>
 * define(function(require, exports, module){
 *      "use strict";
 * 
 *      //Require the Alarm module
 *         require("widgets/med/Alarm")
 * 
 *      function main(){
 *          let Alarm = new Alarm(
 *              'example', // id of element
 *              {top: 100, left: 100, width: 100, height: 100 }, // coordinates
 *              {
 *                  parent: 'xpto',
 *                  muted: true,
 *                  audio: "alarm/alarm1.wav",
 *                  loop: true,
 *                  volume: 50 // percentage og volume
 *              } // options object
 *          )
 *          // render
 *          Alarm.render()
 *      }
 * })
 */
/*jslint lets: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */

require.config({
    baseUrl: '../../client/app',
    path: {
        jquery: '../lib/jquery.js'
    }
})

/* Alarm definition */
define(function(require, exports, module){
    "use strict"
    let d3 = require("d3/d3")
    let Widget = require("widgets/Widget")
    let StateParser = require("util/PVSioStateParser")
    let property = require("util/property")
    let alarm
    let alarmDiv
    let loop_frequency
    let loop

    /**
     * @function constructor
     * @description Constructor for Alarm widget
     * @param id {String} widget instance id
     * @param coords {Object} coordinates of widget: top, left, with, height 
     *                 Default {top: 100, left: 100, width: 100, height: 100}
     * @param opt {Object} options:
     *          <li>parent (String): HTML element where widget will be appended. Default: alarm</li>
     *          <li>audio (Object): is the location of sound. Could be a location inside server or an external url. Default is /alarms/alarm.mp3</li>
     *          <li>loop (Boolean): set if alarm should play in loop or not. Default is false</li>
     *          <li>loop_frequency (integer): . Default 1000</li>
     *          <li>volume (Float): set alarm volume (0-1). Default 50</li>
     * @memberof module: Alarms
     * @instance
     */
    function Alarm(id, coords, opt) {
        opt = opt || {}
        coords = coords || {}
        opt.parent = opt.parent || "alarm"
        opt.audio = opt.audio || `../../client/app/widgets/med/Alarm/alarms/alarm.mp3`
        opt.loop = opt.loop || false
        this.muted = opt.muted || false
        loop = opt.loop
        loop_frequency = parseInt(opt.loop_frequency) || 1000
        opt.volume = parseInt(opt.volume) || 0.5

        this.parent = (opt.parent) ? (`#${opt.parent}`) : 'alarm'

        this.div = d3.select(this.parent)
                        .style("position", "absolute")
                        .style("top", `${this.top}px`)
                        .style("left", `${this.left}px`)
        alarmDiv = this.div
        this.body = d3.select("body")
        this.div.append("audio")
                .attr("id", "audio")
                .attr("name", "alarm")
                .attr("src", opt.audio)
                .text("Your browser dows not support <code>audio</code> element.")
        

        /** get element by id so that it can be played and muted */
        /* TODO: maybe there is a problem with ids if i set more than one widget */
        alarm = document.getElementById("audio")
        alarm.volume=opt.volume

        /* check muted attribute and mute alarm if setted to true */
        if(this.muted === true){
            this.mute()
        }
        

        Widget.call(this, id, coords, opt)
        return this
    }

    Alarm.prototype = Object.create(Widget.prototype);
    Alarm.prototype.constructor = Alarm;
    Alarm.prototype.parentClass = Widget.prototype;

    /**
     * @function hide
     * @description This method will hide the widget.
     * @memberof module:Alarm
     * @instance
     */
    Alarm.prototype.hide = () =>{
        alarmDiv.style("visibility", "hidden")
        return this
    }

     /**
      * @function reveal
      * @description This methor will show the widget
      * @memberof module:Alarm
      * @instance
      */
     Alarm.prototype.reveal = () =>{
        alarmDiv.style("visibility", "visible")
        return this
    }

    /**
     * @function play
     * @description this will play alarm when it is called. Plays in loop or only one time based on configuration
     * @param
     * @memberof module:Alarm
     * @instance 
     */
    Alarm.prototype.play = () => {
        if(loop){
            setInterval(() => {
                if(!alarm.mute){
                    alarm.play()                
                }
            },loop_frequency);    
        }else{
            alarm.play()
        }
        return this
    }

    /**
     * @function <a name="isPaused">isPaused</a>
     * @description returns if sound is paused or not
     * @return this
     * @memberof module:Alarm
     * @instance
     */
    Alarm.prototype.isPaused = () => {
        return alarm.paused
    }

    /**
     * @function <a name="pause">pause</a>
     * @description pause sound
     * @memberof module:Alarm
     * @instance
     */
    Alarm.prototype.pause = () => {
        alarm.pause()
        return this
    }

    /**
     * @function <a name="setVolume">setVolume</a>
     * @description set sound volume
     * @param volume (float) value beetween 0 and 1. Default is 0.5
     * @memberof module:Alarm
     * @instance
     */
    Alarm.prototype.setVolume = (volume) => {
        volume = parseInt(volume) || 0.5
        alarm.volume = volume
        return this
    }

    /**
     * @function <a name="volumeUp">volumeUp</a>
     * @description increase volume by <value>
     * @param value (Float) amount to increase. Default is 0.1
     * @memberof module:Alarm
     * @instance
     */
    Alarm.prototype.volumeUp = (value) => {
        value = parseFloat(value) || 0.1
        if(alarm.volume + value <= 1){
            alarm.volume += value
        }
        return this
    }

    /**
     * @function <a name="volumeDown">volumeDown</a>
     * @description decrease volume by <value>
     * @param value (Float) amount to decrease. Default is 0.1
     * @memberof module:Alarm
     * @instance
     */
    Alarm.prototype.volumeDown = (value) => {
        value = parseFloat(value) || 0.1
        if(alarm.volume - value >= 0){
            alarm.volume -= value
        }
        return
    }

    /**
     * @function mute
     * @description This method mutes the alarm, making every sound not audible
     * @memberof module:Alarm
     * @instance
     */
    Alarm.prototype.mute = () => {
        audio.mute = true
        return this
    }

    /**
     * @function isMuted
     * @description return true if sound is or isn't muted.
     * @param
     * @memberof module:Alarm
     * @return Boolean
     * @instance
     */
    Alarm.prototype.isMuted = () => {
        return audio.mute || false
    }

    	/**
        * @function <a name="toggle">toggle</a>
        * @description Toggle on or off the alarm
        * @memberof module:Alarm
        * @instance
        */
        Alarm.prototype.toggle = function () {
        if(this.isMuted()){
            this.unmute()
        }else{
            this.mute()
        }
    } 

    /**
     * @function unmute
     * @description This method unmutes the alarm making the sound audible again.
     * @memberof module:Alarm
     * @instance
     */
    Alarm.prototype.unmute = () => {
        audio.mute = false
        return this
    }

    /**
     * @function render
     * @description Render method for the Alarm widget
     * @memberof module:Alarm
     * @instance
     */
    Alarm.prototype.render = () => {
        return Alarm.prototype.reveal()
    }

    module.exports = Alarm;
})