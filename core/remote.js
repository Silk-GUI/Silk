 // make app availalbe outisde nodeos

 start = function (options) {
   var remoteDomain = require('domain').create();

   remoteDomain.on('error', function (err) {
     console.log(err);
     try {
       Silk.get("remote/close")();
     } catch (e) {
       console.log(e);
     }
   })

   remoteDomain.add(Silk);

   remoteDomain.run(function () {
     var localtunnel = require('localtunnel');
     localtunnel(3000, function (err, tunnel) {
       if (err) {
         console.log(err);
         return;
       }

       Silk.set("remote/url", tunnel.url);
       Silk.set("remote/close", tunnel.close);

       console.log("Go to " + tunnel.url + " to remotely access Silk");

       tunnel.on("error", function (err) {
         console.log(err);

       });
       tunnel.on("close", function () {
         console.log("remote closed");
       })
     });

   })
 }
 Silk.set('remote/start', start);