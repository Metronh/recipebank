module.exports = function(app)
 {
  const { check, validationResult } = require('express-validator');
   const redirectLogin = (req, res, next) => {

   if (!req.session.userId ) {
     res.redirect('./login')
   } 
   else { next(); }
   }   
//////////////////////////////////////////////////////////////////////////////////////////////////////////
//This Exports a list of all the recipes
//Access api via https and terminal :
//curl -i www.doc.gold.ac.uk/usr/121/api
app.get('/api', function (req,res) {
     var MongoClient = require('mongodb').MongoClient;      //Calling mongo
     var url = 'mongodb://localhost';
     MongoClient.connect(url, function (err, client) {
     if (err) throw err                                                                                                                                                
     var db = client.db('recipebankdb');                     //Setting database                                                                                                                                
      db.collection('recipes').find().toArray((findErr, results) => {                                                                                                                                
      if (findErr) throw findErr;
      else
         res.json(results);                                 //Returning back a json file                                                                                         
      client.close();                                                                                                                                                   
  });
});
});



////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Rendering index
app.get('/',function(req,res){
         res.render('index.html');                          //Rendering index.html
 });     

////////////////////////////////////////////////////////////////////////////////////////////////
//Searching the database looking for the terms by creating a index for the search type of text
app.get('/search',redirectLogin,function(req,res){          
 res.render("search.html");             //Rendering search
 });


app.post('/search-result',function(req,res){
	//searching in the database

	var MongoClient = require('mongodb').MongoClient;     //Calling mongo client
	var url = 'mongodb://localhost';
     	MongoClient.connect(url, function (err, client) {   
		var db = client.db('recipebankdb');                 //Selecting database 
    const searchTerm = req.sanitize(req.body.keyword);    //Sanitizing keyword  
    db.collection('recipes').createIndex({"$**":"text"});   //This means any element field of type text
		db.collection('recipes').find({$text:{$search:searchTerm}}).toArray((findErr,results) => {    //getting search terms and turning it to an array
		if (findErr) throw findErr;
      		else
        	 res.render('search-result.ejs', {availablerecipes:results});
      		client.close();
	
});
});
});

/////////////////////////////////////////////////////////////////////////////////
//Regestering everything and santizing username email and password as well as hashing

app.get('/register', function (req,res){ 
res.render('register.html');     
});                                                                                 
app.post('/registered', [check('email').isEmail(),check('password').isLength({min:5})], function (req,res) {//Checking if element is a email and password is longer than 5 charaters
    
   const errors = validationResult(req);
	 if (!errors.isEmpty()) 
         {
		res.redirect('./register'); //Sending them back to register page
         }	
	else{	
		const bcrypt = require('bcrypt');
		const saltRounds = 10;
		const plainPassword = req.sanitize(req.body.password); //Sanitizations
		const usernameVar = req.sanitize(req.body.username);
		const emailVar = req.sanitize(req.body.email);
		bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
       		// saving data in database
       		var MongoClient = require('mongodb').MongoClient;
       		var url = 'mongodb://localhost';
	

       		MongoClient.connect(url, function(err, client) {
        		if (err) throw err;
        		var db = client.db ('recipebankdb');

            db.collection('users').insertOne({username: usernameVar, password: hashedPassword, email:emailVar }); //putting in user collection
            client.close();

			res.send('You are now registered, Your user name is: '+ usernameVar + ' your password is: '+ plainPassword +' email: '+emailVar+ ' and your hashed password is: '+ hashedPassword + " <a href='./'>Home</a>");
 })
});

}


 }); 

//////////////////////////////////////////////////////////////////////////////////
//Listing all the recipes
app.get('/list',redirectLogin,function(req, res) {

      var MongoClient = require('mongodb').MongoClient;
      var url = 'mongodb://localhost';
      MongoClient.connect(url, function (err, client) {
      if (err) throw err;


      var db = client.db('recipebankdb');

      db.collection('recipes').find().toArray((findErr, results) => {

      if (findErr) throw findErr;
      else
         res.render('list.ejs', {availablerecipes:results});
      client.close();

  });
});

    });
//////////////////////////////////////////////////////////////////////////////////////
app.get('/addrecipe',redirectLogin, function (req,res){

res.render('addrecipe.html');

});
/////////////////////////////////////////////////////////////////////////////////////
app.post('/recipeadded', function (req,res) {

        //Adding recipes to the database
       var MongoClient = require('mongodb').MongoClient;
       var url = 'mongodb://localhost';
       const cleanFood = req.sanitize(req.body.foodName);//santitizing food names and instructions
       const cleanInstructions = req.sanitize(req.body.instructions);
       const cleanUser = req.sanitize(req.body.userName);

       MongoClient.connect(url, function(err, client) {
        if (err) throw err;
        var db = client.db ('recipebankdb');


        db.collection('recipes').insertOne({foodName: cleanFood, instructions: cleanInstructions, userName:cleanUser}); //Inserting into recipe collection
        client.close();

        res.send("The recipe for "+ req.body.foodName+" has been added to the database. <a href='./'>Home</a>");
        });


 });
/////////////////////////////////////////////////////////////////////////////////
app.get('/updaterecipe',redirectLogin, function (req,res){
  res.render('updaterecipe.html');          
});

app.post('/recipeupdated', function (req,res){
  // Updating recipes 
  const cleanFood = req.sanitize(req.body.foodName);      //Santitzing inputs 
  const cleanInstructions = req.sanitize(req.body.instructions);
  const cleanUsername = req.sanitize(req.body.username);
  var MongoClient = require('mongodb').MongoClient;
  var url = 'mongodb://localhost';
  MongoClient.connect(url, function (err, client){
    if(err) throw err;

    var db = client.db('recipebankdb');

    
    
    db.collection('recipes').updateOne({foodName:cleanFood},{$set :{instructions:cleanInstructions,username:cleanUsername}},function(err,res){ //Putting new instructions and usernames into the recipes collection
      if (err) throw err;
      client.close();
    });
    res.send("The recipe for "+cleanFood+" has been updated <a href='./'>Home</a>"); 
  })
  
})

///////////////////////////////////////////////////////////////////////////////
app.get('/delete',redirectLogin, function(req,res){
  res.render('deleterecipe.html');
})

app.post('/reciped',function (req,res){
  const cleanFood = req.sanitize(req.body.foodName);    //Sanitizing the input 
  var MongoClient = require('mongodb').MongoClient;
  var url = 'mongodb://localhost';

  MongoClient.connect(url,function(err, client){
    if(err) throw err;                                  
    var db = client.db('recipebankdb');
    db.collection('recipes').remove({foodName:cleanFood});    //Removing the whole record
      if (err) throw err;
      client.close();
      res.send("The recipe for "+cleanFood+" has been deleted <a href='./'>Home</a>");
  }
  )  
})



////////////////////////////////////////////////////////////////////////////////
app.get('/login', function(req,res){    
	res.render('login.html');
})
app.post('/loggedin',function(req,res){         
	const bcrypt = require('bcrypt');
	const plainPassword = req.sanitize(req.body.password); //Sanitizing password and username 
	const usernameVar = req.sanitize(req.body.username);
	var MongoClient = require('mongodb').MongoClient;
	var url = 'mongodb://localhost';

	MongoClient.connect(url, function(err, client){
	if(err) throw err;
	 
	var db = client.db('recipebankdb');


	db.collection('users').findOne({username:usernameVar},function(err, result){  //finding username and comparing to password
if (err) throw err;
else
	if(result == null){
		res.send("The account doesn't exist");
	}
	else{
		var hashedPassword = result.password;
	
        	bcrypt.compare(plainPassword, hashedPassword, function(err, result) {
        // if result == true ...
		if(err) throw err;
       		if(result){
// **** save user session here, when login is successful

req.session.userId = req.body.username;

    res.send('You are now loggedin, You user name is: '+ req.body.username + ' your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword+ '<br />'+'<a href='+'./'+'>Home</a>');
        	}
        	else{
                	res.send('Password or username is wrong');
        	}
        	});
	}

client.close();
});
});
});
app.get('/logout', redirectLogin, (req,res) => {
     req.session.destroy(err => {
     if (err) {
       return res.redirect('./')
     }
     res.send('you are now logged out. <a href='+'./'+'>Home</a>');
     })
     })

//------------------  

};





