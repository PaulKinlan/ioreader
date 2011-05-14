/**
 * @license
 *
 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
 * Copyright (C) 2010 David Aurelio. All Rights Reserved.
 * Copyright (C) 2010 uxebu Consulting Ltd. & Co. KG. All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC., DAVID AURELIO, AND UXEBU
 * CONSULTING LTD. & CO. KG ``AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL APPLE INC. OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *//**
 * Represents a two-dimensional cubic bezier curve with the starting
 * point (0, 0) and the end point (1, 1). The two control points p1 and p2
 * have x and y coordinates between 0 and 1.
 *
 * This type of bezier curves can be used as CSS transform timing functions.
 */function CubicBezier(a,b,c,d){if(!(a>=0&&a<=1))throw new RangeError("'p1x' must be a number between 0 and 1. Got "+a+"instead.");if(!(b>=0&&b<=1))throw new RangeError("'p1y' must be a number between 0 and 1. Got "+b+"instead.");if(!(c>=0&&c<=1))throw new RangeError("'p2x' must be a number between 0 and 1. Got "+c+"instead.");if(!(d>=0&&d<=1))throw new RangeError("'p2y' must be a number between 0 and 1. Got "+d+"instead.");this._p1={x:a,y:b},this._p2={x:c,y:d}}CubicBezier.prototype._getCoordinateForT=function(a,b,c){var d=3*b,e=3*(c-b)-d,f=1-d-e;return((f*a+e)*a+d)*a},CubicBezier.prototype._getCoordinateDerivateForT=function(a,b,c){var d=3*b,e=3*(c-b)-d,f=1-d-e;return(3*f*a+2*e)*a+d},CubicBezier.prototype._getTForCoordinate=function(a,b,c,d){if(!isFinite(d)||d<=0)throw new RangeError("'epsilon' must be a number greater than 0.");for(var e=a,f=0,g,h;f<8;f++){g=this._getCoordinateForT(e,b,c)-a;if(Math.abs(g)<d)return e;h=this._getCoordinateDerivateForT(e,b,c);if(Math.abs(h)<1e-6)break;e=e-g/h}e=a;var i=0,j=1,g;if(e<i)return i;if(e>j)return j;while(i<j){g=this._getCoordinateForT(e,b,c);if(Math.abs(g-a)<d)return e;a>g?i=e:j=e,e=(j-i)*.5+i}return e},CubicBezier.prototype.getPointForT=function(a){if(a==0||a==1)return{x:a,y:a};if(!(a>0)||!(a<1))throw new RangeError("'t' must be a number between 0 and 1Got "+a+" instead.");return{x:this._getCoordinateForT(a,this._p1.x,this._p2.x),y:this._getCoordinateForT(a,this._p1.y,this._p2.y)}},CubicBezier.prototype.getTforX=function(a,b){return this._getTForCoordinate(a,this._p1.x,this._p2.x,b)},CubicBezier.prototype.getTforY=function(a,b){return this._getTForCoordinate(a,this._p1.y,this._p2.y,b)},CubicBezier.prototype._getAuxPoints=function(a){if(!(a>0)||!(a<1))throw new RangeError("'t' must be greater than 0 and lower than 1");var b={x:a*this._p1.x,y:a*this._p1.y},c={x:this._p1.x+a*(this._p2.x-this._p1.x),y:this._p1.y+a*(this._p2.y-this._p1.y)},d={x:this._p2.x+a*(1-this._p2.x),y:this._p2.y+a*(1-this._p2.y)},e={x:b.x+a*(c.x-b.x),y:b.y+a*(c.y-b.y)},f={x:c.x+a*(d.x-c.x),y:c.y+a*(d.y-c.y)},g={x:e.x+a*(f.x-e.x),y:e.y+a*(f.y-e.y)};return{i0:b,i1:c,i2:d,j0:e,j1:f,k:g}},CubicBezier.prototype.divideAtT=function(a){if(a<0||a>1)throw new RangeError("'t' must be a number between 0 and 1. Got "+a+" instead.");if(a===0||a===1){var b=[];b[a]=CubicBezier.linear(),b[1-a]=this.clone();return b}var c={},d={},e=this._getAuxPoints(a),f=e.i0,g=e.i1,h=e.i2,i=e.j0,j=e.j1,k=e.k,l=k.x,m=k.y;c.p1={x:f.x/l,y:f.y/m},c.p2={x:i.x/l,y:i.y/m},d.p1={x:(j.x-l)/(1-l),y:(j.y-m)/(1-m)},d.p2={x:(h.x-l)/(1-l),y:(h.y-m)/(1-m)};return[new CubicBezier(c.p1.x,c.p1.y,c.p2.x,c.p2.y),new CubicBezier(d.p1.x,d.p1.y,d.p2.x,d.p2.y)]},CubicBezier.prototype.divideAtX=function(a,b){if(a<0||a>1)throw new RangeError("'x' must be a number between 0 and 1. Got "+a+" instead.");var c=this.getTforX(a,b);return this.divideAtT(c)},CubicBezier.prototype.divideAtY=function(a,b){if(a<0||a>1)throw new RangeError("'y' must be a number between 0 and 1. Got "+a+" instead.");var c=this.getTforY(a,b);return this.divideAtT(c)},CubicBezier.prototype.clone=function(){return new CubicBezier(this._p1.x,this._p1.y,this._p2.x,this._p2.y)},CubicBezier.prototype.toString=function(){return"cubic-bezier("+[this._p1.x,this._p1.y,this._p2.x,this._p2.y].join(", ")+")"},CubicBezier.linear=function(){return new CubicBezier},CubicBezier.ease=function(){return new CubicBezier(.25,.1,.25,1)},CubicBezier.linear=function(){return new CubicBezier(0,0,1,1)},CubicBezier.easeIn=function(){return new CubicBezier(.42,0,1,1)},CubicBezier.easeOut=function(){return new CubicBezier(0,0,.58,1)},CubicBezier.easeInOut=function(){return new CubicBezier(.42,0,.58,1)}