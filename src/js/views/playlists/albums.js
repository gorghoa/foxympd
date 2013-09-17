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

    'collections/albums',

    'tpl!templates/playlist/artists',
    'tpl!templates/playlist/roledata',

    'views/playlists/albums_detail'

],function($,_,Backbone,app,AlbumCollection,tplAlbum,tplRoleData,detailedAlbumView) {


    var view = Backbone.View.extend({

        initialize:function()  {
            if(app.registry.collections.albums===undefined) {
                app.registry.collections.albums = this.collection = new AlbumCollection({mpdconnection:app.registry.mpd});
            } else {
                this.collection = app.registry.collections.albums;
            }
        },
        collection:null,

        renderdata:function(items) {

            var last=null,first,init,keys=[],view,percent=0,i=0,size=_.size(items),inter;
            var el = $('<ul/>');

            var roledata=this.$el.children('[role=data]');
            roledata.empty();


            _.each(items,function(item) {
                i++;


                view = new detailedAlbumView({model:item}); 

                first = item.get('Album')[0];

                if( first != last) {

                    roledata.append(el);
                    el=$('<ul/>');
                    keys[keys.length]=first;
                    last = first;
                    roledata.append(tplRoleData({last:last}));
                }

                el.append(view.render());

             }); 


            roledata.append(el);
        },
        render: function() {

            var self=this;
            var data={};

            self.$el.html(tplAlbum({size:'~'}));

            var coll = this.collection;

            app.registry.mpd.stats().then(function(result) {

                self.$el.html(tplAlbum({size:result.data.albums}));
                
            }).done(function() {
                coll.fetch({
                    success:function(dati) {
                        self.renderdata(_.sample(dati.models,200));
                    }
                });
            });

            return self.$el;

        },
        filtering:function(val, e) {

            if(val.length<4) return;
            console.log('filtering albums');
            var self=this;

            var c=this.collection;

            c.search(val,{
                success:function(data) {
                    self.renderdata(data.models);
                }
            });

        },

        filtering:function(val,e) {
            console.log('filtering albums');
             var self=this;

            var c=this.collection;
            c.search(val,{
                success:function(data) {
                    self.renderdata(data.models);
                }
            });
        },
        'done':function(e) {

            var self=this;
            var checked=this.$el.find('.selected');
            var mpd=app.registry.mpd;

            var songs = _.map(checked,function(item) {
                var id = $(item).attr('data-id');
                var model =  self.collection.get(id);
                return model.get('Album');
            });

            mpd.addAlbums(songs).done(function() {
                checked.removeClass('selected');
            
            });
        }
    });

    return view;
});


