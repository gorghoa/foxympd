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

    'dbs',

    //plugins
    'backbone.subroute'

], function($,_,Backbone,MPD,AppManager,MPDConnectionCollection,SettingsCollection,SettingsModel,dbs) {

try{

    var noMPDCONNECTION=false;
    var registry={
            collections:{},
            user:null,
            dbs:{},
            app_ticker:null, //
            settings:{},
            current_connection:null
    };

    var toolbarView={};
    var headerView={};

    var lastSong=null;

    get_last_song = function() {
        if(lastSong===null) return registry.mpd.currentsong();
        return lastSong;
    };

    var initializers={

        initialize_event_manager:function() {
            registry.event_manager = {};
            _.extend(registry.event_manager,Backbone.Events);
        },


        initialize_mpd:function() {
            registry.mpd=new MPD();

            registry.mpd.status();

            registry.mpd.on('player_changed',function() {
                    lastSong = registry.mpd.currentsong();
            });
        },

        initSettings : function() {

                var dfd = $.Deferred();

                coll = new SettingsCollection();
                coll.fetch({
                   success:function(data)  {


                        if(data.size()===0) {
                           
                           model = new SettingsModel({
                                        noLock:true,
                                        showCovers:true
                                    });
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


                if(!_.size(registry.mpd.connect_infos)) break;

                prom=registry.mpd.connect();


                prom.fail(function(e) {
                    console.warn("visible error: ",e);
                });

                break;

        }

    };


    var initialize=function() {



        var dfd= $.Deferred();
   
        initializers.initialize_mpd();
        initializers.initialize_event_manager();


        registry.mpd.on('close',function() {
                                        clearInterval(registry.app_ticker);
                            });

        registry.mpd.on('open',function() {
                                registry.mpd.run();
                                registry.app_ticker = setInterval(function() {
                                registry.event_manager.trigger('tick');
                            },1000);
                });


        document.addEventListener("visibilitychange",function() {
            visibilityAction();
        });
  

        document.addEventListener('online',  registry.event_manager.trigger('online'));
        document.addEventListener('offline',  registry.event_manager.trigger('offline'));


        var conn = mpdconnect();
        var setts = initializers.initSettings();


        var needs = 2,iter=0;

        var check = function() {
            iter++;
            if(iter===needs) {
                dfd.resolve();
            }
            
        };
        conn.always(function() {
            check();
        });

        conn.done(function(model) {
                registry.current_connection=model;
        });

        conn.fail(function(err) {
            console.error(err);
        });

        setts.done(function() {
            check();
            visibilityAction();
        });

        return dfd.promise();
        

    };


    var clearCache = function() {

    console.log('clearing cache');

    var defaultDB = dbs['default']; 
        var initDb=function() {


            request=window.indexedDB.open(defaultDB['id'],_.size(defaultDB['migrations']));

            request.onerror=function(event) {
                console.error('cant init db');
            };

            request.onsuccess = function(event) {
                db = request.result;
                console.log('init db ok');
                var transaction = db.transaction(['artists'], 'readwrite');
                var object_store=transaction.objectStore('artists');
                object_store.clear();

                transaction = db.transaction(['songs'], 'readwrite');
                object_store=transaction.objectStore('songs');
                object_store.clear();

                transaction = db.transaction(['albums'], 'readwrite');
                object_store=transaction.objectStore('albums');
                object_store.clear();
            };

        };

        initDb();


    };

    var mpdconnect=function(model) {

        var dfd = $.Deferred();
        var promise = dfd.promise();
        var mpd=registry.mpd;

        if(model) registry.current_connection=model;

        var doConnect = function (model,promise) {
                if(!model) {
                    dfd.reject('no model given, impossible to connect mpd');
                    return promise;
                }



                var last_db_update = (model.get('stats')) ? model.get('stats')['db_update'] : 0;

                mpd.once('open',function() {
                    mpd.stats().done(function(result) {
                        var stats=result.data;

                        if(stats['db_update'] != last_db_update) {
                            clearCache();
                        }
                        model.set('stats',stats);
                        model.set('last_connection',new Date().getTime());
                        model.save();
                    });
                });
                mpd.setConnectInfos(model.attributes);
                mpd.connect();
                dfd.resolve(model);

                return promise;

        };


        if(typeof(model) === "object" ) return doConnect(model,promise);
        

        if(typeof navigator.TCPSocket === 'undefined' && typeof navigator.mozTCPSocket === 'undefined') {
            dfd.reject('TCP Sockets are not available on your device. Sorry but you may not be able to use FoxyMPD :-\\');
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
        initialize:initialize,
        registry:registry,
        headerView:headerView,
        toolbarView:toolbarView,
        /*beginRouting:beginRouting,*/
        mpdconnect:mpdconnect,
        initializers:initializers,
        get_last_song:get_last_song
    };

}catch(e) {
    console.log(e.message);
}
});
