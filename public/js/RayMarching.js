javascript:(function () {
    var script = document.createElement('script');
    script.onload = function () {
        var stats = new Stats();
        document.body.appendChild(stats.dom);
        requestAnimationFrame(function loop() {
            stats.update();
            requestAnimationFrame(loop)
        });
    };
    script.src = '//rawgit.com/mrdoob/stats.js/master/build/stats.min.js';
    document.head.appendChild(script);
})();

var players = [];
var lplayer = {
    id: null,
    name: null,
    pos: vec3.create()
};
var lplayer_num;
var socket;
var Acceleration = vec3.create();
var OldAcceleration = vec3.create();

function NetworkInit(name) {
    socket = io();

    socket.on('add_user', function (data) {
        var player = data;
        players.push(player);
        if (player.id == null) {
          lplayer = player;
          lplayer_num = players.length - 1;
        }

    });

    socket.on('rem_user', function (data) {
        var i = 0;

        while (i < players.length && players[i].id != data.id)
            i++;

        console.log('Player  deleted: ' + (players[i].id).toString());
        players.splice(i, 1);
    });

    socket.on('send_pos', function (data) {
        var i = 0;
        while (i < players.length && players[i].id != data.id)
            i++;

        vec3.copy(players[i].pos, data.pos);
        console.log('player id: ' + (players[i].id).toString() +
            'pos: ' + vec3.str(players[i].pos));
    });

    socket.on('send_name', function (data) {
        var i = 0;
        while (i < players.length && players[i].id != data.id)
            i++;

        players.name = data.name;
    });

    socket.on('disconnect', function () {
        console.log('Disconnected from server');
    });


    function AccelerationSend(timeout) {
        if (!vec3.exactEquals(OldAcceleration, Acceleration)) {
            console.log("send acceleration" + Acceleration);
            socket.emit('send_acceleration', Acceleration);
            vec3.copy(OldAcceleration, Acceleration);
        }
        setTimeout(AccelerationSend, timeout, timeout);
    }

    AccelerationSend(100);
}

var gl;
var oldpos = vec3.create();
var Camera = {};
var zero_vec = vec3.create();
vec3.set(zero_vec, 0, 0, 0);
var up_vec = vec3.create();
vec3.set(up_vec, 0, 1, 0);

function CameraInit() {
    Camera.Pos = vec3.create();
    Camera.Dir = vec3.create();
    Camera.Up = vec3.create();
    Camera.Right = vec3.create();

    vec3.set(Camera.Pos, 0.0, 0.6, 0.6);
    vec3.set(Camera.Up, 0, 1, 0);
    vec3.set(Camera.Dir, 0, 0, -1);
    vec3.set(Camera.Right, 1, 0, 0);
}

function CameraRotateX(angle) {
    mrot = mat4.create();
    new_up = vec3.create();
    mat4.identity(mrot);
    mat4.rotate(mrot, mrot, angle, Camera.Right);
    vec3.transformMat4(new_up, Camera.Up, mrot);
    if (new_up[1] > 0) {
        vec3.transformMat4(Camera.Dir, Camera.Dir, mrot);
        vec3.copy(Camera.Up, new_up);
    }
}

function CameraRotateY(angle) {
    mrot = mat4.create();
    mat4.identity(mrot);
    mat4.rotate(mrot, mrot, angle, up_vec);
    vec3.transformMat4(Camera.Up, Camera.Up, mrot);
    vec3.transformMat4(Camera.Dir, Camera.Dir, mrot);
    vec3.transformMat4(Camera.Right, Camera.Right, mrot);
}

function CameraTranslate(x, y, z) {
    var tr_vec = vec3.create();
    var x_vec = vec3.create();
    var y_vec = vec3.create();
    var z_vec = vec3.create();

    vec3.set(tr_vec, 0, 0, 0);

    vec3.add(tr_vec, tr_vec,
        vec3.scale(x_vec, Camera.Right, x));

    vec3.add(tr_vec, tr_vec,
        vec3.scale(y_vec, up_vec, y));

    vec3.add(tr_vec, tr_vec,
        vec3.scale(z_vec, Camera.Dir, -z));

    vec3.add(Camera.Pos, Camera.Pos, tr_vec);
}

function InitGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl2");
        if (!gl) {
            gl = canvas.getContext("webgl2");
            if (!gl) {
                alert('Your browser doesn`t support WebGL 2.0. Please google how to enable it.');
            }
        }
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

function PreprocessorInclude( str, PathOriginFile ) {
    var str12, strIncl;
    var PathOriginDirectory;

    PathOriginDirectory = (PathOriginFile.split('').reverse().join('').substring(PathOriginFile.split('').reverse().join('').search("/"))).split('').reverse().join('');

    if (str.search("#include") == -1)
        return str;

    str12 = str.split("#include");

    strIncl = fopen(PathOriginDirectory + str12[1].split('"')[1]);
    str12[1] = str12[1].split('"')[2]
    str12[1] = str12.slice(1).join("#include");

    return PreprocessorInclude(str12[0] + strIncl + str12[1], PathOriginFile);
}

function GetShader(gl, FileName) {
    var str = fopen(FileName);

    str = PreprocessorInclude(str, FileName);

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
        alert(/*"Could not initialise shaders"*/gl.getProgramInfoLog(shaderProgram));
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
    shaderProgram.LightPointUnifrom = new Array();
    shaderProgram.LightPointUnifrom[0] = gl.getUniformLocation(shaderProgram, "LightPoint[0]");
    shaderProgram.TextureUnfirom = gl.getUniformLocation(shaderProgram, "Texture");
    shaderProgram.PlayersNumUniform = gl.getUniformLocation(shaderProgram, "PlayersNum");
    shaderProgram.PlayersPosUniform = new Array();
    for (var i = 0; i < 10; i++)
      shaderProgram.PlayersPosUniform[i] = gl.getUniformLocation(shaderProgram, "PlayersPos[" + i + "]");
}

var CameraMode = "Game";

function SetMatrixUniforms() {
    var time = Date.now() / 1000.0;

    gl.uniform1i(shaderProgram.WidthUniform, gl.viewportWidth);
    gl.uniform1i(shaderProgram.HeightUniform, gl.viewportHeight);

    var TimeVec = vec3.create();
    var Pos = vec3.create();
    var LookAt = vec3.create();

    vec3.set(LookAt, 0, 0.2, 0);

    if (CameraMode == "Lissazhu")
        vec3.set(TimeVec, Math.cos(time * 4 / 3), Math.sin(time * 4 / 5), (Math.sin(time * 4 / 2) + 1) / 2);

    if (CameraMode == "Circle")
        vec3.set(TimeVec, Math.cos(time), Math.sin(time), (Math.sin(time / 2) + 1) / 2);

    if (CameraMode != "Game") {
        vec3.subtract(Camera.Dir, LookAt, Pos);
        vec3.copy(Camera.Pos, Pos);
    }

    Pos[0] = TimeVec[0] * 0.4;
    Pos[1] = TimeVec[2] * 0.6;
    Pos[2] = TimeVec[1] * 0.4;

    if (CameraMode == "Game") {
        vec3.set(TimeVec, Math.cos(time * 4 / 3), Math.sin(time * 4 / 5), (Math.sin(time * 4 / 2) + 1) / 2);
    }

    vec3.normalize(Camera.Dir, Camera.Dir);

    gl.uniform3f(shaderProgram.CamPosUnifrom, Camera.Pos[0], Camera.Pos[1], Camera.Pos[2]);
    gl.uniform3f(shaderProgram.CamViewUnifrom, Camera.Dir[0], Camera.Dir[1], Camera.Dir[2]);
    gl.uniform1f(shaderProgram.ProjDistUnifrom, 1);
    gl.uniform1f(shaderProgram.TimeUnifrom, time);
    gl.uniform3f(shaderProgram.LightPointUnifrom[0], 0.5 * TimeVec[1], 1 - TimeVec[2], 0.5 * TimeVec[0]);
    gl.uniform1i(shaderProgram.TextureUnfirom, 0);
    gl.uniform1i(shaderProgram.PlayersNumUniform, players.length - 1);

    for (var i = 0, j = 0; i < players.length; i++)
      if (players[i].id != null) {
        gl.uniform3f(shaderProgram.PlayersPosUniform[j], players[i].pos[0], players[i].pos[1], players[i].pos[2]);
        j++;
        //console.log("Other player(" + i + ")(my players is " + lplayer_num + ") is on coordinates: " + players[i].pos[0] + " " + players[i].pos[1] + " " +  players[i].pos[2]);
      }
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

function LoadSDF(Model) {
  var Width = 8, Height = 8, Depth = 8;
//  var Width = 16, Height = 32, Depth = 128;
  var Image = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_3D, Image)
  gl.texStorage3D(gl.TEXTURE_3D, 1, gl.R32F, Width, Height, Depth);

  var data = new Array();

  for (var i = 0; i < Depth; i++) {
    for (var j = 0; j < Height; j++) {
      for (var k = 0; k < Width; k++) {
        var x = i - 4;
        var y = j - 4;
        var z = k - 4;
        data[i * Height * Width + j * Width + k] = Math.sqrt(x * x + y * y + z * z) - 2.5;
      }
    }
  }

  gl.texSubImage3D(gl.TEXTURE_3D, 0, 0, 0, 0, Width, Height, Depth, gl.RED, gl.FLOAT, new Float32Array(data));

  gl.bindTexture(gl.TEXTURE_3D, null);
  return Image;
}

var Sphere;

function InitTextures() {
//  alert("Maximal 3d texture size is " + gl.getParameter(gl.MAX_3D_TEXTURE_SIZE));
  Sphere = LoadSDF(null);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_3D, Sphere);
}

function DrawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT);
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
        if (isLocked()) {
            document.addEventListener("mousemove", controlsMouse, false);
            document.addEventListener("keydown", controlsKeyboard, false);
            document.body.classList.add('locked');
        } else {
            document.removeEventListener("mousemove", controlsMouse, false);
            document.removeEventListener("keydown", controlsKeyboard, false);
            document.body.classList.remove('locked');
        }
    };

    document.addEventListener('pointerlockchange', changeCallback, false);
    document.addEventListener('mozpointerlockchange', changeCallback, false);
    document.addEventListener('webkitpointerlockchange', changeCallback, false);
}

function controlsMouse(event) {
    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    movementX *= 0.006;
    movementY *= 0.006;

    movementX = Math.min(Math.PI / 2, movementX);
    movementX = Math.max(-Math.PI / 2, movementX);

    CameraRotateX(-movementY);
    CameraRotateY(-movementX);
}

function controlsKeyboard(event) {
    var key = event.keyCode;

    var speed = 0.1;

    if (key == 87)
        vec3.set(Acceleration, 0, 0, -speed);
    if (key == 65)
        vec3.set(Acceleration, -speed, 0, 0);
    if (key == 83)
        vec3.set(Acceleration, 0, 0, speed);
    if (key == 68)
        vec3.set(Acceleration, speed, 0, 0);
    //console.log("Pressed: " + key);
}


function WebGLStart() {
    var canvas = document.getElementById("rm-canvas");
    InitPointerLock(canvas);
    InitGL(canvas);
    InitShaders();
    InitBuffers();
    InitTextures();
    CameraInit();
    NetworkInit();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    function Update() {
        requestAnimationFrame(Update);
        DrawScene();
    }

    Update();
}

function SetCamera(mode) {
    CameraMode = mode;
}