//REQUIRE
var express = require("express");
var expressSession = require('express-session');
var exphbs = require("express-handlebars")
var passport = require("passport");
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require("bcrypt");
var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');

var app = express();
//Configure Mongoose================================
var dbURL = "mongodb://voting-app:c4rr07qu33n@ds131687.mlab.com:31687/voting-app";
mongoose.connect(dbURL,{ useMongoClient: true });
mongoose.Promise = global.Promise;
var userSchema = new mongoose.Schema({
	name:String,
	email:String,
	password: String
},{collection:'users'});
var User = mongoose.model("User",userSchema);

var pollSchema = new mongoose.Schema({
  userid: String,
  author: String,
  name: String,
  url: String,
  options:[{option:String,votes:Number}]
},{collection:'polls'});
var Poll = mongoose.model("Poll",pollSchema);

//BodyParser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//Configure Cookie Parser
app.use(cookieParser());

//Configure flash
app.use(flash());
//Configure Bcrypt
const saltRounds = 10;


//Configure Passport
app.use(expressSession({secret:'carrot'}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user._id);
});
passport.deserializeUser(function(id,done) {
  User.findById(id, function(err,user) {
    done(err,user);
  });
});

//PASSPORT Registration stategy

//Sign up strategy
passport.use('signup', new LocalStrategy({
    passReqToCallback : true,
    usernameField: "email",
    passwordField: "password"
  },
  function(req,username,password,done) {
    console.log("this far");
    User.findOne({"email":username},function(err, user) {
      if(err) { 
        console.log("Error in SignUp: " + err);
        return done(err);
      }
      // already exists
      if(user) {
        console.log('User already exists');
        return done(null, false, req.flash('message','User Already Exists'));
      } else {
       
        bcrypt.hash(password, 10, function(err, hash) {
          // Store hash in database

          //if there is no user with that email            
          //create user
          var newUser = new User();
          //set the user's local credentials
          console.log("here");
          newUser.name = req.param("name");
          newUser.email = username;
          newUser.password = hash;
          
          newUser.save( function(err) {
            if(err) {
              console.log('Error in Saving user: ' + err);
              throw err;
            }
               console.log('User Registration successful');
            return done(null, newUser);
           
          });
        });
      }
    });  
}));
//Login strategy
passport.use('login', new LocalStrategy({
  passReqToCallback : true,
  usernameField : "email",
  passwordField : "password" 
  }, 
  function(req,username,password,done) {
    User.findOne({"email":username}, function(err, user){
      if(err) {
        console.log("Error in LogIn: " + err);
        return done(err);
      }
      //does not exist
      if(!user) {
        return done(null,false, req.flash('message',"User not found"));
    
      }
      bcrypt.compare(password, user.password, function(err, res) {
      // res == true
        if(!res) {
          return done(null,false, req.flash('message',"Incorrect Password"));
        } else {
          console.log("User login succesful");
          return done(null, user);
        }
      });
    });
  })
);

//Handlebars
app.engine('handlebars',exphbs({defaultLayout:'main'}));
app.set('view engine','handlebars');

//============ROUTES=================================
app.use(express.static('public'));
app.get('/', function(req,res) {
    var name = "user";
    if(req.user) {
      name = req.user.name;
    }
    res.render('home',{user: req.user,username: name, front:true});
});
app.get('/signup', function(req,res) {
  var name = "user";
    if(req.user) {
      name = req.user.name;
    }
  res.render('signup',{user: req.user,username: name, front:false,message:req.flash("message")});
});

app.post('/signup', passport.authenticate('signup', {
  successRedirect: '/',
  failureRedirect: '/signup',
  failureFlash : true
}));

app.get('/login', function(req,res) {
    var name = "user";
    
      if(req.user) {
      name = req.user.name;
    }
  res.render('login',{user: req.user,username: name, front:false, message:req.flash("message")});
});
app.post('/login',
  passport.authenticate('login', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash : true }));
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/browseall', function(req,res){
  Poll.find({}, function(err,polls) {
    if(err) {
      console.log("Failed to Find All Polls in Database: " + err);
      throw err;
    } else {
      var name = "user";
      if(req.user) {
        name = req.user.name;
      }
      res.render('browseall',{user: null,username: name, front:false, polls:polls}); 
    }
  });
});

app.get('/mypolls', function(req,res) {
  if(!req.user) {
    res.redirect("/logout");
  }
  Poll.find({"userid":req.user._id},function(err,polls) {
    if(err) {
      console.log("Error in retrieving poll list: " + err);
      throw err;
    } else {
    var name = "user";
    if(req.user) {
      name = req.user.name;
    }
    console.log(polls);
    res.render('mypolls',{user: req.user,username: name, front:true, polls:polls,message:req.flash("message")});
      
    }
  });
});
app.post('/mypolls',function(req,res) {
  Poll.remove({ _id: req.body.pollid }, function(err){
    if(err) {
      console.log("Failed to delete poll: " + err);
      req.flash("message","Failed to remove poll (database error)");
      res.redirect("/mypolls");
    } else {
      req.flash("message","Poll was deleted");
      res.redirect("/mypolls");
    }
  });
});

app.get('/newpoll', function(req,res) {
  if(!req.user) {
    res.redirect("/logout");
  }
  var name = "user";
  if(req.user) {
    name = req.user.name;
  }
  res.render('newpoll', {user: req.users, username:name, front:true,message:req.flash("message")});
});
app.post('/newpoll', function(req,res) {
  console.log(req.body.options);
  Poll.findOne({userid:req.user._id, name:req.body.name}, function(err, poll){
      if(err) {
        console.log("Error in Checking Poll Exists: " + err);
        return done(err);
      }
      console.log("Poll pulled: " + poll);
      //does not exist
      if(poll != null) {
        req.flash("message","You have already created a poll by that name");
        res.redirect("/newpoll");
      } else {
        var newPoll = new Poll();
        newPoll.name = req.body.name;
        console.log(req.body.options);
        var options = [];
        for( var i=0; i < req.body.options.length;i++) {
          var option = { option:req.body.options[i],votes:0 };
          options.push(option);
        }
        newPoll.options = options;
        newPoll.userid = req.user._id;
        newPoll.url = "https://" + req.headers.host + "/polls/" + encodeURI(newPoll.userid) + "?name=" + encodeURI(newPoll.name)
        newPoll.author = req.user.name;
        
        newPoll.save(function(err) {
              if(err) {
                console.log('Error in Saving Poll: ' + err);
                throw err;
              }
              console.log('Poll upload successful');
          
              var name = "user";
              if(req.user) {
                name = req.user.name;
              }
            res.render('newpollsuccess',{user: req.user, username:name, front:true, url: newPoll.url});
        });
      }
  });
});
// test : https://5dde5d7e53924142b8f03bbe3e9873f8.vfs.cloud9.us-east-2.amazonaws.com/polls/5a40cc5da81bb0608fbe694d?name=time%20or%20space
app.get('/polls/:userid',function(req,res) {
  var userid = req.params.userid;
  var pollname = req.query.name;
  
  Poll.findOne({userid:userid,name:pollname},function(err,poll) {
    if(err) {
        console.log("Error in Retrieving Poll: " + err);
        throw err;
    } else {
      var name = "user";
      if(req.user) {
        name = req.user.name;
      }
      res.render("showpoll",{user: req.user, username:name, front:true,pollauthor: poll.author,userid: poll.userid, pollname:poll.name,options:poll.options,message:req.flash("message")});
    }
  });
});
app.post('/polls/add',function(req,res){
  var newOption = {option: req.body.newoption, votes:0};
  var userId = req.body.userid;
  var pollName = req.body.pollname;
  
  console.log(userId);
  
  Poll.findOne({userid:userId,name:pollName}, function(err,poll) {
      if(err) {
        console.log('Error in Retrieving Poll: ' + err);
        throw err;
      }
      var url = poll.url;
      var alreadyOption = false;
      for(var i=0; i < poll.options.length; i++) {
        if(poll.options[i].option.toLowerCase() == newOption.option.toLowerCase()) {
          alreadyOption = true;
        }
      }
      if(alreadyOption) {
        req.flash("message","New Option is already an Option");
        res.redirect(url);
      } else {
        Poll.update({userid:userId,name:pollName},
          {$addToSet : { options: newOption } },
          function(err) {
            if(err) {
              console.log("Error updating new Option to Poll: " + err);
              throw err;
            }
            res.redirect(url);  
        });
      }
  });
}); 
app.post('/polls/vote',function(req,res) {
  Poll.updateOne({"userid":req.body.userid,"name":req.body.pollname,"options.option":req.body.options},
    {$inc:{"options.$.votes" : 1}}, function(err) {
      if(err) {
        console.log("Error updating Vote to Poll: " + err);
        throw err;
      } else {
        Poll.findOne({userid:req.body.userid,name:req.body.pollname}, function(err,poll) {
          if(err) {
            console.log("Error retrieving Poll: " + err);
            throw err;
          } else {
            
            var name = "user";
            if(req.user) {
               name = req.user.name;
            }
            res.render("votesuccess",{user: req.user, username:name, front:true, pollauthor: poll.userid, pollname:poll.name, url:poll.url});
          }
        }); 
      }
  });
});

app.get("/changepassword",function(req,res){
  if(!req.user) {
    res.redirect("/logout");
  }
  res.render("changepassword",{user: req.user, front:true, message:req.flash("message")});
});
app.post("/changepassword",function(req,res){
  User.findOne({"_id":req.user._id}, function(err,user){
    if(err) {
      console.log("Error looking up User: " + err);
      throw err;
    } else {
      bcrypt.compare(req.body.old_password, user.password, function(err, bcres) {
        if(!bcres) {
          req.flash("message","Your password is incorrect");
          res.redirect("/changepassword");
        } else {
          bcrypt.hash(req.body.new_password, 10, function(err, hash) {
            if(err) {
              console.log("Error hashing new password: " + err);
              throw err;
            } else {
              User.updateOne({"_id":req.user._id}, {"password":hash}, function(err,dbres) {
                if(err) {
                  console.log("Error updating new password hash: " + err);
                  throw err;
                } else {
                  req.user.password = hash; 
                  res.redirect("/changepasswordsuccess");
                }
              });
            }
          });
        }
      });
    }
  });
});
app.get("/changepasswordsuccess",function(req,res) {
  if(!req.user) {
    res.redirect("/");
  }
  res.render("changepasswordsuccess",{user: req.user, front:true });
});
app.get('/api/:action', function(req,res) {
  var action = req.params.action;
  var userid = req.query.userid;
  var pollname = req.query.name;

  if(action == "polldata") {
    Poll.findOne({userid:userid,name:pollname},function(err,poll) {
      if(err) {
        console.log("Error retrieving poll Data: " + err);
        throw err;
      } else {
        res.setHeader("Content-Type", "text/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.end(JSON.stringify(poll)); 
      }
    });
    
  } else {
    res.setHeader("Content-Type", "text/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.end({message: "Invalid request"});
  }
});

//============PORT===================================
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});