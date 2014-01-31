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

    'libs/cover',

    'tpl!templates/headerExtended'

],function($,_,Backbone,app,cover,tpl) {


    "use strict";


    var view = Backbone.View.extend({

        stream_url:null,
        initialize:function() {
            var self= this;
            app.registry.app_manager.eventManager.on('show_view',function() {
                self.hide();
            });
            app.registry.event_manager.on('goto_song',function() {
                self.hide();
            });

            app.registry.mpd.on('open',function(){
                    try{
                        self.stream_url = (app.registry.current_connection.get('http_stream_active') && app.registry.current_connection.get('http_stream_url'))?app.registry.current_connection.get('http_stream_url'):null;

                        self.render();
                    } catch(e) {
                        console.log(e.message,e.fileName,e.lineNumber);
                    }
            });

            app.registry.mpd.on('player_changed',function(){
                app.get_last_song().done(function(result){
                        var song = result.data;
                        self.songChanged(song);
                });
            });

            var self=this;
            app.get_last_song().done(function(result){
                    var song = result.data;
                    self.songChanged(song);
            });
        },
        el:'#cover_container',
        hide:function() {
            console.log('hide');
            this.$el.toggleClass('discreet',true);
        },
        show:function() {
            this.$el.removeClass('discreet');
        },
        toggle:function(force) {
            this.$el.toggleClass('discreet',force);
        },
        render: function() {
            this.$el.html(tpl({http_stream_url:this.stream_url}));
            this.hide();
            this.delegateEvents();

            if(app.registry.settings.get('showCovers')===true) {
                this.$el.find('img[role=cover]').attr('src','./imgs/defaultcover.jpg');
            }
        },
        songChanged:function(song) {
            
            console.log('songChanged',song.Artist);

            this.$el.find('[role=artist]').text(song.Artist);
            this.$el.find('[role=album]').text(song.Album);

            if(app.registry.settings.get('showCovers')===true) {

                var cover_container = this.$el.find('img[role="cover"]');

                cover(song.Artist,song.Album).done(function(cover_url) {
                    cover_container.attr('src',cover_url);
                });
            }
        },
        events: {
            'click button':'mpd_action'
        },
        mpd_action:function(e) {

            var target = $(e.currentTarget);
            var mpd=app.registry.mpd;

            console.log(target.attr('data-action'));

            switch (target.attr('data-action')) {


                case "volumedown":
                    mpd.volumeDown();
                    break;

                case "volumeup":
                    mpd.volumeUp();
                    break;

                case 'stream':
                    var audio =  this.$el.find('#http_stream_player')[0];
                    console.log('ok',audio.paused);
                    var t=$(e.target);
                    if(audio.paused===false) {
                        t.removeClass('active');
                        audio.pause();
                    } else {
                        t.toggleClass('active',true);
                        audio.play();
                    }
                    break;

                default:
                    throw "should not passing here…";
                    break;
            }

        }

    });

    return view;


});
