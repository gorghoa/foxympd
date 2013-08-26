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

    'tpl!templates/playingoptions'

],function($,_,Backbone,app,tpl) {

    var view = Backbone.View.extend({

        render: function() {
            var self=this;

            var data={isRepeat:app.registry.mpd.isRepeat(),isRandom:app.registry.mpd.isRandom()};
            this.$el.html(tpl(data));

            this.$el.find('button').click(function(e) { self.mpd_action(e);});

        },

        events: {
            'click button':'mpd_action'
        },
        mpd_action:function(e) {
            var target = $(e.currentTarget);
            var promise;
            var mpd=app.registry.mpd;

            switch (target.attr('data-action')) {

                case "clear":
                    mpd.clearPlaylist().done(function() {
                        app.registry.app_router.navigate('',{trigger:true});
                    });
                    break;

                case "repeat":
                    promise = mpd.toggleRepeat();
                    break;

                case "volumedown":
                    mpd.volumeDown();
                    break;

                case "volumeup":
                    mpd.volumeUp();
                    break;

                case "randomize":
                    promise = mpd.toggleRandom();
                    break;

                default:
                    throw "should not passing here…";
                    break;
            }

            if(promise) {
                promise.done(function(result) {
                    target.toggleClass('active');
                });
            }
        }

    });


    return view;




});

