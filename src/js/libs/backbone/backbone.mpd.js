define([
    'jquery',
    'underscore',
    'backbone'
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
        sync:function(method, object, options) {

            var mpd_method = this.mpdmethodmapping[method];
            var mpd = this.mpdconnection;

            var retour = mpd[mpd_method].apply(mpd);

            
            retour.done(function(result) {

                var data = result.data;

                var success = options.success;
                if (success) success(data);
                object.trigger('sync', object, data, options);

            });

            retour.fail(function(result) {
                var error = options.error;
                options.error = function(result) {
                    if (error) error(result);
                    object.trigger('error', object, data, options);
                };
            });




        }


    });

    return {
        Model:MpdModel,
        Collection:MpdCollection
    };

});
