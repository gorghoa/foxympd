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

    'tpl!templates/playlist/build'


],function($,_,Backbone,app,defaultView,tplMain) {


    var view = Backbone.View.extend({

        initialize: function() {
            this.current_view=new defaultView();
        },
        changeView:function(view_name,cb) {

            var self=this;
            self.current_view.remove();

            require(['views/playlists/'+view_name],function(view) {
                self.current_view=new view();


                if(cb) {
                    cb.apply(self,[self.current_view]);
                }

            });

            this.$el.find('.active').removeClass('active');
            this.$el.find('li[data-val='+view_name+']').addClass('active');

        },
        current_view:null,
        render: function() {

            var self=this;

            done = $('<a id="done" class="lsf lsf-symbol">stock</a>');
            done.click(function() {self.current_view.done();});
            app.headerView.setActionButtons([done]);

            app.headerView.setTitle('Build a playlist');
            this.$el.html(_.template(tplMain,{current_view:this.current_view}));
             
            this.changeView('artists',function(view) {
               $('div[role=items]').html(view.render());
            });
        },

        events:{
           "click [role=filters]":'chViewEvent',
            "submit form[role=search]":'filtering'
        },

        filtering:function(e) {

            console.log("filterings");

            var val=$(e.currentTarget).children('input[name=value]').val().toUpperCase();
            this.current_view.filtering(val,e);

            return false;
        },
        chViewEvent:function(e) {
            var val = $(e.target).attr('data-val');

            this.changeView(val,function(view) {
               $('div[role=items]').html(view.render());
            });
        }


    });

    return view;
});
