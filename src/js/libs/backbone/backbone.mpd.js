define([
    'jquery',
    'underscore',
    'backbone',

    'backbone.indexeddb'
],function($,_,Backbone) {


    var MpdCollection = Backbone.Collection.extend({

        mpdconnection:null,
        mpdmethodmapping:{
            read:'ping'
        },
        parent:Backbone.Collection.prototype,
        save:function() {

        },
        fetch_from_mpd: function(method,dfd) {


            var mpd_method = this.mpdmethodmapping[method];
            var mpd = this.mpdconnection;


            console.log(mpd_method);

            return  mpd[mpd_method].apply(mpd,[{dfd:dfd,parse:false}]);

        },
        fetch:function(options) {


            var self=this;
            var retour=$.Deferred();
            var dfd = $.Deferred();

            if(this.database===undefined) {

                this.fetch_from_mpd('read',retour); 

            } else {

                var sss = parseInt(this.mpdconnection.cached_stats[this.stat],10);

                try{

                    var parent_options = {
                        success:function(data) {

                                if(typeof data===undefined || _.size(data) < 1) {
                                    console.log('fetching from mpd');
                                    self.fetch_from_mpd('read',retour);

                                } else {
                                    console.log('fetching from indexeddb');
                                    retour.resolve(self);
                                }

                        }

                    };

                    var result = self.parent.fetch.apply(this, [parent_options]);

                } catch(e) 
                {
                    console.log('Backbone.mpd error',e.message);
                }

            }

                retour.done(function(result) {

                    var data = result.data;
                    var success = options.success;

                    if(typeof data === 'undefined')
                    {
                        if (success) success(self);
                        dfd.resolve(self.models);
                        return;
                    }

                    dfd.resolve(data);


                    parsed = self.parse(data);

                    self.set(parsed);


                    if(self.database) {
                        self.parent.sync('create',self, {
                                success:function() {}
                        });
                    }

                    if (success) success(self);

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
        Collection:MpdCollection
    };
});
