/* Excel Unit — product construction turntable (Three.js, homepage band)
   Three models: cat6a copper · 12F fibre optic · MPO trunk. Pills switch models. */
(function(){
var host=document.getElementById('cable3d'); if(!host) return;
var REDUCED=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var current='cat6a', on3dSwitch=null, onHighlight=null;

/* ---- UI: pill switcher + legend/lead/cta swap (runs at any width) ---- */
var pills=[].slice.call(document.querySelectorAll('.cablepills .cpill'));
function setModel(name){
  current=name;
  pills.forEach(function(b){var a=b.getAttribute('data-model')===name;
    b.classList.toggle('on',a); b.setAttribute('aria-pressed',a?'true':'false');});
  [].slice.call(document.querySelectorAll('.cablelead,.cablelegend,.cablecta')).forEach(function(el){
    var a=el.getAttribute('data-for')===name;
    el.classList.toggle('on',a);
    if(a){ [].slice.call(el.querySelectorAll('.rv')).forEach(function(r){r.classList.add('on');}); }
  });
  if(on3dSwitch) on3dSwitch(name);
}
pills.forEach(function(b){ b.addEventListener('click',function(){ setModel(b.getAttribute('data-model')); }); });
[].slice.call(document.querySelectorAll('.cablelegend li[data-part]')).forEach(function(li){
  li.addEventListener('mouseenter',function(){
    var ul=li.parentNode;
    if(ul.getAttribute('data-for')===current && onHighlight) onHighlight(li.getAttribute('data-part'));
  });
  li.addEventListener('mouseleave',function(){ if(onHighlight) onHighlight(null); });
});

/* ---- 3D (desktop only) ---- */
if(window.innerWidth < 1080) return;

function withThree(cb){
  if(window.THREE) return cb();
  var ex=document.querySelector('script[src*="three.min"]');
  if(!ex){ ex=document.createElement('script'); ex.src='/assets/three.min.js'; document.head.appendChild(ex); }
  var iv=setInterval(function(){ if(window.THREE){ clearInterval(iv); cb(); } },60);
  setTimeout(function(){ clearInterval(iv); },15000);
}
var tries=0;
function boot(){
  if(host.clientWidth===0){ if(++tries<40) return setTimeout(boot,250); return; }
  withThree(build);
}

var XL=-4.3, XR=4.3, LEN=XR-XL;
function smooth(u){ u=Math.max(0,Math.min(1,u)); return u*u*(3-2*u); }
function mat(c,o){ o=o||{}; return new THREE.MeshStandardMaterial({color:c,
  roughness:(o.r!=null?o.r:.45), metalness:(o.m!=null?o.m:.05),
  side:o.ds?THREE.DoubleSide:THREE.FrontSide, emissive:o.e||0x000000}); }

function buildCat6a(){
  var g=new THREE.Group(), parts={pairs:[],spline:[],shield:[],jacket:[]};
  var PAIRS=[
    {ang:Math.PI*0.25, pitch:0.85, col:0x2864F0},
    {ang:Math.PI*0.75, pitch:1.05, col:0xF08A24},
    {ang:Math.PI*1.25, pitch:1.25, col:0x2FA84F},
    {ang:Math.PI*1.75, pitch:1.50, col:0x8A5A32}];
  PAIRS.forEach(function(p){
    [0,1].forEach(function(m){
      var c=new THREE.Curve();
      c.getPoint=function(t){
        var x=XL+t*LEN, fan=smooth((-2.5-x)/1.8);
        var cr=0.58*(1+fan*1.05);
        var cy=Math.sin(p.ang)*cr, cz=Math.cos(p.ang)*cr;
        var tw=(x-XL)/p.pitch*Math.PI*2+(m?Math.PI:0)+p.ang*3;
        var orb=0.21*(1+fan*0.5);
        return new THREE.Vector3(x, cy+Math.sin(tw)*orb, cz+Math.cos(tw)*orb);
      };
      var mesh=new THREE.Mesh(new THREE.TubeGeometry(c,220,0.155,10,false), mat(m?0xF2F4F8:p.col,{r:.38}));
      g.add(mesh); parts.pairs.push(mesh);
    });
  });
  [[1.24,0.1],[0.1,1.24]].forEach(function(d){
    var mesh=new THREE.Mesh(new THREE.BoxGeometry(7.0,d[0],d[1]), mat(0xEFE9DA,{r:.7}));
    mesh.position.x=0.85; g.add(mesh); parts.spline.push(mesh);
  });
  var foil=new THREE.Mesh(new THREE.CylinderGeometry(0.98,0.98,5.7,48,1,true), mat(0xD8E0EA,{r:.35,m:.45,ds:1}));
  foil.rotation.z=Math.PI/2; foil.position.x=1.45; g.add(foil); parts.shield.push(foil);
  var jk=new THREE.Mesh(new THREE.CylinderGeometry(1.16,1.16,4.4,48,1,true), mat(0x1E56E8,{r:.45,m:.1,ds:1}));
  jk.rotation.z=Math.PI/2; jk.position.x=2.1; g.add(jk); parts.jacket.push(jk);
  return {group:g, parts:parts};
}

function buildFiber(){
  var g=new THREE.Group(), parts={fibers:[],aramid:[],jacket:[]};
  var COLS=[0x2864F0,0xF08A24,0x2FA84F,0x8A5A32,0x708090,0xF2F4F8,0xD9342B,0x1B1D22,0xF2D024,0x7A3FF2,0xF08FB4,0x35C2CF];
  COLS.forEach(function(col,i){
    var a=i/12*Math.PI*2;
    var c=new THREE.Curve();
    c.getPoint=function(t){
      var x=XL+t*LEN, fan=smooth((-2.3-x)/1.9);
      var r=0.30*(1+fan*2.6);
      var ang=a+(x-XL)*0.55;
      return new THREE.Vector3(x, Math.sin(ang)*r, Math.cos(ang)*r);
    };
    var mesh=new THREE.Mesh(new THREE.TubeGeometry(c,180,0.06,8,false), mat(col,{r:.3}));
    g.add(mesh); parts.fibers.push(mesh);
  });
  var ar=new THREE.Mesh(new THREE.CylinderGeometry(0.52,0.52,5.9,40,1,true), mat(0xF2D024,{r:.95,ds:1}));
  ar.rotation.z=Math.PI/2; ar.position.x=1.35; g.add(ar); parts.aramid.push(ar);
  var jk=new THREE.Mesh(new THREE.CylinderGeometry(0.80,0.80,4.7,48,1,true), mat(0x2FB9C9,{r:.5,ds:1}));
  jk.rotation.z=Math.PI/2; jk.position.x=1.95; g.add(jk); parts.jacket.push(jk);
  g.scale.setScalar(1.18);
  return {group:g, parts:parts};
}

function buildMpo(){
  var g=new THREE.Group(), parts={ferrule:[],housing:[],cable:[]};
  var fe=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.5,1.1), mat(0xEDE6D2,{r:.55}));
  fe.position.x=-2.55; g.add(fe); parts.ferrule.push(fe);
  for(var i=0;i<12;i++){
    var d=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.09,10), mat(0xBFF3FA,{r:.2,e:0x2FB9C9}));
    d.rotation.z=Math.PI/2; d.position.set(-2.92, 0, -0.385+i*0.07);
    g.add(d); parts.ferrule.push(d);
  }
  [-0.46,0.46].forEach(function(z){
    var p=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.045,0.34,12), mat(0xC9D2DE,{r:.25,m:.8}));
    p.rotation.z=Math.PI/2; p.position.set(-2.97,0,z); g.add(p); parts.ferrule.push(p);
  });
  var hs=new THREE.Mesh(new THREE.BoxGeometry(1.7,0.74,1.54), mat(0x3A424F,{r:.45}));
  hs.position.x=-1.35; g.add(hs); parts.housing.push(hs);
  var sl=new THREE.Mesh(new THREE.BoxGeometry(0.85,0.9,1.7), mat(0x99A3B2,{r:.35,m:.3}));
  sl.position.x=-0.85; g.add(sl); parts.housing.push(sl);
  g.scale.setScalar(1.15);
  var bt=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.42,1.5,24), mat(0x14161A,{r:.6}));
  bt.rotation.z=Math.PI/2; bt.position.x=0.15; g.add(bt); parts.cable.push(bt);
  var cb=new THREE.Mesh(new THREE.CylinderGeometry(0.30,0.30,3.4,24), mat(0x2FB9C9,{r:.5}));
  cb.rotation.z=Math.PI/2; cb.position.x=2.6; g.add(cb); parts.cable.push(cb);
  return {group:g, parts:parts};
}

function build(){
  var W=host.clientWidth, H=host.clientHeight;
  var renderer=new THREE.WebGLRenderer({canvas:host, alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(W,H,false);
  var scene=new THREE.Scene();
  var cam=new THREE.PerspectiveCamera(35, W/H, 0.1, 100);
  cam.position.set(0.6,2.0,10.4); cam.lookAt(new THREE.Vector3(0.25,0,0));
  scene.add(new THREE.AmbientLight(0x8fa3c8,.85));
  var key=new THREE.DirectionalLight(0xffffff,1.05); key.position.set(4,6,7); scene.add(key);
  var rim=new THREE.DirectionalLight(0x4477ff,.55); rim.position.set(-7,-3,-4); scene.add(rim);

  var rig=new THREE.Group(); scene.add(rig); rig.rotation.z=-0.10;
  var MODELS={cat6a:buildCat6a(), fiber:buildFiber(), mpo:buildMpo()};
  Object.keys(MODELS).forEach(function(k){ MODELS[k].group.visible=(k===current); rig.add(MODELS[k].group); });

  var needs=true;
  on3dSwitch=function(name){
    Object.keys(MODELS).forEach(function(k){ MODELS[k].group.visible=(k===name); });
    onHighlight(null); needs=true;
  };
  onHighlight=function(part){
    var P=MODELS[current].parts, all=[];
    Object.keys(P).forEach(function(k){ all=all.concat(P[k]); });
    all.forEach(function(m){ m.material.transparent=false; m.material.opacity=1;
      m.material.emissive.setHex(m.userData.e0!=null?m.userData.e0:(m.userData.e0=m.material.emissive.getHex())); });
    if(part && P[part]){
      all.forEach(function(m){ if(P[part].indexOf(m)===-1){ m.material.transparent=true; m.material.opacity=0.16; } });
      P[part].forEach(function(m){ m.material.emissive.setHex(0x18408a); });
    }
    needs=true;
  };

  var dragging=false, px=0, py=0, idle=0;
  host.style.touchAction='none';
  host.addEventListener('pointerdown',function(e){ dragging=true; px=e.clientX; py=e.clientY; host.classList.add('dragging'); e.preventDefault(); });
  window.addEventListener('pointermove',function(e){
    if(!dragging) return;
    rig.rotation.x += (e.clientX-px)*0.011;
    rig.rotation.z = Math.max(-0.55,Math.min(0.35, rig.rotation.z+(e.clientY-py)*0.004));
    px=e.clientX; py=e.clientY; idle=0; needs=true;
  });
  window.addEventListener('pointerup',function(){ dragging=false; host.classList.remove('dragging'); });
  window.addEventListener('resize',function(){
    var w=host.clientWidth,h=host.clientHeight; if(!w||!h) return;
    cam.aspect=w/h; cam.updateProjectionMatrix(); renderer.setSize(w,h,false); needs=true;
  });

  function tick(){
    requestAnimationFrame(tick);
    if(document.hidden) return;
    if(!REDUCED && !dragging){ idle++; if(idle>30) rig.rotation.x+=0.005; needs=true; }
    if(needs){ renderer.render(scene,cam); if(REDUCED && !dragging) needs=false; }
  }
  tick();
}
boot();
})();
