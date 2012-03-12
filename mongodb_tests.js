/*
* Mongo DB performance tests
*/

var
  should      = require('should'),
  mongoose    = require('mongoose'),
  Schema      = mongoose.Schema,
  async       = require('async'),
  _           = require('underscore');

//init db connection
mongoose.connect('mongodb://localhost/test')

// modules
var UserSchema = new Schema({
  name          : {type: String, index:true },
  login         : {type: String, unique:true,index:true},
  description   : {type: String},
  contact      : [{
    address: {type: String}
  }]
});

var User = mongoose.model('user',UserSchema)

var CompanySchema = new Schema({
  name          : {type: String, index:true },
  vatNo         : {type: String, index:true ,unique:true},
  description   : {type: String}
});

var Company = mongoose.model('company',CompanySchema)

var UsersOfCompanySchema = new Schema({
  userId          : {type: Schema.ObjectId, index:true },
  companyId       : {type: Schema.ObjectId, index:true }
});

var UsersOfCompany = mongoose.model('usersofcompany',UsersOfCompanySchema)

var CompanyWithUsersSchema = new Schema({
  name          : {type: String, index:true },
  vatNo         : {type: String, index:true ,unique:true},
  description   : {type: String},
  users         : [{type: Schema.ObjectId, ref:'user'}]
});

var CompanyWithUsers = mongoose.model('companywithusers',CompanyWithUsersSchema)

var usersCount = 500;
var companiesCount = 10;

var longString = 'ABRA!'
for(var it1=0; it1 < 1; it1++){
  longString += longString;
}

//tests
describe('Mongo DB structure performance tests',function(){

  describe('Create companies with users (relation)',function(){
    it('should be successful', function(done){
      var companies = [];
      for (var it = 0; it < companiesCount; it++){
        companies.push({
          name          : 'company_rel_' + it,
          vatNo         : Math.random().toString(),
          description   : longString + Math.random().toString()
        })
      }

      async.forEach(companies,function(companyModel,cb){
          var company = new Company(companyModel)
          company.save(function(err){
            if(err){done(err)}
            var users = [];
            for (var it = 0; it < usersCount; it++){
              users.push({
                name          : company.name + '_user_' + it,
                login         : Math.random().toString(),
                description   : longString + Math.random().toString(),
                contact       : [
                  {address: Math.random().toString()},
                  {address: Math.random().toString()},
                  {address: Math.random().toString()},
                  {address: Math.random().toString()},
                  {address: Math.random().toString()},
                  {address: Math.random().toString()},
                  {address: Math.random().toString()},
                  {address: Math.random().toString()}]
              })
            }

            async.forEach(users,function(userModel,cb2){
                var user = new User(userModel)
                user.save(function(err){
                  if(err){cb2(err)}
                  else{
                    new UsersOfCompany({
                      companyId: company._id,
                      userId:   user._id
                    }).save(cb2)
                  }
                })
              },
              function(err){
                if(err){cb(err)}
                else{ cb() }
              })
          } )
        },
        function(err){
          if(err){done(err)}
          else{ done() }
        })
    })
  })



  describe('Create companies with users (dbrefs)',function(){
    it('should be successful', function(done){
      var companies = [];
      for (var it = 0; it < companiesCount; it++){
        companies.push({
          name          : 'company_ref_' + it,
          vatNo         : Math.random().toString(),
          description   : longString + Math.random().toString()
        })
      }

      async.forEach(companies,function(companyModel,cb){
          var company = new CompanyWithUsers(companyModel)
          company.save(function(err){
            if(err){done(err)}
            else {
              /*Company.find({_id:company._id},function(err,company){
                if(err){done(err)}
                else {*/
                  var users = [];
                  for (var it = 0; it < usersCount; it++){
                    users.push({
                      name          : company.name + '_user_' + it,
                      login         : Math.random().toString(),
                      description   : longString + Math.random().toString(),
                      contact       : [
                        {address: Math.random().toString()},
                        {address: Math.random().toString()},
                        {address: Math.random().toString()},
                        {address: Math.random().toString()},
                        {address: Math.random().toString()},
                        {address: Math.random().toString()},
                        {address: Math.random().toString()},
                        {address: Math.random().toString()}]
                    })
                  }

                  async.forEach(users,function(userModel,cb2){
                      var user = new User(userModel)
                      user.save(function(err){
                        if(err){cb2(err)}
                        else {
                          company.users.push(user)
                          company.save(cb2)
                        }
                      })
                    },
                    function(err){
                      if(err){cb(err)}
                      else{ cb() }
                    })
                /*}
              })*/
            }
          } )
        },
        function(err){
          if(err){done(err)}
          else{ done() }
        })
    })
  })


  describe('Query companies with users (relation)',function(){
    it('should be successful', function(done){
      Company.findOne({name:'company_rel_5'},function(err,company){
        if(err){done(err)}
        else{
          UsersOfCompany
            .find({'companyId': company._id})
            .select('userId')
            .skip(2)
            .limit(5)
            .run(function(err,usersIds){
              if(err){done(err)}
              else{
                usersIds = _.map(usersIds,function(userId){return userId.userId})

                User.find({_id:{$in:usersIds}},function(err,users){
                  if(err){done(err)}
                  else{
                    users.should.have.length(5)
                    done()
                  }
                })
              }
            })
        }
      })
    })
  })

  describe('Query companies with users (dbrefs)',function(){
    it('should be successful', function(done){
      CompanyWithUsers.findOne({name:'company_ref_5'})
        .populate('users',null,null,{skip:2,limit:5})
        .run(function(err,company){

        if(err){done(err)}
        else{
            company.users.should.have.length(5)
          done()
        }
      })
    })
  })
})

