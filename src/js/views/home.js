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

    'timetools',

    'app',

    'collections/playlist',
    'views/playlists/storedplaylists',

    'tpl!templates/playlist/list',
    'tpl!templates/mpdfetching',
    'libs/cover'

],function($,_,Backbone, timetools, app, PlaylistCollection, StoredPlaylistView, tpl,mpdfetchingTpl,cover) {



    var homeView = Backbone.View.extend({


        playlist:undefined,
        initialize: function() {
            var self=this;
            app.registry.mpd.on('playlist_changed',function() {self.render();});
            app.registry.mpd.on('player_changed',function() {
                self.updateHeader();
                self.goto();
            });
            app.registry.event_manager.on('goto_song',function() {
                self.goto(); 
            });

            this.playlist = new PlaylistCollection({
                mpdconnection: app.registry.mpd
            });


        },
        close:function() {
            //@todo kill mpd listeners
        },
        render: function() {


            var mpdConnectPromise = app.registry.mpd.getConnectionPromise();

            var self=this;

            var tmpview;
            var data={};
            var rendered_connections = $('<ul/>');

            self.$el.html(mpdfetchingTpl({message:'waiting for mpd…'}));


            if( typeof mpdConnectPromise === 'undefined') return;
            mpdConnectPromise.done(function() {
                self.renderPlaylist();
            });

        },

        renderPlaylist:function() {

            var self=this;

            self.playlist.fetch({
                success: function(datum) {
                    if(datum) {

                        self.$el.html(tpl({datum:datum,timetools:timetools}));

                        if(!datum.size()) {
                            var v = new StoredPlaylistView();
                            v.render();
                        }

                        self.updateHeader();
                        self.goto(); 
                    }
                }
            });

        },
        events: {
            "click li[role=song]":"play"
        },

        updateHeader:function() {

            var song;
            var self=this;


            $('.current').removeClass('current');

            app.get_last_song().done(function(result){
                song = result.data;
                var el = $("[data-id="+song.Id+"]");



                if(app.registry.settings.get('showCovers')===true) {
                    var img = el.find('img.artist');
                    cover(song.Artist,song.Album).done(function(cover_url) {
                        img.attr('src',cover_url);
                    });
                }
                if(el.size()) {
                    el.toggleClass('current',true);
                }
            });
        },
        goto:function() {
                app.get_last_song().done(function(result){
                    song = result.data;
                    var els = document.getElementsByName(song.Id);
                    if(els.length) {
                        var top = $(els[0]).offset().top - 40;
                        $('html,body').animate({scrollTop:top},100);
                    }
                });
        },
        play:function(e) {
            e.preventDefault();
            var target = $(e.currentTarget);
            var playid = target.attr('data-id');
            app.registry.mpd.socket.send('playid '+playid+'\n');
        }
    });

    return homeView;
});
