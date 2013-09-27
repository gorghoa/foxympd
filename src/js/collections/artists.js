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

    'dbs',

    'models/artist',

    'backbone.mpd',
    'backbone.indexeddb'
],function($,_,Backbone,dbs,ArtistModel,BackboneMpd) {


    var PlaylistCollection = BackboneMpd.Collection.extend({

            model:ArtistModel,
            database:dbs['default'],
            storeName:"artists",

            stat:'artists',

            initialize:function(options) {
                this.mpdconnection = options.mpdconnection; 
            },
            mpdmethodmapping:{
                read:'listArtists'
            },

            parse:function(data) {
                data=this.parse_mpd_response(data);
                return data;
            },
            search:function(val,options) {
                var self=this;

                var success = (options.success) ? options.success : function() {};

                var re = new RegExp(val.toLowerCase());


                var prom = self.mpdconnection.listArtists();
                
                var filter = function(item) {
                    return (item.toLowerCase().match(re))?false:true;
                };


                prom.done(function(result) {

                    var data = self.parse_mpd_response(result.data,filter);

                    self.reset(data);
                    success(self);

                });

            },
            comparator: function(mdl1,mdl2) {
                
                    var first = mdl1.get('Artist');
                    var second = mdl2.get('Artist');

                    return ( (first > second && first) || !second)?1:-1;
            },
            parse_mpd_response:function(data,filter) {


            console.log(data);
            filter = filter || function(){};

            var self=this;

            var ret=[];

            var re = new RegExp("\n");
            data = data.split(re);

            re = new RegExp("(^$)|(^OK)");
            data = _.reject(data,function(item) {
                return item.match(re);
            });

            re = new RegExp("^(Artist): (.*)$");

            var done;
            _.each(data,function(item) {

                done = item.match(re);


               if(filter(done[2])) return; //we do not want rejected artists
                
                var model;
                if(done) {
                    model=new self.model;
                    model.set(done[1],done[2]);
                    ret.push(model);
                } else {
                    console.log('tiens… tiens…',item);
                }
            });

                return ret;

            }

    });

    return PlaylistCollection;

});

