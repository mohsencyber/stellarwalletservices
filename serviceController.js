var myfunc = require('./services');

exports.get_account_info = function(req, res){
	var task = myfunc.accountinfo(req.params.accountId,res);
	console.log(req.params.accountId);
	console.log("in get_account_info : ",task);
};



exports.post_transaction = function(req , res ){
	console.log("Request post recived.");
	res.send(req);
       //var txsubmit = myfunc.postTransaction(req.params.txdr,res);
};

/*xports.create_a_task = function(req, res) {
  var new_task = new Task(req.body);
  new_task.save(function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};*/


