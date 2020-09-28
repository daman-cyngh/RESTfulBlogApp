var expressSanitizer = require("express-sanitizer"),
	express        	 = require("express"),
    app              = express(),body
    mongoose   	  	 = require("mongoose"),
    bodyParser 	  	 = require("body-parser"),
	methodOverride	 = require("method-override");


mongoose.connect("mongodb://localhost:27017/restful_blog_app", {
	useNewUrlParser: true,
	useUnifiedTopology: true
})
.then(() => console.log("Connected to DB!"))
.catch(error => console.log(error.message));

//APP CONFIG
app.set("view engine", "ejs");
app.use(express.static("public")); //tell custom stylesheet directory
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"))

//MONGOOSE/MODEL CONFIG
var blogSchema = mongoose.Schema( 
	{
		title   : String,
		image   : String,
		body    : String,
		created : 
				{
					type    : Date, 
					default : Date.now
				}
	});
var Blog = mongoose.model("Blog", blogSchema);

// Blog.create(
// 	{
// 		title	: "Test Blog",
// 		image	: "https://images.pexels.com/photos/38008/pexels-photo-38008.jpeg?auto=compress&cs=tinysrgb&h=350",
// 		body	: "Hi there, first blog body!!"
// }, function(err, blog) {
// 	if(err){
// 		console.log(err.message);
// 	}
// 	else {
// 		console.log("DATA ADDED SUCCESSFULLY:");
// 		console.log(blog);
// 	}
// });

//--------------------------------------------------------------------
//ROUTES GO HERE
//--------------------------------------------------------------------


app.get("/", function(req, res) {
	res.redirect("/blogs");
});

// INDEX ROUTE
app.get("/blogs", function(req, res) {
	Blog.find({}, function(err, blogs) {
		if(err){
			console.log(err.message);
		}
		else {
			res.render("index", {
									blogs: blogs
								});
		}
	});	
});

// NEW ROUTE
app.get("/blogs/new", function(req, res) {
	res.render("new");
});

// CREATE ROUTE
app.post("/blogs", function(req, res) {
	req.body.blog.body = sanitize(req.body.blog.body);
	//create a new blog
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("new");
		}
		//redirect to the index
		else {
			res.redirect("/blogs");
		}
	});
});

// SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
	Blog.findById(req.params.id, function(err, foundBlog) {
		if(err) {
			res.redirect("/blogs");
		}
		else {
			res.render("show", {
				blog: foundBlog
			});
		}
	});
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog) {
		if(err){
			res.redirect("/blogs");
		}
		else {
			res.render("edit", {blog: foundBlog});
		}
	});
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res) {
	req.body.blog.body = sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, upatedBlog) {
		if(err){
			res.redirect("/blogs");
		}
		else {
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

// DELETE ROUTE
app.delete("/blogs/:id", function(req, res) {
	//destroy blog
	Blog.findByIdAndRemove(req.params.id, function(err, deletedBlog){
		if(err){
			res.redirect("/blogs");
		}
		else {
			res.redirect("/blogs");
		}
	});
});

//set up listener
app.listen(process.env.PORT, process.env.IP, function(){
	console.log("Server Started!");
});