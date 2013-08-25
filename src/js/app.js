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
    'router',

    

    'libs/mpd',


    'appmanager',

    //plugins
    'backbone.subroute'

], function($,_,Backbone,Router,MPD,AppManager) {

        var isSocket=TCPSocket||mozTCPSocket;
        if(!isSocket) {
            alert('pas la techno nécessaire.');
        }


    var registry={
            collections:{},
            user:null,
            dbs:{},
            app_ticker:null //
    };

    var toolbarView={};
    var headerView={};

    var beginRouting=function() {
        Router.initialize(registry.app_router);
    };

    var visibilityAction=function() {
        var prom;

        switch(document.visibilityState) {

            case "hidden":
                prom = registry.mpd.close();
                prom.done(function() {
                });
                break;

            case "visible":
            default:

                if(!registry.mpd.connect_infos.length) break;

                prom=registry.mpd.connect();

                prom.fail(function(e) {
                    console.warn("visible error: ",e);
                });

                prom.done(function() {
                });
                
                break;


        }


    };

    var initialize=function() {
        registry.mpd=new MPD();

        registry.event_manager = {};
        _.extend(registry.event_manager,Backbone.Events);

        registry.app_router= new Router.AppRouter();
        registry.app_router.appManager=new AppManager();

        registry.mpd.on('close',function() {
                                        clearInterval(registry.app_ticker);
                            });

        registry.mpd.on('open',function() {
                                        registry.app_ticker = setInterval(function() {
                                            registry.event_manager.trigger('tick');
                                    },1000);
                });


        visibilityAction();
        document.addEventListener("visibilitychange",function() {
            visibilityAction();
        });


        mpdconnect();
        

    };

    var mpdconnect=function() {

        

        var mpd=registry.mpd;
        require(['collections/mpdconnections'], function(MPDConnectionCollection) {
            try{
                coll = new MPDConnectionCollection;
                coll.comparator = function(model,model2) {
                     return (model.get('last_connection') > model2.get('last_connection'))?1:-1;
                };
                coll.fetch({
                   success:function(data)  {
                    model=data.last();

                    if(!model) {
                        registry.app_router.navigate('/connections/add',{trigger:true}); 
                        return;
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
                    mpd.run();
                   }
                });
            } catch (e) {
                console.error(e);
            }
        });

    };

    return {
        initialize:initialize,
        registry:registry,
        headerView:headerView,
        toolbarView:toolbarView,
        beginRouting:beginRouting,
        mpdconnect:mpdconnect
    };

});
