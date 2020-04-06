/*  plug-in for SoftMoon.WebWare.RGB_Calc  v1.1 April 5, 2020
 *  Modified by Joe Golembeiski, SoftMoon-WebWare; with
 *  only superficial modifications from the previous contributors.
 *  FAR more than superficial thanks to the previous contributors!
 *
 *  charset = UTF-8
 *+++++++++++++++++++++++/
/*
 * color-blind
 * https://github.com/skratchdot/color-blind
 *
 * This source was copied from http://mudcu.be/sphere/js/Color.Blind.js
 *******************(now:2019) https://galactic.ink/sphere/js/Color.Blind.js
 *******************(now:2020) see: http://colorlab.wickline.org/colorblind/colorlab/engine.js
 *
 * It contains modifications for use in node.js.
 *
 * The original copyright is included below.
 *
 * Copyright (c) 2014 skratchdot
 * Licensed under the MIT license.
 */
/*
    The Color Blindness Simulation function is
    copyright (c) 2000-2001 by Matthew Wickline and the
    Human-Computer Interaction Resource Network ( http://hcirn.com/ ).

    It is used with the permission of Matthew Wickline and HCIRN,
    and is freely available for non-commercial use. For commercial use, please
    contact the Human-Computer Interaction Resource Network ( http://hcirn.com/ ).
	------------------------
	blind.protan =
		cpu = 0.735; // confusion point, u coord
		cpv = 0.265; // confusion point, v coord
		abu = 0.115807; // color axis begining point (473nm), u coord
		abv = 0.073581; // color axis begining point (473nm), v coord
		aeu = 0.471899; // color axis ending point (574nm), u coord
		aev = 0.527051; // color axis ending point (574nm), v coord
	blind.deutan =
		cpu =  1.14; // confusion point, u coord
		cpv = -0.14; // confusion point, v coord
		abu = 0.102776; // color axis begining point (477nm), u coord
		abv = 0.102864; // color axis begining point (477nm), v coord
		aeu = 0.505845; // color axis ending point (579nm), u coord
		aev = 0.493211; // color axis ending point (579nm), v coord
	blind.tritan =
		cpu =  0.171; // confusion point, u coord
		cpv = -0.003; // confusion point, v coord
		abu = 0.045391; // color axis begining point (490nm), u coord
		abv = 0.294976; // color axis begining point (490nm), v coord
		aeu = 0.665764; // color axis ending point (610nm), u coord
		aev = 0.334011; // color axis ending point (610nm), v coord

	m = (aev - abv) / (aeu - abu); // slope of color axis
	yi = blind[t].abv - blind[t].abu * blind[t].m; // "y-intercept" of axis (on the "v" axis at u=0)
*/
'use strict';


(function() {
var RGB_Calc = SoftMoon.WebWare.RGB_Calc;  //this is our reference to the RGB_Calc Constructor/StaticClass

RGB_Calc.ConfigStack.prototype.XYZFactory = Array; // to be expanded...
RGB_Calc.ConfigStack.prototype.gammaCorrection = 2.2;  //2.2 was default


// all  RGB_Calc.to  methods take an array of 3 RGB byte-values from 0-255
RGB_Calc.to.xyz = toXYZ;
RGB_Calc.to.definer.quick.xyz = {value: toXYZ};
RGB_Calc.to.definer.audit.xyz = {value: function(color) {return this.convertColor(color, toXYZ, 'xyz');}};
function toXYZ(rgb) {
	var M = toXYZ.matrixRgbXyz;
	var R = rgb[0] / 255;
	var G = rgb[1] / 255;
	var B = rgb[2] / 255;
	if (toXYZ.colorProfile === 'sRGB') {
		R = (R > 0.04045) ? Math.pow(((R + 0.055) / 1.055), 2.4) : R / 12.92;
		G = (G > 0.04045) ? Math.pow(((G + 0.055) / 1.055), 2.4) : G / 12.92;
		B = (B > 0.04045) ? Math.pow(((B + 0.055) / 1.055), 2.4) : B / 12.92;
	} else {
		R = Math.pow(R, this.config.gammaCorrection);
		G = Math.pow(G, this.config.gammaCorrection);
		B = Math.pow(B, this.config.gammaCorrection);
	}
	return new this.config.XYZFactory(
		R * M[0] + G * M[3] + B * M[6],
		R * M[1] + G * M[4] + B * M[7],
		R * M[2] + G * M[5] + B * M[8]
	);
};
toXYZ.colorProfile = 'sRGB';
toXYZ.matrixRgbXyz = [
	0.41242371206635076, 0.21265606784927693, 0.019331987577444885,
	0.3575793401363035, 0.715157818248362, 0.11919267420354762,
	0.1804662232369621, 0.0721864539171564, 0.9504491124870351
];



var RGB_calc_toXYZ = toXYZ.bind({config: {XYZFactory: Array}});  //this is the calculator we use within the colorblind conversion


function to_xyY(xyz) {
	var n = xyz[0] + xyz[1] + xyz[2];
	if (n === 0) {
		return {x: 0, y: 0, Y: xyz[1]};
	}
	return {x: xyz[0] / n, y: xyz[1] / n, Y: xyz[1]};
};

if (!SoftMoon.WebWare.RGB_Calc.colorblindProviders)  SoftMoon.WebWare.RGB_Calc.colorblindProviders= new Object;
SoftMoon.WebWare.RGB_Calc.colorblindProviders.Wickline={
	title: "Wickline Algorithmic",
	thanks: "special thanks to:\n Matthew Wickline and the Human-Computer Interaction Resource Network → http://hcirn.com/\n and “scratchdot” → https://github.com/skratchdot/color-blind",
	to: {
		quick: toColorBlind,
		audit: auditToColorBlind  }  }


// all  RGB_Calc.to  quick methods take an array of 3 RGB byte-values from 0-255
RGB_Calc.to.colorblind = toColorBlind;                     // ←↓
RGB_Calc.to.definer.quick.colorblind = {value: toColorBlind, writable: true};   //  ←↑these may be swapped in/out in real-time by the enduser’s UI to yield different filters on demand.
RGB_Calc.to.definer.audit.colorblind = {value: auditToColorBlind, writable: true};
function auditToColorBlind() {return this.convertColor(arguments, toColorBlind, 'colorblind  «Wickline algorithmic»');}
function toColorBlind(rgb, type, anomalize) {
	if (type==='tritan'  &&  rgb[0]==0 && rgb[1]==0 && rgb[2]==0)  return this.outputRGB(0,0,0);  //catch the NaN bug
	var z, v, n,
		line, c, slope,
		yi, dx, dy,
		dX, dY, dZ,
		dR, dG, dB,
		_r, _g, _b,
		ngx, ngz, M,
		adjust;
	if (type === "achroma") { // D65 in sRGB
		z = rgb[0] * 0.212656 + rgb[1] * 0.715158 + rgb[2] * 0.072186;
		z = {R: z, G: z, B: z};
		if (anomalize) {
			v = 1.75;
			n = v + 1;
			z.R = (v * z.R + rgb[0]) / n;
			z.G = (v * z.G + rgb[1]) / n;
			z.B = (v * z.B + rgb[2]) / n;
		}
		return this.outputRGB(z.R, z.G, z.B);
	}
	line = toColorBlind.blinder[type];
	c = to_xyY(RGB_calc_toXYZ(rgb));
	// The confusion line is between the source color and the confusion point
	slope = (c.y - line.y) / (c.x - line.x);
	yi = c.y - c.x * slope; // slope, and y-intercept (at x=0)
	// Find the change in the x and y dimensions (no Y change)
	dx = (line.yi - yi) / (slope - line.m);
	dy = (slope * dx) + yi;
	dY = 0;
	// Find the simulated colors XYZ coords
	z = {};
	z.X = dx * c.Y / dy;
	z.Y = c.Y;
	z.Z = (1 - (dx + dy)) * c.Y / dy;
	// Calculate difference between sim color and neutral color
	ngx = 0.312713 * c.Y / 0.329016; // find neutral grey using D65 white-point
	ngz = 0.358271 * c.Y / 0.329016;
	dX = ngx - z.X;
	dZ = ngz - z.Z;
	// find out how much to shift sim color toward neutral to fit in RGB space
	M = toColorBlind.matrixXyzRgb;
	dR = dX * M[0] + dY * M[3] + dZ * M[6]; // convert d to linear RGB
	dG = dX * M[1] + dY * M[4] + dZ * M[7];
	dB = dX * M[2] + dY * M[5] + dZ * M[8];
	z.R = z.X * M[0] + z.Y * M[3] + z.Z * M[6]; // convert z to linear RGB
	z.G = z.X * M[1] + z.Y * M[4] + z.Z * M[7];
	z.B = z.X * M[2] + z.Y * M[5] + z.Z * M[8];
	_r = ((z.R < 0 ? 0 : 1) - z.R) / dR;
	_g = ((z.G < 0 ? 0 : 1) - z.G) / dG;
	_b = ((z.B < 0 ? 0 : 1) - z.B) / dB;
	_r = (_r > 1 || _r < 0) ? 0 : _r;
	_g = (_g > 1 || _g < 0) ? 0 : _g;
	_b = (_b > 1 || _b < 0) ? 0 : _b;
	adjust = _r > _g ? _r : _g;
	if (_b > adjust) {
		adjust = _b;
	}
	// shift proportionally...
	z.R += adjust * dR;
	z.G += adjust * dG;
	z.B += adjust * dB;
	// apply gamma and clamp simulated color...
	z.R = 255 * (z.R <= 0 ? 0 : z.R >= 1 ? 1 : Math.pow(z.R, 1 / this.config.gammaCorrection));
	z.G = 255 * (z.G <= 0 ? 0 : z.G >= 1 ? 1 : Math.pow(z.G, 1 / this.config.gammaCorrection));
	z.B = 255 * (z.B <= 0 ? 0 : z.B >= 1 ? 1 : Math.pow(z.B, 1 / this.config.gammaCorrection));
	//
	if (anomalize) {
		v = 1.75;
		n = v + 1;
		z.R = (v * z.R + rgb[0]) / n;
		z.G = (v * z.G + rgb[1]) / n;
		z.B = (v * z.B + rgb[2]) / n;
	}
	//
	return this.outputRGB(z.R, z.G, z.B);
};

// xy: coordinates, m: slope, yi: y-intercept
toColorBlind.blinder = {
	protan: {
		x: 0.7465,
		y: 0.2535,
		m: 1.273463,
		yi: -0.073894
	},
	deutan: {
		x: 1.4,
		y: -0.4,
		m: 0.968437,
		yi: 0.003331
	},
	tritan: {
		x: 0.1748,
		y: 0,
		m: 0.062921,
		yi: 0.292119
	},
	custom: {
		x: 0.735,
		y: 0.265,
		m: -1.059259,
		yi: 1.026914
	}
};
toColorBlind.matrixXyzRgb = [
	3.240712470389558, -0.969259258688888, 0.05563600315398933,
	-1.5372626602963142, 1.875996969313966, -0.2039948802843549,
	-0.49857440415943116, 0.041556132211625726, 1.0570636917433989
];
toColorBlind.types=['protan', 'deutan', 'tritan', 'custom', 'achroma'];

})();
