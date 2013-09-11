/*
    © barosofts, César & Rodrigue Villetard, 2013

    This file is part of FoxyMPD.

    FoxyMPD is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    any later version.

    FoxyMPD is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with FoxyMPD.  If not, see <http://www.gnu.org/licenses/>.
*/
define([
    'jquery',
    'underscore',
    'backbone',

    'libs/mpd',

    'appmanager',

    'collections/mpdconnections',
    'collections/settings',
    'models/settings',

    //plugins
    'backbone.subroute'

], function($,_,Backbone,MPD,AppManager,MPDConnectionCollection,SettingsCollection,SettingsModel) {


    var noMPDCONNECTION=false;
    var registry={
            collections:{},
            user:null,
            dbs:{},
            app_ticker:null //
    };

    var toolbarView={};
    var headerView={};



    var initSettings = function() {

            var dfd = $.Deferred();

            coll = new SettingsCollection();
            coll.fetch({
               success:function(data)  {

                    if(data.size()===0) {
                       
                       model = new SettingsModel({noLock:true,'test':'test'});
                       coll.add(model);
                       model.save();
                    
                    } else {

                        model=data.last();
                        
                    }

                    registry.settings=model;
                    dfd.resolve();

                }
            });

            return dfd.promise();
    };


    var onLineEL = $('section[role=network-status]');
    var networkStatusEl = $('section[role=network-status]').children('.network');
    var mpdStatusEl = onLineEL.children('.mpd'); 

    networkStatusEl.text('no network connection');

    var updateOnlineStatus = function (event) {

        var condition = navigator.onLine ? "online" : "offline";

        if(condition==='offline') {
            networkStatusEl.show();
        } else {
            networkStatusEl.hide();
        }
    };



    /**
     * turn off locking screen and mpd connection when the app is not visible 
     */
    var visibilityAction=function() {
        var prom,lock=null;

        switch(document.visibilityState) {

            case "hidden":

                if(registry.settings.get('noLock')===true) {
                    if(lock) lock.unlock();
                }

                prom = registry.mpd.close();
                break;

            case "visible":
            default:

                if(registry.settings.get('noLock')===true) {
                    lock = window.navigator.requestWakeLock('screen');
                }

                if(!registry.mpd.connect_infos.length) break;

                prom=registry.mpd.connect();

                prom.fail(function(e) {
                    console.warn("visible error: ",e);
                });

                break;

        }

    };

    var updateMPDStatusButton=function() {
        var errtext = (!noMPDCONNECTION) ?'mpd connection error, press to retry':'no mpd connection, press to add one' ;


        mpdStatusEl.text(errtext);
        mpdStatusEl.unbind('click');

        mpdStatusEl.click(function() {

            if(noMPDCONNECTION===true) registry.app_router.navigate('connections/add',{trigger:true});
            else registry.mpd.connect(); 

        });


    };

    var initialize=function() {



        var dfd= $.Deferred();


        registry.mpd=new MPD();

        registry.event_manager = {};
        _.extend(registry.event_manager,Backbone.Events);



        updateMPDStatusButton();


        registry.mpd.on('mpd_error',function(data) {
            alert("mpd error:\n"+data+i);
        });

        registry.mpd.on('close',function() {
                                        clearInterval(registry.app_ticker);
                                        updateMPDStatusButton();
                                        mpdStatusEl.show();
                            });

        registry.mpd.on('open',function() {
                            registry.mpd.run();
                            mpdStatusEl.text('connected').fadeOut(800);
                            registry.app_ticker = setInterval(function() {
                                registry.event_manager.trigger('tick');
                            },1000);
                });


        document.addEventListener("visibilitychange",function() {
            visibilityAction();
        });
  

        updateOnlineStatus();
        document.addEventListener('online',  updateOnlineStatus);
        document.addEventListener('offline', updateOnlineStatus);


        var conn = mpdconnect();
        var setts = initSettings();


        var needs = 2,iter=0;

        var check = function() {
            iter++;
            if(iter===needs) {
                dfd.resolve();
            }
            
        };
        conn.done(function() {
            check();
        });

        setts.done(function() {
            check();
            visibilityAction();
        });

        conn.fail(function() {
            dfd.reject();
        });


        return dfd.promise();
        

    };

    var mpdconnect=function(model) {

        var dfd = $.Deferred();
        var promise = dfd.promise();
        var mpd=registry.mpd;


        var doConnect = function (model,promise) {

                if(!model) {
                    dfd.reject();
                    return promise;
                }


                mpd.once('open',function() {
                    mpd.stats().done(function(result) {
                        var stats=result.data;
                        model.set('stats',stats);
                        model.set('last_connection',new Date().getTime());
                        model.save();
                    });
                });
                mpd.setConnectInfos(model.attributes);
                mpd.connect();
                dfd.resolve();

                return promise;

        };


        if(typeof(model) === "object" ) return doConnect(model,promise);
        

        if(typeof TCPSocket === 'undefined' && typeof mozTCPSocket === 'undefined') {
            dfd.reject();
            return promise;
        }

        try{
            coll = new MPDConnectionCollection;
            coll.comparator = function(model,model2) {
                 return (model.get('last_connection') > model2.get('last_connection'))?1:-1;
            };
            coll.fetch({
               success:function(data)  {

                model=data.last();
                if(data.size()===0) noMPDCONNECTION = true;
                else noMPDCONNECTION = false;

                updateMPDStatusButton();

                return doConnect(model,promise);


               }
            });
        } catch (e) {
                console.error(e);
                dfd.reject();
            }


            return promise;

    };

    return {
        initSettings:initSettings,
        initialize:initialize,
        registry:registry,
        headerView:headerView,
        toolbarView:toolbarView,
        /*beginRouting:beginRouting,*/
        mpdconnect:mpdconnect
    };

});
