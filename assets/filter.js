(function(){
var grid=document.getElementById('pgrid');if(!grid)return;
var cards=[].slice.call(grid.children);
var sp=new URLSearchParams(location.search);
var q=sp.get('q')||'',b=sp.get('brand')||'';
var chips=[].slice.call(document.querySelectorAll('.fchip'));
var more=document.getElementById('more');var SHOW=60,shown=SHOW;
function apply(){var t=q.toLowerCase();
var m=cards.filter(function(c){return(!b||c.getAttribute('data-b')===b)&&(!t||c.getAttribute('data-t').indexOf(t)>-1)});
cards.forEach(function(c){c.style.display='none'});
m.slice(0,shown).forEach(function(c){c.style.display=''});
var cnt=document.getElementById('fcount');if(cnt)cnt.textContent=m.length;
if(more)more.style.display=m.length>shown?'':'none';}
chips.forEach(function(ch){
if(b&&ch.getAttribute('data-b')===b){chips.forEach(function(x){x.classList.remove('on')});ch.classList.add('on')}
ch.addEventListener('click',function(){b=ch.getAttribute('data-b');shown=SHOW;
chips.forEach(function(x){x.classList.toggle('on',x===ch)});apply()});});
var inp=document.querySelector('.fq');
if(inp&&q)inp.value=q;
inp&&inp.addEventListener('input',function(e){q=e.target.value.trim();shown=SHOW;apply()});
more&&more.addEventListener('click',function(){shown+=120;apply()});
apply();})();