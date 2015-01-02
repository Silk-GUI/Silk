
Silk.methods.add({
  'taskManager/apps': function(data, call_obj, send){
    Silk.api.call('apps/list', {}, function(err, data){
      console.dir(err);
      send(err, data);
    })
  },
  'taskManager/restart': function(data, call_obj, send){
    console.log("will restart + " + data);
    Silk.api.call('apps/restart', data.name, function(err, result) {
      console.log(err);
      console.log(result);
    })
  }
})