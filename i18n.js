'use strict';
// Text-only localization: never translate HTML, URLs, record IDs or form values.
const languageKey='sefer.language.v1';
function browserLanguage(){return /^nl(?:-|$)/i.test(navigator.language||navigator.languages?.[0]||'')?'nl':'tr';}
let language=browserLanguage();
try{const saved=localStorage.getItem(languageKey);if(['tr','nl'].includes(saved))language=saved;}catch{}
const nlDictionary=window.SEFER_NL||{};
const translationPattern=new RegExp(Object.keys(nlDictionary).sort((a,b)=>b.length-a.length).map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
function t(text){
 text=String(text??'');
 if(language!=='nl')return text;
 if(Object.hasOwn(nlDictionary,text))return nlDictionary[text];
 text=text.replace(/(\d+)\. şavtı tamamla → (\d+)\. şavta geç/g,'Voltooi ronde $1 → ga naar ronde $2')
 .replace(/Kâbe çevresindeki (\d+)\. tur/g,'Ronde $1 rond de Kaäba')
 .replace(/(\d+)\. şavt/g,'Ronde $1');
 return text.replace(translationPattern,match=>nlDictionary[match]);
}
function uiLocale(){return language==='nl'?'nl-NL':'tr-TR';}
const localizedNodes=new WeakMap(),localizedAttributes=new WeakMap();
const excludedTranslation='script,style,textarea,[data-no-translate],[lang="ar"],[data-prayer-panel="transliteration"] .prayer-turkish-text,.leaflet-control-attribution';
function localizePage(){
 languageObserver.disconnect();
 try{
 document.documentElement.lang=language;
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 let node;
 while((node=walker.nextNode())){
  if(!node.textContent.trim()||node.parentElement?.closest(excludedTranslation))continue;
  const previous=localizedNodes.get(node),source=previous&&node.textContent===previous.output?previous.source:node.textContent;
  const output=t(source);if(output!==node.textContent)node.textContent=output;
  localizedNodes.set(node,{source,output});
 }
 for(const el of document.querySelectorAll('[aria-label],[placeholder],[title],[alt]')){
  if(el.closest(excludedTranslation))continue;
  const saved=localizedAttributes.get(el)||{};
  for(const attr of ['aria-label','placeholder','title','alt']){
   if(!el.hasAttribute(attr))continue;
   const current=el.getAttribute(attr),prev=saved[attr],source=prev&&prev.output===current?prev.source:current,output=t(source);
   if(current!==output)el.setAttribute(attr,output);saved[attr]={source,output};
  }
  localizedAttributes.set(el,saved);
 }
 document.querySelectorAll('[data-prayer-panel="meaning"] .prayer-turkish-text').forEach(el=>el.lang=language);
 document.querySelectorAll('[data-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===language)));
 }finally{languageObserver.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label','placeholder','title','alt']});}
}
let localizationQueued=false;
const languageObserver=new MutationObserver(()=>{
 if(localizationQueued)return;localizationQueued=true;
 queueMicrotask(()=>{localizationQueued=false;localizePage();});
});
function setLanguage(next,persist=true){
 if(!['tr','nl'].includes(next))return;
 language=next;
 let saveFailed=false;
 if(persist)try{localStorage.setItem(languageKey,next);}catch{saveFailed=true;}
 // Render changes labels and dates only; saved records and their identifiers are untouched.
 const scroll=window.scrollY;
 const search=document.querySelector('#prayer-search')?.value,category=document.querySelector('#prayer-category')?.value;
 const openPrayers=[...document.querySelectorAll('.prayer-entry[open]')].map(el=>el.id);
 render();
 if(search!==undefined){document.querySelector('#prayer-search').value=search;if(category)document.querySelector('#prayer-category').value=category;filterPrayerLibrary();}
 openPrayers.forEach(id=>{const el=document.getElementById(id);if(el)el.open=true;});
 localizePage();window.scrollTo(0,scroll);
 if(saveFailed)toast(t('Dil tercihi kaydedilemedi; bu sayfada seçtiğiniz dil kullanılacak.'));
}
document.addEventListener('click',event=>{const button=event.target.closest('[data-language]');if(button)setLanguage(button.dataset.language);});
window.addEventListener('storage',event=>{if(event.key===languageKey||event.key===null)setLanguage(['tr','nl'].includes(event.newValue)?event.newValue:browserLanguage(),false);});
