define([
  'jquery',
  'chai',
  'app',
  'views/networkstatus'

], function($,chai,app,NetworkstatusView) {

  'use strict';

  var expect = chai.expect;
  var should = chai.should();
  var assert = chai.assert;

  app.initializers.initialize_mpd(); //one and for all
  app.initializers.initialize_event_manager(); //one and for all

    describe('networkstatus view', function() {

        describe('::render() should add elements to the dom', function() {
            
            var view = new NetworkstatusView({el:$('<div/>')});
            view.render();
            var el = view.$el;

            it('should have .network child element',function() {
                expect(_.size(el.children('.network'))).to.equal(1);
            });

            it('should have .mpd child element',function() {
                expect(_.size(el.children('.mpd'))).to.equal(1);
            });

        });

        describe('mpd connection error button action if no mpd connection present in store', function() {

            var view = new NetworkstatusView({el:$('<div/>')});
            view.isMPDConnection=function() {return false;};

            it('should redirect to mpd connection creation',function() {
                view.render();
                var el = view.$el;
                var text ='no mpd connection, press to add one';
                expect(el.children('.mpd').text()).to.eq(text);
            });

            it('should retry connection with the last used mpd connections infos in store, if any');
            
        });


        describe('isMPDConnection()',function() {
            var view = new NetworkstatusView({el:$('<div/>')});
            it('should return false when mpd has no connection infos',function() {
                app.registry.mpd.connect_infos = {};
                view.isMPDConnection().should.eq(false);
            });

            it('should return true when mpd has connection infos',function() {
                app.registry.mpd.connect_infos = {'bla':'bla'};
                view.isMPDConnection().should.eq(true);
            });
        });

    });


});
