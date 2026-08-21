/* Excel Unit — 3D data center hero (Three.js) */
(function(){
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
var tries=0;
function boot(){
var host=document.getElementById('hero3d');
if(!host||!window.THREE) return;
if(window.innerWidth===0 || host.clientWidth===0){ if(++tries<40) return setTimeout(boot,250); return; }
if(window.innerWidth < 1080) return;
var W=host.clientWidth, H=host.clientHeight;
var renderer=new THREE.WebGLRenderer({canvas:host, alpha:true, antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.setSize(W,H,false);
var scene=new THREE.Scene();
scene.fog=new THREE.Fog(0x0B1B33, 16, 34);
var cam=new THREE.PerspectiveCamera(42, W/H, 0.1, 100);
cam.position.set(0, 3.2, 13.5);
cam.lookAt(0, 1.2, 0);

function glowTex(){
  var c=document.createElement('canvas'); c.width=c.height=64;
  var g=c.getContext('2d'), grd=g.createRadialGradient(32,32,0,32,32,32);
  grd.addColorStop(0,'rgba(200,225,255,1)'); grd.addColorStop(.4,'rgba(120,175,255,.7)'); grd.addColorStop(1,'rgba(80,140,255,0)');
  g.fillStyle=grd; g.fillRect(0,0,64,64);
  return new THREE.CanvasTexture(c);
}
var tex=glowTex();
var world=new THREE.Group(); scene.add(world);

/* floor grid */
var grid=new THREE.GridHelper(40, 40, 0x2E5AA8, 0x16305C);
grid.material.transparent=true; grid.material.opacity=.34;
grid.position.y=-1.4; world.add(grid);

/* racks */
var RACK_W=1.5, RACK_H=3.4, RACK_D=1.1;
var bodyMat=new THREE.MeshBasicMaterial({color:0x122A50, transparent:true, opacity:.93});
var edgeMat=new THREE.LineBasicMaterial({color:0x6FA5F5, transparent:true, opacity:.85});
var railMat=new THREE.LineBasicMaterial({color:0x33598F, transparent:true, opacity:.5});
var leds=[];
function mkRack(x,z,seed){
  var g=new THREE.Group();
  var geo=new THREE.BoxGeometry(RACK_W, RACK_H, RACK_D);
  g.add(new THREE.Mesh(geo, bodyMat));
  g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat));
  /* rack unit rails on the front */
  var rail=new THREE.BufferGeometry(), rp=[];
  for(var u=1;u<10;u++){
    var y=-RACK_H/2 + u*(RACK_H/10);
    rp.push(-RACK_W/2+.08, y, RACK_D/2+.001,  RACK_W/2-.08, y, RACK_D/2+.001);
  }
  rail.setAttribute('position', new THREE.Float32BufferAttribute(rp,3));
  g.add(new THREE.LineSegments(rail, railMat));
  /* LEDs: sprites on front */
  for(var u=0;u<9;u++){
    var y=-RACK_H/2 + (u+.55)*(RACK_H/10);
    var s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex, color:(u+seed)%3? 0x34D399 : 0x7FB0FF, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false}));
    s.scale.set(.13,.13,1);
    s.position.set(RACK_W/2-.18, y, RACK_D/2+.03);
    s.userData={ph: (u*0.7+seed*1.3)};
    g.add(s); leds.push(s);
  }
  g.position.set(x, -1.4+RACK_H/2, z);
  world.add(g);
  return g;
}
var racks=[];
var xs=[-0.6, 1.4, 3.4], zs=[0, -0.4, -0.8];
for(var i=0;i<3;i++) racks.push(mkRack(xs[i], zs[i], i));
racks.push(mkRack(0.4, -2.6, 3));
racks.push(mkRack(2.4, -3.0, 4));

/* fiber curves sweeping in from the left */
var curves=[], lmat=new THREE.LineBasicMaterial({color:0x3B76D8, transparent:true, opacity:.4, blending:THREE.AdditiveBlending, depthWrite:false});
function mkFiber(y0, z0, tx, ty, tz, lift){
  var a=new THREE.Vector3(-14, y0, z0);
  var b=new THREE.Vector3(tx, ty, tz);
  var m1=new THREE.Vector3(-7, y0+lift, z0+0.6);
  var m2=new THREE.Vector3(tx-3.2, ty+lift*0.5, tz+0.9);
  var curve=new THREE.CubicBezierCurve3(a, m1, m2, b);
  curves.push(curve);
  var geo=new THREE.BufferGeometry().setFromPoints(curve.getPoints(48));
  world.add(new THREE.Line(geo, lmat));
}
mkFiber(2.4, 1.6, -0.6-RACK_W/2, 0.9, 0, 1.4);
mkFiber(0.2, 2.2, -0.6-RACK_W/2, 0.1, 0, 1.8);
mkFiber(-0.8, 1.2, 1.4-RACK_W/2, 0.4, -0.4, 2.2);
mkFiber(3.4, 0.4, 1.4-RACK_W/2, 1.3, -0.4, 1.0);
mkFiber(1.2, 3.0, 3.4-RACK_W/2, 0.6, -0.8, 1.5);
mkFiber(-1.2, 2.6, 0.4-RACK_W/2, 0.2, -2.6, 2.6);

/* pulses along fibers */
var P=16, pulses=[];
for(var i=0;i<P;i++){
  var s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex, color:0xBFE0FF, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false}));
  s.scale.set(.3,.3,1);
  pulses.push({s:s, c:curves[i%curves.length], t:Math.random(), v:.22+Math.random()*.25});
  world.add(s);
}

world.position.x=2.2;
world.rotation.y=-0.35;

var tiltX=0, tiltY=0;
var hero=document.querySelector('.hero');
hero&&hero.addEventListener('mousemove',function(e){
  var r=hero.getBoundingClientRect();
  tiltY=((e.clientX-r.left)/r.width-.5)*.22; tiltX=((e.clientY-r.top)/r.height-.5)*.10;
});
var running=true;
document.addEventListener('visibilitychange',function(){running=!document.hidden;});
var clock=new THREE.Clock();
(function loop(){
  requestAnimationFrame(loop);
  if(!running) return;
  var dt=Math.min(clock.getDelta(), .05), t=clock.elapsedTime;
  world.rotation.y += ((-0.35+tiltY)-world.rotation.y)*.04;
  world.rotation.x += ((tiltX)-world.rotation.x)*.04;
  for(var i=0;i<leds.length;i++){
    var s=leds[i];
    s.material.opacity=.35+.65*(0.5+0.5*Math.sin(t*2.1+s.userData.ph));
  }
  for(var i=0;i<P;i++){
    var p=pulses[i]; p.t+=dt*p.v;
    if(p.t>=1){ p.t=0; p.c=curves[(Math.random()*curves.length)|0]; p.v=.22+Math.random()*.25; }
    p.s.position.copy(p.c.getPoint(p.t));
    p.s.material.opacity=Math.min(1, Math.sin(p.t*Math.PI)*1.4);
  }
  renderer.render(scene,cam);
})();
window.addEventListener('resize',function(){
  var w=host.clientWidth,h=host.clientHeight;
  if(!w||!h) return;
  renderer.setSize(w,h,false); cam.aspect=w/h; cam.updateProjectionMatrix();
});
}
boot();
})();
