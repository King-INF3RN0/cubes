var usedConsoleLogs = /^((?!\/\/).)*console\.log*/gi;
var scene, camera, renderer, container,objMtlLoader,light,chatHideDelay,carMaterial,carMesh;
var geometry, material, clientMaterial, mesh, planeGeom, planeMaterial,modelType;

var socket = (window.location.hostname.indexOf("logan")> -1 ? new io('http://logan.waldman.ro',{path:'/node/socket.io'}) : new io() );

var stats = new Stats();
var key = {w:false,a:false,s:false,d:false,q:false,e:false,t:false,space:false,shift: false,keyPressed:0};
var height = 7;
var size = 3;
var userName;
var isShifted;
var user = {};
var usernamePlates = {};

function init()
{
    //container = document.getElementById('threeJsRenderWindow');
    //document.body.appendChild(container);
  scene = new THREE.Scene();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
  //camera.position.z = -1000;
  camera.position.y = 10;
  camera.position.x = -10;
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  planeGeom = new THREE.PlaneGeometry(30,30);
  geometry = new THREE.BoxGeometry(2, 2, 2);

	
	carMaterial = new THREE.MeshPhongMaterial();
	carMaterial.shading = THREE.FlatShading;
  JsonLoader = new THREE.JSONLoader();
  JsonLoader.load('/node/car.AnExtention',function(loadedCar) {
		carMesh = loadedCar;
		//car.rotateX(-Math.PI/2);
		//car.scale.set(0.6,0.6,0.6);
		//var car = new THREE.Mesh(carMesh,carMaterial);
    //scene.add(car);
  });
	var light = new THREE.PointLight(0xffffff,1,100);
	scene.add(light);
	light.position.y = 15;
	light.position.z = 5;
	light.position.x = 5;
  planeMaterial = new THREE.MeshBasicMaterial({
    color: 0x9966ff,
    side: THREE.DoubleSide
  });
  material = new THREE.MeshBasicMaterial({
    color: 0xffa000,
    wireframe: false
  });
  clientMaterial = new THREE.MeshBasicMaterial({
    color: 0x003366,
    wireframe: false
  });
  plane = new THREE.Mesh(planeGeom,planeMaterial);
  scene.add(plane);
  plane.rotation.x = (Math.PI / 2);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  registerSubmitButton();
}

function animate()
{
  stats.begin();
  mainLoop(); //TODO: ask about this
  stats.end();
  requestAnimationFrame(animate);

  //mesh.rotation.x += 0.01;
  //mesh.rotation.y += 0.02;

  renderer.render(scene, camera);

}

socket.on('userJoined',function(data)
{
	//console.log("receved info about" + data.name + ", who is a " + data.model);
	if (typeof user[data.name] == "undefined") {
		if(data.model=="car")
			{
				user[data.name] = new THREE.Mesh(carMesh,carMaterial);
				user[data.name].rotateX(-Math.PI/2);
				user[data.name].scale.set(0.6,0.6,0.6);
			}else{
				user[data.name] = new THREE.Mesh(geometry, material);
			}
			createTextAtPosition(data.name, user[data.name]);
			scene.add(user[data.name]);
	}
});

socket.on('move', function(info)
{
  //console.log(info);
  user[info.name].position.x = info.posX;
  user[info.name].position.y = info.posY;
  user[info.name].position.z = info.posZ;

  user[info.name].rotation.x = info.rotX;
  user[info.name].rotation.y = info.rotY;
  user[info.name].rotation.z = info.rotZ;
  //user[userName].material.color = 0xffb000;
});


function createTextAtPosition(text, parentObj)
{
  var name = new THREE.TextGeometry(text, {
    size: .7,
    height: .2,
    curveSegments: 4,
    font: "helvetiker", //TODO: finish this http://threejs.org/examples/webgl_geometry_text.html
    weight: "normal",
    style: "normal",
    bevelEnabled: false,
    material: 0,
    extrudeMaterial: 1
  });
  name.computeBoundingBox();
  name.computeVertexNormals();

  var triangleAreaHeuristics = 0.1 * (height * size);

  for (var i = 0; i < name.faces.length; i++) {

    var face = name.faces[i];

    if (face.materialIndex == 1) {

      for (var j = 0; j < face.vertexNormals.length; j++) {

        face.vertexNormals[j].z = 0;
        face.vertexNormals[j].normalize();

      }

      var va = name.vertices[face.a];
      var vb = name.vertices[face.b];
      var vc = name.vertices[face.c];

      var s = THREE.GeometryUtils.triangleArea(va, vb, vc);

      if (s > triangleAreaHeuristics) {

        for (var z = 0; z < face.vertexNormals.length; j++) {

          face.vertexNormals[z].copy(face.normal);

        }

      }

    }

  }
  var centerOffset = -0.5 * (name.boundingBox.max.x - name.boundingBox.min.x);

  textMesh1 = new THREE.Mesh(name, material);

  textMesh1.position.x = centerOffset;
  textMesh1.position.y = 2;
  textMesh1.position.z = 0;

  textMesh1.rotation.x = 0;
  textMesh1.rotation.y = Math.PI / 2;

  parentObj.add(textMesh1);


}

var buttonHandler = function(keyPressed,status)
{
  if (keyPressed.target == $(".chat")) return;
  //console.log("key was pressed"+ keyPressed);
  switch (keyPressed.which)
  {
    case 87:
      key.w = status;
      break;
    case 83:
      key.s = status;
      break;
    case 65:
      key.a = status;
      break;
    case 68:
      key.d = status;
      break;
    case 81:
      key.q = status;
      break;
    case 69:
      key.e = status;
      break;
    case 32:
      key.space = status;
      break;
    case 84:
      key.t = status;
      break;
  }
  if (keyPressed.shiftKey)
  {
    key.shift = true;
  }else{key.shift = false;}
}
var mainLoop = function()
{
  //console.log(key.w);
  if(key.w) user[userName].translateX(0.1);
  if(key.s) user[userName].translateX(-0.1);
  if(key.a) user[userName].translateZ(-0.1);
  if(key.d) user[userName].translateZ(0.1);
  if(key.q) {socket.emit('keypress','q');user[userName].rotation.y += 0.1;}
  if(key.e) {socket.emit('keypress','e');user[userName].rotation.y -= 0.1;}
  if(key.space) user[userName].translateY(0.1);
  if(key.shift) user[userName].translateY(-0.1);

  if(key.w || key.a || key.s || key.d || key.q || key.q || key.e || key.space || key.shift) {
    socket.emit('translate', {
    posX: user[userName].position.x,
    posY: user[userName].position.y,
    posZ: user[userName].position.z
  });
}
}


var submitHandler = function(e)
{
	//console.log("submited");
  $('#name').off('keyup');
  if ($("#name").val().length > 0)
  {
		modelType = $(".model:checked").val();
    socket.emit('user', {name:$("#name").val(),model:modelType});
    userName = $("#name").val();
    $('#login').hide();
    $('#main_window').show();
		chatHideDelay = $("#chatDelay").val();
    document.body.appendChild(renderer.domElement);
		if($("#fpsShow").is(":checked"))
			{
				  document.body.appendChild( stats.domElement );
			}
    $(document).on('keydown', function (e) { buttonHandler(e, true) });
    $(document).on('keyup', function (e) { buttonHandler(e, false) });
		if(modelType == "car")
			{
				user[userName] = new THREE.Mesh(carMesh,carMaterial);
				user[userName].scale.set(0.6,0.6,0.6);
				user[userName].rotateX(-Math.PI/2);
			}else{
				user[userName] = new THREE.Mesh(geometry, clientMaterial);
			}
    user[userName].add(camera);
    scene.add(user[userName]);
    //console.log("registered key handlers");
      //$(document).on('keyup keydown',shiftHandler);
    //$(document).on('keypress',keypressHandler);
  } else
  {
    //console.log("name is empty");
    registerSubmitButton();
  }
}

var registerSubmitButton = function()
{
	//console.log("reg sub");
    $("#sendName").one('click', submitHandler);
    $('#name').on('keyup', function (e) {
        if(e.keyCode == 13)
        {
            $('#sendName').trigger('click');
        }
    });
}

init();
animate();
//var loop = setInterval(mainLoop,1000/60);
$(function(){
	$("#opts").on('click',function(){
		$("#options").toggle();
	});
});