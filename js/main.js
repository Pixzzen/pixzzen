(function(){
  document.documentElement.classList.remove('nojs');
  var y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
  var nav=document.getElementById('navlinks'), btn=document.getElementById('menuBtn');
  if(btn&&nav){
    function setMenuOpen(open){
      nav.classList.toggle('open',open);
      btn.textContent=open?'\u00D7':'\u2630';
      btn.setAttribute('aria-expanded',String(open));
    }
    setMenuOpen(false);
    btn.addEventListener('click',function(){setMenuOpen(!nav.classList.contains('open'))});
    nav.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){setMenuOpen(false)})});
  }
  var els=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
    els.forEach(function(el){io.observe(el)});
  } else { els.forEach(function(el){el.classList.add('in')}); }
  // About page counters animate from zero the first time they enter view.
  var counters=document.querySelectorAll('[data-counter]');
  function runCounter(el){
    if(el.dataset.counted) return; el.dataset.counted='true';
    var target=Number(el.getAttribute('data-counter')), out=el.querySelector('.counter-value');
    if(!out) return;
    var start=performance.now(), duration=1200;
    function frame(now){var progress=Math.min((now-start)/duration,1);out.textContent=Math.floor(target*(1-Math.pow(1-progress,3))).toLocaleString();if(progress<1)requestAnimationFrame(frame);}
    requestAnimationFrame(frame);
  }
  if('IntersectionObserver' in window){var countIO=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){runCounter(e.target);countIO.unobserve(e.target);}})},{threshold:.35});counters.forEach(function(el){countIO.observe(el);});}
  else {counters.forEach(runCounter);}
  // project filters
  var chips=document.querySelectorAll('.chip'), items=document.querySelectorAll('.proj');
  chips.forEach(function(c){c.addEventListener('click',function(){
    chips.forEach(function(x){x.classList.remove('on')}); c.classList.add('on');
    var f=c.getAttribute('data-filter');
    items.forEach(function(p){p.classList.toggle('hide', f!=='all' && p.getAttribute('data-cat')!==f)});
  })});
  // contact form
  var form=document.getElementById('enquiry');
  var successDialog=document.getElementById('formSuccessDialog');
  var successClose=document.getElementById('formSuccessClose');
  var successDialogTimer=null;
  if(successDialog){successDialog.addEventListener('close',function(){clearTimeout(successDialogTimer);successDialogTimer=null;});}
  if(successDialog&&successClose){successClose.addEventListener('click',function(){successDialog.close();});}
  if(form){form.addEventListener('submit',function(e){
    e.preventDefault();
    var note=document.getElementById('formNote');
    var accessKey=form.querySelector('[name="access_key"]');
    var submitButton=form.querySelector('[type="submit"]');
    if(!accessKey||!accessKey.value.trim()||accessKey.value.trim()==='YOUR_WEB3FORMS_ACCESS_KEY'){
      note.textContent='Add your Web3Forms access key in contact.html to enable form submissions.';
      return;
    }
    var payload=Object.fromEntries(new FormData(form).entries());
    submitButton.disabled=true;
    form.setAttribute('aria-busy','true');
    note.textContent='Sending your message...';
    fetch('https://api.web3forms.com/submit',{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(payload)
    }).then(function(response){
      return response.json().then(function(result){
        if(!response.ok||!result.success) throw new Error(result.message||'Unable to send your message right now.');
        form.reset();
        note.textContent='';
        if(successDialog){
          successDialog.showModal();
          successDialogTimer=setTimeout(function(){if(successDialog.open) successDialog.close();},2000);
        }
      });
    }).catch(function(){
      note.textContent='We could not send your message. Please try again or contact us by phone or WhatsApp.';
    }).finally(function(){
      submitButton.disabled=false;
      form.removeAttribute('aria-busy');
    });
  });}
})();
