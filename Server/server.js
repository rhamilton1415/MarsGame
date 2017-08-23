const http = require('http');
const express = require('express');
const app = express();
const port = 80;

app.get('/',(request,response)=>
{
	response.send('hi');
});

app.use(express.static('..'))
app.listen(port,(err) =>
{
	if(err)
	{
		return console.log('err',err);
	}
	console.log('listening on ${port}');
});