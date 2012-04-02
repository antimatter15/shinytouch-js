//!/usr/bin/env python
//
// Ported from Johnny Lee's C// WiiWhiteboard project (Warper.cs file)
// by Stephane Duchesneau <stephane.duchesneau@gmail.com>
//
// Create Perspective() object,
// call setsrc() with the 4 corners of the quad as tuples,
// call setdst() with the 4 corners of the rectangle as tuples,
//
// use warp(srcx,srcy) to get dstx and dsty 
//
// LICENSE:         MIT (X11) License which follows:
//
// Copyright (c) 2008 Stephane Duchesneau
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

function Perspective(){
	//Used to map pixels in a non-rectangular quad to a rectangular one
	this.srcmatrix = [0,0,
	                  1,0,
	                  0,1,
	                  1,1]
	this.dstmatrix = [0,0,
	                  1,0,
	                  0,1,
	                  1,1]
	this.dstdots = [[0,0],[1,0],[0,1],[1,1]]
	this.srcdots = [[0,0],[1,0],[0,1],[1,1]]
	
	this.computeWarpMatrix()
}
		

Perspective.prototype.setsrc = function(dot1,dot2,dot3,dot4){
	this.srcdots = [[dot1[0],dot1[1]], [dot2[0],dot2[1]], [dot3[0],dot3[1]], [dot4[0],dot4[1]]]
	this.computeWarpMatrix()
}

Perspective.prototype.setdst = function(dot1,dot2,dot3,dot4){
	this.dstdots = [dot1,dot2,dot3,dot4]
	this.computeWarpMatrix()
}
	
Perspective.prototype.computeWarpMatrix = function(){
	this.srcmatrix = this.computeQuadToSquare(this.srcdots)
	this.dstmatrix = this.computeSquareToQuad(this.dstdots)
	this.warpmatrix = this.multMats(this.srcmatrix,this.dstmatrix)
}

Perspective.prototype.computeSquareToQuad = function(inputdots){
	var x0 = inputdots[0][0]
	var y0 = inputdots[0][1]
	var x1 = inputdots[1][0]
	var y1 = inputdots[1][1]
	var x2 = inputdots[2][0]
	var y2 = inputdots[2][1]
	var x3 = inputdots[3][0]
	var y3 = inputdots[3][1]
	var dx1 = x1 - x2
	var dy1 = y1 - y2
	var dx2 = x3 - x2
	var dy2 = y3 - y2
	var sx = x0 - x1 + x2 - x3
	var sy = y0 - y1 + y2 - y3
	var g = (sx * dy2 - dx2 * sy) / (dx1 * dy2 - dx2 * dy1)
	var h = (dx1 * sy - sx * dy1) / (dx1 * dy2 - dx2 * dy1)
	var a = x1 - x0 + g * x1
	var b = x3 - x0 + h * x3
	var c = x0
	var d = y1 - y0 + g * y1
	var e = y3 - y0 + h * y3
	var f = y0
	
	var mat = new Array(16)
	
	mat[ 0] = a
	mat[ 1] = d
	mat[ 2] = 0
	mat[ 3] = g
  mat[ 4] = b
	mat[ 5] = e
	mat[ 6] = 0
	mat[ 7] = h
  mat[ 8] = 0
	mat[ 9] = 0
	mat[10] = 1
	mat[11] = 0
  mat[12] = c
	mat[13] = f	
	mat[14] = 0
	mat[15] = 1
	return mat
}

Perspective.prototype.computeQuadToSquare = function(inputdots){
	var x0 = inputdots[0][0]
	var y0 = inputdots[0][1]
	var x1 = inputdots[1][0]
	var y1 = inputdots[1][1]
	var x2 = inputdots[2][0]
	var y2 = inputdots[2][1]
	var x3 = inputdots[3][0]
	var y3 = inputdots[3][1]
	var mat = this.computeSquareToQuad(inputdots)
	
	var a = mat[ 0]
	var d = mat[ 1]
	var g = mat[ 3]
	var b = mat[ 4]
	var e = mat[ 5]
	var h = mat[ 7]	        
  var c = mat[12]
	var f = mat[13]
	
	var A = e - f * h
  var B = c * h - b
  var C = b * f - c * e
  var D = f * g - d
  var E =     a - c * g
  var F = c * d - a * f
  var G = d * h - e * g
  var H = b * g - a * h
  var I = a * e - b * d
	var idet = 1 / (a * A + b * D + c * G)
	 
	mat[ 0] = A * idet
	mat[ 1] = D * idet
	mat[ 2] = 0
	mat[ 3] = G * idet
	
  mat[ 4] = B * idet
	mat[ 5] = E * idet
	mat[ 6] = 0
	mat[ 7] = H * idet
	
  mat[ 8] = 0       
	mat[ 9] = 0       
	mat[10] = 1
	mat[11] = 0       
	
  mat[12] = C * idet
	mat[13] = F * idet
	mat[14] = 0
	mat[15] = I * idet
	return mat
}

Perspective.prototype.multMats = function(srcMat,dstMat){
	var resMat = new Array(16)
	for(var r = 0; r < 4; r++){
		var ri = r * 4
		for(var c = 0; c < 4; c++){
			resMat[ri + c] = (srcMat[ri] * dstMat[c] +
			srcMat[ri + 1] * dstMat[c +  4] +
			srcMat[ri + 2] * dstMat[c +  8] +
			srcMat[ri + 3] * dstMat[c + 12])
	  }
	}
	return resMat
}

Perspective.prototype.warp = function( srcX, srcY){
	var result = new Array(4)
	var mat = this.warpmatrix
	var z=0
	result[0] = (srcX * mat[0] + srcY*mat[4] + z*mat[8] + 1*mat[12])
	result[1] = (srcX * mat[1] + srcY*mat[5] + z*mat[9] + 1*mat[13])
	result[2] = (srcX * mat[2] + srcY*mat[6] + z*mat[10] + 1*mat[14])
	result[3] = (srcX * mat[3] + srcY*mat[7] + z*mat[11] + 1*mat[15])        
	dstX = result[0]/result[3]
	dstY = result[1]/result[3]
	return [dstX,dstY]
}