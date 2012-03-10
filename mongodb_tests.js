/*
* Mongo DB performance tests
*/

var
  should      = require('should'),
  mongoose    = require('mongoose');

//init db connection
mongoose.connect('mongodb://localhost/test')
mongoose.connection.db.executeDbCommand( {dropDatabase:1},function(err){
  if (err) throw new Error('cannot clear db!')
})

// modules



//tests
describe('Mongo DB structure performance tests',function(){
})