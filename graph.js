"use strict";
if (window.Raphael != undefined) {
	var paper = Raphael("content", "100%", "100%");
}
/*(function (p) {
	var y = 0;
	p.canvas.onmousewheel = function (event) {
		console.log(event);
		console.log(event.wheelDeltaY, y);
		p._top -= event.wheelDeltaY;
	};
})(paper);*/
var currentHue = Math.floor(360*Math.random());
function getColor() {
	currentHue += 37;
	if (currentHue > 360) {currentHue = currentHue-360;}
	return "hsl("+currentHue+"deg,70%,70%)";
}
var notthis = function () {
	function getAncestor(name, themes) {
		var previous = name;
		while (themes[themes[previous]] != undefined) {
			previous = themes[previous];
		}
		return previous;
	}
	function getCategoryPaths(themes) {
		var paths = {},
			name = null,
			anc = null,
			ancestors = {};
		for (name in themes) {
			anc = getAncestor(name, themes);
			if (ancestors[anc] == undefined) {
				ancestors[anc] = true;
			}
		}
		for (name in ancestors) {
			paths[name] = themes[name];
		}
		return paths;
	}
	function stripPaths(themes) {
		var theme = null,
			name = "";
		for (name in themes) {
			theme = themes[name];
			while (theme[theme.length-1][2] == "x") {
				theme.pop();
			}
			themes[name] = theme;
		}
		return themes;
	}
	function process(json) {
		var i = 0,
			length = null,
			year = null,
			theme = null,
			x = 100,
			y = 50,
			squares = [],
			paths = [],
			path = "",
			p = null,
			themes = {}
			t = null,
			point = 1,
			pathlength = 0
			control1 = null,
			control2 = null,
			x2 = null,
			y2 = null,
			ancestor = null,
			counter = 0;
		for (year in json) {
			for (theme in json[year]) {
				t = json[year][theme];
				if (!t.ancestor) {
					themes[theme] = [[x, y, theme]];
				} else {
					themes[theme] = t.ancestor;
					ancestor = getAncestor(t.ancestor, themes);
					themes[ancestor].push([x,y,theme]);
				}
				squares.push(["M "+x+","+y+" v50 h50 v-50 h-50",
					function (a, b, c) {
						var el = $("#container")
							.show()
							.css("left", b+7)
							.css("top", c-10);
						$("h2", el).html(this.theme);
						$("img", el).attr("href", this.icon);
						$("#sets", el).html("Sets: "+this.sets);
						$("#desc", el).html(this.desc);
					},
					function (a, b, c) {
						$("#container").hide();
					},
					{"theme": theme, "desc": t.desc,
					"sets": t.sets, "icon": t.icon}]);
				x += 60;
			}
			paths = getCategoryPaths(themes);
			for (theme in paths) {
				if (paths[theme].length == counter) {
					themes[theme].push([x,y,"x"]);
					x += 15;
				}
			}
			paper.text(30, y+30, year).attr({
				"font-size": "20px",
				"font-weight": "bold",
				"text-anchor": "start"
			});
			y += 100;
			x = 100;
			counter++;
		}
		paths = getCategoryPaths(themes);
		paths = stripPaths(paths);
		var circles = [];
		for (i in paths) {
			p = paths[i];
			x = p[0][0];
			y = p[0][1];
			circles.push(p[0]);
			path = "M"+x+","+y+" v50 h50 v-50 h-50 v50";
			if (p.length > 1) {
				for (point = 1, pathlength = p.length;point < pathlength;point++) {
					//console.log(point);
					x2 = p[point][0];
					y2 = p[point][1];
					control1 = [x,y+75];
					control2 = [x2,y2-25];
					circles.push([x2,y2]);
					circles.push([x,y]);
					circles.push(control1);
					circles.push(control2);
					path += " C"+control1[0]+","+control1[1]+" "+
						control2[0]+","+control2[1]+" "+
						x2+","+y2+" v50";
					x = x2;
					y = y2;
				}
				path+=" h50";
				x += 50;
				for (point--;point > -1;point--) {
					//console.log(point);
					path+=" v-50";
					if (p[point][2] == "x") {
						x2 = p[point][0] + 5;
					} else {
						x2 = p[point][0] + 50;
					}
					y2 = p[point][1];
					control1 = [x,y-25];
					control2 = [x2,y2+75];
					circles.push([x2,y2]);
					circles.push([x,y]);
					circles.push(control1);
					circles.push(control2);
					path += " C"+control1[0]+","+control1[1]+" "+
						control2[0]+","+control2[1]+" "+
						x2+","+(y2+50);
					x = x2;
					y = y2;
				}
				path+=" h-50";
			}
			paper.path(path).attr({
				"fill": getColor(),
				"stroke": "none"
			});
		}
		for (i=0,length=squares.length;i<length;i++) {
			paper.path(squares[i][0]).attr({
				"fill": "white",
				"stroke": "none",
				"fill-opacity": 0.2
			}).hover(squares[i][1], squares[i][2], squares[i][3]);
		}
		for (theme in paths) {
			for (i=0,length=paths[theme].length;i<length;i++) {
				p = paths[theme][i];
				if (p[2] != "x") {
					paper.text(p[0]+25,p[1]+25,p[2].replace(" ", "\n"));
				}
			}
		}
		/*for (i=0,length=circles.length;i<length;i++) {
			paper.circle(circles[i][0], circles[i][1], 5, 5).attr({
				"fill": "black",
				"stroke": "white"
			});
		}*/
	}
	function getFirstInYear(themeName, year) {
		var i = 0,
			length = year.length;
		for ( ;i<length;i++) {
			if (year[i].theme == themeName) {
				return [i, year[i].name == "x"];
			}
		} //Returns undefined
	}
	function getLastInYear(themeName, year) {
		var i = year.length - 1;
		for ( ;i>-1;i--) {
			if (year[i].theme == themeName) {
				return [i, year[i].name == "x"];
			}
		} //Returns undefined
	}
	function getXforPosition(position, yearArray) {
		var i = 0,
			x = OFFSET;
		for ( ;i<position;i++) {
			if (yearArray[i].name == "x") {
				x += GAP + GAP;
			} else {
				x += WIDTH + GAP;
			}
		}
		return x;
	}
	WIDTH = 50;
	GAP = 10;
	OFFSET = 100;
	function calculateThemePoints(themeNames, years, yearKeys) {
		var themeName = null,
			i = 0,
			length = yearKeys.length,
			startYear = -1,
			endYear = -1,
			pathTextStart = "",
			pathTextEnd = "",
			pathText = "",
			x1 = null,
			x2 = null,
			rightX = null,
			leftX = null,
			y = null,
			previousRightX = null,
			previousLeftX = null,
			previousY = null,
			blankYears = {};
		for (var y in years) {
			blankYears[y] = [];
		}
		for (themeName in themeNames) {
			for (i=0;i<length;i++) {
				if (getFirstInYear(themeName, years[yearKeys[i]]) != undefined) {
					break;
				}
			}
			startYear = i;
			for (i=length-1;i>-1;i--) {
				if (getFirstInYear(themeName, years[yearKeys[i]]) != undefined) {
					break;
				}
			}
			endYear = i;
			for (i=startYear;i<endYear+1;i++) {
				x1 = getFirstInYear(themeName, years[yearKeys[i]]);
				x2 = getLastInYear(themeName, years[yearKeys[i]]);
				if (x1[1]) {
					leftX = getXforPosition(x1[0], years[yearKeys[i]]);
					rightX = leftX - WIDTH + GAP;
					
				} else {
					leftX = getXforPosition(x1[0], years[yearKeys[i]]);//*(GAP+WIDTH) + OFFSET;
					rightX = getXforPosition(x2[0], years[yearKeys[i]]);//*(GAP+WIDTH) + OFFSET + WIDTH;
				}
				y = i * (WIDTH * 2);
				if (i != startYear) {
					pathTextStart = pathTextStart.replace("<c2x>", (leftX-previousLeftX));
					pathTextStart += " " + (leftX-previousLeftX) + "," +(y-previousY-WIDTH) + " ";
					pathTextEnd = pathTextEnd.replace("<c2x>", (previousRightX-rightX));
					pathTextEnd = pathTextEnd.replace("Q", " " + (previousRightX-rightX) + "," + (previousY-y+WIDTH) + " ");
				} else {
					pathTextStart = "M"+leftX+","+y;
					pathTextEnd = " h-"+(rightX-leftX)+"z";
				}
				pathTextStart += " v"+WIDTH;
				pathTextEnd = " v-"+WIDTH + pathTextEnd;
				if (i != endYear) {
					pathTextStart += " c0,"+(WIDTH*0.5)+" <c2x>,"+(WIDTH*0.5);
					pathTextEnd = " c0,-"+(WIDTH*0.5)+" <c2x>,-"+(WIDTH*0.5) + "Q" + pathTextEnd;
					previousLeftX = leftX;
					previousRightX = rightX;
					previousY = y;
				} else {
					pathText = pathTextStart + " h"+((x2[0]-x1[0])*(WIDTH+GAP)+WIDTH)+pathTextEnd;
				}
			}
			var themePath = paper.path(pathText).attr({"fill": getColor(),"stroke": "none"});
			(function (path, name) {
				path.click(function (e) {
					$("#theme").html(name);
					$("#desc").html("&nbsp;");
					$("#startYear").html("&nbsp;");
					$("#endYear").html("&nbsp;");
					$("#setNumber").html("&nbsp;");
					e.stopImmediatePropagation();
				});
			})(themePath, themeName);
		}
	}
	function createSquares(years, keys) {
		var i = 0,
			length = keys.length,
			year = null
			j = 0
			ylength = -1,
			path = " v"+WIDTH+" h"+WIDTH+" v-"+WIDTH+" h-"+WIDTH+" v"+WIDTH+" ",
			x = 0,
			y = 0
			width = 0;
		for ( ;i<length;i++) {
			year = years[keys[i]];
			for (j=0,jlength=year.length;j<jlength;j++) {
				x = getXforPosition(j,year);
				y = i*(WIDTH*2);
				width = (year[j].name == "x") ? GAP : WIDTH;
				path = " v"+WIDTH+" h"+width+" v-"+WIDTH+" h-"+width+" v"+WIDTH+" ";
				path = "M"+x+","+y+path;
				var setupclick = function (path, subthemename, themename, from, to, sets) {
					path.click(function (e) {
						$("#theme").html(themename);
						if (subthemename == "x") {
							$("#desc").html("[none]");
							$("#startYear").html("&nbsp;");
							$("#endYear").html("&nbsp;");
							$("#setNumber").html("&nbsp;");
						} else {
							$("#desc").html(subthemename);
							$("#startYear").html("Started: "+from);
							$("#endYear").html("Stopped: "+to);
							$("#setNumber").html("Sets: "+sets);
						}
						e.stopImmediatePropagation();
					});
				};
				setupclick(paper.path(path).attr({
					"fill": "#fff",
					"opacity": 0.4,
					"stroke": "none"
				}), year[j].name, year[j].theme, year[j].start, year[j].end, year[j].sets);
				var str = year[j].name.replace(" ","\n");
				while (str.search(" ") != -1) {
					str = str.replace(" ", "\n");
				}
				var txt = null;
				if (width == WIDTH) {
					txt = paper.text(x+(0.5*WIDTH), y+(0.5*WIDTH),str);
					setupclick(txt, year[j].name, year[j].theme, year[j].start, year[j].end, year[j].sets);
				}
			}
		}
	}
	function createHeads(themeNames, years, yearKeys) {
		var themeName = "",
			i = 0,
			length = yearKeys.length,
			startYear = -1,
			x1 = null,
			x2 = null,
			leftX = 0,
			rightX = 0,
			y = 0,
			path = "",
			width = 0;
		for (themeName in themeNames) {
			for (i=0;i<length;i++) {
				if (getFirstInYear(themeName, years[yearKeys[i]]) != undefined) {
					break;
				}
			}
			x1 = getFirstInYear(themeName, years[yearKeys[i]]);
			x2 = getLastInYear(themeName, years[yearKeys[i]]);
			leftX = getXforPosition(x1[0], years[yearKeys[i]]);
			rightX = getXforPosition(x2[0], years[yearKeys[i]])+WIDTH;
			width = rightX-leftX+GAP;
			y = i * (WIDTH * 2);
			path = "M"+(leftX-(GAP/2))+","+(y-GAP)+" h"+width+
				" v"+(GAP*1.5)+" h-"+width+" v-"+(GAP*1.5)+"z";
			paper.path(path).attr({
				"fill": "#fff",
				"opacity": 0.8,
				"stroke": "none"
			});
			paper.text(leftX+(0.5*width)-8, y-(0.45*GAP),themeName);
		}
	}
	function createYears(years) {
		var i = 0,
			length = years.length,
			unit = WIDTH-20,
			y = 0;
		for ( ;i < length;i++) {
			paper.text(unit, y+unit, years[i]).attr({
				"font-size": "20px",
				"font-weight": "bold",
				"text-anchor": "start"
			});
			y += WIDTH*2;
		}
	}
	function process(json) {
		var themes = {},
			years = {},
			themeName = null,
			themeData = null,
			yearKeys = [],
			themeKeys = [],
			yearNum = "",
			year = null;
		for (themeName in json) {
			themeData = json[themeName];
			if (themes[themeData.theme] == undefined) {
				themes[themeData.theme] = [];
			}
			if (years[themeData.year] == undefined) {
				years[themeData.year] = [];
			}
			themes[themeData.theme].push(themeData.name);
			years[themeData.year].push({"name": themeData.name,
				"theme": themeData.theme,
				"start": themeData.year,
				"end": themeData.yearTo,
				"sets": themeData.sets});
		}
		for (yearNum in years) {
			yearKeys.push(yearNum);
		}
		yearKeys.sort(function (a, b) {return Number(a) - Number(b);});
		
		/// YEARS.SORT ISN'T ALWAYS WORKING ///
		
		var startYear = 0,
			endYear = 0,
			i = 0,
			length = yearKeys.length;
		for (themeName in themes) {
			for (i=0;i<length;i++) {
				if (getFirstInYear(themeName, years[yearKeys[i]]) != undefined) {
					break;
				}
			}
			startYear = i;
			for (i=length-1;i>-1;i--) {
				if (getFirstInYear(themeName, years[yearKeys[i]]) != undefined) {
					break;
				}
			}
			endYear = i;
			for (i=startYear;i<endYear+1;i++) {
				if (getFirstInYear(themeName, years[yearKeys[i]]) == undefined) {
					years[yearKeys[i]].push({"theme": themeName, "name":"x"});
				}
			}
			themeKeys.push(themeName);
		}
		themeKeys.sort();
		for (yearNum in years) {
			year = years[yearNum];
			var newYear = [];
			themeKeys.forEach(function (theme) {
				year.forEach(function (subtheme) {
					if (subtheme.theme == theme) {
						newYear.push(subtheme);
					}
				});
			});
			years[yearNum] = newYear;
		}
		calculateThemePoints(themes, years, yearKeys);
		createSquares(years, yearKeys);
		createYears(yearKeys);
		createHeads(themes, years, yearKeys);
		setupControls();
	}
};

var MULTIPLIER = 10,
    YEARHEIGHT = 25,
    YOFFSET    = 30,
    XOFFSET    = 60,
    YEARGAP    = 30,
    LARGESTX   = -1,
    LARGESTY   = -1;

function getVertices(year, subtheme, theme) {
	//year: [{name:__,width:__,theme:__},...]
	//subtheme: string
	//theme: string
	var i = 0,
		length = year.length,
		current = null,
		vertex = 0,
		left = 0,
		right = 0,
		done = false;
	for ( ;i < length;i++) {
		current = year[i];
		if (current.name == subtheme && current.theme == theme) {
			left = XOFFSET + vertex;
			right = left + current.width*MULTIPLIER;
			break;
		} else {
			vertex += current.width*MULTIPLIER;
		}
	}
	if (right > LARGESTX) {
		LARGESTX = right;
	}
	return [left, right];
}

function calculateSubthemePath(yearList, yearsdata, themedata, subtheme, theme) {
	//yearsdata: { 2020: [{name:__, width:___,theme:__},...] , ...}
	//themedata: { 2010: {sub1: 2(sets), sub2: 3}, ...}
	//subtheme: string
	//theme: string
	var yearNum = "",
		vertices = null,
		year = null,
		first = true,
		y = 0,
		subthemePoints = {};
	subthemePoints["index"] = [];
	for (yearNum in themedata) {
		year = yearsdata[yearNum];
		//console.log(year, yearNum);
		vertices = getVertices(year, subtheme, theme);
		y = getYforYear(yearList, yearNum);
		subthemePoints[yearNum] = {
			"left": vertices[0],
			"right": vertices[1],
			"y": y
		};
		subthemePoints["index"].push(yearNum);
	}
	subthemePoints["index"] = subthemePoints["index"].sort();
	//console.log(subtheme, subthemePoints);
	return subthemePoints;
}

function drawTheme(points, name, color, themeName) {
	var i = 0,
		length = points.index.length,
		year = "",
		point = null,
		pathStart = "",
		pathEnd = "",
		path = "";
	for ( ;i < length;i++) {
		year = points.index[i];
		point = points[year];
		
		if (i == 0) {
			pathStart = "M"+point.left+","+point.y;
			pathEnd = " H"+point.left+"z";
		} else {
			pathStart = pathStart.replace("<cx>", point.left);
			pathStart = pathStart.replace("<cy>", point.y-YEARGAP*0.5);
			pathStart = pathStart.replace("<x2>", point.left);
			pathStart = pathStart.replace("<y2>", point.y);
			pathEnd = " C"+point.right+","+(point.y-YEARGAP*0.5) + pathEnd;
		}
		pathStart += " v"+YEARHEIGHT;
		pathEnd = " v-"+YEARHEIGHT + pathEnd;
		if (i == length-1) {
			path = pathStart+" H"+point.right+" "+pathEnd;
		} else {
			pathStart += " C"+point.left+","+(point.y+YEARHEIGHT+YEARGAP*0.5)+
				" <cx>,<cy> <x2>,<y2>";
		
			pathEnd = " "+point.right+","+(point.y+YEARHEIGHT+YEARGAP*0.5)+
				" "+point.right+","+(point.y+YEARHEIGHT) + pathEnd;
		}
	}
	//console.log(name, path);
	paper.path(path).attr({
		"fill": color,
		"stroke": "#fff"
	}).hover(function (e) {
		$("#info").show()
			.css("left", e.clientX+10)
			.css("top", e.clientY-9);
		$("#desc").html(name);
		$("#theme").html(themeName);
		$("#startYear").html("&nbsp;");
		$("#endYear").html("&nbsp;");
		$("#setNumber").html("&nbsp;");
		e.stopImmediatePropagation();
	}, function (e) {
		$("#info").hide();
		e.stopImmediatePropagation();
	});
}

function getYforYear(yearList, year) {
	var y = YOFFSET+(yearList.indexOf(year)*(YEARHEIGHT+YEARGAP));
	if (y > LARGESTY) {
		LARGESTY = y;
	}
	return y;
}

function getYearList(yearData) {
	var ylist = [],
		year = "";
	for (year in yearData) {
		ylist.push(year);
	}
	return ylist.sort();
}

function logYearData(data) {
	//data: { 2020: [{name:__, width:___,theme:__},...] , ...}
	var yearKey = "",
		currentYear = null,
		i = 0,
		length = 0,
		subtheme = null;
	for (yearKey in data) {
		console.log("> "+yearKey);
		currentYear = data[yearKey];
		i = 0;
		length = currentYear.length;
		for ( ;i < length;i++) {
			subtheme = currentYear[i];
			console.log("\tname: "+subtheme.name+" theme: "+
				subtheme.theme+" sets: "+subtheme.width);
		}
	}
}

function logSingleYear(yearData) {
	var i = 0,
		length = yearData.length,
		subtheme = null;
	for ( ;i < length;i++) {
		subtheme = yearData[i];
		console.log("\tname: "+subtheme.name+" theme: "+
			subtheme.theme+" sets: "+subtheme.width);
	}
}

function calculateYears(themedata) {
	var themeName = "",
		yearsdata = {},
		yearNum = "",
		year = null,
		subtheme = null,
		specialThemeLists = {},
		endYears = {},
		i = 0,
		length = 0;
	// Initialize year data from theme data
	for (themeName in themedata) {
		specialThemeLists[themeName] = [];
		for (yearNum in themedata[themeName]) {
			year = themedata[themeName][yearNum];
			if (yearsdata[yearNum] === undefined) {
				yearsdata[yearNum] = [];
			}
			for (subtheme in year) {
				if (specialThemeLists[themeName].indexOf(subtheme) == -1) {
					specialThemeLists[themeName].push(subtheme);
				}
				if (endYears[themeName] === undefined) {
					endYears[themeName] = {
						"start": Infinity,
						"end": -Infinity
					};
				}
				if (+(yearNum) > endYears[themeName]["end"]) {
					endYears[themeName]["end"] = +(yearNum);
				}
				if (+(yearNum) < endYears[themeName]["start"]) {
					endYears[themeName]["start"] = +(yearNum);
				}
				yearsdata[yearNum].push({
					"theme": themeName,
					"name": subtheme,
					"width": year[subtheme]
				});
			}
		}
	}
	// Add in blanks for missing years <--- TOO MANY DATA POINTS FOR SVG
	/*for (themeName in themedata) {
		for (yearNum in yearsdata) {
			if (themedata[themeName][yearNum] === undefined) {
				themedata[themeName][yearNum] = {};
			}
		}
	}*/
	console.log(endYears);
	
	// Add in blanks for missing subthemes
	for (themeName in themedata) {
		length = specialThemeLists[themeName].length;
		for (yearNum in yearsdata) {
			if (+(yearNum) < endYears[themeName]["start"] || +(yearNum) > endYears[themeName]["end"]) {
				continue;
			}
			year = themedata[themeName][yearNum];
			if (year === undefined) {
				themedata[themeName][yearNum] = {};
				year = {};
			}
			for (i=0;i<length;i++) {
				if (year[specialThemeLists[themeName][i]] === undefined) {
					themedata[themeName][yearNum][specialThemeLists[themeName][i]] = 0;
					yearsdata[yearNum].push({
						"theme": themeName,
						"name": specialThemeLists[themeName][i],
						"width": 0
					});
				}
			}
		}
	}
	// Sort year data
	var newYearData = {},
		currentYear = null;
	for (yearNum in yearsdata) {
		currentYear = yearsdata[yearNum];
		currentYear.sort(function (a, b) {
			if (a.theme > b.theme) {
				return 1;
			} else {
				if (a.theme < b.theme) {
					return -1;
				}
				if (a.name > b.name) {
					return 1;
				}
			}
			// a.name < b.name
			return -1;
		});
		newYearData[yearNum] = currentYear;
	}
	yearsdata = newYearData;
	return [yearsdata, specialThemeLists];
}

function drawYears(yearList) {
	var i = 0,
		length = yearList.length,
		y = 0;
	for ( ;i < length;i++ ) {
		y = getYforYear(yearList, yearList[i]);
		if (i % 2) {
			paper.rect(0, y - (YEARGAP/2), LARGESTX, YEARHEIGHT + YEARGAP).attr({
				"stroke": "none",
				"fill": "rgba(255,255,255,0.2)"
			}).toBack();
		}
		paper.text(0, y + (YEARHEIGHT/2), yearList[i]).attr({
			"font-size": "20px",
			"font-weight": "bold",
			"text-anchor": "start"
		});
	}
}

function drawHotSpots(points, name, themeName) {
	var i = 0,
		length = points.index.length,
		year = "",
		point = null,
		sets = 0;
	for ( ;i < length;i++) {
		year = points.index[i];
		point = points[year];
		if (point.left != point.right) {
			sets = (point.right - point.left) / MULTIPLIER;
			drawHotSpot(point, sets, name, themeName, year);
		}
	}
}

function drawHotSpot(point, sets, name, themeName, year) {
			paper.rect(point.left, point.y, point.right - point.left, YEARHEIGHT)
			.attr({
				"stroke": "none",
				"fill": "rgba(0,0,0,0)",
				"cursor": "pointer"
			})
			.hover(function (e) {
				$("#info").show()
					.css("left", e.clientX+12)
					.css("top", e.clientY-9);
				$("#desc").html(name);
				$("#theme").html(themeName);
				$("#startYear").html(year);
				$("#setNumber").html(sets+" sets");
				e.stopImmediatePropagation();
			}, function (e) {
				$("#info").hide();
				e.stopImmediatePropagation();
			});
}

function getDataPoints(data) {
	// data -> {yearList: [...], subthemeYears: {...}, subthemeNames: [...]}
	// where yearList = ["1001", "1002", "1003",...] sorted
	// and subthemeNames = ["theme1-subtheme1", ...] sorted
	// and subthemeYears = {"theme-subtheme": {name:subtheme, theme:themeName,
	//				years:["1002", "1003",...], 1002: 0, 1003:1,...
	//				start: 1002, end: 1008},...}
	// returns [[{x:#, y0:#, y:#},...],...]
	// This is an array with items corresponding to every subtheme,
	// and every item is an array with items corresponding to every year
	var yearList = data.yearList,
		subthemeYears = data.subthemeYears,
		subthemeNames = data.subthemeNames,
		i = 0,
		length = 0,
		subtheme = null,
		subthemeName = "",
		yearName = "",
		year = null,
		dataPoints = [],
		subthemePoints = [],
		previous = [],
		sbthemeIndx = 0,
		numSubthemes = subthemeNames.length,
		height = 0,
		previousHeight = 0;
	for ( ;sbthemeIndx < numSubthemes;sbthemeIndx++) {
		subthemeName = subthemeNames[sbthemeIndx];
		subthemePoints = new Array(yearList.length*2);
		subtheme = subthemeYears[subthemeName];
		for (i=0,length=subtheme.years.length;i<length;i++) {
			yearName = subtheme.years[i];
			height = subtheme[yearName];
			if (previous[0] === undefined) {
				previousHeight = 0;
			} else {
				previousHeight = previous[yearList.indexOf(yearName)*2].realY;
			}
			if (previousHeight+height > LARGESTY) {
				LARGESTY = previousHeight+height;
			}
			if (previousHeight == NaN || height == NaN || yearList.indexOf(yearName) == -1) {
				console.log("ERROR ERROR ERROR");
				console.log("subthemeName", subthemeName);
				console.log("yearName", yearName);
				console.log("previousHeight: "+previousHeight);
				console.log("height: "+height);
				console.log("x", yearList.indexOf(yearName));
			}
			subthemePoints[yearList.indexOf(yearName)*2] = {
				"x": yearList.indexOf(yearName)*2,
				"y": height,
				"y0": 0,
				"realY": previousHeight+height
			};
			subthemePoints[yearList.indexOf(yearName)*2 + 1] = {
				"x": yearList.indexOf(yearName)*2 + 1,
				"y": height,
				"y0": 0
			};
		}
		previous = subthemePoints;
		dataPoints.push(subthemePoints);
	}
	return dataPoints;
}

function getSubthemeYears(themeData) {
	// themeData -> original json ({theme:{year:{subtheme1:number,..},..},..})
	// returns {yearList: [...], subthemeYears: {...}, subthemeNames: [...]}
	// where yearList = ["1001", "1002", "1003",...] sorted
	// and subthemeNames = ["theme1-subtheme1", ...] sorted
	// and subthemeYears = {"theme-subtheme": {name:subtheme, theme:themeName,
	//				years:["1002", "1003",...], 1002: 0, 1003:1,...
	//				start: 1002, end: 1008},...}
	var themeName = "",
		theme = "",
		years = [],
		i = 0,
		length = 0;
		yearNum = "";
	var year = {},
		subthemeYears = {},
		subthemeName = "",
		indexName = "",
		subthemeNames = [];
	for (var themeName in themeData) {
		theme = themeData[themeName];
		for (var yearNum in theme) {
			if (years.indexOf(yearNum) == -1) {
				years.push(yearNum);
			}
			year = theme[yearNum];
			for (var subthemeName in year) {
				indexName = themeName+"-"+subthemeName;
				if (subthemeNames.indexOf(indexName) == -1) {
					subthemeNames.push(indexName);
				}
				if (subthemeYears[indexName] === undefined) {
					subthemeYears[indexName] = {
						"name": subthemeName,
						"theme": themeName,
						"years": [],
						"start": 1000000,
						"end": -1
					};
				}
				if (subthemeYears[indexName]["start"] > +(yearNum)) {
					subthemeYears[indexName]["start"] = +(yearNum);
				}
				if (subthemeYears[indexName]["end"] < +(yearNum)) {
					subthemeYears[indexName]["end"] = +(yearNum);
				}
				subthemeYears[indexName][yearNum] = year[subthemeName];
				subthemeYears[indexName]["years"].push(yearNum);
			}
		}
	}
	// Now, sort years and then add missing years to subthemeYears
	years.sort();
	subthemeNames.sort();
	length = years.length;
	for (var indexName in subthemeYears) {
		i = 0;
		for ( ;i < length;i++) {
			yearNum = years[i];
			if (/*(subthemeYears[indexName]["start"] < +(yearNum)) && 
				(subthemeYears[indexName]["end"] > +(yearNum)) &&*/
					(subthemeYears[indexName][yearNum] === undefined)) {
				subthemeYears[indexName][yearNum] = 0;
				subthemeYears[indexName]["years"].push(yearNum);
			}
		}
	}
	LARGESTX = years.length;
	return {"yearList": years, "subthemeYears": subthemeYears, "subthemeNames": subthemeNames};
}

function subthemeYearsWithout(ldata, exclude) {
	var yearList = ldata.yearList,
		subthemeYears = ldata.subthemeYears,
		subthemeNames = ldata.subthemeNames,
		i = 0,
		numYears = yearList.length;
	var yearName = "",
		j = 0,
		length = 0;
	
	if (! Array.isArray(exclude)) {
		exclude = [exclude];
	}
	
	length = exclude.length;
	
	for ( ;i < numYears;i++) {
		yearName = yearList[i];
		for (j = 0;j < length;j++) {
			subthemeYears[exclude[j]][yearName] = 0;
		}
	}
	return {"yearList": yearList, "subthemeYears": subthemeYears, "subthemeNames": subthemeNames};
}

function subthemeYearsWith(odata, ldata, include) {
	var yearList = ldata.yearList,
		subthemeYears = ldata.subthemeYears,
		subthemeNames = ldata.subthemeNames,
		i = 0,
		numYears = yearList.length;
	var yearName = "",
		j = 0,
		length = 0;
	
	if (! Array.isArray(include)) {
		include = [include];
	}
	
	length = include.length;
	
	for ( ;i < numYears;i++) {
		yearName = yearList[i];
		for (j = 0;j < length;j++) {
			subthemeYears[include[j]][yearName] = odata.subthemeYears[include[j]][yearName];
		}
	}
	return ldata;
}

//yearsdata: { 2020: [{name:__, width:___,theme:__},...] , ...}
//themeLists: {themeName1: [subthemeName1, subthemeName2,...], ...}
//yearList: ["2010", "2011", "2012", ... ] (sorted)

function process(themeData) {
	var yearsData = calculateYears(themeData),
		themeLists = yearsData[1],
		yearsData = yearsData[0],
		yearList = getYearList(yearsData);
	console.log(yearsData);
	console.log(themeData);
	var theme = "",
		themeColor = null,
		i = 0,
		length = 0,
		subtheme = "",
		path = null;
	for (theme in themeLists) {
		themeColor = getColor();
		for (i=0,length=themeLists[theme].length;i<length;i++) {
			subtheme = themeLists[theme][i];
			path = calculateSubthemePath(yearList, yearsData, themeData[theme], subtheme, theme);
			drawTheme(path, subtheme, themeColor, theme);
			drawHotSpots(path, subtheme, theme);
		}
	}
	drawYears(yearList);
	setupControls();
}

function setupControls () {
	
	$("#info").hover(function () {
		$("#info").show();
	}, function () {
		$("#info").hide();
	});
	
	var y = 0,
		x = 0,
		startY = 0,
		startX = 0,
		zoomFactor = 1,
		dragging = false;
	$("#content").mousedown(function (event) {
		dragging = true;
		startY = event.clientY;
		startX = event.clientX;
	}).mousemove(function (event) {
		$("#info").css("left", event.clientX+16)
			.css("top", event.clientY-9);
		if (dragging) {
			x -= event.clientX - startX;
			if (x < 0) {
				x = 0;
			}
			if (x > LARGESTX - window.innerWidth) {
				x = LARGESTX - window.innerWidth;
			}
			y -= event.clientY - startY;
			if (y < 0) {
				y = 0;
			}
			if (y > LARGESTY - window.innerHeight) {
				y = LARGESTY + YEARHEIGHT - window.innerHeight;
			}
			startX = event.clientX;
			startY = event.clientY;
			paper.setViewBox(x, y, window.innerWidth*zoomFactor, window.innerHeight*zoomFactor, false);
		}
	}).mouseup(function (event) {
		dragging = false;
		if (dragging) {
			x -= event.clientX - startX;
			if (x > LARGESTX - window.innerWidth) {
				x = LARGESTX - window.innerWidth;
			}
			y -= event.clientY - startY;
			if (y > LARGESTY - window.innerHeight) {
				y = LARGESTY - window.innerHeight;
			}
			startX = event.clientX;
			startY = event.clientY;
			paper.setViewBox(x*zoomFactor, y*zoomFactor, $("svg").innerWidth()*zoomFactor, $("svg").innerHeight()*zoomFactor, false);
		}
	});
	var mousewheel = function (event) {
		var delta = event.detail < 0 || event.wheelDelta > 0 ? 1 : -1,
			dir = (delta > 0) ? -0.1 : 0.1;
		if (!delta) { return; }
		zoomFactor += dir;
		zoomFactor = (zoomFactor < 0) ? 0 : zoomFactor;
		paper.setViewBox(x*zoomFactor, y*zoomFactor, $("svg").innerWidth()*zoomFactor, $("svg").innerHeight()*zoomFactor, false);
	};
	$("#content").unbind('mousewheel DOMMouseScroll').bind('mousewheel DOMMouseScroll', mousewheel);
}

function setupPathHandlers (subthemeYears, subthemeNames, themeList) {
	$("path").each(function (index, path) {
		var d = subthemeNames[index];
		this.style.fill = d3.rgb(themeList[subthemeYears[d].theme]);
		$(this).hover(function () {
			$("#theme").html(d);
			$("#info").show();
		}, function () {
			$("#info").hide();
		}).click(function () {
			$("li.theme-select[data-name=\""+d+"\"]").click();
		});
	});
}

function copyObject (object) {
	var newObj = {},
		value = "";
	for (var name in object) {
		value = object[name];
		if (Array.isArray(value)) {
			newObj[name] = copyArray(value);
		} else {
			if (typeof(value) == "object") {
				newObj[name] = copyObject(value);
			} else {
				newObj[name] = value;
			}
		}
	}
	return newObj;
}

function copyArray (array) {
	var newArray = [],
		value = "",
		i = 0,
		length = array.length;
	for ( ;i < length;i++) {
		value = array[i];
		if (Array.isArray(value)) {
			newArray.push(copyArray(value));
		} else {
			if (typeof(value) == "object") {
				newArray.push(copyObject(value));
			} else {
				newArray.push(value);
			}
		}
	}
	return newArray;
}

if (window.d3 != undefined) {
	
	var originalData = getSubthemeYears(js),
		currentData = copyObject(originalData),
		data0 = d3.layout.stack().offset("wiggle")(getDataPoints(originalData)),
		m = LARGESTX*2,
		themeList = {};
	
	d3.map(originalData.subthemeNames).forEach(function (d,v) {
		var sbtheme = currentData.subthemeYears[v];
		themeList[sbtheme.theme] = getColor();
		
		var html = "<li class=\"theme-select\" data-name=\""+v+"\">"+
			"<span class=\"theme-toggle on\" data-name=\""+v+"\">&nbsp;</span> "+
			sbtheme.name+" ("+sbtheme.theme+")"+
			"</li>";
		$("#themelist").append(html);
	});

	var width = m*YEARHEIGHT,
		height = LARGESTY*MULTIPLIER,
		mx = m - 1,
		my = d3.max(data0, function(d) {
			return d3.max(d, function(d) {
				return d.y0 + d.y;
			});
		});
	$("#top-ruler").css("width", width);
	d3.map(currentData.yearList).forEach(function (i,name) {
		var newEl = $("<span></span>");
		newEl.html(name);
		newEl.css({
			"position": "absolute",
			"left": i*(YEARHEIGHT+0.2)*2,
			"top": 0
		});
		$("#top-ruler").append(newEl);
	});

	var area = d3.svg.area()
		.x(function(d) {
			if (d.x === undefined) {
				console.log(d.x, width, mx);
			}
			return d.x * width / mx;
		})
		.y0(function(d) {
			if (d.y0 === undefined) {
				console.log(d.y0, height, my);
			}
			return height - d.y0 * height / my;
		})
		.y1(function(d) {
			if (d.y === undefined) {
				console.log(d.y, height, my);
			}
			return height - (d.y + d.y0) * height / my;
		});

	var vis = d3.select("#chart")
		.append("svg")
			.attr("width", width)
			.attr("height", height);

	vis.selectAll("path")
			.data(data0)
		.enter().append("path")
			.attr("d", area);
		
	setupPathHandlers(originalData.subthemeYears, originalData.subthemeNames, themeList);
	
	$(".theme-select").click(function () {
		//console.log("theme select");
		var name = this.getAttribute("data-name"),
			index = originalData.subthemeNames.indexOf(name),
			obj = $(this);
		if (obj.hasClass("on")) {
			obj.removeClass("on");
			var theme = originalData.subthemeYears[name].theme,
				color = themeList[theme];
			$($("path").get(index)).css("fill", d3.rgb(color));
		} else {
			obj.addClass("on");
			$($("path").get(index)).css("fill", "#eee");
		}
	});
	$(".theme-toggle").click(function (event) {
		//console.log("theme toggle");
		var name = this.getAttribute("data-name"),
			index = originalData.subthemeNames.indexOf(name),
			obj = $(this);
		if (obj.hasClass("on")) {
			obj.removeClass("on");
			var newData = subthemeYearsWithout(currentData, name),
				data = d3.layout.stack().offset("wiggle")(getDataPoints(newData));
			d3.selectAll("path")
					.data(data) // Right here, data is not replacing the existing data.
				.transition()
					.duration(2500)
					.attr("d", area);
		} else {
			obj.addClass("on");
			var newData = subthemeYearsWith(originalData, currentData, name),
				data = d3.layout.stack().offset("wiggle")(getDataPoints(newData));
			d3.selectAll("path")
				.data(data)
				.transition()
				.duration(2500)
				.attr("d", area);
		}
		event.stopImmediatePropagation();
	});
	
	$(document).scroll(function (event) {
		var y = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
		$("#top-ruler").css("top", y);
	});
		
	$("body").mousemove(function (event) {
		var x, y;
		if (event.screenX + 316 >= $("body").innerWidth()) {
			$("#balloon, .arrow").addClass("right-arrow")
				.removeClass("left-arrow");
			x = event.pageX - 316;
		} else {
			$("#balloon, .arrow").addClass("left-arrow")
				.removeClass("right-arrow");
			x = event.pageX + 20;
		}
		if (event.screenY + 140 >= window.innerHeight) {
			$("#upper-arrow").hide();
			$("#lower-arrow").show();
			y = event.pageY - 140;
		} else {
			$("#upper-arrow").show();
			$("#lower-arrow").hide();
			y = event.pageY - 18;
		}
		$("#info").css("left", x)
			.css("top", y);
		if ($("#theme").html()) {
			var yearIndex = Math.round(event.pageX/(width/(m-1))/2),
				yearName = originalData.yearList[yearIndex],
				themeName = $("#theme").html(),
				setNumber = originalData.subthemeYears[themeName][yearName];
			$("#year").html(yearName);
			$("#setNumber").html(setNumber+" sets");
		}
	});
	$("#info").hover(function () {
		$("#info").show();
	}, function () {
		$("#info").hide();
	});
	
	$("#panel").hover(function () {
		$("#controls").show();
	}, function () {
		$("#controls").hide();
	});
}