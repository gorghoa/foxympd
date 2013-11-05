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




    var view = Backbone.View.extend({

        toggle:function() {
            this.$el.find('*').slideToggle(100);
        },
        render: function() {
            this.$el.html(tpl());
            this.$el.find('*').slideToggle(1);
            this.delegateEvents();

            if(app.registry.settings.get('showCovers')===true) {
                this.$el.find('img[role=cover]').attr('src','./imgs/defaultcover.jpg');
            }
        },
        songChanged:function(song) {

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


            switch (target.attr('data-action')) {


                case "volumedown":
                    mpd.volumeDown();
                    break;

                case "volumeup":
                    mpd.volumeUp();
                    break;


                default:
                    throw "should not passing here…";
                    break;
            }

        }

    });

    return view;


});
