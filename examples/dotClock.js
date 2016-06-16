/*
 * DotClock - Fun dot clock using d3
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 
 * @author SB
 * @version 0.0.1
 */

var DotClock = (function () {

	var DAY_DOT = "day-dot",
		HOUR_DOT = "hour-dot",
		MINUTE_DOT = "minute-dot",
		SECOND_DOT = "second-dot";

	var parentNode = "body",
		clockRadius = 200,
		margin = 10,
		width = (clockRadius + margin) * 2,
		height = (clockRadius + margin) * 2,
		emptyColor = "#F9F9F9",
		secondTickStart = clockRadius;
		secondColor = "#5FA6C8",
		minuteTickStart = clockRadius,
		minuteColor = "#31708F",
		hourTickStart = clockRadius,
		hourColor = "#1B809E",
		dayTickStart = clockRadius,
		dayColor = "#71BDEB",
		refreshTime = 1000;
		
    function DotClock(options) {
		var self = this;
		self.interval = null;
		
    	options = options || {};
		options.parentNode = options.parentNode || parentNode;
		options.cfid = "clock-face-" + (options.parentNode.id || Math.random().toString(36).substring(7));
		options.clockRadius = options.clockRadius || clockRadius;
		options.margin = options.margin || margin;
		options.emptyColor = options.emptyColor || emptyColor;
		options.width = (options.clockRadius + margin) * 2;
		options.height = (options.clockRadius + margin) * 2;
		options.secondTickStart = options.clockRadius;
		options.secondTickRadius = options.secondTickRadius || options.clockRadius / 50; /* If clockRadius = 200 then secondTickRadius = 4 */
		options.secondColor = options.secondColor || secondColor;
		options.minuteTickStart = options.clockRadius;
		options.minuteTickRadius = options.minuteTickRadius || options.clockRadius / 33.33; /* If clockRadius = 200 then secondTickRadius = 6 */
		options.minuteColor = options.minuteColor || minuteColor;
		options.hourTickStart = options.clockRadius;
		options.hourTickRadius = options.hourTickRadius || options.clockRadius / 25; /* If clockRadius = 200 then secondTickRadius = 8 */
		options.hourColor = options.hourColor || hourColor;
		options.dayTickStart = options.clockRadius;
		options.dayTickRadius = options.dayTickRadius || options.clockRadius / 20; /* If clockRadius = 200 then secondTickRadius = 10 */
		options.dayColor = options.dayColor || dayColor;
		options.refreshTime = options.refreshTime || refreshTime;
		options.timeZoneOffset = options.timeZoneOffset;
		options.label = options.label;
		if (options.label) {
			options.labelColor = options.labelColor || options.minuteColor
			options.labelFontSize = options.labelFontSize || (options.clockRadius / 5) + "px";
		}
		self.options = options;
		
		drawClock(self);
		start(self);
    }
	
	var dayScale = d3.scale.linear()
		.range([12,360])
		.domain([0,30]);

	var hourScale = d3.scale.linear()
		.range([15,360])
		.domain([0,23]);

	var minuteScale = secondScale = d3.scale.linear()
		.range([6,360])
		.domain([0,59]);

	var dotData = {
		day: {
			value:0,
			scale:dayScale
		},
		hour: {
			value:0,
			scale:hourScale
		},
		minute: {
			value:0,
			scale:minuteScale
		},
		second: {
			value:0,
			scale:secondScale
		}
	};

	function drawClock(self){
		var options = self.options;
		
		// Create all the clock elements
		updateData(options);	// Draw them in the correct starting position
		var svg = d3.select(options.parentNode).append("svg")
			.attr("width", options.width)
			.attr("height", options.height);

		var transform = "translate(" + (options.clockRadius + options.margin) + "," + (options.clockRadius + options.margin) + ")";

		var face = svg.append('g')
			.attr('id',options.cfid)
			.attr('class', 'clock-face')
			.attr('transform',transform);

		if (options.label) {
			var label = svg.append('text')
				.attr('id',"label-" + options.cfid)
				.attr('transform',transform)
				.attr("text-anchor", "middle")
				.attr("fill", options.labelColor)
				.attr("font-family", "sans-serif")
				.attr("font-weight", "bold")
				.attr("font-size", options.labelFontSize)
				.text(typeof options.label == "function" ? options.label() : options.label);
		}
	
		// Add dots for days
		/*face.selectAll('.day-dot')
			.data(d3.range(0,12)).enter()
			.append('circle')
			.attr("cx", options.dayTickStart - options.dayTickRadius * 9)
			.attr("cy", -(options.dayTickStart - options.dayTickRadius * 9)))
			.attr("r", options.daydTickRadius).style("fill", options.emptyColor)
			.attr("stroke-width","0")
			.attr('class', DAY_DOT)
			.attr('transform',function(d){
				return 'rotate(' + dayScale(d) + ')';
			});*/

		// Add dots for hours
		face.selectAll('.' + HOUR_DOT)
			.data(d3.range(0,24)).enter()
			.append('circle')
			/*.attr("cx", options.hourTickStart - options.hourTickRadius * 9)*/
			.attr("cy", -(options.hourTickStart - options.hourTickRadius * 9))
			.attr("r", options.hourTickRadius).style("fill", options.emptyColor)
			.attr("stroke-width","0")
			.attr('class', HOUR_DOT)
			.attr('transform',function(d){
				return 'rotate(' + hourScale(d) + ')';
			});

		// Add dots for minutes
		face.selectAll('.' + MINUTE_DOT)
			.data(d3.range(0,60)).enter()
			.append('circle')
			/*.attr("cx", options.minuteTickStart - options.minuteTickRadius * 7)*/
			.attr("cy", - (options.minuteTickStart - options.minuteTickRadius * 7))
			.attr("r", options.minuteTickRadius).style("fill", options.emptyColor)
			.attr("stroke-width","0")
			.attr('class', MINUTE_DOT)
			.attr('transform',function(d){
				return 'rotate(' + minuteScale(d) + ')';
			});

		// Add dots for seconds
		face.selectAll('.' + SECOND_DOT)
			.data(d3.range(0,60)).enter()
			.append('circle')
			/*.attr("cx", options.secondTickStart - options.secondTickRadius * 5)*/
			.attr("cy", -(options.secondTickStart - options.secondTickRadius * 5))
			.attr("r", options.secondTickRadius).style("fill", options.emptyColor)
			.attr("stroke-width","0")
			.attr('class', SECOND_DOT)
			.attr('transform',function(d){
				return 'rotate(' + secondScale(d) + ')';
			});
	}
	
	function updateData(options){
		var date = newDate(options.timeZoneOffset);

		if (options.label && typeof options.label == "function") {
			var label = d3.select('#label-' + options.cfid);
			label.text(options.label(date));
		}

		/*dotData["day"].value = date.getDays();*/
		dotData["hour"].value = date.getHours();
		dotData["minute"].value = date.getMinutes();
		dotData["second"].value = date.getSeconds();
	}
				
	function moveDots(self){
		var options = self.options;
		var clockFace = d3.select('#' + options.cfid);
				
		// Reset hours
		if (dotData["hour"].value == 0) {
			updateDotsColor(clockFace, '.' + HOUR_DOT, 0, 24, options.emptyColor);
		}
		// Update hours
		updateDotsColor(clockFace, '.' + HOUR_DOT, 0, dotData["hour"].value, options.hourColor);
		
		// Reset minutes
		if (dotData["minute"].value == 0) {
			updateDotsColor(clockFace, '.' + MINUTE_DOT, 0, 60, options.emptyColor);
		}
		// Update minutes
		updateDotsColor(clockFace, '.' + MINUTE_DOT, 0, dotData["minute"].value, options.minuteColor);

		// Reset seconds
		if (dotData["second"].value == 0) {
			updateDotsColor(clockFace, '.' + SECOND_DOT, 0, 60, options.emptyColor);
		}
		// Update seconds
		updateDotsColor(clockFace, '.' + SECOND_DOT, 0, dotData["second"].value, options.secondColor);
	}
	
	function updateDotsColor(clockFace, styleClass, rangeFrom, rangeTo, color) {
		clockFace.selectAll(styleClass)
		.data(d3.range(rangeFrom, rangeTo))
		.style("fill", color);
	}
	
	function start(self) {
		self.interval = setInterval(function(){
			updateData(self.options);
			moveDots(self);
		}, self.options.refreshTime);
	};
	
	DotClock.prototype.start = function() {
		start(this);
	};
	
	function stop(self) {
		if (self.interval) {
			clearInterval(self.interval);
		}
	};

	DotClock.prototype.stop = function() {
		stop(this);
	};
	
	function newDate(offset) {
		// Create Date object for current location
		var date = new Date();
		if (offset) {
			// Convert to milliseconds
			// Add local time zone offset 
			// Get UTC time in milliseconds
			var utc = date.getTime() + (date.getTimezoneOffset() * 60000);
			
			// Create new Date object for new offset
			return new Date(utc + (3600000 * offset));
		} else {
			return date;
		}
	}

	return DotClock;
})();
