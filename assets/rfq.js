/* Excel Unit RFQ form — selection-driven quote request.
   Submits JSON to LEAD_API (our own backend). Until the API is activated,
   falls back to a structured email so no lead is ever lost. */
(function(){
'use strict';
var LEAD_API = '';   /* e.g. 'https://lead-api.excelunit.com.hk/api/lead' — set when backend goes live */
var form = document.getElementById('rfqform');
if (!form) return;

/* chip groups */
[].slice.call(document.querySelectorAll('.qchips')).forEach(function(g){
  var multi = g.hasAttribute('data-multi');
  [].slice.call(g.querySelectorAll('.qchip')).forEach(function(ch){
    ch.addEventListener('click', function(){
      if (multi) ch.classList.toggle('on');
      else {
        var was = ch.classList.contains('on');
        [].slice.call(g.querySelectorAll('.qchip')).forEach(function(x){x.classList.remove('on');});
        if (!was) ch.classList.add('on');
      }
      g.classList.remove('bad');
    });
  });
});

/* ?pn= prefill from product pages */
var pn = new URLSearchParams(location.search).get('pn');
if (pn) {
  var ta = document.getElementById('rpns');
  ta.value = pn + '  × ';
  var prods = document.querySelector('.qchips[data-name="products"]');
  document.getElementById('quote').scrollIntoView();
}

function picked(name){
  var g = document.querySelector('.qchips[data-name="'+name+'"]');
  return [].slice.call(g.querySelectorAll('.qchip.on')).map(function(x){return x.textContent;});
}
function val(id){ return document.getElementById(id).value.trim(); }

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
    timeline: picked('timeline')[0]||'', scale: picked('scale')[0]||'', part_numbers: pns,
    name: name, company: company, email: email, phone: phone,
    source: location.pathname + location.search, submitted_at: new Date().toISOString()
  };
  var btn = form.querySelector('.rsubmit'); btn.disabled = true; btn.textContent = 'Sending… 傳送中';

  function done(){
    form.hidden = true;
    var ok = document.getElementById('rfqok'); ok.hidden = false;
    var bits = [];
    if (products.length) bits.push(products.join(', '));
    if (payload.sector) bits.push(payload.sector.replace(/ [^ ]+$/,''));
    if (payload.timeline) bits.push(payload.timeline.replace(/ [^ ]+$/,''));
    document.getElementById('oksum').textContent =
      'We’ve logged your request'+(bits.length?' — '+bits.join(' · '):'')+'. A copy of our reply goes to '+email+'.';
    ok.scrollIntoView({block:'center'});
  }
  function mailFallback(){
    var lines = [
      'Quote request from '+name+' ('+company+')',
      'Email: '+email+(phone?'   Phone: '+phone:''), '',
      'Products: '+(products.join(', ')||'-'),
      'Sector: '+(payload.sector||'-'),
      'Stage: '+(payload.stage||'-'),
      'Timeline: '+(payload.timeline||'-'),
      'Scale: '+(payload.scale||'-'), '',
      'Part numbers / BOM:', pns||'-', '',
      'Submitted from: '+location.href
    ];
    location.href = 'mailto:info@excelunit.com.hk?subject='
      + encodeURIComponent('Quote request — '+company+' ('+(products[0]||'general')+')')
      + '&body=' + encodeURIComponent(lines.join('\n'));
    done();
  }
  if (LEAD_API){
    fetch(LEAD_API, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
      .then(function(r){ if(!r.ok) throw 0; done(); })
      .catch(function(){ mailFallback(); });
  } else {
    mailFallback();
  }
});
})();
