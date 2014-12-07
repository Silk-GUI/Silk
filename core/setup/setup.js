// lets user choose window manager, then installs wm and apps requested by wm
module.exports = function(app){
  app.get('/', function (req, res) {
  res.sendFile(__root + "/core/setup/public/index.html");
});
  app.get('/choose.html', function(req, res){
    res.sendFile(__root + "/core/setup/public/choose.html");
  });

}