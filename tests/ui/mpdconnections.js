define([
  'jquery',
  'chai',

  'foxy/libs/mpd'

], function($,chai,MPD) {
  'use strict';

  var expect = chai.expect;
  var should = chai.should();
  var assert = chai.assert;

    describe('mpd connections UI', function() {


        describe('mpd connection error button action if no mpd connection present in store', function() {
            it('should redirect to mpd connection creation');

            it('should retry connection with the last used mpd connections infos in store, if any');
        });


    });


});
