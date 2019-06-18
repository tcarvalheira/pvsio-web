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

        var widgets = {
             pagination: new Pagination('pagination',
                {top: 100,left: 100,width: 400,height: 50},
                {
                    pages: 7, 
                    callback: onMessageReceived,
                    opacity: '0',
                    parent: 'content',
                    displayKey: 'pag_active'
                }),
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
                    visibleWhen: 'isReady=TRUE'
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
                buttonPage1: new ButtonEVO('buttonPage1', 
                {width: 150,height: 50,top: 170,left: 0}, 
                {
                    softLabel: 'Page1',
                    backgroundColor: 'gainsboro',
                    fontColor: 'black',
                    opacity: '0.7',
                    borderRadius: '8px',
                    fontsize: 20,
                    parent: 'content',
                    visibleWhen: 'pag_active=1',
                    callback: onMessageReceived
                }),
                buttonPage2: new ButtonEVO('buttonPage2', 
                {width: 150,height: 50,top: 170,left: 0}, 
                {
                    softLabel: 'Page2',
                    backgroundColor: 'gainsboro',
                    fontColor: 'black',
                    opacity: '0.7',
                    borderRadius: '8px',
                    fontsize: 20,
                    parent: 'content',
                    visibleWhen: 'pag_active=2',
                    callback: onMessageReceived
                }),
                buttonPage3: new ButtonEVO('buttonPage3', 
                {width: 150,height: 50,top: 170,left: 0}, 
                {
                    softLabel: 'Page3',
                    backgroundColor: 'gainsboro',
                    fontColor: 'black',
                    opacity: '0.7',
                    borderRadius: '8px',
                    fontsize: 20,
                    parent: 'content',
                    visibleWhen: 'pag_active=3',
                    callback: onMessageReceived
                }),
                buttonPage4: new ButtonEVO('buttonPage4', 
                {width: 150,height: 50,top: 170,left: 0}, 
                {
                    softLabel: 'Page4',
                    backgroundColor: 'gainsboro',
                    fontColor: 'black',
                    opacity: '0.7',
                    borderRadius: '8px',
                    fontsize: 20,
                    parent: 'content',
                    visibleWhen: 'pag_active=4',
                    callback: onMessageReceived
                }),
                buttonPage5: new ButtonEVO('buttonPage5', 
                {width: 150,height: 50,top: 170,left: 0}, 
                {
                    softLabel: 'Page5',
                    backgroundColor: 'gainsboro',
                    fontColor: 'black',
                    opacity: '0.7',
                    borderRadius: '8px',
                    fontsize: 20,
                    parent: 'content',
                    visibleWhen: 'pag_active=5',
                    callback: onMessageReceived
                }),
                buttonPage6: new ButtonEVO('buttonPage6', 
                {width: 150,height: 50,top: 170,left: 0}, 
                {
                    softLabel: 'Page6',
                    backgroundColor: 'gainsboro',
                    fontColor: 'black',
                    opacity: '0.7',
                    borderRadius: '8px',
                    fontsize: 20,
                    parent: 'content',
                    visibleWhen: 'pag_active=6',
                    callback: onMessageReceived
                }),
                buttonPage7: new ButtonEVO('buttonPage7', 
                {width: 150,height: 50,top: 170,left: 0}, 
                {
                    softLabel: 'Page7',
                    backgroundColor: 'gainsboro',
                    fontColor: 'black',
                    opacity: '0.7',
                    borderRadius: '8px',
                    fontsize: 20,
                    parent: 'content',
                    visibleWhen: 'pag_active=7',
                    callback: onMessageReceived
                })
        };
            
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
        }

        function render(res){
            if(res === undefined){res = {}}
            for(var w in widgets){
                widgets[`${w}`].render(res)
            }
        }

      
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
