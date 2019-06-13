/**
 * Waves widget demo page
 *
 * @author Tiago Carvalheira
 * @date 12/03/2018
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
require.config({
    baseUrl: '../../client/app',
    paths: {
        d3: '../lib/d3',
        'pvsioweb': 'plugins/prototypebuilder',
        'imagemapper': '../lib/imagemapper',
        'text': '../lib/text',
        'lib': '../lib',
        'cm': '../lib/cm',
        stateParser: './util/PVSioStateParser'
    }
});

require([
    'widgets/container/Pagination',
    'widgets/container/Tab',
    'widgets/core/Battery',
    'widgets/core/DateTime',
    'widgets/core/ButtonEVO',
    'widgets/ButtonActionsQueue',
    'stateParser',
    'PVSioWebClient'
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
        'use strict';
        var client = PVSioWebClient.getInstance();
        var tick;
        function start_tick() {
            if (!tick) {
                tick = setInterval(function () {
                    ButtonActionsQueue.getInstance().queueGUIAction('tick', onMessageReceived);
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
            if (str.indexOf('/') >= 0) {
                var args = str.split('/');
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
                if (res.indexOf('(#') === 0) {
                    render(stateParser.parse(res));
                }
            } else {
                console.log(err);
            }
        } */

/* 
        // create buttons to put inside each array
        let edit_basal_profiles = new ButtonEVO('edit_basal_profiles', {
            width: 472,
            height: 50,
            top: 0,
            left: 0
        }, {
            softLabel: 'Edit Basal Profiles',
            backgroundColor: 'indigo',
            opacity: '0.9',
            borderRadius: '8px',
            fontsize: 20,
            parent: 'giip-basal_mgm',
            callback: onMessageReceived
        });
        let activate_basal_profiles = new ButtonEVO('activate_basal_profiles', {
            width: 472,
            height: 50,
            top: 70,
            left: 0
        }, {
            softLabel: 'Activate Basal Profiles',
            backgroundColor: 'indigo',
            opacity: '0.85',
            borderRadius: '8px',
            fontsize: 20,
            parent: 'giip-basal_mgm',
            callback: onMessageReceived
        });
        let manage_temporary_basal = new ButtonEVO('manage_temporary_basal', {
            width: 472,
            height: 50,
            top: 140,
            left: 0
        }, {
            softLabel: 'Manage Temporary Basal',
            backgroundColor: 'indigo',
            opacity: '0.8',
            borderRadius: '8px',
            fontsize: 20,
            parent: 'giip-basal_mgm',
            callback: onMessageReceived
        });

        // bolus profile screen
        let edit_food_database = new ButtonEVO('edit_food_database', {
            width: 472,
            height: 50,
            top: 0,
            left: 0
        }, {
            softLabel: 'Edit Food Database',
            backgroundColor: 'seagreen',
            opacity: '0.9',
            borderRadius: '8px',
            fontsize: 20,
            parent: 'giip-bolus_mgm',
            callback: onMessageReceived
        });
        let start_bolus = new ButtonEVO('start_bolus', {
            width: 472,
            height: 120,
            top: 70,
            left: 0
        }, {
            softLabel: 'Start Bolus',
            backgroundColor: 'seagreen',
            opacity: '0.9',
            borderRadius: '8px',
            fontsize: 20,
            parent: 'giip-bolus_mgm',
            callback: onMessageReceived
        });

        // pump configuration screen
        let set_time = new ButtonEVO('set_time', {
            width: 472,
            height: 50,
            top: 0,
            left: 0
        }, {
            softLabel: 'Set Time',
            backgroundColor: 'slategray',
            opacity: '0.9',
            borderRadius: '8px',
            fontsize: 20,
            parent: 'giip-config',
            callback: onMessageReceived
        }); */

        var widgets = {
/*             pagination: new Pagination('pagination',
                {top: 100,left: 100,width: 400,height: 50},
                {
                    pages: ['Page1', 'Page2', 'Page3', 'Page4', 'Page5', 'Page6', 'Page7', 'Page8', 'Page9', 'Page10', 'Page11', 'Page12', 'Page13', 'Page14'],
                    callback: onMessageReceived,
                    parent: 'content'
                }),*/
            tab: new Tab('nav_tab',
                {top: 300,left: 50,width: 500,height: 50},
                {
                    parent: 'content',
                    pages: [{ id: 'battery', title: 'Battery level', state: 'BATTERY' }, 
                            { id: 'date', title: 'Date', state: 'DATE' }, 
                            { id: 'ok', title: 'Ok, go on!', state: 'OK' }, 
                            { id: 'cancel', title: 'Cancel that!!', state: 'CANCEL' }],
                    type: 'tab',
                    opacity: '0',
                    callback: onMessageReceived,
                    displayKey: 'modeTab',
                    visibleWhen: 'isReady=TRUE'
                }),
             pill: new Tab('nav_pill',
                {top: 500,left: 50,width: 800,height: 50},
                {
                    parent: 'content',
                    pages: [{ id: 'battery', title: 'Battery level', state: 'BATTERY' }, 
                            { id: 'date', title: 'Date', state: 'DATE' }, 
                            { id: 'ok', title: 'Ok, go on!', state: 'OK' }, 
                            { id: 'cancel', title: 'Cancel that!!', state: 'CANCEL' }],
                    type: 'pill',
                    opacity: '0',
                    callback: onMessageReceived,
                    displayKey: 'mode',
                    visibleWhen: 'isReady=FALSE'
                }),
            battery: new Battery('battery_indicator',
                {left: 0,top: 0,width: 40,height: 40},
                {
                    parent: 'nav_pill_battery_pane',
                    fontColor: '#0000FF',
                    backgroundColor: 'transparent',
                    textFontSize: 10,
                    displayKey: 'battery_level',
                    show_icon: true,
                    show_text: true,
                    //iconFontSize: '20'
                }

            ),
            date: new DateTime('datatime',
                {left: 0,top: 0,width: 200,height: 40},
                {
                    parent: 'nav_pill_date_pane',
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
                }),
            buttonOk: new ButtonEVO('buttonOK', 
                {width: 50,height: 50,top: 0,left: 0}, 
                {
                    softLabel: 'OK',
                    backgroundColor: 'gainsboro',
                    fontColor: 'black',
                    opacity: '0.7',
                    borderRadius: '8px',
                    fontsize: 20,
                    parent: 'nav_pill_ok_pane',
                    callback: onMessageReceived
                }),
            buttonCancel: new ButtonEVO('buttonCancel', 
                {width: 472,height: 50,top: 0,left: 0}, 
                {
                    softLabel: 'Cancel',
                    backgroundColor: 'gainsboro',
                    fontColor: 'black',
                    opacity: '0.7',
                    borderRadius: '8px',
                    fontsize: 20,
                    parent: 'nav_pill_cancel_pane',
                    callback: onMessageReceived
                }),
            buttonBatteryTab: new ButtonEVO('buttonBatteryTab', 
                {width: 150,height: 50,top: 0,left: 0}, 
                {
                    softLabel: 'Battery',
                    backgroundColor: 'gainsboro',
                    fontColor: 'black',
                    opacity: '0.7',
                    borderRadius: '8px',
                    fontsize: 20,
                    parent: 'nav_tab_battery_pane',
                    callback: onMessageReceived
                }),
            buttonDateTab: new ButtonEVO('buttonDateTab', 
                {width: 150,height: 50,top: 0,left: 0}, 
                {
                    softLabel: 'Date',
                    backgroundColor: 'gainsboro',
                    fontColor: 'black',
                    opacity: '0.7',
                    borderRadius: '8px',
                    fontsize: 20,
                    parent: 'nav_tab_date_pane',
                    callback: onMessageReceived
                }),
                buttonOkTab: new ButtonEVO('buttonOkTab', 
                {width: 150,height: 50,top: 0,left: 0}, 
                {
                    softLabel: 'Roger that!',
                    backgroundColor: 'gainsboro',
                    fontColor: 'black',
                    opacity: '0.7',
                    borderRadius: '8px',
                    fontsize: 20,
                    parent: 'nav_tab_ok_pane',
                    callback: onMessageReceived
                }),
                buttonCancelTab: new ButtonEVO('buttonCancelTab', 
                {width: 150,height: 50,top: 0,left: 0}, 
                {
                    softLabel: 'Cancel',
                    backgroundColor: 'gainsboro',
                    fontColor: 'black',
                    opacity: '0.7',
                    borderRadius: '8px',
                    fontsize: 20,
                    parent: 'nav_tab_cancel_pane',
                    callback: onMessageReceived
                }),
        };
            
        function onMessageReceived(err, event) {
            if (!err) {
                // get new state
                client.getWebSocket().lastState(event.data);
                // parse and render new state
                var res = event.data.toString();
                if (res.indexOf('(#') === 0) {
                    render(stateParser.parse(res));
                    //    console.log(res.replace(/\s\s+/g, ' '));
                }
            } else {
                console.log(err);
            }
        }


        function render(res){
            if(res === undefined){res = {}}
            for(var w in widgets){
                widgets[`${w}`].render(res)
            }
        }

        // Render widgets
        /* function render(res) {
            widgets.pagination.render()
            widgets.tab.render()
            widgets.pill.render() */
            /* setTimeout(() => {
                // console.log(`Set new TAB`)
                widgets.tab.setActiveTab('page2')
                widgets.pill.setActiveTab('page3')
            }, 5000) */
            /* widgets.battery.render();
            widgets.date.render();
            setTimeout(() => { */
                /* widgets.battery.setBatteryLevel(8) */
                //widgets.date.setDate('2018/06/05 15:24:20')
                //widgets.battery.hideText()
                //widgets.battery.hideIcon()
          /*   }, 5000)
        } */

        /* $('#PrevBtn').on('click', function (e) {
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
        }) */

        var demoFolder = 'containers';
        //register event listener for websocket connection from the client
        client.addListener('WebSocketConnectionOpened', function (e) {
            //start pvs process
            console.log("web socket opened");
            client.getWebSocket()
                .startPVSProcess({ name: 'main.pvs', demoName: demoFolder + '/pvs' }, function (err, event) {
                    client.getWebSocket().sendGuiAction('init;', onMessageReceived);
                    d3.select('.demo-splash').style('display', 'none');
                    d3.select('#content').style('display', 'block');
                });
        }).addListener('WebSocketConnectionClosed', function (e) {
            console.log("web socket closed");
        }).addListener('processExited', function (e) {
            var msg = 'Warning!!!\r\nServer process exited. See console for details.';
        });
        client.connectToServer();
    });
