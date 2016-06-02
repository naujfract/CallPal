(function (lib, img, cjs, ss) {

var p; // shortcut to reference prototypes

// library properties:
lib.properties = {
	width: 550,
	height: 400,
	fps: 24,
	color: "#FFFFFF",
	manifest: []
};



// symbols:



(lib.Symbol2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#FFFFFF").p("AqaqaIU1AAIAAU1I01AAg");
	this.shape.setTransform(66.7,66.7);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#878787").s().p("AqaKbIAA01IU1AAIAAU1g");
	this.shape_1.setTransform(66.7,66.7);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1,-1,135.5,135.5);


(lib.Symbol1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#FFFFFF").p("AqaqaIU1AAIAAU1I01AAg");
	this.shape.setTransform(66.7,66.7);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#878787").s().p("AqaKbIAA01IU1AAIAAU1g");
	this.shape_1.setTransform(66.7,66.7);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1,-1,135.5,135.5);


// stage content:
(lib.Untitled5 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.stop()
		this.rectangle_mc.addEventListener("click", fl_ClickToPosition.bind(this));



		function fl_ClickToPosition()

		{
		this.play();
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(36));

	// Layer 1
	this.rectangle_mc = new lib.Symbol2();
	this.rectangle_mc.setTransform(83.7,208.7,1,1,0,0,0,66.7,66.7);

	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#FFFFFF").p("AqaqaIBkAAIEOAAIPDAAIAAU1I01AAg");
	this.shape.setTransform(-5.3,179.7);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#878787").s().p("EAo0AKbIAA01IBkAAIAAEYIEOAAIAAkYIPEAAIAAU1gEg9qgEeIAAkYIEOAAIAAEYg");
	this.shape_1.setTransform(332.7,169.7);

	this.instance = new lib.Symbol1();
	this.instance.setTransform(-5.3,179.7,1,1,0,0,0,66.7,66.7);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.rectangle_mc}]}).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.rectangle_mc}]},1).to({state:[{t:this.shape_1},{t:this.shape}]},1).to({state:[{t:this.instance}]},1).wait(1));
	this.timeline.addTween(cjs.Tween.get(this.rectangle_mc).wait(1).to({x:101,y:207.1},0).wait(1).to({x:118.4,y:205.5},0).wait(1).to({x:135.8,y:204},0).wait(1).to({x:153.2,y:202.4},0).wait(1).to({x:170.6,y:200.8},0).wait(1).to({x:188,y:199.2},0).wait(1).to({x:205.4,y:197.7},0).wait(1).to({x:222.8,y:196.1},0).wait(1).to({x:240.2,y:194.5},0).wait(1).to({x:257.6,y:192.9},0).wait(1).to({x:275,y:191.4},0).wait(1).to({x:292.4,y:189.8},0).wait(1).to({x:309.8,y:188.2},0).wait(1).to({x:327.2,y:186.6},0).wait(1).to({x:344.6,y:185.1},0).wait(1).to({x:362,y:183.5},0).wait(1).to({x:379.3,y:181.9},0).wait(1).to({x:396.7,y:180.3},0).wait(1).to({x:414.1,y:178.8},0).wait(1).to({x:431.5,y:177.2},0).wait(1).to({x:448.9,y:175.6},0).wait(1).to({x:466.3,y:174},0).wait(1).to({x:483.7,y:172.5},0).wait(1).to({x:501.1,y:170.9},0).wait(1).to({x:518.5,y:169.3},0).wait(1).to({x:535.9,y:167.7},0).wait(1).to({x:553.3,y:166.2},0).wait(1).to({x:570.7,y:164.6},0).wait(1).to({x:588.1,y:163},0).wait(1).to({x:605.5,y:161.4},0).wait(1).to({x:622.9,y:159.9},0).wait(1).to({x:640.3,y:158.3},0).wait(1).to({x:657.7,y:156.7},0).to({_off:true},1).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(291.5,341.5,134.5,134.5);

})(lib = lib||{}, images = images||{}, createjs = createjs||{}, ss = ss||{});
var lib, images, createjs, ss;
