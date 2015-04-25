/*

		ALLISON MONTROY, SARAH SELBY
		Project 2 // CS 452
		
		Game: Project 1 in 3D

*/



var OFFSCREEN_WIDTH = 2048, OFFSCREEN_HEIGHT = 2048;
var LIGHT_X = 0, LIGHT_Y = 7, LIGHT_Z = 2; // Position of the light source
var currentPosition = 0;
var myShape, plane, triangle,triangletwo,trianglethree,trianglefour;
var startPos = [getRandomInt(40,60), getRandomInt(80,400), getRandomInt(80,200), getRandomInt(150,300)];
var tx;
var zPos = [getRandomInt(-3,3), getRandomInt(-3,3), getRandomInt(-3,3), getRandomInt(-3,3)];
var yPos = [getRandomInt(-3,4), getRandomInt(-3,4), getRandomInt(-3,4), getRandomInt(-3,4)];
var pX = 0;
var pY = 0;
var pZ = 4;
var collisions=0;


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

window.onload = function init() {
	
	console.log("startPos: "+startPos);
	console.log("yPos: "+yPos);
	console.log("zPos: "+zPos);
   var canvas = document.getElementById( "webgl" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

  // Initialize shaders for generating a shadow map
  var shadowProgram = initShaders( gl, "shadow-vertex-shader", "shadow-fragment-shader" );
  gl.useProgram( shadowProgram );
  shadowProgram.a_Position = gl.getAttribLocation(shadowProgram, 'a_Position');
  shadowProgram.u_MvpMatrix = gl.getUniformLocation(shadowProgram, 'u_MvpMatrix');
  if (shadowProgram.a_Position < 0 || !shadowProgram.u_MvpMatrix) {
    console.log('Failed to get the storage location of attribute or uniform variable from shadowProgram'); 
    return;
  }

  // Initialize shaders for regular drawing
  var normalProgram = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( normalProgram );
  normalProgram.a_Position = gl.getAttribLocation(normalProgram, 'a_Position');
  normalProgram.a_Color = gl.getAttribLocation(normalProgram, 'a_Color');
  normalProgram.u_MvpMatrix = gl.getUniformLocation(normalProgram, 'u_MvpMatrix');
  normalProgram.u_MvpMatrixFromLight = gl.getUniformLocation(normalProgram, 'u_MvpMatrixFromLight');
  normalProgram.u_ShadowMap = gl.getUniformLocation(normalProgram, 'u_ShadowMap');
  if (normalProgram.a_Position < 0 || normalProgram.a_Color < 0 || !normalProgram.u_MvpMatrix ||
      !normalProgram.u_MvpMatrixFromLight || !normalProgram.u_ShadowMap) {
    console.log('Failed to get the storage location of attribute or uniform variable from normalProgram'); 
    return;
  }

  // Set the vertex information
  triangle = initVertexBuffersForTriangleTwo(gl,triangle);
  player = initVertexBuffersForPlayer(gl);
  lplane = initVertexBuffersForPlane(gl);
  flplane = initVertexBuffersForPlaneB(gl);
  tplane = initVertexBuffersForPlaneB(gl);
  rplane = initVertexBuffersForPlane(gl);
  bplane = initVertexBuffersForPlaneB(gl);
  triangletwo = initVertexBuffersForTriangle(gl,triangletwo);
  trianglethree = initVertexBuffersForTriangle(gl, trianglethree);
  trianglefour = initVertexBuffersForTriangleTwo(gl,trianglefour);
  if (!triangle || !lplane || !tplane || !flplane || !rplane || !bplane || !triangletwo || !trianglethree || !trianglefour) {
    console.log('Failed to set the vertex information');
    return;
  }



window.onkeypress = function(event) {
		var char = String.fromCharCode(event.keyCode);
	switch(char){
		case 'a':
		//left
		if(pX>-3)
		pX--;
		break;
		case 'd':
		if(pX<3)
		//right
		pX++;
		break;
		case 'w':
		if(pY<4)
		//w
		pY++;
		break;	
		case 's':
		if(pY>-2)
		//s
		pY--;
		break;	
	}
	};



  // Initialize framebuffer object (FBO)  
  var fbo = initFramebufferObject(gl);
  if (!fbo) {
    console.log('Failed to initialize frame buffer object');
    return;
  }
  gl.activeTexture(gl.TEXTURE0); // Set a texture object to the texture unit
  gl.bindTexture(gl.TEXTURE_2D, fbo.texture);

  // Set the clear color and enable the depth test
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  var viewProjMatrixFromLight = new Matrix4(); // Prepare a view projection matrix for generating a shadow map
  viewProjMatrixFromLight.setPerspective(90.0, OFFSCREEN_WIDTH/OFFSCREEN_HEIGHT, 1.0, 100.0);
  viewProjMatrixFromLight.lookAt(LIGHT_X, LIGHT_Y, LIGHT_Z, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  var viewProjMatrix = new Matrix4();          // Prepare a view projection matrix for regular drawing
  viewProjMatrix.setPerspective(60, canvas.width/canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(0.0, 4.0, 8.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

 currentAngle = 0.0; // Current rotation angle (degrees)
  var mvpMatrixFromLight_t = new Matrix4(); // A model view projection matrix from light source (for triangle)
  var mvpMatrixFromLight_player = new Matrix4(); 
  var mvpMatrixFromLight_lp = new Matrix4(); // A model view projection matrix from light source (for lplane)
  var tick = function() {
    currentAngle = animate(currentAngle);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);               // Change the drawing destination to FBO
    gl.viewport(0, 0, OFFSCREEN_HEIGHT, OFFSCREEN_HEIGHT); // Set view port for FBO
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);   // Clear FBO    

    gl.useProgram(shadowProgram); // Set shaders for generating a shadow map
	 drawTriangle(gl, shadowProgram, player, currentAngle, viewProjMatrixFromLight);
	mvpMatrixFromLight_player.set(g_mvpMatrix); // Used later
    drawTriangle(gl, shadowProgram, triangle, currentAngle, viewProjMatrixFromLight);
	drawTriangle(gl, shadowProgram, triangletwo, currentAngle, viewProjMatrixFromLight);
	drawTriangle(gl, shadowProgram, trianglethree, currentAngle, viewProjMatrixFromLight);
	drawTriangle(gl, shadowProgram, trianglefour, currentAngle, viewProjMatrixFromLight);
    mvpMatrixFromLight_t.set(g_mvpMatrix); // Used later
    drawPlane(gl, shadowProgram, lplane, viewProjMatrixFromLight);
    drawPlane(gl, shadowProgram, tplane, viewProjMatrixFromLight);
	drawPlane(gl, shadowProgram, rplane, viewProjMatrixFromLight);
	drawPlane(gl, shadowProgram, bplane, viewProjMatrixFromLight);
	drawPlane(gl, shadowProgram, flplane, viewProjMatrixFromLight);
    mvpMatrixFromLight_lp.set(g_mvpMatrix); // Used later

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);               // Change the drawing destination to color buffer
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    // Clear color and depth buffer

    gl.useProgram(normalProgram); // Set the shader for regular drawing
    gl.uniform1i(normalProgram.u_ShadowMap, 0);  // Pass 0 because gl.TEXTURE0 is enabledする

    gl.uniformMatrix4fv(normalProgram.u_MvpMatrixFromLight, false, mvpMatrixFromLight_t.elements);
    drawTriangle(gl, normalProgram, triangle, currentAngle, viewProjMatrix);
	drawTriangle(gl, normalProgram, triangletwo, currentAngle, viewProjMatrix);
	drawTriangle(gl, normalProgram, trianglethree, currentAngle, viewProjMatrix);
	drawTriangle(gl, normalProgram, trianglefour, currentAngle, viewProjMatrix);
    gl.uniformMatrix4fv(normalProgram.u_MvpMatrixFromLight, false, mvpMatrixFromLight_player.elements);
    drawTriangle(gl, normalProgram, player, currentAngle, viewProjMatrix);


    gl.uniformMatrix4fv(normalProgram.u_MvpMatrixFromLight, false, mvpMatrixFromLight_lp.elements);
    drawPlane(gl, normalProgram, lplane, viewProjMatrix);
    drawPlane(gl, normalProgram, rplane, viewProjMatrix);
    drawPlane(gl, normalProgram, tplane, viewProjMatrix);
    drawPlane(gl, normalProgram, bplane, viewProjMatrix);
    drawPlane(gl, normalProgram, flplane, viewProjMatrix);

    window.requestAnimationFrame(tick, canvas);
  };
  tick(); 
}

// Coordinate transformation matrix
var g_modelMatrix = new Matrix4();
var g_mvpMatrix = new Matrix4();

function drawTriangle(gl, program, tri, angle, viewProjMatrix) {
  // Set rotate angle to model matrix and draw triangle

   if(tri == triangle) { 
//   g_modelMatrix.setTranslate(10-currentPosition%20,0,1,0); 
	g_modelMatrix.setRotate(0, 0, 0, 0);
	if(currentPosition%startPos[0] == 0){
		zPos[0] = getRandomInt(-3,3);
		yPos[0] = getRandomInt(-3,4);
	}
   g_modelMatrix.setTranslate(zPos[0],yPos[0],10-currentPosition%startPos[0]*.5,0); 
   }
   else if (tri == triangletwo){
	   if(currentPosition%startPos[1] == 0){
		zPos[1] = getRandomInt(-3,3);
		yPos[1] = getRandomInt(-3,4);
	}
  	  g_modelMatrix.setTranslate(zPos[1],yPos[1],-20+currentPosition%startPos[1]*.5,0); 
   }
      else if (tri == trianglethree){
		    if(currentPosition%startPos[2] == 0){
		zPos[2] = getRandomInt(-3,3);
		yPos[2] = getRandomInt(-3,4);
	}
  	  g_modelMatrix.setTranslate(zPos[2],yPos[2],-35+currentPosition%startPos[2]*.5,0); 
   }
      else if (tri == trianglefour){
		  if(currentPosition%startPos[3] == 0){
		zPos[3] = getRandomInt(-3,3);
		yPos[3] = getRandomInt(-3,4);
	}
  	  g_modelMatrix.setTranslate(zPos[3],yPos[3],40-currentPosition%startPos[3]*.5,0); 
   }
   else if(tri == player){
	   g_modelMatrix.setTranslate(pX,pY,pZ,0);
       //g_modelMatrix.setRotate(angle, 0, 1, 0);
//    g_modelMatrix.rotate(angle, 0, 1, 0);
   }
   
  tx = [10-currentPosition%startPos[0]*.5,-20+currentPosition%startPos[1]*.5,-50+currentPosition%startPos[2]*.5,40-currentPosition%startPos[3]*.5];
   
   checkCollisions();
   
  draw(gl, program, tri, viewProjMatrix);
}

function checkCollisions(){
	for(var i=0; i<yPos.length; i++)
	if((tx[i] >= pZ-1 && tx[i] <= pZ+1) && (yPos[i] >= pY-1 && yPos[i] <= pY+1) && (zPos[i] >= pX-1 && zPos[i] <= pX+1)){
		collisions++;
		tx[i] = 0;
		console.log("hit shape # "+ i);
	}
	
}


function drawPlane(gl, program, plane, viewProjMatrix) {
  // Set rotate angle to model matrix and draw plane
  if(plane == lplane)
  g_modelMatrix.setRotate(-90, 0, 0, 1);
  else if(plane == rplane)
  g_modelMatrix.setRotate(90, 0, 0, 1);
  else if(plane == bplane)
  g_modelMatrix.setRotate(90, 1, 0, 1);
/*else if(plane == flplane){
 g_modelMatrix.setRotate(90, 0, 1, 0);
}*/
else{
	 g_modelMatrix.setRotate(90, 0, 0, 0);
}
  draw(gl, program, plane, viewProjMatrix);
}

function draw(gl, program, o, viewProjMatrix) {
  initAttributeVariable(gl, program.a_Position, o.vertexBuffer);
  if (program.a_Color != undefined) // If a_Color is defined to attribute
    initAttributeVariable(gl, program.a_Color, o.colorBuffer);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);

  // Calculate the model view project matrix and pass it to u_MvpMatrix
  g_mvpMatrix.set(viewProjMatrix);
  g_mvpMatrix.multiply(g_modelMatrix);
  gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrix.elements);

  gl.drawElements(gl.TRIANGLES, o.numIndices, gl.UNSIGNED_BYTE, 0);
}

// Assign the buffer objects and enable the assignment
function initAttributeVariable(gl, a_attribute, buffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);
}

function initVertexBuffersForPlane(gl) {
  // Create a plane
  //  v1------v0
  //  |        | 
  //  |        |
  //  |        |
  //  v2------v3

  // Vertex coordinates
  var vertices = new Float32Array([
    100.0, -5, 100,  -100.0, -5, 10,  -100.0, -5, -100,   100.0, -5, -100    // v0-v1-v2-v3
  ]);

  // Colors
  var colors = new Float32Array([
    1.0, 0.0, 1.0,    1.0, 1.0, 0.0,  0.0, 1.0, 1.0,   1.0, 1.0, 1.0
  ]);

  // Indices of the vertices
  var indices = new Uint8Array([0, 1, 2,   0, 2, 3]);

  var o = new Object(); // Utilize Object object to return multiple buffer objects together

  // Write vertex information to buffer object
  o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
  o.colorBuffer = initArrayBufferForLaterUse(gl, colors, 3, gl.FLOAT);
  o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
  if (!o.vertexBuffer || !o.colorBuffer || !o.indexBuffer) return null; 

  o.numIndices = indices.length;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return o;
}

function initVertexBuffersForPlaneB(gl) {
  // Create a plane
  //  v1------v0
  //  |        | 
  //  |        |
  //  |        |
  //  v2------v3

  // Vertex coordinates
  var vertices = new Float32Array([
    100.0, -15, 100, -100.0, -15, 100,  -100.0, -15, -100,   100.0, -15, -100    // v0-v1-v2-v3
  ]);

  // Colors
  var colors = new Float32Array([
   1.0, 1.0, 1.0,  0.0, 1.0, 1.0,1.0, 0.0, 1.0,    1.0, 1.0, 0.0     
  ]);

  // Indices of the vertices
  var indices = new Uint8Array([0, 1, 2,   0, 2, 3]);

  var o = new Object(); // Utilize Object object to return multiple buffer objects together

  // Write vertex information to buffer object
  o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
  o.colorBuffer = initArrayBufferForLaterUse(gl, colors, 3, gl.FLOAT);
  o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
  if (!o.vertexBuffer || !o.colorBuffer || !o.indexBuffer) return null; 

  o.numIndices = indices.length;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return o;
}

function initVertexBuffersForTriangle(gl, tri) {
 // Vertex coordinates
  var vertices = new Float32Array([0,0,0, 
   0.5,-1.5,0,  
   1,-1,0,  
  0.5,-1.5,0,   
  -0.5,-1.5,0,    
  -1,-1, 0,    
  0,-1,-1,   
   0, -1,1]);
  // Colors
   if(tri == triangle) { 
  var colors = new Float32Array([  0.5,0.0,0.0,   0.5,0.0,0.0,   0.0,0.5,0.5,   0.0,0.5,0.5,   0.5,0.0,0.5,  0.5,0.0,0.5,  0.0,0.0,0.5,  0.0,0.0,0.5]); 
   }
   else if(tri == triangletwo) { 
     var colors = new Float32Array([  0.9,0.9,0.9,   0.9,0.9,0.9,   0.9,0.9,0.9,   0.9,0.0,0.9,   0.9,0.0,0.9,  0.9,0.0,0.9,  0.9,0.0,0.9,  0.9,0.0,0.9]); 
   }
      else if(tri == trianglethree) { 
	      var colors = new Float32Array([  0.0,0.2,0.5,   0.0,0.2,0.5,   0.0,0.2,0.5,   0.0,0.0,0.5,   0.0,0.0,0.5,  0.0,0.0,0.5,  0.0,0.0,0.5,  0.0,0.2,0.5]);  
   }
      else { 
	       var colors = new Float32Array([  0.7,0.0,0.0,   0.7,0.0,0.0,   0.7,0.0,0.0,   0.7,0.0,0.0,   0.7,0.0,0.0,  0.7,0.0,0.0,  0.7,0.0,0.0,  0.7,0.0,0.0]); 
   }
  // Indices of the vertices
  var indices = new Uint8Array([0,1,2,0,2,3,0,3,4,0,4,5,6,3,1,6,5,4,0,1,6,0,6,5]);

  var o = new Object();  // Utilize Object object to return multiple buffer objects together

  // Write vertex information to buffer object
  o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
  o.colorBuffer = initArrayBufferForLaterUse(gl, colors, 3, gl.FLOAT);
  o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
  if (!o.vertexBuffer || !o.colorBuffer || !o.indexBuffer) return null; 

  o.numIndices = indices.length;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return o;
}

function initVertexBuffersForPlayer(gl) {
 // Vertex coordinates
  var vertices = new Float32Array([-0.5,-1.5,0, 
   0.5,-1.5,0,  
   1,-1,0,  
  0.5,-1.5,0,   
  -0.5,-1.5,0,    
  -1,-1, 0,    
  0,-1,-1,   
   0, -1,1]);
  // Colors
  var colors = new Float32Array([  0.5,0.0,0.0,   0.5,0.0,0.0,   0.0,0.5,0.5,   0.0,0.5,0.5,   0.5,0.0,0.5,  0.5,0.0,0.5,  0.0,0.0,0.5,  0.0,0.0,0.5]);    
  // Indices of the vertices
  var indices = new Uint8Array([0,1,6, 1,2,6,2,3,6,3,4,6,4,5,6,5,0,6,0,1,7,1,2,7,2,3,7,3,4,7,4,5,7,5,0,7]);

  var o = new Object();  // Utilize Object object to return multiple buffer objects together

  // Write vertex information to buffer object
  o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
  o.colorBuffer = initArrayBufferForLaterUse(gl, colors, 3, gl.FLOAT);
  o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
  if (!o.vertexBuffer || !o.colorBuffer || !o.indexBuffer) return null; 

  o.numIndices = indices.length;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return o;
}

function initVertexBuffersForTriangleTwo(gl, tri) {

  var vertices = new Float32Array([
  1,-0.9, 0.4,       0.0, 1, -1.4,        -1,-0.9, 0.4,        0, 1, 0.9]);
  // Colors
  if(tri == triangle){
  var colors = new Float32Array([1.0, 0.5, 0.0,  0.0, 1.0, 0.0,  0.0, 0.5, 1.0, 0.0, 0.2, 0.0]);  
  }
  else   if(tri == triangletwo){
  var colors = new Float32Array([1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0, 1.0, 1.0, 0.0]);  
  }
  else   if(tri==trianglethree){
  var colors = new Float32Array([0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, 0.0, 0.0, 1.0]);  
  }
  else {
  var colors = new Float32Array([1.0, 1.0, 0.5,  1.0, 1.0, 0.5,  1.0, 0.0, 0.8, 1.0, 0.0, 0.8]);  
  }
  
  // Indices of the vertices
  var indices = new Uint8Array([0,1,2  , 0,1,3  ,  1,2,3,  0,2,3  ]);

  var o = new Object();  // Utilize Object object to return multiple buffer objects together

  // Write vertex information to buffer object
  o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
  o.colorBuffer = initArrayBufferForLaterUse(gl, colors, 3, gl.FLOAT);
  o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
  if (!o.vertexBuffer || !o.colorBuffer || !o.indexBuffer) return null; 

  o.numIndices = indices.length;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return o;
}

function initArrayBufferForLaterUse(gl, data, num, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // Store the necessary information to assign the object to the attribute variable later
  buffer.num = num;
  buffer.type = type;

  return buffer;
}

function initElementArrayBufferForLaterUse(gl, data, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

  buffer.type = type;

  return buffer;
}

function initFramebufferObject(gl) {
  var framebuffer, texture, depthBuffer;

  // Define the error handling function
  var error = function() {
    if (framebuffer) gl.deleteFramebuffer(framebuffer);
    if (texture) gl.deleteTexture(texture);
    if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
    return null;
  }

  // Create a framebuffer object (FBO)
  framebuffer = gl.createFramebuffer();
  if (!framebuffer) {
    console.log('Failed to create frame buffer object');
    return error();
  }

  // Create a texture object and set its size and parameters
  texture = gl.createTexture(); // Create a texture object
  if (!texture) {
    console.log('Failed to create texture object');
    return error();
  }
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Create a renderbuffer object and Set its size and parameters
  depthBuffer = gl.createRenderbuffer(); // Create a renderbuffer object
  if (!depthBuffer) {
    console.log('Failed to create renderbuffer object');
    return error();
  }
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);

  // Attach the texture and the renderbuffer object to the FBO
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

  // Check if FBO is configured correctly
  var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (gl.FRAMEBUFFER_COMPLETE !== e) {
    console.log('Frame buffer object is incomplete: ' + e.toString());
    return error();
  }

  framebuffer.texture = texture; // keep the required object

  // Unbind the buffer object
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);

  return framebuffer;
}

var ANGLE_STEP = 40;   // The increments of rotation angle (degrees)

var last = Date.now(); // Last time that this function was called
function animate(angle) {
  var now = Date.now();   // Calculate the elapsed time
  var elapsed = now - last;
  last = now;
  currentPosition++;
  document.getElementById('timer').innerHTML = "Timer: " + Math.round((currentPosition/30))+"s"; 
   document.getElementById('score').innerHTML = "Score: " + (collisions); 
   
   if( Math.round((currentPosition/30)) == 60){
   	alert("Times up! Your score is " + collisions);
	window.location= "project2.html";
   }
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle % 360;
}
