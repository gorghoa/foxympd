define([
    'jquery',
    'underscore',
    'backbone',

    'backbone.indexeddb'
],function($,_,Backbone) {

    var MpdModel = Backbone.Model.extend({

        mpdconnection:null,
        sync:function(method, model, options) {

            resp =  [{salut:'manu'}];

            var success = options.success;
            options.success = function(resp) {
                if (success) success(resp);
                /*object.trigger('sync', object, resp, options);*/
            };

            var error = options.error;
            options.error = function(resp) {
                if (error) error(resp);
                /*object.trigger('error', object, resp, options);*/
            };

        }


    });

    var MpdCollection = Backbone.Collection.extend({

        mpdconnection:null,
        mpdmethodmapping:{
            read:'ping'
        },

        fetch_from_mpd: function(method,dfd) {


            var mpd_method = this.mpdmethodmapping[method];
            var mpd = this.mpdconnection;

            return  mpd[mpd_method].apply(mpd,[{dfd:dfd,parse:false}]);

        },
        sync:function(method, object, options) {

            var self=this;
            var retour=$.Deferred();
            var dfd = $.Deferred();



            if(method!=='read') return Backbone.Collection.prototype.sync.apply(this, arguments);

            if(this.database===undefined) {

                this.fetch_from_mpd(method,retour); 

            } else {

                var sss = parseInt(this.mpdconnection.cached_stats[this.stat],10);


                try{
                var result = Backbone.Collection.prototype.sync.apply(this, arguments);

                } catch(e) 
                {
                    console.log('nersatuiensratuinratenrusieurtrset',e.message);
                }


                      
                result.done(function(data) {
                try{

                    if(data===undefined || _.size(data) != sss) {
                        self.fetch_from_mpd(method,retour);
                    } else {
                        retour =  result;
                    }
                } catch(e) 
                {
                    console.log('nersatuiensratuinratenrusieurtrset',e.message);
                }
                });
            }
                retour.done(function(result) {


                    var data = result.data;

                    dfd.resolve(data);

                    var success = options.success;

                    console.log('METH',object.mpdmethodmapping[method]);
                    try{
                        if (success) success(data);
                    }catch(e) {
                    console.log('errrrrrrrr',e.message);
                    }

                    object.trigger('sync', object, data, options);

                });

                retour.fail(function(result) {
                    dfd.reject(result);
                    var error = options.error;
                    options.error = function(result) {
                        if (error) error(result);
                        object.trigger('error', object, result, options);
                    };
                });


            return dfd;
        }


    });

    return {
        Model:MpdModel,
        Collection:MpdCollection
    };

});
