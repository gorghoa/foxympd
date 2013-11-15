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

    'collections/artists',

    'tpl!templates/playlist/artists',
    'tpl!templates/playlist/roledata',

    'views/playlists/artists_detail'

],function($,_,Backbone,app,ArtistCollection,tplArtist,tplRoledata,detailedArtistView) {

    "use strict";

    var view = Backbone.View.extend({

        initialize:function()  {
            if(app.registry.collections.artists===undefined) {
                app.registry.collections.artists = this.collection = new ArtistCollection({mpdconnection:app.registry.mpd});
            } else {
                this.collection = app.registry.collections.artists;
            }
        },
        collection:null,

        renderdata:function(items) {


            items = _.sortBy(items,function(mdl1) {
                return mdl1.get('Artist').toUpperCase();
            });
                

            var last=null,first,init,keys=[],view,percent=0,i=0,size=_.size(items),inter;
            var el = $('<ul/>');

            var roledata=this.$el.children('[role=data]');
            roledata.empty();

                console.log('size',_.size(items));
                _.each(items,function(item) {

                    view = new detailedArtistView({model:item}); 

                    first = (_.size(item.get('Artist')))?item.get('Artist')[0].toUpperCase():'Mistagged Artists… <span class="lsf">wink</span>';

                    if( first != last) {

                        roledata.append(el);
                        el=$('<ul/>');
                        keys[keys.length]=first;
                        last = first;
                        roledata.append(tplRoledata({last:last}));
                    }

                    el.append(view.render());

                 }); 


            roledata.append(el);
        },
        render: function() {

            var self=this;
            var data={};

            self.$el.html(tplArtist({size:'~'}));
            var coll = this.collection;


            app.registry.mpd.stats().then(function(result) {

                self.$el.html(tplArtist({size:result.data.artists}));
                
            }).done(function() {
                coll.fetch({
                    success:function(dati) {
                        self.renderdata(_.sample(dati.models,50));
                    }
                });
            });

            return self.$el;

        },

        filtering:function(val,e) {
            console.log('filtering artists');
            var self=this;
            var c=this.collection;

            self.renderdata(c.search(val));


        },
        'done':function(e) {

            var self=this;
            var checked=this.$el.find('.selected');
            var mpd=app.registry.mpd;

            var songs = _.map(checked,function(item) {
                var id = $(item).attr('data-id');
                var model =  self.collection.get(id);
                return model.get('Artist');
            });

            mpd.addArtists(songs).done(function() {
                checked.removeClass('selected');
            });
        }
    });

    return view;
});

