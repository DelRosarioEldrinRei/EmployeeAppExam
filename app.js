const bodyParser       = require("body-parser");
const expressSanitizer = require('express-sanitizer');
const mongoose         = require("mongoose");
const express          = require("express");
const passport         = require("passport");
const LocalStrategy    = require("passport-local");
const methodOverride   = require('method-override')
const app              = express();

mongoose.set('useNewUrlParser', true);
mongoose.connect("mongodb://localhost/_dev_sample");
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));
app.set("view engine", "pug");
app.use(expressSanitizer());
app.use(methodOverride("_method"));

var employeeSchema = new mongoose.Schema({
	name : String,
	age : Number,
  username : String,
  password : String
});

// PASSPORT CONFIGURATION
app.use(require("express-session")({
  secret: "Once again ponger wins cutest fisher!",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const isLoggedIn = function(req, res, next){
  if(req.isAuthenticated()){
      return next();
  }
  res.redirect("/login");
}

var Employee = mongoose.model("Employee", employeeSchema);

app.get("/", (req,res) => {
  res.render("index");
});

app.get("/login", (req,res) => {
  res.render("login");
})

router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/employees",
        failureRedirect: "/login"
    }), function(req, res){
});

app.get("/employees", isLoggedIn, (req,res) => {
  Employee.find({}, (err, employees) => {
		if(err)
			console.log(err);
		else
			res.render("employees", {employees});
	});
});

app.get("/employees/new", isLoggedIn, (req,res) => {
  res.render("new");
});

app.post("/employees", isLoggedIn, (req,res) => {
  console.log(req.body);
  Employee.create(
    {
      name : req.body.name,
      age : parseFloat(req.body.age),
      username : req.body.username,
      password : req.body.password
    }, (err, employee) => {
      if(err)
        res.redirect("new");
      else
        res.redirect("/employees");
    });
});

app.get("/employees/:id", isLoggedIn, (req,res) => {
  Employee.findById(req.params.id, function(err, employee){
    if(err){
        res.redirect("/employees");
    } else {
        // res.render("show", {employee});
        res.render("show", {employee});
    }
})
});

app.get("/employees/:id/edit", (req,res) => {
  Employee.findById(req.params.id, function(err, employee){
    if(err){
        res.redirect("/employees");
    } else {
        res.render("edit", {employee});
    }
  });
});

app.put("/employees/:id", (req,res) => {
  // req.body.employee.body = req.sanitize(req.body.employee.body)
   Employee.findByIdAndUpdate(req.params.id, req.body, function(err, updatedEmployee){
      if(err){
          res.redirect("/employees");
      }  else {
        console.log(updatedEmployee);
          res.redirect("/employees/" + req.params.id);
      }
   });
});

app.delete("/employees/:id", (req,res) => {
  Employee.findByIdAndRemove(req.params.id, function(err){
    if(err){
        res.redirect("/employees");
    } else {
        res.redirect("/employees");
    }
  });
});


app.listen(3000, () => {
  console.log("Server has started!");
});