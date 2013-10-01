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

    'models/album',

    'backbone.mpd'
],function($,_,Backbone,dbs,AlbumModel,BackboneMpd) {


    var PlaylistCollection = BackboneMpd.Collection.extend({

            model:AlbumModel,
            database:dbs['default'],
            storeName:"albums",

            stat:'artists',

            initialize:function(options) {
                this.mpdconnection = options.mpdconnection; 
            },
            mpdmethodmapping:{
                read:'listAlbums'
            },
            parse:function(data) {
                if(typeof data === 'object')  {
                    data = _.first(data);
                } else {

                    data=this.parse_mpd_response(data);
                }
                return data;
            },
            comparator: function(mdl1,mdl2) {
                
                    var first = mdl1.get('Album');
                    var second = mdl2.get('Album');

                    return ( (first > second && first) || !second)?1:-1;
            },
            search:function(val,options) {

                try{
                var re = new RegExp(val.toLowerCase());
                var filterFn = function(item) {
                    return (item.get('Album').toLowerCase().match(re))?true:false;
                };

                return  _.filter(this.models,filterFn);

                } catch(e) {
                    console.log(e.message);
                }
                return '';

            },
            parse_mpd_response:function(data,filter) {


            var self=this;

            filter = filter || function(){};
            var ret=[];

            var re = new RegExp("\n");
            data = data.split(re);

            re = new RegExp("(^$)|(^OK)");
            data = _.reject(data,function(item) {
                return item.match(re);
            });

            re = new RegExp("^(Album): (.*)$");

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


