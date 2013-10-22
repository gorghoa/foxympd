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

    'app',

    'tpl!templates/networkstatus',

],function($,_,Backbone,app,tpl,mnf) {


    var view = Backbone.View.extend({

        el : 'section[role=network-status]',
        initialize:function() {


            var self=this;
            var registry = app.registry;

            registry.event_manager.on('online',  function() {self.updateOnlineStatus();});
            registry.event_manager.on('offline', function() { self.updateOnlineStatus();});

            registry.mpd.on('close',function() {
                                            self.updateMPDStatusButton();
                                            self.mpdStatusShow();
                                });

            registry.mpd.on('open',function() {
                                self.mpdStatusConnected();
                                registry.mpd.run();
                                registry.app_ticker = setInterval(function() {
                                    registry.event_manager.trigger('tick');
                                },1000);
                    });
        },
        mpdStatusConnected:function() {
            mpdStatusEl.text('connected').fadeOut(800);
        },
        mpdStatusShow:function() {
        },
        render: function() {
            this.$el.html(tpl());
            this.updateMPDStatusButton();

            var networkStatusEl = this.$el.children('.network');
            networkStatusEl.text('no network connection');
        },

        isMPDConnection: function() {
            return (_.size(app.registry.mpd.connect_infos))?true:false;
        },

        events : {
            '.mpd click':'redirect'
        },

        redirect: function() {
            var noMPDCONNECTION = !this.isMPDConnection();
            if(noMPDCONNECTION===true) app.registry.app_router.navigate('connections/add',{trigger:true});
            else app.registry.mpd.connect(); 
        },
        updateMPDStatusButton:function() {
            var noMPDCONNECTION = !this.isMPDConnection();

            var errtext = (!noMPDCONNECTION) ?'mpd connection error, press to retry':'no mpd connection, press to add one' ;

            var mpdStatusEl = this.$el.children('.mpd'); 

            mpdStatusEl.text(errtext);

            this.undelegateEvents();
            this.delegateEvents();
        },
        updateOnlineStatus : function (event) {
            var condition = navigator.onLine ? "online" : "offline";

            var networkStatusEl = this.$el.children('.network');

            if(condition==='offline') {
                networkStatusEl.show();
            } else {
                networkStatusEl.hide();
            }
        }
    });
    return view;


});

