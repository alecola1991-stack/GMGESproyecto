'use strict';
(()=>{
const slugs={inicio:'inicio',resumen:'asistencia',horario:'horario',calendario:'calendario',faltas:'faltas',clasevirtual:'aula',noticias:'noticias',ajustes:'ajustes',mas:'mas'};
const panels=Object.fromEntries(Object.entries(slugs).map(([id,slug])=>[slug,id]));
const base=new URL(window.gmGesAppRoot||document.baseURI).pathname;
let desired=panels[window.gmGesInitialRoute]||'inicio',applying=false;
const original=switchTab;
function remember(id){try{sessionStorage.setItem('gmGesRoute',slugs[id])}catch{}}
function show(id,push){if(!slugs[id])return;desired=id;remember(id);original(id);document.title=(id==='inicio'?'Inicio':document.querySelector('.tab[data-tab="'+id+'"]')?.textContent.trim()||'GM GES')+' · GM GES';if(push){const target=base+slugs[id]+'/';if(location.pathname!==target)history.pushState({section:id},'',target+location.search+location.hash)}}
switchTab=function(id){if(applying){original(id);return}show(id,true)};
window.addEventListener('popstate',()=>{const slug=location.pathname.slice(base.length).replace(/^\/+|\/+$/g,'');show(panels[slug]||'inicio',false)});
const observer=new MutationObserver(()=>{if(!document.body.classList.contains('auth-locked')){applying=true;show(desired,false);applying=false}});observer.observe(document.body,{attributes:true,attributeFilter:['class']});
show(desired,false);
})();
