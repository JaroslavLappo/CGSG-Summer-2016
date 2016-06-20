var gl;
function InitGL(canvas) {
  try {
    gl = canvas.getContext("webgl2");
    if (!gl)
      gl = canvas.getContext("webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch (e) {
  }
  if (!gl) {
    alert("Could not initialise WebGL");
  }
}
function fopen(FileName) {
  var str = "";
  var xhr = new XMLHttpRequest();

  xhr.open('GET', FileName, false);

  xhr.send();

  str = xhr.responseText;
  return str;
}
function GetShader(gl, FileName) {
  var str = fopen(FileName);
  var shader;
  if (FileName.split('.')[1] == "frag") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (FileName.split('.')[1] == "vert") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}
var shaderProgram;
function InitShaders() {
  var fragmentShader = GetShader(gl, "shaders/shader.frag");
  var vertexShader = GetShader(gl, "shaders/shader.vert");
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Could not initialise shaders");
  }
  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
  shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "vMatrix");
  shaderProgram.WidthUniform = gl.getUniformLocation(shaderProgram, "Width");
  shaderProgram.HeightUniform = gl.getUniformLocation(shaderProgram, "Height");
  shaderProgram.CamPosUnifrom = gl.getUniformLocation(shaderProgram, "CamPos");
  shaderProgram.CamViewUnifrom = gl.getUniformLocation(shaderProgram, "CamView");
  shaderProgram.ProjDistUnifrom = gl.getUniformLocation(shaderProgram, "ProjDist");
  shaderProgram.TimeUnifrom = gl.getUniformLocation(shaderProgram, "Time");
}
var vMatrix = mat4.create();
function SetMatrixUniforms() {
  var time = 0 * Date.now() / 1000.0;

  gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
  gl.uniform1i(shaderProgram.WidthUniform, gl.viewportWidth);
  gl.uniform1i(shaderProgram.HeightUniform, gl.viewportHeight);

  var Pos = new vec3.create();
  var TimeVec = new vec3.create();
  var LookAt = new vec3.create();

  LookAt.x = 0;
  LookAt.y = 0.2;
  LookAt.z = 0;

  TimeVec.x = Math.cos(time);
  TimeVec.y = Math.sin(time);

  Pos.x = TimeVec.x * 0.4;
  Pos.y = 1         * 0.6;
  Pos.z = TimeVec.y * 0.4;


  gl.uniform3f(shaderProgram.CamPosUnifrom, Pos.x, Pos.y, Pos.z);
  gl.uniform3f(shaderProgram.CamViewUnifrom, LookAt.x - Pos.x, LookAt.y - Pos.y, LookAt.z - Pos.z);
  gl.uniform1f(shaderProgram.ProjDistUnifrom, 1);
  gl.uniform1f(shaderProgram.TimeUnifrom, time);
}
var squareVertexPositionBuffer;
function InitBuffers() {
  squareVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  vertices = [
    1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0,
    1.0, -1.0, 0.0,
    -1.0, -1.0, 0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  squareVertexPositionBuffer.itemSize = 3;
  squareVertexPositionBuffer.numItems = 4;
}
function DrawScene() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT);
//        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
//        mat4.ortho(pMatrix, -10, 10, -10, 10, -1, 1);
//        mat4.ortho = function (out, left, right, bottom, top, near, far)
  mat4.identity(vMatrix);
//        mat4.translate(mvMatrix, [0.0, 0.0, -7.0]);
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  SetMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
}
function InitPointerLock(canvas) {
  canvas.requestPointerLock = canvas.requestPointerLock ||
    canvas.mozRequestPointerLock ||
    canvas.webkitRequestPointerLock;
  document.exitPointerLock = document.exitPointerLock ||
    document.mozExitPointerLock ||
    document.webkitExitPointerLock;

  var isLocked = function () {
    return canvas === document.pointerLockElement ||
      canvas === document.mozPointerLockElement ||
      canvas === document.webkitPointerLockElement;
  }

  canvas.addEventListener('click', function () {
    if (!isLocked()) {
      canvas.requestPointerLock();
    } else {
      document.exitPointerLock();
    }
  }, false);

  var changeCallback = function () {
    if (!havePointerLock) {
      alert('Your browser do not support pointer-lock');
      return;
    }
    if (isLocked()) {
      document.addEventListener("mousemove", CameraRotate, false);
      document.body.classList.add('locked');
    } else {
      document.removeEventListener("mousemove", CameraRotate, false);
      document.body.classList.remove('locked');
    }
  }

  document.addEventListener('pointerlockchange', changeCallback, false);
  document.addEventListener('mozpointerlockchange', changeCallback, false);
  document.addEventListener('webkitpointerlockchange', changeCallback, false);
}
function CameraRotate() {

}

function WebGLStart() {
  var canvas = document.getElementById("rm-canvas");
  InitPointerLock(canvas);
  InitGL(canvas);
  InitShaders();
  InitBuffers();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  function Update() {
    requestAnimationFrame(Update);
    DrawScene();
  }

  Update();
}
