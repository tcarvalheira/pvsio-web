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
        "widgets/ButtonActionsQueue",
        "stateParser",
        "PVSioWebClient"
    ], function (
        Pagination,
        Tab,
        Battery,
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

        // Function automatically invoked by PVSio-web when the back-end sends states updates
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
        }

        var widgets = {
            pagination : new Pagination('pagination',
                {
                    top: 100,
                    left: 100,
                    width: 400,
                    height: 50
                },
                {
                    pages: ["Page1", "Page2", "Page3", "Page4","Page5", "Page6", "Page7", "Page8", "Page9", "Page10","Page11", "Page12", "Page13", "Page14"],
                    callback: onMessageReceived,
                    parent: 'pagination'
                }),
            tab: new Tab('nav-tab',
                {
                    top: 300,
                    left: 50,
                    width: 500,
                    height: 50
                },
                {
                    pages: [{id: 'page1', title: 'Page 1'},{id: 'page2', title: 'Page 2'},{id: 'page3', title: 'Page 3'},{id: 'page4', title: 'Page 4'}],
                    type: 'tab',
                    callback: onMessageReceived,
                    parent: 'tabs'
                }),
            pill: new Tab('nav-pill',
                {
                    top: 500,
                    left: 50,
                    width: 800,
                    height: 50
                },
                {
                    pages: [{id: 'page1', title: 'Page 1'},{id: 'page2', title: 'Page 2'},{id: 'page3', title: 'Page 3'},{id: 'page4', title: 'Page 4'}],
                    type: 'pill',
                    callback: onMessageReceived,
                    parent: 'pills'
                }),
            battery: new Battery('battery_indicator',
                {
                    left:400,
                    top:40,
                    width: 50,
                    height: 30
                },
                {
                    fontColor: "green",
                    backgroundColor: "transparent",
                    fontsize: 11,
                    parent: "battery"
                }

            )
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
            setTimeout(() => {
                widgets.battery.setBatteryLevel(8)
            }, 5000)
        }

        $('#PrevBtn').on('click', function (e) {
            let active = widgets.pagination.getActiveIndex()
            if( active !== 1){
                widgets.pagination.setActivePage(active-1)
            }
            
        })
        $('#NextBtn').on('click', function (e) {
            let active = widgets.pagination.getActiveIndex()
            if(active !== 14){
                widgets.pagination.setActivePage(active+1)
            }
        })

        var demoFolder = "waves_examples";
        //register event listener for websocket connection from the client
        client.addListener('WebSocketConnectionOpened', function (e) {
            //start pvs process
            client.getWebSocket()
                .startPVSProcess({name: "main.pvs", demoName: demoFolder + "/pvs"}, function (err, event) {
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
