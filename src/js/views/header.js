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

    'timetools',

    'tpl!templates/header'

],function($,_,Backbone,app,timetools,tpl) {



    var networkAPI = navigator.connection || navigator.mozConnection;

    var view = Backbone.View.extend({

        el : 'section[role=region] header',
        tick:null,
        elapsed:0,
        initialize:function() {

            var self=this;
            app.registry.mpd.on('player_changed',function(){
                    self.updateTitles();
            });


            app.registry.event_manager.on('tick',function(){
                self.updateElapsedTime();
            });
        },
        render: function() {

            var data={};
            var re=tpl(data);

            this.$el.html(re);
            this.updateTitles();

        },
        updateTitles:function() {
            var self=this;

            var song;

            app.registry.mpd.currentsong().done(function(result) {
                song = result.data;
                self.setTitle(song.Title);
            });

            app.registry.mpd.status().done(function(result) {

                if (result.data.elapsed)
                {
                    self.elapsed=Math.floor(result.data.elapsed);
                } else {
                    self.setTitle2('¬');
                }
            });

        },
        updateElapsedTime:function() {

            var self=this;
            app.registry.mpd.isPlaying().done(function(isIt) {
                if(isIt) {
                    self.elapsed+=1;
                    self.setTitle2(timetools.time_to_duration(self.elapsed,"short"));
                }
            });

        },
        setTitle:function(title) {
            this.$el.find('.titles h1').text(title);
        },
        setTitle2:function(title) {
            this.$el.find('.titles h2').html(title);
        },
        setActionButtons:function(buttons) {
            $('#menu_buttons').empty();

            var self=this;
            _.each(buttons,function(el) {
                self.addActionButton(el);
            });
        },
        addActionButton:function(element,callback) {
            var menu = $('#menu_buttons');
            menu.append(element);
        }

    });


    return view;


});

