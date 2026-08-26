/* Excel Unit RFQ (Hong Kong) — bilingual EN/繁中, hardened.
   POSTs to the lead API with a 15s timeout; on failure shows a clear
   message with our email (no auto-opened mail client). */
(function(){
'use strict';
var LEAD_API = 'https://excelunit-lead-api.onrender.com/api/lead';
var form = document.getElementById('rfqform');
if (!form) return;

[].slice.call(document.querySelectorAll('.qchips')).forEach(function(g){
  var multi = g.hasAttribute('data-multi');
  [].slice.call(g.querySelectorAll('.qchip')).forEach(function(ch){
    ch.addEventListener('click', function(){
      if (multi) ch.classList.toggle('on');
      else {
        var was = ch.classList.contains('on');
        [].slice.call(g.querySelectorAll('.qchip')).forEach(function(x){x.classList.remove('on');x.setAttribute('aria-pressed','false');});
        if (!was) ch.classList.add('on');
      }
      ch.setAttribute('aria-pressed', ch.classList.contains('on') ? 'true' : 'false');
      g.classList.remove('bad');
    });
  });
});

var files = [];
var finput = document.getElementById('rfiles');
function renderFiles(){
  var box = document.getElementById('rflist'); if(!box) return;
  box.innerHTML = files.map(function(f,i){
    return '<span class="rfile">'+f.name.replace(/[<>&]/g,'')+' <b>'+(f.size/1048576).toFixed(1)+'MB</b><button type="button" data-i="'+i+'" aria-label="Remove">✕</button></span>';
  }).join('');
}
if (finput){
  finput.addEventListener('change', function(){
    [].slice.call(finput.files).forEach(function(f){
      if (files.length >= 5) return;
      if (f.size > 15*1048576){ alert(f.name+' is over 15 MB — please email it to info@excelunit.com.hk instead. 檔案超過15MB，請直接電郵。'); return; }
      files.push(f);
    });
    finput.value=''; renderFiles();
  });
  document.getElementById('rflist').addEventListener('click', function(e){
    var b = e.target.closest('button[data-i]'); if(!b) return;
    files.splice(+b.getAttribute('data-i'),1); renderFiles();
  });
}

var pn = new URLSearchParams(location.search).get('pn');
if (pn) {
  var ta = document.getElementById('rpns');
  if (ta) ta.value = pn + '  × ';
  var q = document.getElementById('quote'); if (q) q.scrollIntoView();
}

function picked(name){
  var g = document.querySelector('.qchips[data-name="'+name+'"]');
  if (!g) return [];
  return [].slice.call(g.querySelectorAll('.qchip.on')).map(function(x){return x.textContent;});
}
function val(id){ var el=document.getElementById(id); return el ? el.value.trim() : ''; }
['rname','rcompany','remail','rphone','rpns'].forEach(function(id){
  var el = document.getElementById(id);
  if (el) el.addEventListener('input', function(){ el.classList.remove('bad'); });
});

form.addEventListener('submit', function(e){
  e.preventDefault();
  var err = document.getElementById('rerr'); err.textContent = '';
  var products = picked('products'), pns = val('rpns');
  var name = val('rname'), company = val('rcompany'), email = val('remail'), phone = val('rphone');
  var bad = false;
  if (!products.length && !pns){
    document.querySelector('.qchips[data-name="products"]').classList.add('bad');
    err.textContent = 'Tap at least one product type, or paste a part number. 請選擇產品或輸入型號。'; bad = true;
  }
  [['rname',name],['rcompany',company],['remail',email]].forEach(function(f){
    var el = document.getElementById(f[0]);
    el.classList.toggle('bad', !f[1]); if(!f[1]) bad = true;
  });
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){
    document.getElementById('remail').classList.add('bad');
    err.textContent = err.textContent || 'Please check the email address. 請檢查電郵地址。'; bad = true;
  }
  if (bad){ if(!err.textContent) err.textContent = 'Please fill in the fields marked red. 請填寫紅色欄位。'; return; }

  var payload = {
    products: products, sector: picked('sector')[0]||'', stage: picked('stage')[0]||'',
    timeline: picked('timeline')[0]||'', scale: '', part_numbers: pns,
    name: name, company: company, email: email, phone: phone,
    website: val('rhp'),
    source: location.pathname + location.search, submitted_at: new Date().toISOString()
  };
  var btn = form.querySelector('.rsubmit'); btn.disabled = true; btn.textContent = 'Sending… 傳送中';
  var ctl = ('AbortController' in window) ? new AbortController() : null;
  var timer = ctl ? setTimeout(function(){ ctl.abort(); }, 15000) : null;

  function done(){
    if (window.gtag) gtag('event','generate_lead',{method:'rfq_form',site:'hk'});
    form.hidden = true;
    var ok = document.getElementById('rfqok'); ok.hidden = false;
    var s = document.getElementById('oksum');
    if (s) s.textContent = 'We’ve logged your request — a confirmation and our reply go to '+email+'. 已收到您的查詢，確認電郵已發送。';
    ok.scrollIntoView({block:'center'});
  }
  function fail(){
    btn.disabled = false; btn.textContent = 'Send request 提交查詢';
    err.innerHTML = 'Could not send right now — please try again, or email us at 暫時無法傳送，請直接電郵 <a href="mailto:info@excelunit.com.hk" style="font-weight:700">info@excelunit.com.hk</a>';
  }
  var req;
  if (files.length){
    var fd = new FormData();
    fd.append('payload', JSON.stringify(payload));
    files.forEach(function(f){ fd.append('files', f, f.name); });
    req = fetch(LEAD_API, {method:'POST', body: fd, signal: ctl && ctl.signal});
  } else {
    req = fetch(LEAD_API, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload), signal: ctl && ctl.signal});
  }
  req.then(function(r){ if(timer)clearTimeout(timer); if(!r.ok) throw 0; done(); })
     .catch(function(){ if(timer)clearTimeout(timer); fail(); });
});
})();
