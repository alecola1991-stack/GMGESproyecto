'use strict';
(()=>{
const slugs={inicio:'inicio',resumen:'asistencia',horario:'horario',calendario:'calendario',faltas:'faltas',clasevirtual:'aula',noticias:'noticias',ajustes:'ajustes',mas:'mas'};
const panels=Object.fromEntries(Object.entries(slugs).map(([id,slug])=>[slug,id]));
const courses={'tecnica-contable':'tc',cea:'cea',oac:'oac',ingles:'eng'},names={tc:'Técnica Contable',cea:'Comunicación Empresarial',oac:'Operaciones de Compraventa',eng:'Inglés Profesional'};
const base=new URL(window.gmGesAppRoot||document.baseURI).pathname;
let desired=window.gmGesInitialRoute||'inicio',applying=false,displayed=null;
const original=switchTab;
function write(slug,push){try{sessionStorage.setItem('gmGesRoute',slug)}catch{}const target=base+slug+'/';if(push&&location.pathname!==target)history.pushState({route:slug},'',target+location.search+location.hash)}
function routeForCourse(id){return 'aula/'+Object.keys(courses).find(k=>courses[k]===id)}
function courseOpened(id){displayed=id;if(applying)return;desired=routeForCourse(id);original('clasevirtual');document.title=names[id]+' · Aula · GM GES';write(desired,true)}
if(window.gmGesClass){const api=window.gmGesClass,oldOpen=api.open,oldCatalog=api.showCatalog,oldUser=api.setUser;api.open=function(){oldOpen();courseOpened('tc')};api.showCatalog=function(){oldCatalog();displayed=null;if(!applying)show('aula',true)};api.setUser=function(id){displayed=null;oldUser(id)}}
if(window.gmGesExtraClasses){const api=window.gmGesExtraClasses,old=api.open;api.open=function(id){old(id);if(Object.values(courses).includes(id))courseOpened(id)}}
const root=document.getElementById('virtualClassRoot');root.addEventListener('click',e=>{if(e.target.closest('#vcEnter'))courseOpened('tc');if(e.target.closest('#vcBack')){displayed=null;show('aula',true)}});
function show(slug,push){const parts=slug.split('/'),course=parts[0]==='aula'?courses[parts[1]]:null,id=parts[0]==='aula'?'clasevirtual':panels[slug];if(!id)return;desired=course?routeForCourse(course):slugs[id];original(id);applying=true;try{if(id==='clasevirtual'&&!document.body.classList.contains('auth-locked')){if(course&&displayed!==course){if(course==='tc')window.gmGesClass.open();else window.gmGesExtraClasses.open(course)}else if(!course&&displayed){window.gmGesClass.showCatalog();displayed=null}}}finally{applying=false}document.title=(course?names[course]:id==='inicio'?'Inicio':document.querySelector('.tab[data-tab="'+id+'"]')?.textContent.trim()||'GM GES')+' · GM GES';write(desired,push)}
switchTab=function(id){if(slugs[id])show(slugs[id],true)};
window.addEventListener('popstate',()=>{const slug=location.pathname.slice(base.length).replace(/^\/+|\/+$/g,'');show(slug||'inicio',false)});
new MutationObserver(()=>{if(!document.body.classList.contains('auth-locked'))show(desired,false);else displayed=null}).observe(document.body,{attributes:true,attributeFilter:['class']});
show(desired,false);
})();
