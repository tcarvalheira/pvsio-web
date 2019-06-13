/**
 * Waves widget demo page
 *
 * @author Tiago Carvalheira
 * @date 12/03/2018
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
require.config({
    baseUrl: "../../client/app",
    paths: {
        d3: "../lib/d3",
        "pvsioweb": "plugins/prototypebuilder",
        "imagemapper": "../lib/imagemapper",
        "text": "../lib/text",
        "lib": "../lib",
        "cm": "../lib/cm",
        stateParser: './util/PVSioStateParser'
    }
});

require([
    "widgets/container/Pagination",
    "widgets/container/Tab",
    "widgets/core/Battery",
    "widgets/core/DateTime",
    "widgets/core/ButtonEVO",
    "widgets/ButtonActionsQueue",
    "stateParser",
    "PVSioWebClient"
], function (
    Pagination,
    Tab,
    Battery,
    DateTime,
    ButtonEVO,
    ButtonActionsQueue,
    stateParser,
    PVSioWebClient
) {
        "use strict";
        var client = PVSioWebClient.getInstance();
        var tick;
        function start_tick() {
            if (!tick) {
                tick = setInterval(function () {
                    ButtonActionsQueue.getInstance().queueGUIAction("tick", onMessageReceived);
                }, 1000);
            }
        }
        function stop_tick() {
            if (tick) {
                clearInterval(tick);
                tick = null;
            }
        }
        function evaluate(str) {
            var v = +str;
            if (str.indexOf("/") >= 0) {
                var args = str.split("/");
                v = +args[0] / +args[1];
            }
            var ans = (v < 100) ? v.toFixed(1).toString() : v.toFixed(0).toString();
            return parseFloat(ans);
        }

        /* // Function automatically invoked by PVSio-web when the back-end sends states updates
        function onMessageReceived(err, event) {
            if (!err) {
                // get new state
                client.getWebSocket().lastState(event.data);
                // parse and render new state
                var res = event.data.toString();
                if (res.indexOf("(#") === 0) {
                    render(stateParser.parse(res));
                }
            } else {
                console.log(err);
            }
        } */

/* 
        // create buttons to put inside each array
        let edit_basal_profiles = new ButtonEVO("edit_basal_profiles", {
            width: 472,
            height: 50,
            top: 0,
            left: 0
        }, {
            softLabel: "Edit Basal Profiles",
            backgroundColor: "indigo",
            opacity: "0.9",
            borderRadius: "8px",
            fontsize: 20,
            parent: "giip-basal_mgm",
            callback: onMessageReceived
        });
        let activate_basal_profiles = new ButtonEVO("activate_basal_profiles", {
            width: 472,
            height: 50,
            top: 70,
            left: 0
        }, {
            softLabel: "Activate Basal Profiles",
            backgroundColor: "indigo",
            opacity: "0.85",
            borderRadius: "8px",
            fontsize: 20,
            parent: "giip-basal_mgm",
            callback: onMessageReceived
        });
        let manage_temporary_basal = new ButtonEVO("manage_temporary_basal", {
            width: 472,
            height: 50,
            top: 140,
            left: 0
        }, {
            softLabel: "Manage Temporary Basal",
            backgroundColor: "indigo",
            opacity: "0.8",
            borderRadius: "8px",
            fontsize: 20,
            parent: "giip-basal_mgm",
            callback: onMessageReceived
        });

        // bolus profile screen
        let edit_food_database = new ButtonEVO("edit_food_database", {
            width: 472,
            height: 50,
            top: 0,
            left: 0
        }, {
            softLabel: "Edit Food Database",
            backgroundColor: "seagreen",
            opacity: "0.9",
            borderRadius: "8px",
            fontsize: 20,
            parent: "giip-bolus_mgm",
            callback: onMessageReceived
        });
        let start_bolus = new ButtonEVO("start_bolus", {
            width: 472,
            height: 120,
            top: 70,
            left: 0
        }, {
            softLabel: "Start Bolus",
            backgroundColor: "seagreen",
            opacity: "0.9",
            borderRadius: "8px",
            fontsize: 20,
            parent: "giip-bolus_mgm",
            callback: onMessageReceived
        });

        // pump configuration screen
        let set_time = new ButtonEVO("set_time", {
            width: 472,
            height: 50,
            top: 0,
            left: 0
        }, {
            softLabel: "Set Time",
            backgroundColor: "slategray",
            opacity: "0.9",
            borderRadius: "8px",
            fontsize: 20,
            parent: "giip-config",
            callback: onMessageReceived
        }); */

        var widgets = {
            pagination: new Pagination('pagination',
                {
                    top: 100,
                    left: 100,
                    width: 400,
                    height: 50
                },
                {
                    pages: ["Page1", "Page2", "Page3", "Page4", "Page5", "Page6", "Page7", "Page8", "Page9", "Page10", "Page11", "Page12", "Page13", "Page14"],
                    /* set an array of arrays of objects */
                    //page_array: [giit_config, giip_bolus_mgm, giip_basal_mgm],
                    /* pages: [{name: 'giip-config' , title: 'Configuration', items: [edit_basal_profiles, activate_basal_profiles, manage_temporary_basal]},
                                {name: 'giip-bolus_mgm', title: 'Bolus management', items: [edit_food_database, start_bolus]},
                                {name: 'giip-basal_mgm', title: 'Basal Management', items: [set_time]}], */
                    callback: onMessageReceived,
                    parent: 'content'
                }),
            tab: new Tab('nav-tab',
                {
                    top: 300,
                    left: 50,
                    width: 500,
                    height: 50
                },
                {
                    parent: 'content',
                    pages: [{ id: 'page1', title: 'Page 1' }, { id: 'page2', title: 'Page 2' }, { id: 'page3', title: 'Page 3' }, { id: 'page4', title: 'Page 4' }],
                    type: 'tab',
                    callback: onMessageReceived,
                    opacity: "0",
                }),
            pill: new Tab('nav-pill',
                {
                    top: 500,
                    left: 50,
                    width: 800,
                    height: 50
                },
                {
                    pages: [{ id: 'page1', title: 'Page 1' }, { id: 'page2', title: 'Page 2' }, { id: 'page3', title: 'Page 3' }, { id: 'page4', title: 'Page 4' }],
                    type: 'pill',
                    opacity: "0",
                    callback: onMessageReceived,
                    parent: 'content'
                }),
            battery: new Battery('battery_indicator',
                {
                    left: 400,
                    top: 40,
                    width: 50,
                    height: 30
                },
                {
                    fontColor: "#00FFFF",
                    backgroundColor: "transparent",
                    fontsize: 11,
                    parent: "content",
                    battery_level: 80,
                    show_icon: true,
                    show_text: true,
                    //iconFontSize: '20'
                }

            ),
            date: new DateTime('datatime',
                {
                    left: 600,
                    top: 40,
                    width: 200,
                    height: 40
                },
                {
                    parent: 'content',
                    fontColor: 'DodgerBlue',
                    useCurrentDateTime: true,
                    dateFontSize: '14',
                    timeFontSize: '20',
                    relativePosition: 'vertical',
                    relativeOrder: 'time-date',
                    locale: 'en-US',
                    dateFormat: { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', timeZoneName: 'short' },
                    timeFormat: { hour12: true, hour: 'numeric', minute: 'numeric' },
                    showDate: true,
                    showTime: true
                })
        };

        function onMessageReceived(err, event) {
            if (!err) {
                // get new state
                client.getWebSocket().lastState(event.data);
                // parse and render new state
                var res = event.data.toString();
                if (res.indexOf("(#") === 0) {
                    render(stateParser.parse(res));
                    //    console.log(res.replace(/\s\s+/g, ' '));
                }
            } else {
                console.log(err);
            }
        }

        // Render widgets
        function render(res) {
            widgets.pagination.render()
            widgets.tab.render()
            widgets.pill.render()
            /* setTimeout(() => {
                // console.log(`Set new TAB`)
                widgets.tab.setActiveTab('page2')
                widgets.pill.setActiveTab('page3')
            }, 5000) */
            widgets.battery.render();
            widgets.date.render();
            setTimeout(() => {
                widgets.battery.setBatteryLevel(8)
                //widgets.date.setDate('2018/06/05 15:24:20')
                //widgets.battery.hideText()
                //widgets.battery.hideIcon()
            }, 5000)
        }

        $('#PrevBtn').on('click', function (e) {
            let active = widgets.pagination.getActiveIndex()
            if (active !== 1) {
                widgets.pagination.setActivePage(active - 1)
            }

        })
        $('#NextBtn').on('click', function (e) {
            let active = widgets.pagination.getActiveIndex()
            if (active !== 14) {
                widgets.pagination.setActivePage(active + 1)
            }
        })

        var demoFolder = "waves_examples";
        //register event listener for websocket connection from the client
        client.addListener('WebSocketConnectionOpened', function (e) {
            //start pvs process
            client.getWebSocket()
                .startPVSProcess({ name: "main.pvs", demoName: demoFolder + "/pvs" }, function (err, event) {
                    client.getWebSocket().sendGuiAction("init(0);", onMessageReceived);
                    d3.select(".demo-splash").style("display", "none");
                    d3.select("#content").style("display", "block");
                    // start the simulation
                    //start_tick();
                });
        }).addListener("WebSocketConnectionClosed", function (e) {

        }).addListener("processExited", function (e) {
            var msg = "Warning!!!\r\nServer process exited. See console for details.";
        });
        client.connectToServer();
        render("1");
    });
