'use strict';
(()=>{
const PUBLISHER='44dc6ef8-9f7c-4c40-a38a-95e66886414b';
const el=id=>document.getElementById(id);
let client=null,uid=null,epoch=0,items=[],seen='',loaded=false,fetching=false;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stamp=n=>n.updated_at||n.created_at;
const storageKey=()=> 'gmGesNewsSeen:'+uid;
const newest=()=>items.reduce((v,n)=>stamp(n)>v?stamp(n):v,seen);
const active=()=>!document.hidden&&el('noticias').classList.contains('active');
function markSeen(){if(!uid||!loaded)return;seen=newest();try{localStorage.setItem(storageKey(),seen)}catch{}render()}
function render(){
 const unread=items.filter(n=>stamp(n)>seen);
 el('newsBadge').textContent=unread.length?String(unread.length):'';
 el('newsBadge').classList.toggle('hide',!unread.length);
 el('newsNotice').classList.toggle('hide',!uid||!unread.length||active());
 el('newsNoticeText').textContent=unread.length+' noticia'+(unread.length===1?' nueva':'s nuevas')+' por leer.';
 el('newsEditor').classList.toggle('hide',uid!==PUBLISHER);
 el('newsList').innerHTML=items.length?items.map(n=>'<article class="card news-item"><div class="subject-head"><h2>'+esc(n.title)+'</h2>'+(stamp(n)>seen?'<span class="pill">Nueva</span>':'')+'</div><p class="muted"><time>'+esc(new Date(n.created_at).toLocaleString('es-ES',{timeZone:'Europe/Madrid',dateStyle:'medium',timeStyle:'short'}))+'</time>'+ (n.updated_at!==n.created_at?' · Actualizada':'')+'</p><p class="news-body">'+esc(n.body)+'</p>'+(uid===PUBLISHER?'<div class="controls"><button class="btn" data-news-edit="'+n.id+'">Editar</button><button class="btn danger" data-news-delete="'+n.id+'">Eliminar</button></div>':'')+'</article>').join(''):'<p class="muted">'+(loaded?'Todavía no hay noticias publicadas.':'Cargando noticias…')+'</p>';
 el('newsList').querySelectorAll('[data-news-edit]').forEach(b=>b.onclick=()=>{const n=items.find(x=>x.id===b.dataset.newsEdit);el('newsId').value=n.id;el('newsTitle').value=n.title;el('newsBody').value=n.body;el('newsPublish').textContent='Guardar cambios';el('newsCancel').classList.remove('hide');el('newsTitle').focus()});
 el('newsList').querySelectorAll('[data-news-delete]').forEach(b=>b.onclick=async()=>{if(uid!==PUBLISHER||!confirm('¿Eliminar esta noticia para todos?'))return;const expected=epoch;b.disabled=true;try{const {data,error}=await client.from('gm_ges_news').delete().eq('id',b.dataset.newsDelete).select('id');if(error)throw error;if(!data?.length)throw Error();if(expected!==epoch)return;resetForm();await refresh();el('newsStatus').textContent='Noticia eliminada.'}catch{if(expected===epoch)el('newsStatus').textContent='No se pudo eliminar la noticia. Inténtalo de nuevo.'}finally{b.disabled=false}});
}
function resetForm(){el('newsForm').reset();el('newsId').value='';el('newsPublish').textContent='Publicar noticia';el('newsCancel').classList.add('hide')}
async function refresh(){
 if(!client||!uid||fetching)return;fetching=true;const expected=epoch,previous=new Map(items.map(n=>[n.id,stamp(n)])),wasLoaded=loaded;
 try{
 const {data,error}=await client.from('gm_ges_news').select('id,title,body,created_at,updated_at').order('created_at',{ascending:false});
 if(expected!==epoch)return;if(error)throw error;
 items=data||[];loaded=true;
 const fresh=items.filter(n=>stamp(n)>seen&&(!previous.has(n.id)||previous.get(n.id)!==stamp(n)));
 if(active())markSeen();else render();
 el('newsLoadStatus').textContent='Noticias actualizadas automáticamente.';
 if(wasLoaded&&fresh.length&&uid!==PUBLISHER&&!active()&&typeof alerts!=='undefined'&&alerts.enabled&&'Notification' in window&&Notification.permission==='granted'){
  try{await showAlert(fresh.length===1?'Nueva noticia: '+fresh[0].title:fresh.length+' noticias nuevas','Abre el apartado Noticias para leer los avisos.','gmges-news')}catch{}
 }
 }catch{if(expected===epoch)el('newsLoadStatus').textContent='No se pudieron actualizar las noticias. Pulsa Actualizar o espera a recuperar la conexión.'}
 finally{if(expected===epoch)fetching=false}
}
function setSession(c,id){epoch++;client=c;uid=id;items=[];loaded=false;fetching=false;seen='';el('newsPublish').disabled=false;el('newsStatus').textContent='';if(uid)try{seen=localStorage.getItem(storageKey())||''}catch{}resetForm();render();if(uid)refresh()}
el('newsForm').onsubmit=async e=>{
 e.preventDefault();if(uid!==PUBLISHER)return;
 const title=el('newsTitle').value.trim(),body=el('newsBody').value.trim(),id=el('newsId').value,expected=epoch;
 if(!title||!body){el('newsStatus').textContent='Escribe un título y el texto de la noticia.';return}
 el('newsPublish').disabled=true;el('newsStatus').textContent='Publicando…';
 try{
 const query=id?client.from('gm_ges_news').update({title,body,updated_at:new Date().toISOString()}).eq('id',id):client.from('gm_ges_news').insert({title,body});
 const {data,error}=await query.select('id');if(error)throw error;if(!data?.length)throw Error();if(expected!==epoch)return;
 resetForm();await refresh();el('newsStatus').textContent=id?'Noticia actualizada para todos.':'Noticia publicada para todos.';
 }catch{if(expected===epoch)el('newsStatus').textContent='No se pudo publicar. Comprueba tu conexión y que has entrado con la cuenta autorizada.'}
 finally{if(expected===epoch)el('newsPublish').disabled=false}
};
el('newsCancel').onclick=resetForm;
el('newsRefresh').onclick=refresh;
el('newsReadAll').onclick=markSeen;
el('newsOpen').onclick=()=>{switchTab('noticias');markSeen()};
document.querySelector('[data-tab="noticias"]').addEventListener('click',()=>{markSeen();refresh()});
el('newsEnableAlerts').onclick=async()=>{
 const note=el('newsLoadStatus');
 if(!('Notification' in window)||!('serviceWorker' in navigator)){note.textContent='Este navegador no admite avisos. Las noticias nuevas se indican dentro de la web.';return}
 try{const permission=await Notification.requestPermission();if(permission==='granted'){alerts.enabled=true;saveAlerts();renderAlerts();note.textContent='Avisos activados en este dispositivo. Requieren mantener la web abierta.'}else note.textContent='No se han permitido los avisos. Seguirás viendo las noticias nuevas dentro de la web.'}catch{note.textContent='No se pudieron activar los avisos del navegador.'}
};
window.gmGesNews={setSession};
if(window.gmGesAuthClient&&window.gmGesUserId)setSession(window.gmGesAuthClient,window.gmGesUserId);else render();
setInterval(()=>{if(!document.hidden)refresh()},60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
window.addEventListener('online',refresh);
})();