define([
  'jquery',
  'chai',

  'foxy/libs/mpd'

], function($,chai,MPD) {
  'use strict';

  var expect = chai.expect;
  var should = chai.should();
  var assert = chai.assert;

    describe('mpd', function() {

        describe('commands', function() {

            it('should be stacked');


        });

        describe('processMPDData',function() {
    

                

        });

        describe('on data', function() {
            var mpd = new MPD();
    
            it('should match with **OK** regex when it’s ok',function() {

                var data = '18:file: link/Zikmu/Weeds-Ost (copie)/fourth/27 - Chicha Libre - Sonido Amazonico - S04E10.mp3\n19:file: link/Incub/1TitLarme/Chopin - Marche Funèbre.mp3\n20:file: link/Incub/- Classique -/Classique - divers/1. PisteAudio 01.mp3\n39:file: link/Incub/- Classique -/Classique - divers/21. PisteAudio 21.mp3\nOK\n';

                expect(data.match(mpd.okRegExp)).to.not.equal(null);
            });

            it('should match with **KO** regex when an error occured',function() {

                var data = 'ACK [5@0] {} unknown command "auie"\n';
                expect(data.match(mpd.koRegExp)).to.not.equal(null);

            });


            describe('mpd::onDataEnd',function() {
            
                it('should be called only once all response data had been received',function() {

                    var mpd = new MPD(),r;

                    var part1 = '18:file: link/Zikmu/Weeds-Ost (copie)/fourth/27 - Chicha Libre - Sonido Amazonico - S04E10.mp3\n19:file: link/Incub/1TitLarme/Chopin - Marche Funèbre.mp3\n20:file: link/Incub/- Classique -/Classique - d';
                    var part2 = 'ivers/1. PisteAudio 01.mp3\n39:file: link/Incub/- Classique -/Classique - divers/21. PisteAudio 21.mp3\nOK\n';

                    var i=0;

                    sinon.spy(mpd,'onDataEnd');

                    var dfd = $.Deferred();

                    var buffer='';

                    r = {"data":mpd.utf8_encode(part1)};
                    buffer = mpd.processMPDData(r,buffer,dfd,false); 

                    r = {"data":mpd.utf8_encode(part2)};
                    mpd.processMPDData(r,buffer,dfd,false); 

                    expect(mpd.onDataEnd.calledOnce).to.equal(true);
                    
                });

            });


        });

        describe('control',function() {


            describe('play/pause action',function() {

                var mpd = new MPD(),result;
                var currentStatus; //the real mocked status of mpd server
                //mpd.statusdata.state is the cached version of mpc

                /**
                 * override mpd status 
                 */
                mpd.status = function() {
                    var dfd=$.Deferred();
                    mpd.statusdata.state=currentStatus;
                    return dfd.resolve({data:mpd.statusdata});
                };

                /**
                 * override mpd pause 
                 */
                mpd.pause = function(result) {

                    if(result===true) {
                        currentStatus = 'pause';
                    }  else {
                        currentStatus = (currentStatus==='play') ? 'pause' : 'play';
                    }

                    return $.Deferred().resolve();

                };

                mpd.play= function() {
                    currentStatus = 'play';
                    return $.Deferred().resolve();
                };

              it('should trigger **play** when not playing',function(done) {
                    mpd.statusdata.state='pause';
                    currentStatus='pause';
                    result = mpd.togglePlayPause().done(function() {
                        currentStatus.should.equal('play');
                        done();
                    });
              });
                
              it('should trigger **pause** when playing',function(done) {

                    mpd.statusdata.state='play';
                    currentStatus='play';

                    result = mpd.togglePlayPause().done(function() {
                        currentStatus.should.equal('pause');
                        done();
                    });
              });


              it('should not be disturbed when cache state is out of sync with real mpd status',function(done) {
                    mpd.statusdata.state='play';
                    currentStatus='pause'; //should be the winner
                    result = mpd.togglePlayPause().done(function() {
                        currentStatus.should.equal('play');
                        done();
                    });

              });
          }); //fin describe play/pause


        }); //fin describe controls
  });
});
