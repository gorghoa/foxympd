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

    'collections/mpdconnections',
    'views/mpdconnections/list_detail',
    'tpl!templates/mpdconnections/list'

],function($,_,Backbone,app,MPDConnections,detailView,tpl) {


    var coll =  new MPDConnections;
    var view = Backbone.View.extend({

        render: function() {

            var self=this;

            var tmpview;
            var data={};
            var rendered_connections = $('<ul/>');

            done = $('<a id="done" class="lsf lsf-symbol">add</a>');
            app.headerView.setActionButtons([done]);
            done.click(function() {
                    app.registry.app_router.navigate('/connections/add',{trigger:true});
                    
            });

            coll.fetch({
            
                success: function(datum) {
                    datum.each(function(connection) {
                        tmpview = new detailView({model:connection});
                        tmpview.render();
                        rendered_connections.append(tmpview.el);
                    });

                    self.$el.html(_.template(tpl,data));
                    self.$el.append(rendered_connections);
                }
            
            });


        }
    });

    return view;
});


