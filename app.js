'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const H0=8, H1=22, HOUR=60; // calendario 8:00-22:00, 60px/hora
const DAYS=['LUN','MAR','MIE','JUE','VIE'];
const COLORS=['#34d399','#60a5fa','#f472b6','#fbbf24','#a78bfa'];

/* ---------- tema ---------- */
const ACCENTS=['#34d399','#60a5fa','#f472b6','#fbbf24','#a78bfa','#f87171','#2dd4bf','#84cc16','#fb923c','#e879f9'];
const ACC_BASIC=4;
function dimHex(hex,f){const n=parseInt(hex.slice(1),16);const m=v=>Math.max(0,Math.min(255,Math.round(v*f)));return '#'+((1<<24)+(m(n>>16&255)<<16)+(m(n>>8&255)<<8)+m(n&255)).toString(16).slice(1)}
function getTheme(){try{return Object.assign({mode:'dark',accent:'#34d399'},JSON.parse(localStorage.getItem('sf_theme')||'{}'))}catch(e){return{mode:'dark',accent:'#34d399'}}}
function applyTheme(){const t=getTheme();document.documentElement.dataset.theme=t.mode;document.documentElement.style.setProperty('--acc',t.accent);document.documentElement.style.setProperty('--acc-dim',dimHex(t.accent,t.mode==='light'?0.78:0.55))}
function saveTheme(t){localStorage.setItem('sf_theme',JSON.stringify(t))}
function renderThemePanel(){
  const t=getTheme();
  $('#th-dark').classList.toggle('on',t.mode==='dark');
  $('#th-light').classList.toggle('on',t.mode==='light');
  const paint=(el,list)=>{el.innerHTML='';list.forEach(hex=>{const s=document.createElement('button');s.type='button';s.className='sw'+(t.accent.toLowerCase()===hex?' on':'');s.style.background=hex;s.onclick=()=>{const th=getTheme();th.accent=hex;saveTheme(th);applyTheme();renderThemePanel()};el.appendChild(s)})};
  paint($('#th-basic'),ACCENTS.slice(0,ACC_BASIC));
  paint($('#th-pro-sw'),ACCENTS.slice(ACC_BASIC));
}
$('#th-dark').onclick=()=>{const t=getTheme();t.mode='dark';saveTheme(t);applyTheme();renderThemePanel()};
$('#th-light').onclick=()=>{const t=getTheme();t.mode='light';saveTheme(t);applyTheme();renderThemePanel()};
$('#th-hex-go').onclick=()=>{let v=$('#th-hex').value.trim();if(/^[0-9a-fA-F]{6}$/.test(v))v='#'+v;if(!/^#[0-9a-fA-F]{6}$/.test(v)){$('#th-hex').value='';return}const t=getTheme();t.accent=v.toLowerCase();saveTheme(t);applyTheme();renderThemePanel()};
function openTheme(){renderThemePanel();$('#overlay-th').classList.remove('hidden')}
$('#btn-theme').onclick=openTheme;
$('#btn-theme2').onclick=openTheme;
$('#th-close').onclick=()=>$('#overlay-th').classList.add('hidden');
$('#overlay-th').onclick=e=>{if(e.target.id==='overlay-th')$('#overlay-th').classList.add('hidden')};
applyTheme();

/* ---------- selector fecha/hora ---------- */
const MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MESES_S=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
let dtCb=null,dtDate=null,dtTimeOnly=false,dtViewY=0,dtViewM=0;
function pad(n){return String(n).padStart(2,'0')}
function fmtDTBtn(v){const d=new Date(v);return d.getDate()+' '+MESES_S[d.getMonth()]+', '+pad(d.getHours())+':'+pad(d.getMinutes())}
function paintDt(inpId,timeOnly){
  const v=$('#'+inpId).value,b=$('#'+inpId+'-btn');
  if(!v){b.classList.add('ph');b.firstElementChild.textContent=timeOnly?'Elige hora':'Elige fecha y hora';return}
  b.classList.remove('ph');b.firstElementChild.textContent=timeOnly?v:fmtDTBtn(v);
}
function openDt(inpId,timeOnly,title){
  dtTimeOnly=timeOnly;$('#dt-title').textContent=title||(timeOnly?'Elige hora':'Elige fecha y hora');
  $('#dt-cal-wrap').classList.toggle('hidden',timeOnly);
  const v=$('#'+inpId).value;let d;
  if(timeOnly){d=new Date();const p=(v||'09:00').split(':');d.setHours(+p[0],+p[1],0,0)}
  else if(v)d=new Date(v);
  else{d=new Date();d.setMinutes(0,0,0);d.setHours(d.getHours()+1)}
  dtDate=d;dtViewY=d.getFullYear();dtViewM=d.getMonth();
  dtCb=val=>{$('#'+inpId).value=val;paintDt(inpId,timeOnly)};
  renderDt();$('#overlay-dt').classList.remove('hidden');
}
function renderDt(){
  $('#dt-month').textContent=MESES[dtViewM]+' '+dtViewY;
  const cal=$('#dt-cal');cal.innerHTML='';
  ['L','M','X','J','V','S','D'].forEach(w=>{const e=document.createElement('span');e.className='dt-dow';e.textContent=w;cal.appendChild(e)});
  const lead=(new Date(dtViewY,dtViewM,1).getDay()+6)%7;
  const daysIn=new Date(dtViewY,dtViewM+1,0).getDate();
  const prevIn=new Date(dtViewY,dtViewM,0).getDate();
  const today=new Date();
  const pick=(y,m,dd)=>{dtDate.setFullYear(y,m,dd);dtViewY=y;dtViewM=m;renderDt()};
  for(let i=0;i<lead;i++){const b=document.createElement('button');b.type='button';b.className='dt-day off';b.textContent=prevIn-lead+1+i;
    const y=dtViewM===0?dtViewY-1:dtViewY,m=dtViewM===0?11:dtViewM-1,dd=prevIn-lead+1+i;b.onclick=()=>pick(y,m,dd);cal.appendChild(b)}
  for(let dd=1;dd<=daysIn;dd++){
    const b=document.createElement('button');b.type='button';b.className='dt-day';b.textContent=dd;
    if(dd===today.getDate()&&dtViewM===today.getMonth()&&dtViewY===today.getFullYear())b.classList.add('today');
    if(dd===dtDate.getDate()&&dtViewM===dtDate.getMonth()&&dtViewY===dtDate.getFullYear())b.classList.add('on');
    b.onclick=()=>pick(dtViewY,dtViewM,dd);cal.appendChild(b);
  }
  const trail=(7-(lead+daysIn)%7)%7;
  for(let dd=1;dd<=trail;dd++){const b=document.createElement('button');b.type='button';b.className='dt-day off';b.textContent=dd;
    const y=dtViewM===11?dtViewY+1:dtViewY,m=dtViewM===11?0:dtViewM+1;b.onclick=()=>pick(y,m,dd);cal.appendChild(b)}
  $('#dt-h').value=pad(dtDate.getHours());$('#dt-m').value=pad(dtDate.getMinutes());
}
$('#dt-prev').onclick=()=>{dtViewM--;if(dtViewM<0){dtViewM=11;dtViewY--}renderDt()};
$('#dt-next').onclick=()=>{dtViewM++;if(dtViewM>11){dtViewM=0;dtViewY++}renderDt()};
function stepDt(unit,d){
  if(unit==='h'){let h=(dtDate.getHours()+d+24)%24;dtDate.setHours(h);$('#dt-h').value=pad(h)}
  else{let m=(dtDate.getMinutes()+d*5+60)%60;dtDate.setMinutes(m);$('#dt-m').value=pad(m)}
}
$('#dt-h-m').onclick=()=>stepDt('h',-1);$('#dt-h-p').onclick=()=>stepDt('h',1);
$('#dt-m-m').onclick=()=>stepDt('m',-1);$('#dt-m-p').onclick=()=>stepDt('m',1);
$('#dt-h').onchange=()=>{let h=parseInt($('#dt-h').value,10);if(isNaN(h))h=0;h=Math.min(23,Math.max(0,h));dtDate.setHours(h);$('#dt-h').value=pad(h)};
$('#dt-m').onchange=()=>{let m=parseInt($('#dt-m').value,10);if(isNaN(m))m=0;m=Math.min(59,Math.max(0,m));dtDate.setMinutes(m);$('#dt-m').value=pad(m)};
$('#dt-cancel').onclick=()=>$('#overlay-dt').classList.add('hidden');
$('#overlay-dt').onclick=e=>{if(e.target.id==='overlay-dt')$('#overlay-dt').classList.add('hidden')};
$('#dt-ok').onclick=()=>{
  const v=dtTimeOnly
    ?pad(dtDate.getHours())+':'+pad(dtDate.getMinutes())
    :dtDate.getFullYear()+'-'+pad(dtDate.getMonth()+1)+'-'+pad(dtDate.getDate())+'T'+pad(dtDate.getHours())+':'+pad(dtDate.getMinutes());
  $('#overlay-dt').classList.add('hidden');
  if(dtCb)dtCb(v);
};
$('#dl-due-btn').onclick=()=>openDt('dl-due',false);
$('#m-start-btn').onclick=()=>openDt('m-start',true,'Hora de inicio');
$('#m-end-btn').onclick=()=>openDt('m-end',true,'Hora de fin');

/* ---------- notificaciones ---------- */
async function fire(title,body){
  if(!('Notification' in window)||Notification.permission!=='granted')return false;
  try{
    if('serviceWorker' in navigator){
      const r=await navigator.serviceWorker.getRegistration();
      if(r){await r.showNotification(title,{body,icon:'icon.svg'});return true}
    }
    new Notification(title,{body,icon:'icon.svg'});return true;
  }catch(e){
    try{new Notification(title,{body});return true}catch(e2){return false}
  }
}
function updateNtfBtn(){
  const b=$('#acc-ntf');
  if(!('Notification' in window)){b.textContent='No soportadas aquí';b.disabled=true;return}
  const p=Notification.permission;
  if(p==='granted'){b.textContent='Activadas ✓';b.disabled=true}
  else if(p==='denied'){b.textContent='Bloqueadas';b.disabled=true}
  else{b.textContent='Activar';b.disabled=false}
}
$('#acc-ntf').onclick=()=>{if('Notification' in window)Notification.requestPermission().then(updateNtfBtn)};
function fmtRem(m){if(m>=1440&&m%1440===0)return (m/1440)+' día'+(m>1440?'s':'');if(m>=60&&m%60===0)return (m/60)+' h';return m+' min'}
function checkReminders(){
  if(!me)return;
  const now=Date.now();let ch=false;
  data.deadlines.forEach(d=>{
    if(d.remind==null||d.done||d.notified)return;
    const due=new Date(d.due).getTime();
    if(now>=due-d.remind*60000){
      d.notified=true;ch=true;
      const left=due-now;
      fire('Entrega: '+d.name,left>0?fmtLeft(left)+' · límite '+new Date(d.due).toLocaleString('es-ES',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'La entrega ya venció');
    }
  });
  if(ch){save();if(!$('#view-entregas').classList.contains('hidden'))renderDeadlines()}
}

/* ---------- diálogos propios ---------- */
function ask(o){
  return new Promise(res=>{
    $('#ask-title').textContent=o.title||'¿Seguro?';
    $('#ask-msg').textContent=o.msg||'';
    const y=$('#ask-yes');y.textContent=o.yes||'Borrar';
    y.className=o.danger===false?'btn':'btn warn';
    $('#ask-no').style.display=o.no===null?'none':'';
    $('#ask-no').textContent=o.no||'Cancelar';
    $('#overlay-ask').classList.remove('hidden');
    const done=v=>{$('#overlay-ask').classList.add('hidden');res(v)};
    y.onclick=()=>done(true);
    $('#ask-no').onclick=()=>done(false);
    $('#overlay-ask').onclick=e=>{if(e.target.id==='overlay-ask')done(false)};
  });
}
function notice(title,msg){return ask({title,msg,yes:'Vale',no:null,danger:false})}

/* ---------- storage ---------- */
const store={
  users(){try{return JSON.parse(localStorage.getItem('sf_users')||'{}')}catch(e){return{}}},
  saveUsers(u){localStorage.setItem('sf_users',JSON.stringify(u))},
  data(n){try{return JSON.parse(localStorage.getItem('sf_data_'+n)||'null')}catch(e){return null}},
  saveData(n,d){localStorage.setItem('sf_data_'+n,JSON.stringify(d))},
  session(){return localStorage.getItem('sf_session')},
  setSession(n){n?localStorage.setItem('sf_session',n):localStorage.removeItem('sf_session')}
};
function blankData(){return {classes:[],deadlines:[],notes:[],pomos:{total:0,days:{},mins:{},totalMin:0},settings:{focus:25,short:5,long:15,remindDef:null}}}
let me=null, data=null, isPro=false;
function save(){store.saveData(me,data);cloudPush()}
let cloudT=null;
function cloudPush(){
  if(!me||typeof sbSaveData!=='function')return;
  clearTimeout(cloudT);
  cloudT=setTimeout(()=>{sbSaveData(data).catch(()=>{})},800);
}

/* ---------- auth (Supabase, fase 2) ---------- */
let authMode='login';
function setAuthMode(m){
  authMode=m;
  $('#tab-login').classList.toggle('on',m==='login');
  $('#tab-reg').classList.toggle('on',m==='reg');
  $('#a-go').textContent=m==='login'?'Entrar':'Crear cuenta';
  $('#a-err').textContent='';
}
$('#tab-login').onclick=()=>setAuthMode('login');
$('#tab-reg').onclick=()=>setAuthMode('reg');
$('#form-auth').onsubmit=async e=>{
  e.preventDefault();
  const email=$('#a-name').value.trim().toLowerCase(), pass=$('#a-pass').value;
  const err=m=>{$('#a-err').textContent=m};
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){err('Escribe un email válido');return}
  if(pass.length<6){err('Contraseña de al menos 6 caracteres');return}
  $('#a-go').disabled=true;err('');
  try{
    const r=authMode==='reg'?await sbSignup(email,pass):await sbLogin(email,pass);
    if(!r.ok){err(r.error);return}
    if(r.needsConfirm){err('Cuenta creada. Revisa tu email para confirmarla.');return}
    await enterCloud(r.user,authMode==='reg');
  }catch(ex){err('Sin conexión. Inténtalo de nuevo en un momento.')}
  finally{$('#a-go').disabled=false}
};
function normalize(){
  data.classes=data.classes||[];
  data.deadlines=data.deadlines||[];
  data.notes=(data.notes||[]).map(n=>{n.subject=typeof n.subject==='string'&&n.subject.trim()?n.subject.trim().slice(0,40):null;return n});
  data.pomos=data.pomos||{total:0,days:{},mins:{},totalMin:0};
  data.pomos.mins=data.pomos.mins||{};
  if(data.pomos.totalMin==null)data.pomos.totalMin=0;
  data.settings=Object.assign({focus:25,short:5,long:15,remindDef:null},data.settings||{});
}
function showApp(email){
  $('#auth').classList.add('hidden');$('#app').classList.remove('hidden');
  $('#u-name').textContent=email;$('#u-av').textContent=(email[0]||'?').toUpperCase();
  syncSettingsUI();renderAll();
}
async function enterCloud(user,isNew){
  me=user.id;
  data=store.data(me)||blankData();
  normalize();
  store.setSession(me);store.saveData(me,data);
  showApp(user.email||'');
  if(!isNew){
    try{
      const r=await sbLoadData();
      if(r.ok&&r.payload){
        data=Object.assign(blankData(),r.payload);normalize();
        store.saveData(me,data);syncSettingsUI();renderAll();
      }else if(r.ok){
        const local=store.data(me);
        if(local&&(local.classes.length||local.deadlines.length||local.notes.length)){sbSaveData(local).catch(()=>{})}
        else await offerMigration();
      }
    }catch(ex){/* seguimos con la copia local */}
  }else{
    await offerMigration();
  }
  sbLoadProfile().then(p=>{if(p.ok)isPro=p.pro}).catch(()=>{});
}
function findLegacyData(){
  try{
    const users=store.users();
    const legacy=store.session();
    if(legacy&&users[legacy]&&store.data(legacy))return{name:legacy,d:store.data(legacy)};
    const ks=Object.keys(users);
    if(ks.length===1&&store.data(ks[0]))return{name:ks[0],d:store.data(ks[0])};
  }catch(e){}
  return null;
}
async function offerMigration(){
  const lg=findLegacyData();
  if(!lg)return;
  const yes=await ask({title:'¿Subir tus datos locales?',msg:'En este navegador había datos de "'+lg.name+'". ¿Los subimos a tu cuenta para tenerlos en todos tus dispositivos?',yes:'Subir',no:'Ahora no',danger:false});
  if(!yes)return;
  data=Object.assign(blankData(),lg.d);normalize();
  store.saveData(me,data);syncSettingsUI();renderAll();
  const r=await sbSaveData(data).catch(()=>null);
  if(!r||!r.ok)notice('Sin conexión','No se pudieron subir ahora. Se quedan en este navegador y se subirán en la próxima sincronización.');
}
$('#btn-out').onclick=async()=>{stopTimer();try{await sbLogout()}catch(e){}me=null;data=null;store.setSession(null);$('#app').classList.add('hidden');$('#auth').classList.remove('hidden');$('#a-pass').value=''};

/* ---------- nav ---------- */
function switchView(v){
  $$('nav button').forEach(x=>x.classList.toggle('on',x.dataset.view===v));
  ['horario','entregas','apuntes','pomodoro','ia'].forEach(w=>$('#view-'+w).classList.toggle('hidden',w!==v));
  if(v==='horario')renderCal();
  if(v==='entregas')renderDeadlines();
  if(v==='apuntes')renderNotes();
}
$$('nav button').forEach(b=>b.onclick=()=>switchView(b.dataset.view));

/* ---------- horario ---------- */
let editId=null, mColor=COLORS[0];
const swBox=$('#m-colors');
COLORS.forEach(c=>{const d=document.createElement('button');d.className='sw';d.dataset.color=c;d.style.background=c;d.onclick=()=>{mColor=c;$$('.sw').forEach(x=>x.classList.toggle('on',x.dataset.color===mColor))};swBox.appendChild(d)});
$$('.sw')[0].classList.add('on');

function toMin(t){const[a,b]=t.split(':').map(Number);return a*60+b}
function renderCal(){
  const cal=$('#cal');cal.innerHTML='';
  cal.appendChild(Object.assign(document.createElement('div'),{className:'corner'}));
  const today=(new Date().getDay()+6)%7;
  DAYS.forEach((d,i)=>{const h=document.createElement('div');h.className='day-h'+(i===today?' today':'');h.innerHTML=d+'<small>'+['lunes','martes','miércoles','jueves','viernes'][i]+'</small>';cal.appendChild(h)});
  const times=document.createElement('div');times.className='times';times.style.height=((H1-H0)*HOUR)+'px';
  for(let h=H0;h<H1;h++){const s=document.createElement('span');s.style.top=((h-H0)*HOUR)+'px';s.textContent=String(h).padStart(2,'0')+':00';times.appendChild(s)}
  cal.appendChild(times);
  for(let d=0;d<5;d++){
    const col=document.createElement('div');col.className='day-col';col.style.height=((H1-H0)*HOUR)+'px';
    for(let h=H0;h<H1;h++){const l=document.createElement('div');l.className='hour-line';l.style.top=((h-H0)*HOUR)+'px';col.appendChild(l)}
    data.classes.filter(c=>c.day===d).sort((a,b)=>toMin(a.start)-toMin(b.start)).forEach(c=>{
      const top=Math.max(0,(toMin(c.start)-H0*60))/60*HOUR;
      const hgt=Math.max(24,(toMin(c.end)-toMin(c.start))/60*HOUR);
      const b=document.createElement('div');b.className='blk';b.style.top=top+'px';b.style.height=hgt+'px';
      const colr=/^#[0-9a-fA-F]{6}$/.test(c.color)?c.color:COLORS[0];
      b.style.borderLeftColor=colr;
      const bt=document.createElement('b');bt.style.color=colr;bt.textContent=String(c.name||'').slice(0,60);
      const st=document.createElement('span');st.textContent=c.start+' - '+c.end;
      b.appendChild(bt);b.appendChild(st);
      b.onclick=()=>goNotes(c.name);
      b.appendChild(editBtn(c));col.appendChild(b);
    });
    cal.appendChild(col);
  }
  $('#cal-empty').classList.toggle('hidden',data.classes.length>0);
  $('.cal-wrap').classList.toggle('hidden',data.classes.length===0);
  $('#cal-m').classList.toggle('hidden',data.classes.length===0);
  renderCalM();fillSubjSelects();
}
let mDay=Math.min(4,Math.max(0,(new Date().getDay()+6)%7));
function renderCalM(){
  const w=$('#cal-m');w.innerHTML='';
  const chips=document.createElement('div');chips.className='m-chips';
  const today=(new Date().getDay()+6)%7;
  DAYS.forEach((d,i)=>{const c=document.createElement('button');c.type='button';c.className='m-chip'+(i===mDay?' on':'')+(i===today?' today':'');c.textContent=d;c.onclick=()=>{mDay=i;renderCalM()};chips.appendChild(c)});
  w.appendChild(chips);
  const list=data.classes.filter(c=>c.day===mDay).sort((a,b)=>toMin(a.start)-toMin(b.start));
  if(!list.length){const e=document.createElement('div');e.className='m-empty';e.textContent='Sin clases este día';w.appendChild(e);return}
  list.forEach(c=>{
    const colr=/^#[0-9a-fA-F]{6}$/.test(c.color)?c.color:COLORS[0];
    const b=document.createElement('div');b.className='m-cls';b.style.borderLeftColor=colr;
    const t=document.createElement('b');t.textContent=String(c.name||'').slice(0,60);t.style.color=colr;
    const s=document.createElement('span');s.textContent=c.start+' - '+c.end;
    b.appendChild(t);b.appendChild(s);b.onclick=()=>goNotes(c.name);b.appendChild(editBtn(c));w.appendChild(b);
  });
}
function editBtn(c){
  const eb=document.createElement('button');eb.type='button';eb.className='blk-edit';eb.title='Editar clase';eb.setAttribute('aria-label','Editar clase');
  eb.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>';
  eb.onclick=e=>{e.stopPropagation();openModal(c)};
  return eb;
}
function subjectNames(){return [...new Set([...data.classes.map(c=>c.name),...data.notes.map(n=>n.subject).filter(Boolean)])].sort((a,b)=>a.localeCompare(b,'es'))}
function fillSubjSelects(){
  const names=subjectNames();
  const f=$('#note-filter'),s=$('#note-subj');
  const fv=f.value,sv=s.value;
  f.innerHTML='';
  [['','Todas las asignaturas'],['__none__','Sin asignatura'],...names.map(n=>[n,n])].forEach(([v,l])=>{const o=document.createElement('option');o.value=v;o.textContent=l;f.appendChild(o)});
  f.value=(fv==='__none__'||names.includes(fv))?fv:'';
  s.innerHTML='';
  [['','Sin asignatura'],...names.map(n=>[n,n])].forEach(([v,l])=>{const o=document.createElement('option');o.value=v;o.textContent=l;s.appendChild(o)});
  s.value=names.includes(sv)?sv:'';
}
function goNotes(subj){
  fillSubjSelects();
  $('#note-filter').value=subjectNames().includes(subj)?subj:'';
  $('#notes').classList.add('m-show-list');
  switchView('apuntes');
}
function openModal(c){
  editId=c?c.id:null;
  $('#m-title').textContent=c?'Editar clase':'Nueva clase';
  $('#m-name').value=c?c.name:'';
  $('#m-day').value=c?c.day:'0';
  $('#m-start').value=c?c.start:'09:00';
  $('#m-end').value=c?c.end:'10:00';
  paintDt('m-start',true);paintDt('m-end',true);
  mColor=c?c.color:COLORS[0];
  $$('.sw').forEach(x=>x.classList.toggle('on',x.dataset.color===mColor));
  $('#m-del').classList.toggle('hidden',!c);
  $('#m-err').textContent='';
  $('#overlay').classList.remove('hidden');
}
$('#btn-add-class').onclick=()=>openModal(null);
$('#m-cancel').onclick=()=>$('#overlay').classList.add('hidden');
$('#overlay').onclick=e=>{if(e.target.id==='overlay')$('#overlay').classList.add('hidden')};
$('#m-del').onclick=async()=>{if(await ask({title:'¿Borrar esta clase?',msg:'Se quita del horario.'})){data.classes=data.classes.filter(c=>c.id!==editId);save();$('#overlay').classList.add('hidden');renderCal()}};
$('#m-save').onclick=()=>{
  const name=$('#m-name').value.trim(),day=+$('#m-day').value,start=$('#m-start').value,end=$('#m-end').value;
  if(!name){$('#m-err').textContent='Ponle un nombre';return}
  if(!start||!end||toMin(start)>=toMin(end)){$('#m-err').textContent='La hora de fin tiene que ser después de la de inicio';return}
  if(editId){const c=data.classes.find(x=>x.id===editId);Object.assign(c,{name,day,start,end,color:mColor})}
  else data.classes.push({id:Date.now(),name,day,start,end,color:mColor});
  save();$('#overlay').classList.add('hidden');renderCal();
};
$('#btn-sample-cal').onclick=()=>{seedCal()};

function seedCal(){
  data.classes=[
    {id:1,name:'Matemáticas',day:0,start:'09:00',end:'10:30',color:COLORS[1]},
    {id:2,name:'Programación',day:0,start:'11:00',end:'13:00',color:COLORS[0]},
    {id:3,name:'Inglés',day:1,start:'10:00',end:'11:30',color:COLORS[3]},
    {id:4,name:'Redes',day:2,start:'09:00',end:'11:00',color:COLORS[4]},
    {id:5,name:'Gym',day:3,start:'16:00',end:'17:30',color:COLORS[2]},
    {id:6,name:'Proyecto',day:4,start:'09:30',end:'11:00',color:COLORS[0]},
  ];save();renderCal();
}

/* ---------- apuntes ---------- */
let curNote=null, saveT=null;
function renderNotes(){
  const q=($('#note-search').value||'').toLowerCase();
  const f=$('#note-filter').value;
  const list=data.notes.filter(n=>{
    const subj=n.subject||null;
    if(f==='__none__'&&subj!==null)return false;
    if(f&&f!=='__none__'&&subj!==f)return false;
    return !q||n.title.toLowerCase().includes(q)||n.body.toLowerCase().includes(q);
  }).sort((a,b)=>b.updated-a.updated);
  const box=$('#note-items');box.innerHTML='';
  list.forEach(n=>{
    const d=document.createElement('div');d.className='note-item'+(curNote===n.id?' on':'');
    const t=document.createElement('b');t.textContent=n.title||'Sin título';d.appendChild(t);
    const subj=n.subject||null;
    if(subj){
      const g=document.createElement('small');g.className='subj-tag';
      const cls=data.classes.find(c=>c.name===subj);
      g.style.color=cls&&/^#[0-9a-fA-F]{6}$/.test(cls.color)?cls.color:'var(--acc)';
      g.textContent=subj;d.appendChild(g);
    }
    const dt=new Date(n.updated);
    const s=document.createElement('small');s.textContent=dt.toLocaleDateString('es-ES',{day:'numeric',month:'short'})+' '+dt.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});d.appendChild(s);
    d.onclick=()=>openNote(n.id);box.appendChild(d);
  });
  $('#notes-empty').classList.toggle('hidden',data.notes.length>0);
  $('#notes').classList.toggle('hidden',data.notes.length===0&&false);
}
function openNote(id){
  const n=data.notes.find(x=>x.id===id);if(!n)return;
  curNote=id;$('#note-title').value=n.title;$('#note-body').value=n.body;
  fillSubjSelects();$('#note-subj').value=n.subject||'';
  $('#notes').classList.remove('m-show-list');renderNotes();
}
$('#btn-back-notes').onclick=()=>$('#notes').classList.add('m-show-list');
$('#note-search').oninput=renderNotes;
$('#note-filter').onchange=renderNotes;
$('#note-subj').onchange=()=>{
  if(curNote==null)return;
  const n=data.notes.find(x=>x.id===curNote);if(!n)return;
  n.subject=$('#note-subj').value||null;n.updated=Date.now();
  save();renderNotes();
};
$('#btn-new-note').onclick=()=>{
  const f=$('#note-filter').value;
  const n={id:Date.now(),title:'',body:'',subject:(f&&f!=='__none__')?f:null,updated:Date.now()};
  data.notes.push(n);save();openNote(n.id);$('#note-title').focus();
};
$('#btn-del-note').onclick=async()=>{
  if(curNote==null)return;
  if(!await ask({title:'¿Borrar este apunte?',msg:'No se puede deshacer.'}))return;
  data.notes=data.notes.filter(n=>n.id!==curNote);curNote=null;
  $('#note-title').value='';$('#note-body').value='';
  $('#notes').classList.add('m-show-list');save();renderNotes();
};
function noteChanged(){
  if(curNote==null)return;
  const n=data.notes.find(x=>x.id===curNote);if(!n)return;
  n.title=$('#note-title').value;n.body=$('#note-body').value;n.updated=Date.now();
  $('#note-saved').classList.add('hidden');
  clearTimeout(saveT);saveT=setTimeout(()=>{save();renderNotes();$('#note-saved').classList.remove('hidden');setTimeout(()=>$('#note-saved').classList.add('hidden'),1500)},600);
}
$('#note-title').oninput=noteChanged;$('#note-body').oninput=noteChanged;
$('#btn-sample-notes').onclick=()=>{seedNotes()};
function seedNotes(){
  data.notes.push(
    {id:Date.now(),title:'Ideas proyecto',body:'- App de horarios con IA\n- Empezar por horario + apuntes + pomodoro\n- La IA que ordene la semana va en fase 2',subject:'Proyecto',updated:Date.now()},
    {id:Date.now()+1,title:'Chuleta pomodoro',body:'25 min enfoque + 5 descanso.\nA la cuarta ronda, descanso largo de 15.\nSin móvil durante el enfoque.',subject:null,updated:Date.now()}
  );save();renderNotes();
}

/* ---------- entregas ---------- */
function fmtLeft(ms){
  if(ms<0){const d=Math.floor(-ms/86400000);return d>0?'vencida hace '+d+'d':'vencida hoy'}
  const d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000);
  if(d>0)return 'quedan '+d+'d '+h+'h';
  if(h>0)return 'quedan '+h+'h '+m+'m';
  return 'quedan '+m+'m';
}
function renderDeadlines(){
  const box=$('#dl-list');box.innerHTML='';
  const now=Date.now();
  const list=[...data.deadlines].sort((a,b)=>new Date(a.due)-new Date(b.due));
  list.forEach(d=>{
    const due=new Date(d.due).getTime(),left=due-now;
    const row=document.createElement('div');row.className='dl-item'+(d.done?' done':'');
    const soon=!d.done&&left>0&&left<86400000, late=!d.done&&left<0;
    const ok=document.createElement('button');ok.className='dl-ok';ok.textContent=d.done?'✓':'';
    const grow=document.createElement('div');grow.className='grow';
    const bn=document.createElement('b');bn.textContent=String(d.name||'').slice(0,80);
    const when=document.createElement('span');when.className='dl-when';
    const dDate=new Date(d.due);
    let wtxt=isNaN(dDate.getTime())?'sin fecha':dDate.toLocaleString('es-ES',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
    const rem=Number(d.remind);
    if(Number.isFinite(rem)&&rem>0)wtxt+=' · aviso '+fmtRem(rem)+' antes';
    when.textContent=wtxt;
    grow.appendChild(bn);grow.appendChild(when);
    const lf=document.createElement('span');lf.className='dl-left'+(soon?' soon':'')+(late?' late':'');lf.textContent=d.done?'hecha':fmtLeft(left);
    const x=document.createElement('button');x.className='dl-x';x.textContent='✕';
    row.appendChild(ok);row.appendChild(grow);row.appendChild(lf);row.appendChild(x);
    ok.onclick=()=>{d.done=!d.done;save();renderDeadlines()};
    x.onclick=async()=>{if(await ask({title:'¿Borrar esta entrega?',msg:String(d.name||'').slice(0,80)})){data.deadlines=data.deadlines.filter(y=>y.id!==d.id);save();renderDeadlines()}};
    box.appendChild(row);
  });
  $('#dl-empty').classList.toggle('hidden',data.deadlines.length>0);
}
$('#btn-add-dl').onclick=()=>{
  $('#dl-name').value='';$('#dl-due').value='';$('#dl-err').textContent='';
  paintDt('dl-due',false);
  const def=data.settings.remindDef;
  if(def==null)$('#dl-rem').value='';
  else if([10,60,1440].includes(def))$('#dl-rem').value=String(def);
  else{$('#dl-rem').value='custom';$('#dl-rem-custom').value=def}
  $('#dl-rem-custom').classList.toggle('hidden',$('#dl-rem').value!=='custom');
  $('#overlay-dl').classList.remove('hidden');
};
$('#dl-rem').onchange=()=>$('#dl-rem-custom').classList.toggle('hidden',$('#dl-rem').value!=='custom');
$('#dl-cancel').onclick=()=>$('#overlay-dl').classList.add('hidden');
$('#overlay-dl').onclick=e=>{if(e.target.id==='overlay-dl')$('#overlay-dl').classList.add('hidden')};
$('#dl-save').onclick=()=>{
  const name=$('#dl-name').value.trim(),due=$('#dl-due').value;
  if(!name){$('#dl-err').textContent='Ponle un nombre';return}
  if(!due){$('#dl-err').textContent='Ponle fecha y hora';return}
  let rem=$('#dl-rem').value;
  if(rem==='custom'){
    rem=parseInt($('#dl-rem-custom').value,10);
    if(!rem||rem<1){$('#dl-err').textContent='Pon los minutos del aviso personalizado';return}
  }else rem=rem===''?null:parseInt(rem,10);
  data.deadlines.push({id:Date.now(),name,due,done:false,remind:rem});
  data.settings.remindDef=rem;
  save();$('#overlay-dl').classList.add('hidden');renderDeadlines();checkReminders();
};
$('#btn-sample-dl').onclick=()=>{seedDl()};
function seedDl(){
  const day=86400000,now=Date.now();
  data.deadlines.push(
    {id:now+1,name:'Práctica 2 de redes',due:new Date(now+2*day).toISOString().slice(0,16),done:false,remind:1440},
    {id:now+2,name:'Examen de mates',due:new Date(now+5*day).toISOString().slice(0,16),done:false,remind:60}
  );save();renderDeadlines();
}
setInterval(()=>{if(!me)return;if(!$('#view-entregas').classList.contains('hidden'))renderDeadlines();checkReminders()},60000);

/* ---------- cuenta ---------- */
$('#u-av').onclick=()=>{$('#acc-err').textContent='';updateNtfBtn();$('#overlay-acc').classList.remove('hidden')};
$('#acc-close').onclick=()=>$('#overlay-acc').classList.add('hidden');
$('#overlay-acc').onclick=e=>{if(e.target.id==='overlay-acc')$('#overlay-acc').classList.add('hidden')};
function sanitizeImport(d){
  if(!d||typeof d!=='object'||!Array.isArray(d.classes)||!Array.isArray(d.notes))throw 0;
  const out=blankData();
  const isTime=s=>typeof s==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(s);
  const isHex=s=>typeof s==='string'&&/^#[0-9a-fA-F]{6}$/.test(s);
  const isDue=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d/.test(s);
  const num=(v,def,min,max)=>{v=Number(v);return Number.isFinite(v)?Math.max(min,Math.min(max,Math.round(v))):def};
  const arr=a=>Array.isArray(a)?a:[];
  out.classes=arr(d.classes).slice(0,200).map(c=>c&&typeof c==='object'?c:{}).map(c=>({
    id:num(c.id,Date.now(),1,9e15),name:String(c.name||'').slice(0,40)||'Clase',
    day:num(c.day,0,0,4),start:isTime(c.start)?c.start:'09:00',end:isTime(c.end)?c.end:'10:00',
    color:isHex(c.color)?c.color:COLORS[0]
  })).filter(c=>toMin(c.start)<toMin(c.end));
  out.deadlines=arr(d.deadlines).slice(0,300).map(x=>x&&typeof x==='object'?x:{}).map(x=>({
    id:num(x.id,Date.now(),1,9e15),name:String(x.name||'').slice(0,60)||'Entrega',
    due:isDue(x.due)?x.due.slice(0,16):new Date().toISOString().slice(0,16),
    done:!!x.done,remind:Number.isFinite(Number(x.remind))&&Number(x.remind)>0?Math.min(43200,Math.round(Number(x.remind))):null,
    notified:!!x.notified
  }));
  out.notes=arr(d.notes).slice(0,500).map(n=>n&&typeof n==='object'?n:{}).map(n=>({
    id:num(n.id,Date.now(),1,9e15),title:String(n.title||'').slice(0,80),
    body:String(n.body||'').slice(0,50000),updated:num(n.updated,Date.now(),0,9e15),
    subject:typeof n.subject==='string'&&n.subject.trim()?n.subject.trim().slice(0,40):null
  }));
  if(d.settings&&typeof d.settings==='object'){
    out.settings.focus=num(d.settings.focus,25,1,180);
    out.settings.short=num(d.settings.short,5,1,60);
    out.settings.long=num(d.settings.long,15,1,90);
    out.settings.remindDef=Number.isFinite(Number(d.settings.remindDef))&&Number(d.settings.remindDef)>0?Math.min(43200,Math.round(Number(d.settings.remindDef))):null;
  }
  if(d.pomos&&typeof d.pomos==='object'){
    out.pomos.total=num(d.pomos.total,0,0,1e7);
    out.pomos.totalMin=num(d.pomos.totalMin,0,0,1e9);
    ['days','mins'].forEach(k=>{if(d.pomos[k]&&typeof d.pomos[k]==='object')Object.keys(d.pomos[k]).slice(0,400).forEach(day=>{if(/^\d{4}-\d{2}-\d{2}$/.test(day))out.pomos[k][day]=num(d.pomos[k][day],0,0,1440)})});
  }
  return out;
}
$('#acc-export').onclick=()=>{
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='studyflow-'+me+'.json';a.click();URL.revokeObjectURL(a.href);
};
$('#acc-import').onclick=()=>$('#acc-file').click();
$('#acc-file').onchange=e=>{
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{try{
    data=sanitizeImport(JSON.parse(r.result));
    save();syncSettingsUI();renderAll();$('#overlay-acc').classList.add('hidden');
  }catch(x){$('#acc-err').textContent='Ese archivo no vale. Tiene que ser un JSON exportado desde StudyFlow.'}};
  r.readAsText(f);e.target.value='';
};
$('#acc-wipe').onclick=async()=>{
  if(!await ask({title:'¿Borrar todos tus datos?',msg:'Se borran tu horario, entregas, apuntes y estadísticas de este navegador.',yes:'Borrar todo'}))return;
  data=blankData();save();syncSettingsUI();renderAll();$('#overlay-acc').classList.add('hidden');
};

/* ---------- pomodoro ---------- */
const P={mode:'focus',left:25*60,total:25*60,running:false,int:null};
function durFor(m){return (data.settings[m]||25)*60}
function syncSettingsUI(){$('#d-focus').value=data.settings.focus;$('#d-short').value=data.settings.short;$('#d-long').value=data.settings.long}
function setDur(m,v){
  const lim={focus:180,short:60,long:90}[m];
  v=Math.max(1,Math.min(lim,Math.round(+v)||1));
  data.settings[m]=v;$('#d-'+m).value=v;save();
  if(P.mode===m&&!P.running)setMode(m);
}
$$('.dur .step button').forEach(b=>b.onclick=()=>setDur(b.dataset.m,(parseInt($('#d-'+b.dataset.m).value,10)||0)+(+b.dataset.d)));
['focus','short','long'].forEach(m=>{
  $('#d-'+m).onchange=e=>setDur(m,e.target.value);
});
$$('#modes button').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
function setMode(m){
  stopTimer();P.mode=m;P.left=durFor(m);P.total=P.left;
  $$('#modes button').forEach(x=>x.classList.toggle('on',x.dataset.mode===m));
  renderPomo();
}
function renderPomo(){
  const mm=String(Math.floor(P.left/60)).padStart(2,'0'),ss=String(P.left%60).padStart(2,'0');
  $('#time').textContent=mm+':'+ss;
  const pct=P.total?1-P.left/P.total:0;
  $('#dial').style.background='conic-gradient(var(--acc) '+(pct*360)+'deg, var(--panel2) 0deg)';
  const todayKey=new Date().toISOString().slice(0,10);
  $('#st-today').textContent=data.pomos.days[todayKey]||0;
  $('#st-total').textContent=data.pomos.total;
  $('#st-min-today').textContent=data.pomos.mins[todayKey]||0;
  let wk=0;for(let i=0;i<7;i++){const d=new Date();d.setDate(d.getDate()-i);wk+=data.pomos.mins[d.toISOString().slice(0,10)]||0}
  $('#st-min-week').textContent=wk;
  $('#btn-start').textContent=P.running?'Pausar':'Iniciar';
}
$('#btn-start').onclick=()=>{
  if(P.running){stopTimer();renderPomo();return}
  P.running=true;
  P.int=setInterval(()=>{
    P.left--;renderPomo();
    if(P.left<=0){
      stopTimer();
      if(P.mode==='focus'){
        const k=new Date().toISOString().slice(0,10);
        const mins=Math.round(durFor('focus')/60);
        data.pomos.total++;data.pomos.days[k]=(data.pomos.days[k]||0)+1;
        data.pomos.mins[k]=(data.pomos.mins[k]||0)+mins;data.pomos.totalMin+=mins;
        save();
      }
      beep();renderPomo();
      const t=P.mode==='focus'?'¡Enfoque terminado!':'Descanso terminado',m=P.mode==='focus'?'Toca un descanso.':'¡A por otro!';
      fire(t,m);
      if(!document.hidden)notice(t,m);
      setMode(P.mode==='focus'?'short':'focus');
    }
  },1000);
  renderPomo();
};
function stopTimer(){P.running=false;clearInterval(P.int)}
$('#btn-reset').onclick=()=>setMode(P.mode);
function beep(){try{
  const a=new (window.AudioContext||window.webkitAudioContext)();
  const o=a.createOscillator(),g=a.createGain();
  o.connect(g);g.connect(a.destination);o.frequency.value=880;
  g.gain.setValueAtTime(.25,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+1.2);
  o.start();o.stop(a.currentTime+1.2);
}catch(e){}}

/* ---------- init ---------- */
function renderAll(){fillSubjSelects();renderCal();renderDeadlines();renderNotes();setMode(P.mode);checkReminders()}
const sbS=typeof sbSession==='function'?sbSession():null;
if(sbS&&sbS.user){
  me=sbS.user.id;data=store.data(me)||blankData();normalize();
  showApp(sbS.user.email||'');
  sbLoadData().then(r=>{if(r.ok&&r.payload){data=Object.assign(blankData(),r.payload);normalize();store.saveData(me,data);syncSettingsUI();renderAll()}}).catch(()=>{});
  sbLoadProfile().then(p=>{if(p.ok)isPro=p.pro}).catch(()=>{});
}
if('serviceWorker' in navigator&&location.protocol==='https:'){navigator.serviceWorker.register('sw.js').catch(()=>{})}
