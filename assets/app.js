
const inp=document.getElementById('q');let idx=null;
async function load(){if(!idx){idx=await (await fetch('assets/search.json')).json()}}
inp&&inp.addEventListener('input',async e=>{await load();const q=e.target.value.trim().toLowerCase();
const res=document.getElementById('results');const cats=document.getElementById('catgrid');
if(q.length<2){res.style.display='none';cats.style.display='grid';return}
const terms=q.split(/\s+/);const hits=idx.filter(x=>terms.every(t=>(x.n+' '+x.p).toLowerCase().includes(t))).slice(0,48);
res.innerHTML=hits.map(x=>`<a class="pc" href="${x.u}"><div class="im">${x.i?`<img loading="lazy" src="${x.i}">`:'<span class="noimg">—</span>'}</div><div class="bd"><h3>${x.n}</h3><span class="pn">${x.p.slice(0,34)}</span></div></a>`).join('')||'<p style="color:var(--mut)">No products matched. Try a part number like "CPC3312" or "N-012".</p>';
res.style.display='grid';cats.style.display='none';});
