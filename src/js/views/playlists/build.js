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

    'views/playlists/artists',
    'views/playlists/songs',
    'views/playlists/albums',

    'tpl!templates/playlist/build'


],function($,_,Backbone,app,artistsView, songsView, albumsView, tplMain) {


    var view = Backbone.View.extend({

        initialize:function() {
            this.songsView = new songsView();
            this.artistsView = new artistsView();
            this.albumsView = new albumsView();
        },
        changeView:function(view_name,cb) {

            var self=this;

            if(self.current_view) {
                self.current_view.undelegateEvents();
            }

            var view;

            switch(view_name) {
                case 'songs':
                    view = this.songsView;
                    break;

                case 'albums':
                    view = this.albumsView;
                    break;

                default:
                    view = this.artistsView;
                    break;
            }

                self.current_view = view;
                
                self.current_view.delegateEvents();

            this.$el.find('.active').removeClass('active');
            this.$el.find('li[data-val='+view_name+']').addClass('active');


            if(cb) {
                cb.apply(self,[self.current_view]);
            }


        },

        current_view:null,

        render: function() {

            var self=this;

            self.$el.html(tplMain());

            done = $('<a id="done" class="lsf lsf-symbol">stock</a>');
            done.click(function() {self.current_view.done();});

            app.headerView.setActionButtons([done]);

            app.headerView.setTitle('Build a playlist');


            this.changeView('artists',function(view) {
                self.$el.find('[role=items]').html(view.render());
            });
        
        },

        events:{
           "click [role=filters]":'chViewEvent',
            "submit form[role=search]":'filtering'
        },

        filtering:function(e) {

            var val=$(e.currentTarget).children('input[name=value]').val().toUpperCase();
            this.current_view.filtering(val,e);

            return false;
        },
        chViewEvent:function(e) {
            var val = $(e.target).attr('data-val');
            var self=this;

            this.changeView(val,function(view) {
                self.$el.find('[role=items]').html(view.render());
            });
        }


    });

    return view;
});
