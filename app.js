var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var process = require('child_process');
var express = require('express');
var app = express();



// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


/*ROUTES*/
app.get('/', function(req, res) {
  //res.render('index', { title: 'Express' });
	res.sendFile('/home/ec2-user/reSearch/public/index.html')
});

var rated_data=    new Array();
var search_data=   new Array();
var keywords_data= new Array();
var viewed_data=   new Array();


function main_search(callback){
	keywords= keywords_data.toString();
	console.log("search: " + keywords);
	result = "";
	child = process.exec("/usr/bin/python /home/ec2-user/reSearch/search/search_core_faux.py -q '" + keywords+"'");
	child.stdout.on('data', function(data){
		result = result + data
	});
	child.on('close', function(code){
		//console.log('data: ' + result)
		console.log('closing code: ' + code);
		search_data = JSON.parse(result).articles;
		callback("Success");
	});
	
}
function main_learn(callback){
	console.log()
	child = process.exec("echo'" + keywords_data + "'");
	child.stdout.on('data', function(data){
		result = result + data
	});
	child.on('close', function(code){
		console.log('closing code: ' + code)
		console.log("STUBB: Learn completed")
		callback("Success")
	});

}

app.post('/relevant', function(req, res) {
	console.log("STUBB: " + JSON.stringify(req.body.Title + ": " + req.body.State))
	viewed_data.push(JSON.stringify(req.body))
	console.log(viewed_data.length + " " + search_data.length)
	if (req.body.State !== "0"){		
		if (viewed_data.length%3==0 || search_data.length == 1){
			main_learn(function(e){
				console.log("STUBB: I LEARNED")
			});
			main_search(function(e){
				console.log("STUBB: UPDATED SEARCH")
			});	
		}
	}
	//console.log(article)
	new_article=search_data.pop()
	new_article.tags = keywords_data
	res.json(new_article)
});
app.post('/main-search', function(req, res) {
	//console.log("SEARCH: " + JSON.stringify(req.body));
	console.log("query is " + req.body.value);
	keywords_data= req.body.value.trim().split(/\s+/);
	main_search(function(e){
		if(search_data.length==0){
			console.log('0 articles returned.')
			//DO SOMTHING STUBB
		}else{
			send= search_data.pop();
			send.tags=keywords_data;
			console.log(JSON.stringify(send));
			console.log(send)
			res.json(send);
		}
	});	
	//console.log(search_data)
	//	//console.log("test" + JSON.stringify(send))
	//res.json(JSON.stringify(send))
});

app.get('/papers', function(req, res) {
	console.log("Requested papers");
	console.log("PAPERS: " + viewed_data.length)	
	console.log(viewed_data)
	res.json(viewed_data);
});

app.set('view engine', 'jade')

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.send("404 error")
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send(err.status)
    
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send();
});


module.exports = app;
