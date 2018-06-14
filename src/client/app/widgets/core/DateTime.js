/**
 * @module DateTime
 * @version 1.0
 * @description Renders a digital display for rendering text.
 *              This module provide APIs for setting up the visual appearance of the widget, e.g., font size and color.
 * @author Tiago Carvalheira
 * @date 2018/06/13
 *
 * @example <caption>Example use of the widget.</caption>
 // Example pvsio-web demo that uses DateTime
 // The following configuration assumes the pvsio-web demo is stored in a folder within pvsio-web/examples/demo/
 require.config({
     baseUrl: "../../client/app",
     paths: { d3: "../lib/d3", text: "../lib/text" }
 });
 require(["widgets/core/DateTime"], function (DateTime) {
      "use strict";
      var disp = new DateTime('datatime',
                {
                    left: 200,
                    top: 42,
                    width: 240,
                    height: 40
                },
                {
                        parent: "topline_display",
                        fontColor: 'white',
                        useCurrentDateTime: true,
                        fontFamilly: 'sans-serif',
                        dateFontSize: '12',
                        timeFontSize: '16',
                        relativePosition: 'vertical',
                        relativeOrder: 'time-date',
                        locale: 'en-US',
                        dateFormat: { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', timeZoneName:'short'},
                        timeFormat: { hour12: true, hour:'numeric', minute: 'numeric'},
                        showDate: true,
                        showTime: true
                })
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
     * @function <a name="DateTime">DateTime</a>
     * @description Constructor.
     * @param id {String} The ID of the touchscreen button.
     * @param coords {Object} The four coordinates (top, left, width, height) of the display, specifying
     *        the left, top corner, and the width and height of the (rectangular) widget area.
     *        Default is { top: 0, left: 0, width: 32, height: 20 }.
     * @param {Object} opt 
     * @param {String} [opt.backgroundColor='transparent'] widget background color
     * @param {String} [opt.cursor='default']
     * @param {String} [opt.overflow='hidden']
     * @param {Boolean} [opt.shoDate=true] Whether if date should be shown or not
     * @param {Boolean} [opt.showTime=true] Whether if time should be shown or not
     * @param {Boolean} [useCurrentDateTime=true] If setted to true, widget will handle date and time changed every second. If set to false, date and time should be setted based on PVS model on callback function
     * @param {String} [locale='en-US'] sets the date and time locale
     * @param {Object} [opt.dateFormat={}] Date format. These are the date format options on JavaScript, for example:
     * @param {String} [opt.dateFormat.weekday]
     * @param {String} [opt.dateFormat.year]
     * @param {String} [opt.dateFormat.month]
     * @param {String} [opt.dateFormat.day]
     * @param {String} [opt.dateFormat.timeZoneName]
     * @param {Object} [opt.timeFormat={}] Date format. These are the date format options on JavaScript, for example:
     * @param {Boolean} [opt.timeFormat.hour12] Whether to show 12 based hour or 24 based hour
     * @param {String} [opt.timeFormat.hour]
     * @param {String} [opt.timeFormat.minute]
     * @param {String} [opt.timeFormat.second]
     * @param {'vertical' | 'horizontal'} [relativePosition='vertical'] Whether date and time should be placed vertically or horizontally realtive to each other
     * @param {'date-time' | 'time-date'} [relativeOrder='date-time'] Sets the relative order to show the date and time. If it is set to date-time, date is shown first, above or on leftmost depending on relativePosition is set to vertical or horizontal.
     * @memberof module:DateTime
     * @instance
     */
    function DateTime(id, coords, opt) {
        coords = coords || {};
        opt = this.normaliseOptions(opt);
        // set widget type & display key
        this.type = this.type || "DateTime";
        this.displayKey = (typeof opt.displayKey === "string") ? opt.displayKey : id;

        // override default style options of WidgetEVO as necessary before creating the DOM element with the constructor of module WidgetEVO


        /* OPTIONS */
        this.id = id
        this.coords = coords
        this.opt = opt
        this.opt.backgroundColor = opt.backgroundColor || "transparent";
        this.opt.cursor = opt.cursor || "default";
        this.opt.overflow = "hidden";
        this.opt.showDate = opt.showDate !== undefined ? opt.showDate : true
        this.opt.showTime = opt.showTime !== undefined ? opt.showTime : true
        this.opt.useCurrentDateTime = opt.useCurrentDateTime !== undefined ? opt.useCurrentDateTime : true
        this.opt.locale = opt.locale || 'en-US'
        this.opt.dateFormat = opt.dateFormat || {} // { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', timeZoneName: 'short'}
        this.opt.timeFormat = opt.timeFormat || {}
        this.opt.dateFontSize = opt.dateFontSize || '20'
        this.opt.timeFontSize = opt.timeFontSize || '14'
        this.opt.relativePosition = opt.relativePosition || 'vertical' //vertical || horaizontal
        this.opt.relativeOrder = opt.relativeOrder || 'date-time' // date-time || time-date 

        this.currentDate = new Date()

        this.parent = (opt.parent) ? (`#${opt.parent}`) : 'body'
        this.div = d3.select(this.parent)
            .append('div')
            .attr('id', this.id)

        /* set specific opt and coords for the date and time */
        let dateOpt = Object.assign({}, opt); // copy object without reference
        let timeOpt = Object.assign({}, opt);
        let dateCoords = Object.assign({}, coords)
        let timeCoords = Object.assign({}, coords)
        dateOpt.parent = this.id
        dateOpt.fontSize = this.opt.dateFontSize
        timeOpt.parent = this.id
        timeOpt.fontSize = this.opt.timeFontSize
        /* calculate positions of the two widgets */
        if (this.opt.relativePosition === 'horizontal') {
            // the elements should be horizontally positioned
            timeCoords.width = this.coords.width / 2
            dateCoords.width = this.coords.width / 2
            if (this.opt.relativeOrder === 'date-time') {
                timeCoords.left = this.coords.left + dateCoords.width
            } else {
                dateCoords.left = this.coords.left + timeCoords.width
            }
        } else {
            // the element should be vertically positioned
            timeCoords.height = this.coords.height / 2
            dateCoords.height = this.coords.height / 2
            if (this.opt.relativeOrder === 'date-time') {
                timeCoords.top = this.coords.top + dateCoords.height
            } else {
                dateCoords.top = this.coords.top + timeCoords.height
            }
        }
        /* date and time displays */
        this.date = new BasicDisplayEVO('date',
            dateCoords,
            dateOpt)
        this.time = new BasicDisplayEVO('time',
            timeCoords,
            timeOpt)

        if (this.opt.useCurrentDateTime) {
            setInterval(() => {
                this.setDateInternal(this)
                //this.render()
            }, 1000)
        }

        // invoke WidgetEVO constructor to create the widget
        WidgetEVO.apply(this, [id, coords, opt]);
        return this;
    }
    DateTime.prototype = Object.create(WidgetEVO.prototype);
    DateTime.prototype.parentClass = WidgetEVO.prototype;
    DateTime.prototype.constructor = DateTime;

    /**
     * @function <a name="render">render</a>
     * @description Rendering function for button widgets.
     * @param {Object} state JSON object with the current value of the state attributes of the modelled system
     * @param {Object} opt 
     * @memberof module:DateTime
     * @instance
     */
    DateTime.prototype.render = function (state, opt) {
        // set style
        opt = this.normaliseOptions(opt);

        this.setStyle(opt);

        // render content
        if (this.opt.showDate) {
            this.date.render(this.getDateString())
        } else {
            this.date.hide()
        }

        if (this.opt.showTime) {
            this.time.render(this.getTimeString())
        } else {
            this.time.hide()
        }


        this.reveal();
        return this;
    }

	/**
    * @function <a name="getDateString">getDateString</a>
    * @description a string representation of the current date of the widget
    * @return {String} 
    * @memberof module:DateTime
    * @instance
    */
    DateTime.prototype.getDateString = function () {
        let dateStr = this.currentDate.toLocaleDateString(this.opt.locale, this.opt.dateFormat)
        return dateStr
    }

    /**
    * @function <a name="getTimeString">getTimeString</a>
    * @description get a string representation of the current time of the widget
    * @return {String} 
    * @memberof module:DateTime
    * @instance
    */
    DateTime.prototype.getTimeString = function () {
        let timeStr = this.currentDate.toLocaleTimeString(this.opt.locale, this.opt.timeFormat)

        return timeStr
    }

    /**
     * @protected
    * @function <a name="setDate">setDate</a>
    * @description Auxiliary method to set the widget date inside interval functions which does not have access to this
    * @param {Object} obj widget object (this)
    * @param {String} [date] Date string representing desired date and time. Ex. 
    * @return self objet for chained calls
    * @memberof module:DateTime
    * @instance
    */
    DateTime.prototype.setDateInternal = function (obj, date) {
        if (obj.opt.useCurrentDateTime) {
            obj.currentDate = new Date()
        } else {
            obj.currentDate = new Date(date);
        }
        return obj.render()
    }
    /**
    * @function <a name="setDate">setDate</a>
    * @description Set widget date. It will update date and rerender widget with the new date
    * @param {String} date A date string representing desired date for the widget
    * @return self object to chained calls
    * @memberof module:DateTime
    * @instance
    */
    DateTime.prototype.setDate = function (date) {
        this.setDateInternal(this, date)
        return this
    }

    module.exports = DateTime
}

)