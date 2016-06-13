(function (lib, img, cjs, ss) {

var p; // shortcut to reference prototypes

// library properties:
lib.properties = {
	width: 750,
	height: 1334,
	fps: 24,
	color: "#FFFFFF",
	manifest: []
};



// symbols:



// stage content:
(lib.avatarhtml5 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
		var page_body = document.getElementsByTagName("body")[0];
		
		
		var page_canvas = document.getElementsByTagName("canvas")[0];
		stageWidth = page_canvas.width;
		stageHeight = page_canvas.height;
		
		var viewport = document.querySelector('meta[name=viewport]');
		var viewportContent = 'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=0';
		
		if (viewport === null) {
			var head = document.getElementsByTagName('head')[0];
			viewport = document.createElement('meta');
			viewport.setAttribute('name', 'viewport');
			head.appendChild(viewport);
		}
		
		viewport.setAttribute('content', viewportContent);
		
		function onResize() {
			var widthToHeight = stageWidth / stageHeight;
			var newWidth = window.innerWidth;
			var newHeight = window.innerHeight;
			var newWidthToHeight = newWidth / newHeight;
			//
			if (newWidthToHeight > widthToHeight) {
				newWidth = newHeight * widthToHeight;
				page_canvas.style.height = newHeight + "px";
				page_canvas.style.width = newWidth + "px";
			} else {
				newHeight = newWidth / widthToHeight;
				page_canvas.style.height = newHeight + "px";
				page_canvas.style.width = newWidth + "px";
			}
			scale = newWidthToHeight / widthToHeight;
			stage.width = newWidth;
			stage.height = newHeight;
			page_canvas.style.marginTop = ((window.innerHeight - newHeight) / 2) + "px";
			page_canvas.style.marginLeft = ((window.innerWidth - newWidth) / 2) + "px";
		}
		
		window.onresize = function () {
			onResize();
		}
		
		onResize();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(2));

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#BFBFBF").ss(3).p("Egb6A9KMA31AAAMAAAh6TMg31AAAg");
	this.shape.setTransform(570.8,587.6);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#BFBFBF").ss(15).p("At0AAIbpAA");
	this.shape_1.setTransform(172.5,810.5);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f().s("#BFBFBF").ss(15).p("AxkAAMAjJAAA");
	this.shape_2.setTransform(196.5,764.5);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f().s("#BFBFBF").ss(15).p("AxkAAMAjJAAA");
	this.shape_3.setTransform(196.5,718.5);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f().s("#BFBFBF").ss(15).p("AxkAAMAjJAAA");
	this.shape_4.setTransform(196.5,672.5);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f().s("#BFBFBF").ss(15).p("AxkAAMAjJAAA");
	this.shape_5.setTransform(196.5,626.5);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f().s("#BFBFBF").ss(15).p("AxkAAMAjJAAA");
	this.shape_6.setTransform(196.5,580.5);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#BFBFBF").s().p("An6SyQjrhji0i1Qi1i1hjjqQhnjyAAkJQAAkIBnjzQBjjqC1i1QC0i0DrhjQDyhmEIAAQEJAADyBmQDrBjC1C0QC0C1BjDqQBnDzAAEIQAAEJhnDyQhjDqi0C1Qi1C1jrBjQjyBmkJABQkIgBjyhmg");
	this.shape_7.setTransform(198,364.1);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#BFBFBF").s().p("AgeCqQgPgCgNgGQgNgFgLgJQgLgIgIgLQgJgLgHgOIgLgdQgGgWgDg1QAAgbAJguIALgeQAHgOAJgLQAIgLALgIQALgIANgGQANgFAPgDQAPgDAPAAQARAAAPADQAPADANAFQAMAGAMAIQAKAIAJALQAJALAGAOIAMAeQAIAuAAAbQgDA0gGAWIgLAeQgHAOgIALQgJAKgLAIQgLAJgNAGQgNAGgPACQgOADgRAAgAgfhoQgNAGgJAOQgJANgEAWQgEAVAAAcQAAAeAEAUQAEAWAJANQAIANAOAHQAOAGARAAQATAAANgGQAOgHAJgOQAIgNAEgVQAFgVAAgdQAAgdgEgUQgEgWgJgNQgJgOgOgGQgNgHgTAAQgRAAgOAHg");
	this.shape_8.setTransform(699.2,918.1);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#BFBFBF").s().p("AgeCqQgPgCgNgGQgNgFgLgJQgLgIgIgLQgJgLgHgOIgLgdQgGgWgDg1QAAgbAJguIALgeQAHgOAJgLQAIgLALgIQALgIANgGQANgFAPgDQAPgDAPAAQARAAAPADQAPADANAFQAMAGAMAIQAKAIAJALQAJALAGAOIAMAeQAIAuAAAbQgDA0gGAWIgLAeQgHAOgIALQgJAKgLAIQgLAJgNAGQgNAGgPACQgOADgRAAgAgfhoQgNAGgJAOQgJANgEAWQgEAVAAAcQAAAeAEAUQAEAWAJANQAIANAOAHQAOAGARAAQATAAANgGQAOgHAJgOQAIgNAEgVQAFgVAAgdQAAgdgEgUQgEgWgJgNQgJgOgOgGQgNgHgTAAQgRAAgOAHg");
	this.shape_9.setTransform(666.4,918.1);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#BFBFBF").s().p("Ag+CoQgWgFgSgJQgBgQAEgOQAFgPAIgJQAMAFAOAEQAPACAPABQAQgBANgDQALgEAIgGQAJgHAFgJQAEgKAAgNQAAgLgEgJQgEgIgJgHQgIgFgLgEQgLgDgQAAIgFAAQgEgLAAgKQAAgLAEgLIAHAAQAZAAALgLQAOgLAAgWQAAgRgLgLQgKgKgSABQgNAAgLAFQgLAFgIAJQgNgFgIgKQgJgJgDgPQAPgSAXgMQAYgKAZAAQATAAARAGQASAGAMAMQAMAMAHARQAGAQAAAVQAAAYgLAUQgLATgSAJQAMAEAKAGQAKAFAIALQAHAKAEANQAEAOAAAPQAAAZgIAUQgJATgPAOQgRANgXAHQgXAHgbAAQgWAAgVgFg");
	this.shape_10.setTransform(637.4,918.1);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#BFBFBF").s().p("AiTCUQg+g9AAhXQAAhWA+g+QA9g9BWAAQBXAAA+A9QA9A+AABWQAABXg9A9Qg+A+hXAAQhWAAg9g+g");
	this.shape_11.setTransform(597.9,918.2);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#BFBFBF").s().p("AqeEXIAAotIU9AAIAAItg");
	this.shape_12.setTransform(646.5,857.1);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#BFBFBF").s().p("ApPJQIAAyfISfAAIAASfg");
	this.shape_13.setTransform(482.8,886);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#BFBFBF").s().p("AgeCqQgPgDgNgFQgNgGgLgIQgLgIgIgMQgJgKgHgNIgLgfQgGgVgDg1QAAgaAJgvIALgeQAHgNAJgLQAIgLALgJQALgIANgGQANgGAPgCQAPgDAPAAQARAAAPADQAPACANAGQAMAGAMAIQAKAJAJALQAJALAGANIAMAeQAIAvAAAaQgDA0gGAWIgLAeQgHAOgIAKQgJALgLAJQgLAIgNAGQgNAFgPADQgOADgRAAgAgfhpQgNAHgJAOQgJAOgEAUQgEAWAAAcQAAAdAEAWQAEAUAJAOQAIAOAOAGQAOAGARAAQATAAANgGQAOgGAJgOQAIgOAEgVQAFgVAAgdQAAgcgEgWQgEgVgJgNQgJgOgOgHQgNgGgTAAQgRAAgOAGg");
	this.shape_14.setTransform(699.2,770.1);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#BFBFBF").s().p("AgeCqQgPgDgNgFQgNgGgLgIQgLgIgIgMQgJgKgHgNIgLgfQgGgVgDg1QAAgaAJgvIALgeQAHgNAJgLQAIgLALgJQALgIANgGQANgGAPgCQAPgDAPAAQARAAAPADQAPACANAGQAMAGAMAIQAKAJAJALQAJALAGANIAMAeQAIAvAAAaQgDA0gGAWIgLAeQgHAOgIAKQgJALgLAJQgLAIgNAGQgNAFgPADQgOADgRAAgAgfhpQgNAHgJAOQgJAOgEAUQgEAWAAAcQAAAdAEAWQAEAUAJAOQAIAOAOAGQAOAGARAAQATAAANgGQAOgGAJgOQAIgOAEgVQAFgVAAgdQAAgcgEgWQgEgVgJgNQgJgOgOgHQgNgGgTAAQgRAAgOAGg");
	this.shape_15.setTransform(666.4,770.1);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f("#BFBFBF").s().p("Ag+CoQgWgFgSgKQgBgPAEgOQAFgPAIgKQAMAGAOADQAPADAPABQAQAAANgEQALgEAIgGQAJgHAFgKQAEgJAAgMQAAgMgEgJQgEgJgJgFQgIgHgLgCQgLgDgQAAIgFAAQgEgLAAgLQAAgLAEgLIAHAAQAZAAALgLQAOgMAAgUQAAgTgLgJQgKgLgSAAQgNAAgLAGQgLAFgIAKQgNgGgIgKQgJgKgDgOQAPgTAXgKQAYgLAZAAQATAAARAHQASAGAMAMQAMALAHARQAGAQAAAVQAAAZgLATQgLATgSAKQAMACAKAHQAKAGAIAKQAHAKAEAOQAEANAAAQQAAAZgIATQgJAUgPANQgRANgXAHQgXAHgbAAQgWAAgVgFg");
	this.shape_16.setTransform(637.4,770.1);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("#BFBFBF").s().p("AiTCUQg+g9AAhXQAAhWA+g+QA9g9BWAAQBXAAA+A9QA9A+AABWQAABXg9A9Qg+A+hXAAQhWAAg9g+g");
	this.shape_17.setTransform(597.9,770.2);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f("#BFBFBF").s().p("AqeEXIAAotIU9AAIAAItg");
	this.shape_18.setTransform(646.5,709.1);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.f("#BFBFBF").s().p("ApPJQIAAyfISfAAIAASfg");
	this.shape_19.setTransform(482.8,738);

	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.f("#BFBFBF").s().p("AgeCqQgPgCgNgGQgNgGgLgIQgLgIgIgLQgJgLgHgOIgLgeQgGgVgDg1QAAgbAJguIALgeQAHgNAJgMQAIgKALgJQALgIANgGQANgGAPgCQAPgDAPAAQARAAAPADQAPACANAGQAMAGAMAIQAKAJAJAKQAJAMAGANIAMAeQAIAuAAAbQgDA1gGAVIgLAeQgHANgIAMQgJAKgLAIQgLAJgNAGQgNAGgPACQgOADgRAAgAgfhoQgNAGgJANQgJAOgEAWQgEAVAAAcQAAAeAEAUQAEAWAJANQAIANAOAHQAOAGARAAQATAAANgGQAOgHAJgOQAIgNAEgVQAFgVAAgdQAAgdgEgUQgEgWgJgOQgJgNgOgGQgNgHgTAAQgRAAgOAHg");
	this.shape_20.setTransform(699.2,622.1);

	this.shape_21 = new cjs.Shape();
	this.shape_21.graphics.f("#BFBFBF").s().p("AgeCqQgPgCgNgGQgNgGgLgIQgLgIgIgLQgJgLgHgOIgLgeQgGgVgDg1QAAgbAJguIALgeQAHgNAJgMQAIgKALgJQALgIANgGQANgGAPgCQAPgDAPAAQARAAAPADQAPACANAGQAMAGAMAIQAKAJAJAKQAJAMAGANIAMAeQAIAuAAAbQgDA1gGAVIgLAeQgHANgIAMQgJAKgLAIQgLAJgNAGQgNAGgPACQgOADgRAAgAgfhoQgNAGgJANQgJAOgEAWQgEAVAAAcQAAAeAEAUQAEAWAJANQAIANAOAHQAOAGARAAQATAAANgGQAOgHAJgOQAIgNAEgVQAFgVAAgdQAAgdgEgUQgEgWgJgOQgJgNgOgGQgNgHgTAAQgRAAgOAHg");
	this.shape_21.setTransform(666.4,622.1);

	this.shape_22 = new cjs.Shape();
	this.shape_22.graphics.f("#BFBFBF").s().p("Ag+CoQgWgFgSgJQgBgQAEgOQAFgOAIgKQAMAFAOAEQAPACAPAAQAQAAANgDQALgDAIgHQAJgHAFgJQAEgKAAgNQAAgLgEgJQgEgIgJgHQgIgFgLgEQgLgDgQAAIgFAAQgEgLAAgJQAAgMAEgLIAHAAQAZAAALgLQAOgMAAgVQAAgRgLgLQgKgKgSAAQgNABgLAFQgLAFgIAJQgNgFgIgJQgJgLgDgOQAPgTAXgKQAYgLAZAAQATAAARAGQASAHAMALQAMANAHAQQAGAQAAAVQAAAYgLAUQgLATgSAJQAMAEAKAGQAKAGAIAKQAHAKAEANQAEAOAAAPQAAAZgIAUQgJATgPAOQgRANgXAHQgXAHgbAAQgWAAgVgFg");
	this.shape_22.setTransform(637.4,622.1);

	this.shape_23 = new cjs.Shape();
	this.shape_23.graphics.f("#BFBFBF").s().p("AiTCUQg+g9AAhXQAAhWA+g+QA9g9BWAAQBXAAA+A9QA9A+AABWQAABXg9A9Qg+A+hXAAQhWAAg9g+g");
	this.shape_23.setTransform(597.9,622.2);

	this.shape_24 = new cjs.Shape();
	this.shape_24.graphics.f("#BFBFBF").s().p("AqeEXIAAotIU9AAIAAItg");
	this.shape_24.setTransform(646.5,561.1);

	this.shape_25 = new cjs.Shape();
	this.shape_25.graphics.f("#BFBFBF").s().p("ApPJQIAAyfISfAAIAASfg");
	this.shape_25.setTransform(482.8,590);

	this.shape_26 = new cjs.Shape();
	this.shape_26.graphics.f("#BFBFBF").s().p("AgeCqQgPgDgNgFQgNgGgLgIQgLgIgIgLQgJgLgHgNIgLgeQgGgWgDg1QAAgaAJgvIALgeQAHgNAJgLQAIgLALgJQALgIANgGQANgGAPgCQAPgDAPAAQARAAAPADQAPACANAGQAMAGAMAIQAKAJAJALQAJALAGANIAMAeQAIAvAAAaQgDA0gGAWIgLAeQgHANgIAMQgJAKgLAJQgLAIgNAGQgNAFgPADQgOADgRAAgAgfhpQgNAHgJAOQgJAOgEAVQgEAVAAAcQAAAdAEAWQAEAUAJAOQAIAOAOAGQAOAGARAAQATAAANgGQAOgGAJgOQAIgOAEgVQAFgVAAgdQAAgdgEgUQgEgWgJgNQgJgOgOgHQgNgGgTAAQgRAAgOAGg");
	this.shape_26.setTransform(699.2,474.1);

	this.shape_27 = new cjs.Shape();
	this.shape_27.graphics.f("#BFBFBF").s().p("AgeCqQgPgDgNgFQgNgGgLgIQgLgIgIgLQgJgLgHgNIgLgeQgGgWgDg1QAAgaAJgvIALgeQAHgNAJgLQAIgLALgJQALgIANgGQANgGAPgCQAPgDAPAAQARAAAPADQAPACANAGQAMAGAMAIQAKAJAJALQAJALAGANIAMAeQAIAvAAAaQgDA0gGAWIgLAeQgHANgIAMQgJAKgLAJQgLAIgNAGQgNAFgPADQgOADgRAAgAgfhpQgNAHgJAOQgJAOgEAVQgEAVAAAcQAAAdAEAWQAEAUAJAOQAIAOAOAGQAOAGARAAQATAAANgGQAOgGAJgOQAIgOAEgVQAFgVAAgdQAAgdgEgUQgEgWgJgNQgJgOgOgHQgNgGgTAAQgRAAgOAGg");
	this.shape_27.setTransform(666.4,474.1);

	this.shape_28 = new cjs.Shape();
	this.shape_28.graphics.f("#BFBFBF").s().p("Ag+CoQgWgFgSgKQgBgPAEgOQAFgPAIgKQAMAGAOADQAPAEAPAAQAQAAANgEQALgEAIgGQAJgHAFgKQAEgJAAgMQAAgMgEgJQgEgJgJgGQgIgFgLgEQgLgCgQAAIgFAAQgEgLAAgLQAAgLAEgLIAHAAQAZAAALgLQAOgMAAgUQAAgTgLgJQgKgKgSAAQgNgBgLAGQgLAFgIAKQgNgGgIgKQgJgKgDgOQAPgSAXgMQAYgKAZAAQATAAARAHQASAFAMANQAMAMAHAQQAGARAAAUQAAAZgLATQgLATgSAJQAMADAKAHQAKAFAIALQAHAKAEAOQAEANAAAQQAAAZgIATQgJAUgPANQgRANgXAHQgXAHgbAAQgWAAgVgFg");
	this.shape_28.setTransform(637.4,474.1);

	this.shape_29 = new cjs.Shape();
	this.shape_29.graphics.f("#BFBFBF").s().p("AiTCUQg+g9AAhXQAAhWA+g+QA9g9BWAAQBXAAA+A9QA9A+AABWQAABXg9A9Qg+A+hXAAQhWAAg9g+g");
	this.shape_29.setTransform(597.9,474.2);

	this.shape_30 = new cjs.Shape();
	this.shape_30.graphics.f("#BFBFBF").s().p("AqeEXIAAotIU9AAIAAItg");
	this.shape_30.setTransform(646.5,413.1);

	this.shape_31 = new cjs.Shape();
	this.shape_31.graphics.f("#BFBFBF").s().p("ApPJQIAAyfISfAAIAASfg");
	this.shape_31.setTransform(482.8,442);

	this.shape_32 = new cjs.Shape();
	this.shape_32.graphics.f("#BFBFBF").s().p("AgeCqQgPgCgNgGQgNgGgLgIQgLgIgIgMQgJgKgHgOIgLgeQgGgVgDg1QAAgbAJguIALgeQAHgNAJgMQAIgKALgJQALgIANgGQANgGAPgCQAPgDAPAAQARAAAPADQAPACANAGQAMAGAMAIQAKAJAJAKQAJAMAGANIAMAeQAIAuAAAbQgDA1gGAVIgLAeQgHANgIALQgJAMgLAHQgLAJgNAGQgNAGgPACQgOADgRAAgAgfhpQgNAHgJANQgJAPgEAUQgEAWAAAcQAAAeAEAUQAEAWAJANQAIANAOAHQAOAGARAAQATAAANgGQAOgHAJgOQAIgNAEgVQAFgVAAgdQAAgcgEgWQgEgVgJgOQgJgNgOgHQgNgGgTAAQgRAAgOAGg");
	this.shape_32.setTransform(699.2,326.1);

	this.shape_33 = new cjs.Shape();
	this.shape_33.graphics.f("#BFBFBF").s().p("AgeCqQgPgCgNgGQgNgGgLgIQgLgIgIgMQgJgKgHgOIgLgeQgGgVgDg1QAAgbAJguIALgeQAHgNAJgMQAIgKALgJQALgIANgGQANgGAPgCQAPgDAPAAQARAAAPADQAPACANAGQAMAGAMAIQAKAJAJAKQAJAMAGANIAMAeQAIAuAAAbQgDA1gGAVIgLAeQgHANgIALQgJAMgLAHQgLAJgNAGQgNAGgPACQgOADgRAAgAgfhpQgNAHgJANQgJAPgEAUQgEAWAAAcQAAAeAEAUQAEAWAJANQAIANAOAHQAOAGARAAQATAAANgGQAOgHAJgOQAIgNAEgVQAFgVAAgdQAAgcgEgWQgEgVgJgOQgJgNgOgHQgNgGgTAAQgRAAgOAGg");
	this.shape_33.setTransform(666.4,326.1);

	this.shape_34 = new cjs.Shape();
	this.shape_34.graphics.f("#BFBFBF").s().p("Ag+CoQgWgFgSgJQgBgQAEgOQAFgOAIgKQAMAFAOAEQAPACAPAAQAQABANgEQALgDAIgHQAJgHAFgJQAEgKAAgNQAAgLgEgJQgEgJgJgFQgIgHgLgCQgLgEgQAAIgFAAQgEgKAAgKQAAgMAEgLIAHAAQAZAAALgLQAOgLAAgWQAAgRgLgLQgKgKgSAAQgNABgLAFQgLAFgIAJQgNgFgIgJQgJgLgDgOQAPgTAXgKQAYgLAZAAQATAAARAGQASAHAMALQAMANAHAQQAGAQAAAVQAAAYgLAUQgLATgSAKQAMADAKAGQAKAGAIAKQAHAKAEANQAEAOAAAPQAAAZgIAUQgJATgPAOQgRANgXAHQgXAHgbAAQgWAAgVgFg");
	this.shape_34.setTransform(637.4,326.1);

	this.shape_35 = new cjs.Shape();
	this.shape_35.graphics.f("#BFBFBF").s().p("AiTCUQg+g9AAhXQAAhWA+g+QA9g9BWAAQBXAAA+A9QA9A+AABWQAABXg9A9Qg+A+hXAAQhWAAg9g+g");
	this.shape_35.setTransform(597.9,326.2);

	this.shape_36 = new cjs.Shape();
	this.shape_36.graphics.f("#BFBFBF").s().p("AqeEXIAAotIU9AAIAAItg");
	this.shape_36.setTransform(646.5,265.1);

	this.shape_37 = new cjs.Shape();
	this.shape_37.graphics.f("#BFBFBF").s().p("ApPJQIAAyfISfAAIAASfg");
	this.shape_37.setTransform(482.8,294);

	this.shape_38 = new cjs.Shape();
	this.shape_38.graphics.f("#FFFFFF").s().p("AjJDKQhThUAAh2QAAh1BThUQBVhTB0AAQB2AABTBTQBUBUAAB1QAAB2hUBUQhTBTh2AAQh0AAhVhTg");
	this.shape_38.setTransform(0.4,1121.9);

	this.shape_39 = new cjs.Shape();
	this.shape_39.graphics.f("#FFFFFF").s().p("AjIDKQhUhUAAh2QAAh1BUhUQBThTB1AAQB2AABTBTQBUBUAAB1QAAB2hUBUQhTBTh2AAQh1AAhThTg");
	this.shape_39.setTransform(100.4,1121.9);

	this.shape_40 = new cjs.Shape();
	this.shape_40.graphics.f("#FFFFFF").s().p("AjIDKQhUhUAAh2QAAh1BUhUQBThTB1AAQB2AABTBTQBUBUAAB1QAAB2hUBUQhTBTh2AAQh1AAhThTg");
	this.shape_40.setTransform(201.2,1121.9);

	this.shape_41 = new cjs.Shape();
	this.shape_41.graphics.f("#FFFFFF").s().p("AjMDNQhWhVAAh4QAAh3BWhVQBVhWB3AAQB4AABWBWQBVBVAAB3QAAB4hVBVQhWBWh4AAQh3AAhVhWg");
	this.shape_41.setTransform(750.9,1121.4);

	this.shape_42 = new cjs.Shape();
	this.shape_42.graphics.f("#FFFFFF").s().p("AjNDNQhVhVAAh4QAAh3BVhVQBWhWB3AAQB4AABWBWQBVBVAAB3QAAB4hVBVQhWBWh4AAQh3AAhWhWg");
	this.shape_42.setTransform(541.3,1121.4);

	this.shape_43 = new cjs.Shape();
	this.shape_43.graphics.f("#FFFFFF").s().p("AjMDNQhWhVAAh4QAAh3BWhVQBVhWB3AAQB4AABVBWQBWBVAAB3QAAB4hWBVQhVBWh4AAQh3AAhVhWg");
	this.shape_43.setTransform(645.7,1121.4);

	this.shape_44 = new cjs.Shape();
	this.shape_44.graphics.f("#FFFFFF").s().p("AgoCrQgWgIgOgRQgPgQgHgaQgHgZAAgiQAAggAHgXQAHgZANgSQAOgRATgJQATgJAZAAQARAAATAHQASAHAPANIAAhzQATgFATAFIAAFLQgVAMgZAGQgaAHgaAAQgbAAgVgJgAgagtQgOAGgJAMQgJAMgEARQgFASAAAZQAAAZAFASQAFASAKANQAJAMAPAGQAPAGASAAIAfgDQAQgDALgFIAAiVQgLgQgRgJQgSgKgSAAQgQAAgOAHg");
	this.shape_44.setTransform(454.9,1117.5);

	this.shape_45 = new cjs.Shape();
	this.shape_45.graphics.f("#FFFFFF").s().p("AglB9QgWgIgPgSQgPgRgIgZQgIgZABggQgBgeAIgZQAHgaAQgRQAOgSAWgJQAVgJAZAAQAXABASAGQASAGAMAMQANAMAGASQAHASAAAXQAAAYgGAcQg3AIgdABQg3gCgZgFQABAVAHAPQAGAPALALQALAKAPAFQAOAGATgBQAQABARgGQARgFAPgKQAOAKAAATQgSANgWAHQgXAHgYAAQgaABgWgKgAgVhdQgOAFgKAKQgIALgGAPQgFAPgCAUQAjAHAiAAQAiAAAfgFIABgWQAAgPgEgMQgEgLgIgHQgIgIgMgEQgLgEgPAAQgPAAgNAFg");
	this.shape_45.setTransform(428.3,1122.1);

	this.shape_46 = new cjs.Shape();
	this.shape_46.graphics.f("#FFFFFF").s().p("AgZChQgLgDgHgJQgHgJgEgMQgEgNAAgRIAAjoQAHgLAKgIQAKgHALgFIAABEIBGAAQABATgLAQIg8AAIAACZQAAAUAHAJQAGAKANAAQAUAAAWgOQAGAFADAIQADAIgBAJQgNAJgPAGQgQAFgPAAQgOAAgLgFg");
	this.shape_46.setTransform(407.4,1118.9);

	this.shape_47 = new cjs.Shape();
	this.shape_47.graphics.f("#FFFFFF").s().p("AgeB9QgVgIgOgSQgPgRgHgYQgIgaAAgfQAAgeAIgaQAHgZAOgSQAPgRAUgJQAVgKAXAAQAYABAUAJQATAKAMASQgEARgPAIQgIgNgOgHQgOgHgQAAQgRAAgOAHQgOAGgJAMQgKAMgEATQgFASAAAYQAAAZAFARQAFATALAMQAKAMAQAGQANAHAVAAQASAAAQgDQAQgFALgFQAKAMAAASQgSAJgUAGQgUAEgWAAQgZABgVgKg");
	this.shape_47.setTransform(386.1,1122.1);

	this.shape_48 = new cjs.Shape();
	this.shape_48.graphics.f("#FFFFFF").s().p("AglB9QgWgIgPgSQgPgRgIgZQgIgZAAggQAAgeAIgZQAHgaAQgRQAOgSAWgJQAVgJAZAAQAXABASAGQASAGANAMQAMAMAHASQAGASABAXQgBAYgGAcQg4AIgcABQg3gCgZgFQACAVAFAPQAHAPALALQALAKAPAFQAOAGATgBQARABARgGQAQgFAPgKQANAKABATQgSANgXAHQgXAHgXAAQgaABgWgKgAgWhdQgNAFgJAKQgKALgFAPQgGAPgBAUQAkAHAgAAQAjAAAfgFIACgWQgBgPgEgMQgEgLgIgHQgIgIgLgEQgMgEgOAAQgQAAgOAFg");
	this.shape_48.setTransform(360.5,1122.1);

	this.shape_49 = new cjs.Shape();
	this.shape_49.graphics.f("#FFFFFF").s().p("AgTCwQgJgDgGgHQgGgGgDgKQgDgKAAgOIAAkuQATgFATAFIAAEkQAAAPAEAGQAEAGAJAAQAOAAANgLQANAIgCATQgJAKgMAGQgNAFgNAAQgKAAgJgEg");
	this.shape_49.setTransform(341,1117.5);

	this.shape_50 = new cjs.Shape();
	this.shape_50.graphics.f("#FFFFFF").s().p("AglB9QgWgIgPgSQgPgRgIgZQgHgZAAggQAAgeAHgZQAIgaAOgRQAPgSAVgJQAWgJAZAAQAXABASAGQASAGANAMQAMAMAHASQAGASAAAXQABAYgHAcQg4AIgcABQg2gCgbgFQADAVAFAPQAHAPALALQALAKAPAFQAOAGATgBQARABARgGQAQgFAPgKQAOAKAAATQgSANgXAHQgXAHgXAAQgaABgWgKgAgWhdQgNAFgJAKQgJALgGAPQgFAPgCAUQAjAHAhAAQAkAAAdgFIACgWQABgPgFgMQgEgLgIgHQgIgIgMgEQgLgEgOAAQgQAAgOAFg");
	this.shape_50.setTransform(318.8,1122.1);

	this.shape_51 = new cjs.Shape();
	this.shape_51.graphics.f("#FFFFFF").s().p("AgvCCQgXgGgTgJQgBgUAMgMQARAHATAEQAUAEASAAQAYAAAQgLQAPgLAAgSQAAgLgFgHQgGgHgKgHQgIgEgkgPQgggLgOgNQgKgJgFgKQgGgMAAgQQAAgPAGgNQAGgNAMgKQALgIAPgFQARgGARAAQAZAAAVAKQAVAJALARQgBAKgHAGQgFAGgKACQgJgMgPgFQgOgHgRAAQgUAAgNAKQgNAJAAAQQAAAJAFAHQAFAGALAGIAsASIAZALQANAGAJAHQAKAKAFALQAGANAAARQAAARgHAOQgGAPgNAKQgMAKgRAFQgRAGgTgBQgXAAgXgEg");
	this.shape_51.setTransform(294.6,1122.1);

	this.shape_52 = new cjs.Shape();
	this.shape_52.graphics.f("#BFBFBF").s().p("AghBwQgTgIgOgQQgOgPgGgWQgHgXAAgcQAAgbAHgWQAGgXANgPQAOgQATgIQATgIAWAAQAUAAARAGQAQAGALAKQALALAGAQQAGAQAAATQAAAWgGAaQgyAHgZABQgwgCgYgFQADATAFAOQAGAOAKAIQAJAKANAEQANAFARgBQAPABAPgFQAPgFAMgJQANAJAAARQgQAMgUAGQgVAHgUAAQgXAAgUgIgAgThTQgMAEgJAKQgHAJgFANQgGAOgBATQAfAFAeAAQAgABAagFIACgUQAAgNgEgLQgEgJgGgIQgIgGgKgEQgLgDgNAAQgNAAgMAEg");
	this.shape_52.setTransform(458.7,98.5);

	this.shape_53 = new cjs.Shape();
	this.shape_53.graphics.f("#BFBFBF").s().p("AgRCdQgIgDgGgGQgFgGgCgJQgDgJAAgMIAAkMQARgGARAGIAAEDQAAAOAEAFQADAFAIAAQAMAAAMgKQALAIgBARQgIAJgLAFQgLAEgMAAQgJAAgIgDg");
	this.shape_53.setTransform(441.4,94.5);

	this.shape_54 = new cjs.Shape();
	this.shape_54.graphics.f("#BFBFBF").s().p("AgWCQQgKgEgGgIQgHgHgDgLQgEgLAAgPIAAjPQAHgJAJgIQAIgHAKgEIAAA9IA+AAQABARgJAOIg2AAIAACIQAAASAGAIQAGAIAMAAQARAAAUgLQAFAEADAGQADAIgCAIQgLAJgOAEQgOAFgNAAQgNAAgJgEg");
	this.shape_54.setTransform(426.7,95.7);

	this.shape_55 = new cjs.Shape();
	this.shape_55.graphics.f("#BFBFBF").s().p("AgQCdIAAjmQAQAEAQgEIAADmQgIACgIAAQgHAAgJgCgAgQh9QgEgPAEgPQAQgGARAGQAEAPgEAPQgJADgIAAQgHAAgJgDg");
	this.shape_55.setTransform(412.1,94.3);

	this.shape_56 = new cjs.Shape();
	this.shape_56.graphics.f("#BFBFBF").s().p("AgWCQQgKgEgGgIQgHgHgDgLQgEgLAAgPIAAjPQAHgJAJgIQAIgHAKgEIAAA9IA+AAQABARgJAOIg2AAIAACIQAAASAGAIQAGAIAMAAQARAAAUgLQAFAEADAGQADAIgCAIQgLAJgOAEQgOAFgNAAQgNAAgJgEg");
	this.shape_56.setTransform(400,95.7);

	this.shape_57 = new cjs.Shape();
	this.shape_57.graphics.f("#BFBFBF").s().p("AgkCZQgTgIgNgPQgNgPgGgWQgGgXAAgeQAAgcAGgVQAGgWAMgQQAMgQARgHQARgJAWAAQAPAAARAHQARAGAMAMIAAhmQARgGARAGIAAEmQgSALgXAFQgXAGgXAAQgYAAgTgHgAgXgoQgMAFgIALQgIALgFAPQgEAQAAAWQAAAWAFAQQAEARAJALQAJALANAFQANAFAQAAIAcgCQANgDALgEIAAiFQgKgOgQgJQgQgIgQAAQgOAAgMAGg");
	this.shape_57.setTransform(365.1,94.5);

	this.shape_58 = new cjs.Shape();
	this.shape_58.graphics.f("#BFBFBF").s().p("AgnBzQgRgFgMgJQgLgJgGgOQgGgOAAgRQAAgSAFgOQAGgNAMgIQAMgJAQgFQARgFAWAAQAPAAARAEQAQAEAMAHIAAgXQAAgOgEgKQgDgKgHgHQgIgGgLgEQgLgDgOAAQgOAAgPADQgPAFgMAHQgNgIABgTQAPgJASgFQATgGARAAQAXAAARAGQAQAGAMAMQALALAFASQAGARAAAYIAAB7QgVAKgYAGQgZAGgWAAQgWAAgRgFgAgZAHQgLADgHAEQgIAGgDAIQgEAIAAALQAAAJAEAJQAEAHAIAGQAIAFALADQALACAMAAQASAAAPgCQAQgDAKgFIAAg7QgLgIgQgDQgPgEgRAAQgOAAgLADg");
	this.shape_58.setTransform(340.8,98.5);

	this.shape_59 = new cjs.Shape();
	this.shape_59.graphics.f("#BFBFBF").s().p("AghBwQgTgIgOgQQgOgPgGgWQgHgXAAgcQAAgbAHgWQAGgXANgPQAOgQATgIQATgIAWAAQAUAAAQAGQARAGALAKQALALAGAQQAGAQAAATQAAAWgGAaQgyAHgZABQgwgCgXgFQACATAFAOQAGAOAJAIQAKAKAOAEQAMAFARgBQAPABAPgFQAPgFANgJQAMAJAAARQgQAMgUAGQgVAHgUAAQgXAAgUgIgAgThTQgMAEgJAKQgIAJgEANQgGAOAAATQAeAFAeAAQAgABAagFIACgUQAAgNgEgLQgEgJgGgIQgIgGgKgEQgKgDgOAAQgNAAgMAEg");
	this.shape_59.setTransform(317.8,98.5);

	this.shape_60 = new cjs.Shape();
	this.shape_60.graphics.f("#BFBFBF").s().p("AA5CcIAAiYQAAgMgDgJQgDgKgGgGQgGgGgIgDQgKgCgNAAQgOAAgRAGQgSAGgPAKIAACyQgRAFgRgFIAAk3QARgFARAFIAABiQAQgKAUgFQAUgFASAAQASAAAOAFQANAEAJAKQAKAJAEAPQAFAOAAAUIAACcQgIADgJAAQgJAAgIgDg");
	this.shape_60.setTransform(293.3,94.3);

	this.shape_61 = new cjs.Shape();
	this.shape_61.graphics.f("#BFBFBF").s().p("Ai3C4QhNhMAAhsQAAhrBNhMQBMhNBrAAQBsAABMBNQBNBMAABrQAABshNBMQhMBNhsAAQhrAAhMhNg");
	this.shape_61.setTransform(69.4,96.2);

	this.shape_62 = new cjs.Shape();
	this.shape_62.graphics.f("#BFBFBF").s().p("AjCDDQhRhRAAhyQAAhxBRhRQBRhRBxAAQByAABRBRQBRBRAABxQAAByhRBRQhRBRhyAAQhxAAhRhRg");
	this.shape_62.setTransform(681.4,96.2);

	this.shape_63 = new cjs.Shape();
	this.shape_63.graphics.f("#FFFFFF").s().p("AAuDHIAAhMIi0AAQgGgTAGgTQAYgqArheQAUgyAdhkQAOgBAKAFQAMAEAGAKQgcBdgSAuQgpBXgWAnICEAAIAAhIQAWgHAYAHIAABIIAtAAQAAAZgJAQIgkAAIAABMQgMADgMAAQgMAAgLgDg");
	this.shape_63.setTransform(648.1,1256.6);

	this.shape_64 = new cjs.Shape();
	this.shape_64.graphics.f("#BFBFBF").s().p("Aj0D1QhlhmAAiPQAAiOBlhmQBmhlCOAAQCPAABmBlQBlBmAACOQAACPhlBmQhmBliPAAQiOAAhmhlg");
	this.shape_64.setTransform(648.3,1257.8);

	this.shape_65 = new cjs.Shape();
	this.shape_65.graphics.f("#BFBFBF").s().p("AhFDIQgYgGgUgMQgDgXAQgQQAQAJATAEQATAFATAAQAXAAAQgFQASgGAMgKQANgKAGgPQAHgPAAgTQAAgSgHgPQgGgOgNgKQgMgJgSgGQgRgFgXAAIgGAAQgHgOAHgRIAIAAQASAAANgFQAPgFAKgJQAKgKAFgMQAFgPAAgRQAAgPgEgKQgEgMgIgIQgIgIgMgEQgMgEgNAAQgSAAgRAIQgQAHgLANQgKgDgHgIQgGgIgCgKQARgVAXgLQAYgLAbAAQAWAAATAHQATAIAOANQAPAOAHASQAIATAAAXQAAAegOAYQgNAZgXAMQAQAEAMAIQANAHAIANQAJAMAFAQQAEAQAAATQAAAdgJAYQgJAWgSAQQgSAQgaAIQgaAIgfAAQgXAAgXgGg");
	this.shape_65.setTransform(464.6,1256.7);

	this.shape_66 = new cjs.Shape();
	this.shape_66.graphics.f("#FFFFFF").s().p("AjzD1QhmhmAAiPQAAiOBmhmQBlhlCOAAQCPAABmBlQBlBmAACOQAACPhlBmQhmBliPAAQiOAAhlhlg");
	this.shape_66.setTransform(463.8,1257.8);

	this.shape_67 = new cjs.Shape();
	this.shape_67.graphics.f("#FFFFFF").s().p("Ah5DLQgGgRAGgQQAvgqAjgkQAjgmAWggQAXgfAMgdQAMgdAAgaQAAgPgFgMQgEgMgJgIQgJgJgNgEQgMgFgOABQgXAAgVAKQgVAKgRATQgLgEgHgIQgHgIgDgLQALgNANgKIAbgRIAfgKQAPgDAPAAQAaAAAVAHQAVAGAOAOQAPANAHASQAHAUAAAYQAAAegKAfQgKAfgUAeQgUAgggAhQgcAigqAlICsAAQAHAXgHAWg");
	this.shape_67.setTransform(278.2,1256.4);

	this.shape_68 = new cjs.Shape();
	this.shape_68.graphics.f("#BFBFBF").s().p("Aj0D1QhlhmAAiPQAAiOBlhmQBmhlCOAAQCPAABlBlQBmBmAACOQAACPhmBmQhlBliPAAQiOAAhmhlg");
	this.shape_68.setTransform(279.2,1257.8);

	this.shape_69 = new cjs.Shape();
	this.shape_69.graphics.f("#FFFFFF").s().p("AhBDJQgIgWAIgWIA7AAIAAkJQgrAsgbAUQgSgKgFgUQAcgcAaggQAbggASgfQASgHAUAHIAAFiIA6AAQAIAWgIAWg");
	this.shape_69.setTransform(92.8,1256.6);

	this.shape_70 = new cjs.Shape();
	this.shape_70.graphics.f("#BFBFBF").s().p("Aj0D1QhlhmAAiPQAAiOBlhmQBmhlCOAAQCPAABmBlQBlBmAACOQAACPhlBmQhmBliPAAQiOAAhmhlg");
	this.shape_70.setTransform(94.7,1257.8);

	this.shape_71 = new cjs.Shape();
	this.shape_71.graphics.f().s("#BFBFBF").ss(3).p("EA6mALzMh1LAAAIAA3lMB1LAAAg");
	this.shape_71.setTransform(375,75.6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_71},{t:this.shape_70},{t:this.shape_69},{t:this.shape_68},{t:this.shape_67},{t:this.shape_66},{t:this.shape_65},{t:this.shape_64},{t:this.shape_63},{t:this.shape_62},{t:this.shape_61},{t:this.shape_60},{t:this.shape_59},{t:this.shape_58},{t:this.shape_57},{t:this.shape_56},{t:this.shape_55},{t:this.shape_54},{t:this.shape_53},{t:this.shape_52},{t:this.shape_51},{t:this.shape_50},{t:this.shape_49},{t:this.shape_48},{t:this.shape_47},{t:this.shape_46},{t:this.shape_45},{t:this.shape_44},{t:this.shape_43},{t:this.shape_42},{t:this.shape_41},{t:this.shape_40},{t:this.shape_39},{t:this.shape_38},{t:this.shape_37},{t:this.shape_36},{t:this.shape_35},{t:this.shape_34},{t:this.shape_33},{t:this.shape_32},{t:this.shape_31},{t:this.shape_30},{t:this.shape_29},{t:this.shape_28},{t:this.shape_27},{t:this.shape_26},{t:this.shape_25},{t:this.shape_24},{t:this.shape_23},{t:this.shape_22},{t:this.shape_21},{t:this.shape_20},{t:this.shape_19},{t:this.shape_18},{t:this.shape_17},{t:this.shape_16},{t:this.shape_15},{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]},1).wait(1));

	// Layer 2
	this.shape_72 = new cjs.Shape();
	this.shape_72.graphics.f("#FFFFFF").s().p("Ajrh1IHXAAIjsDrg");
	this.shape_72.setTransform(371.8,1063.3);

	this.shape_73 = new cjs.Shape();
	this.shape_73.graphics.f("#BFBFBF").s().p("Eg6lAKbIAA01MB1KAAAIAAU1g");
	this.shape_73.setTransform(375,1119.3);

	this.shape_74 = new cjs.Shape();
	this.shape_74.graphics.f("#BFBFBF").s().p("AukMLIAA4VIdIAAIAAYVg");
	this.shape_74.setTransform(463.8,1256.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_74},{t:this.shape_73},{t:this.shape_72}]}).wait(2));

	// parrot
	this.shape_75 = new cjs.Shape();
	this.shape_75.graphics.f("#BFBFBF").s().p("AkRByIAAjjIIkAAIAADjg");
	this.shape_75.setTransform(299.1,1110.9);

	this.shape_76 = new cjs.Shape();
	this.shape_76.graphics.f("#BFBFBF").s().p("Aj+ByIAAjjIH9AAIAADjg");
	this.shape_76.setTransform(424.2,1110.9);

	this.shape_77 = new cjs.Shape();
	this.shape_77.graphics.f("#BFBFBF").s().p("Ag7Q1MAAAghpIB3AAMAAAAhpg");
	this.shape_77.setTransform(330.2,1014.6);

	this.shape_78 = new cjs.Shape();
	this.shape_78.graphics.f("#BFBFBF").s().p("Ag7Q1MAAAghpIB3AAMAAAAhpg");
	this.shape_78.setTransform(395.9,1014.6);

	this.shape_79 = new cjs.Shape();
	this.shape_79.graphics.f("#BFBFBF").s().p("Ajhc9QhhgEhiixQhiivhAkbQhFkugJlLQgLlyBElNQBGleCildQCRk2C/kCQCwjvClh+QCmh+BZAkQCMA5g0IOQgeE3iSMBQiWMYh7G5QjdMhjJAAIgDAAg");
	this.shape_79.setTransform(235.8,693.1);

	this.shape_80 = new cjs.Shape();
	this.shape_80.graphics.f("#BFBFBF").s().p("AjHQcQh7m3iWsaQiRsCgfk2QgzoOCLg5QBZgkCmB+QClB+CwDvQC/ECCRE2QCiFdBGFeQBEFOgLFxQgJFLhFEuQhAEbhiCvQhiCxhhAEIgDAAQjJAAjdshg");
	this.shape_80.setTransform(491.9,693.1);

	this.shape_81 = new cjs.Shape();
	this.shape_81.graphics.f("#BFBFBF").s().p("AmfQQQjAhWiUicQiUichRjLQhUjSAAjlQAAjkBUjSQBRjLCUicQCUicDAhWQDHhZDYAAQDZAADGBZQDABWCUCcQCUCcBSDLQBUDSAADkQAADlhUDSQhSDLiUCcQiUCcjABWQjGBZjZAAQjYAAjHhZg");
	this.shape_81.setTransform(366.1,394.3);

	this.shape_82 = new cjs.Shape();
	this.shape_82.graphics.f("#BFBFBF").s().p("EgIjAghQj9isjDk4QjDk5hrmVQhumkAAnLQAAnKBumkQBrmVDDk5QDDk4D9isQEGixEdAAQEeAAEGCxQD8CsDEE4QDDE5BrGVQBuGkAAHKQAAHLhuGkQhrGVjDE5QjDE4j9CsQkGCxkeAAQkdAAkGixg");
	this.shape_82.setTransform(366.1,714.7);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_82},{t:this.shape_81},{t:this.shape_80},{t:this.shape_79},{t:this.shape_78},{t:this.shape_77},{t:this.shape_76},{t:this.shape_75}]}).to({state:[]},1).wait(1));

	// Layer 1
	this.shape_83 = new cjs.Shape();
	this.shape_83.graphics.f("#BFBFBF").s().p("AghBwQgTgIgOgQQgOgPgGgWQgHgXAAgcQAAgbAHgWQAGgXANgPQAOgQATgIQATgIAWAAQAUAAARAGQAQAGALAKQALALAGAQQAGAQAAATQAAAWgGAaQgyAHgZABQgwgCgYgFQADATAFAOQAGAOAKAIQAJAKANAEQANAFARgBQAPABAPgFQAPgFAMgJQANAJAAARQgQAMgUAGQgVAHgUAAQgXAAgUgIgAgThTQgMAEgJAKQgHAJgFANQgGAOgBATQAfAFAeAAQAgABAagFIACgUQAAgNgEgLQgEgJgGgIQgIgGgKgEQgLgDgNAAQgNAAgMAEg");
	this.shape_83.setTransform(458.7,98.5);

	this.shape_84 = new cjs.Shape();
	this.shape_84.graphics.f("#BFBFBF").s().p("AgRCdQgIgDgGgGQgFgGgCgJQgDgJAAgMIAAkMQARgGARAGIAAEDQAAAOAEAFQADAFAIAAQAMAAAMgKQALAIgBARQgIAJgLAFQgLAEgMAAQgJAAgIgDg");
	this.shape_84.setTransform(441.4,94.5);

	this.shape_85 = new cjs.Shape();
	this.shape_85.graphics.f("#BFBFBF").s().p("AgWCQQgKgEgGgIQgHgHgDgLQgEgLAAgPIAAjPQAHgJAJgIQAIgHAKgEIAAA9IA+AAQABARgJAOIg2AAIAACIQAAASAGAIQAGAIAMAAQARAAAUgLQAFAEADAGQADAIgCAIQgLAJgOAEQgOAFgNAAQgNAAgJgEg");
	this.shape_85.setTransform(426.7,95.7);

	this.shape_86 = new cjs.Shape();
	this.shape_86.graphics.f("#BFBFBF").s().p("AgQCdIAAjmQAQAEAQgEIAADmQgIACgIAAQgHAAgJgCgAgQh9QgEgPAEgPQAQgGARAGQAEAPgEAPQgJADgIAAQgHAAgJgDg");
	this.shape_86.setTransform(412.1,94.3);

	this.shape_87 = new cjs.Shape();
	this.shape_87.graphics.f("#BFBFBF").s().p("AgWCQQgKgEgGgIQgHgHgDgLQgEgLAAgPIAAjPQAHgJAJgIQAIgHAKgEIAAA9IA+AAQABARgJAOIg2AAIAACIQAAASAGAIQAGAIAMAAQARAAAUgLQAFAEADAGQADAIgCAIQgLAJgOAEQgOAFgNAAQgNAAgJgEg");
	this.shape_87.setTransform(400,95.7);

	this.shape_88 = new cjs.Shape();
	this.shape_88.graphics.f("#BFBFBF").s().p("AgkCZQgTgIgNgPQgNgPgGgWQgGgXAAgeQAAgcAGgVQAGgWAMgQQAMgQARgHQARgJAWAAQAPAAARAHQARAGAMAMIAAhmQARgGARAGIAAEmQgSALgXAFQgXAGgXAAQgYAAgTgHgAgXgoQgMAFgIALQgIALgFAPQgEAQAAAWQAAAWAFAQQAEARAJALQAJALANAFQANAFAQAAIAcgCQANgDALgEIAAiFQgKgOgQgJQgQgIgQAAQgOAAgMAGg");
	this.shape_88.setTransform(365.1,94.5);

	this.shape_89 = new cjs.Shape();
	this.shape_89.graphics.f("#BFBFBF").s().p("AgnBzQgRgFgMgJQgLgJgGgOQgGgOAAgRQAAgSAFgOQAGgNAMgIQAMgJAQgFQARgFAWAAQAPAAARAEQAQAEAMAHIAAgXQAAgOgEgKQgDgKgHgHQgIgGgLgEQgLgDgOAAQgOAAgPADQgPAFgMAHQgNgIABgTQAPgJASgFQATgGARAAQAXAAARAGQAQAGAMAMQALALAFASQAGARAAAYIAAB7QgVAKgYAGQgZAGgWAAQgWAAgRgFgAgZAHQgLADgHAEQgIAGgDAIQgEAIAAALQAAAJAEAJQAEAHAIAGQAIAFALADQALACAMAAQASAAAPgCQAQgDAKgFIAAg7QgLgIgQgDQgPgEgRAAQgOAAgLADg");
	this.shape_89.setTransform(340.8,98.5);

	this.shape_90 = new cjs.Shape();
	this.shape_90.graphics.f("#BFBFBF").s().p("AghBwQgTgIgOgQQgOgPgGgWQgHgXAAgcQAAgbAHgWQAGgXANgPQAOgQATgIQATgIAWAAQAUAAAQAGQARAGALAKQALALAGAQQAGAQAAATQAAAWgGAaQgyAHgZABQgwgCgXgFQACATAFAOQAGAOAJAIQAKAKAOAEQAMAFARgBQAPABAPgFQAPgFANgJQAMAJAAARQgQAMgUAGQgVAHgUAAQgXAAgUgIgAgThTQgMAEgJAKQgIAJgEANQgGAOAAATQAeAFAeAAQAgABAagFIACgUQAAgNgEgLQgEgJgGgIQgIgGgKgEQgKgDgOAAQgNAAgMAEg");
	this.shape_90.setTransform(317.8,98.5);

	this.shape_91 = new cjs.Shape();
	this.shape_91.graphics.f("#BFBFBF").s().p("AA5CcIAAiYQAAgMgDgJQgDgKgGgGQgGgGgIgDQgKgCgNAAQgOAAgRAGQgSAGgPAKIAACyQgRAFgRgFIAAk3QARgFARAFIAABiQAQgKAUgFQAUgFASAAQASAAAOAFQANAEAJAKQAKAJAEAPQAFAOAAAUIAACcQgIADgJAAQgJAAgIgDg");
	this.shape_91.setTransform(293.3,94.3);

	this.shape_92 = new cjs.Shape();
	this.shape_92.graphics.f("#BFBFBF").s().p("Ai3C4QhNhMAAhsQAAhrBNhMQBMhNBrAAQBsAABMBNQBNBMAABrQAABshNBMQhMBNhsAAQhrAAhMhNg");
	this.shape_92.setTransform(69.5,96.2);

	this.shape_93 = new cjs.Shape();
	this.shape_93.graphics.f("#BFBFBF").s().p("AjCDDQhRhRAAhyQAAhxBRhRQBRhRBxAAQByAABRBRQBRBRAABxQAAByhRBRQhRBRhyAAQhxAAhRhRg");
	this.shape_93.setTransform(681.5,96.2);

	this.shape_94 = new cjs.Shape();
	this.shape_94.graphics.f("#FFFFFF").s().p("AAuDHIAAhMIi0AAQgGgTAGgTQAYgqArheQAUgyAdhkQAOgBAKAFQAMAEAGAKQgcBdgSAuQgpBXgWAnICEAAIAAhIQAWgHAYAHIAABIIAtAAQAAAZgJAQIgkAAIAABMQgMADgMAAQgMAAgLgDg");
	this.shape_94.setTransform(648.1,1256.6);

	this.shape_95 = new cjs.Shape();
	this.shape_95.graphics.f("#BFBFBF").s().p("AjzD1QhmhmAAiPQAAiOBmhmQBlhlCOAAQCPAABlBlQBmBmAACOQAACPhmBmQhlBliPAAQiOAAhlhlg");
	this.shape_95.setTransform(648.4,1257.8);

	this.shape_96 = new cjs.Shape();
	this.shape_96.graphics.f("#FFFFFF").s().p("AhFDIQgYgGgUgMQgDgXAQgQQAQAJATAEQATAFATAAQAXAAAQgFQASgGAMgKQANgKAGgPQAHgPAAgTQAAgSgHgPQgGgOgNgKQgMgJgSgGQgRgFgXAAIgGAAQgHgOAHgRIAIAAQASAAANgFQAPgFAKgJQAKgKAFgMQAFgPAAgRQAAgPgEgKQgEgMgIgIQgIgIgMgEQgMgEgNAAQgSAAgRAIQgQAHgLANQgKgDgHgIQgGgIgCgKQARgVAXgLQAYgLAbAAQAWAAATAHQATAIAOANQAPAOAHASQAIATAAAXQAAAegOAYQgNAZgXAMQAQAEAMAIQANAHAIANQAJAMAFAQQAEAQAAATQAAAdgJAYQgJAWgSAQQgSAQgaAIQgaAIgfAAQgXAAgXgGg");
	this.shape_96.setTransform(464.6,1256.7);

	this.shape_97 = new cjs.Shape();
	this.shape_97.graphics.f("#BFBFBF").s().p("Aj0D1QhlhmAAiPQAAiOBlhmQBmhlCOAAQCPAABmBlQBlBmAACOQAACPhlBmQhmBliPAAQiOAAhmhlg");
	this.shape_97.setTransform(463.8,1257.8);

	this.shape_98 = new cjs.Shape();
	this.shape_98.graphics.f("#FFFFFF").s().p("Ah5DLQgGgRAGgQQAvgqAjgkQAjgmAWggQAXgfAMgdQAMgdAAgaQAAgPgFgMQgEgMgJgIQgJgJgNgEQgMgFgOABQgXAAgVAKQgVAKgRATQgLgEgHgIQgHgIgDgLQALgNANgKIAbgRIAfgKQAPgDAPAAQAaAAAVAHQAVAGAOAOQAPANAHASQAHAUAAAYQAAAegKAfQgKAfgUAeQgUAgggAhQgcAigqAlICsAAQAHAXgHAWg");
	this.shape_98.setTransform(278.2,1256.4);

	this.shape_99 = new cjs.Shape();
	this.shape_99.graphics.f("#BFBFBF").s().p("AjzD1QhmhmAAiPQAAiOBmhmQBlhlCOAAQCPAABmBlQBlBmAACOQAACPhlBmQhmBliPAAQiOAAhlhlg");
	this.shape_99.setTransform(279.3,1257.8);

	this.shape_100 = new cjs.Shape();
	this.shape_100.graphics.f("#FFFFFF").s().p("AhBDJQgIgWAIgWIA7AAIAAkJQgrAsgbAUQgSgKgFgUQAcgcAaggQAbggASgfQASgHAUAHIAAFiIA6AAQAIAWgIAWg");
	this.shape_100.setTransform(92.8,1256.6);

	this.shape_101 = new cjs.Shape();
	this.shape_101.graphics.f("#BFBFBF").s().p("Aj0D1QhlhmAAiPQAAiOBlhmQBmhlCOAAQCPAABlBlQBmBmAACOQAACPhmBmQhlBliPAAQiOAAhmhlg");
	this.shape_101.setTransform(94.7,1257.8);

	this.shape_102 = new cjs.Shape();
	this.shape_102.graphics.f().s("#BFBFBF").ss(3).p("EA6mALzMh1LAAAIAA3lMB1LAAAg");
	this.shape_102.setTransform(375,75.6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_102},{t:this.shape_101},{t:this.shape_100},{t:this.shape_99},{t:this.shape_98},{t:this.shape_97},{t:this.shape_96},{t:this.shape_95},{t:this.shape_94},{t:this.shape_93},{t:this.shape_92},{t:this.shape_91},{t:this.shape_90},{t:this.shape_89},{t:this.shape_88},{t:this.shape_87},{t:this.shape_86},{t:this.shape_85},{t:this.shape_84},{t:this.shape_83}]}).to({state:[]},1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(373.5,665.5,753,1336);

})(lib = lib||{}, images = images||{}, createjs = createjs||{}, ss = ss||{});
var lib, images, createjs, ss;