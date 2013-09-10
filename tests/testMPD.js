define([

    'foxy/libs/mpd'

],function(MPD){



    (function() {

        module("mpd client",{

        });

        test('is playing',function(assert) {
            var mpd = new MPD();

            var currentStatus=undefined;
            mpd.status = function() {
                var dfd=$.Deferred();
                mpd.statusdata.state=currentStatus;
                return dfd.resolve({data:mpd.statusdata});
            };

            expect(2);

            mpd.statusdata.state='play';
            mpd.isPlaying().done(function(result) {
                assert.strictEqual(result,true);
            });

            mpd.statusdata.state='pause';
            mpd.isPlaying().done(function(result) {
                assert.strictEqual(result,false);
            });



        });

        test('toggle play pause',function(assert) {
            var mpd = new MPD(),result;


            var currentStatus=undefined;

            mpd.status = function() {
                var dfd=$.Deferred();
                mpd.statusdata.state=currentStatus;
                return dfd.resolve({data:mpd.statusdata});
            };

            mpd.pause = function() {
                currentStatus = (currentStatus==='play') ? 'pause' : 'play';
                return $.Deferred().resolve();
            };

            mpd.statusdata.state=undefined;
            currentStatus='play';
            mpd.status().done(function() {
                assert.strictEqual('play',mpd.statusdata.state); 
            });


            currentStatus='play';
            mpd.statusdata.state=undefined;
            mpd.isPlaying().done(function(result) {
                assert.strictEqual(result,true);
                assert.strictEqual(mpd.statusdata.state,'play');
            });

            mpd.statusdata.state='pause';
            currentStatus='pause';
            result = mpd.togglePlayPause().done(function() {
                assert.strictEqual(currentStatus,'play');
            });

            mpd.statusdata.state='play';
            currentStatus='play';
            result = mpd.togglePlayPause().done(function() {
                assert.strictEqual(currentStatus,'pause');
            });

    
            mpd.statusdata.state='pause';
            currentStatus='play';
            result = mpd.togglePlayPause().done(function() {
                assert.strictEqual(currentStatus,'pause');
            });

            //réitère le même test => cas ou le cache de la lib mpd est différent du serveur
            mpd.statusdata.state='play';
            currentStatus='pause';
            result = mpd.togglePlayPause().done(function() {
                assert.strictEqual(currentStatus,'play');
            });


        });


        test('parse mpd response',function(assert) {
            var mpd = new MPD();

            var data = "Title: totoro\nArtist: Vivie\nOK\n";

            var result = mpd.parse_mpd_response(data);
            var expected = {"Title":"totoro","Artist":"Vivie"};

            for(var i in expected) {
                assert.ok(result[i]);
                assert.equal(expected[i],result[i]);
            }

       });

    })();


});

