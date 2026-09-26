'use strict';
// Text-only localization: never translate HTML, URLs, record IDs or form values.
const languageKey='sefer.language.v1';
function browserLanguage(){return /^nl(?:-|$)/i.test(navigator.language||navigator.languages?.[0]||'')?'nl':'tr';}
let language=browserLanguage();
try{const saved=localStorage.getItem(languageKey);if(['tr','nl'].includes(saved))language=saved;}catch{}
// nl.js is loaded only when Dutch is needed; Turkish visitors never download it.
let nlDictionary=null,translationPattern=null,dictionaryLoading=null;
function setDictionary(dictionary){
 nlDictionary=dictionary;
 const keys=Object.keys(dictionary).sort((a,b)=>b.length-a.length).map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
 translationPattern=keys.length?new RegExp(keys.join('|'),'g'):null;
}
function loadDictionary(){
 if(nlDictionary)return Promise.resolve(true);
 return dictionaryLoading||=new Promise(resolve=>{
  const script=document.createElement('script');
  script.src='nl.js?v=20260926-4';
  script.onload=()=>{setDictionary(window.SEFER_NL||{});resolve(true);};
  script.onerror=()=>{dictionaryLoading=null;script.remove();resolve(false);};
  document.head.append(script);
 });
}
if(window.SEFER_NL)setDictionary(window.SEFER_NL);
// A fragment only counts as a word when it is not glued to other letters ("Dil" must not match inside "Dilek").
const wordCharacter=/[\p{L}\p{N}]/u;
function wholeWord(match,offset,text){
 return !(wordCharacter.test(match[0])&&wordCharacter.test(text[offset-1]||''))&&!(wordCharacter.test(match[match.length-1])&&wordCharacter.test(text[offset+match.length]||''));
}
function t(text){
 text=String(text??'');
 if(language!=='nl'||!nlDictionary)return text;
 if(Object.hasOwn(nlDictionary,text))return nlDictionary[text];
 text=text.replace(/(\d+)\. şavtı tamamla → (\d+)\. şavta geç/g,'Voltooi ronde $1 → ga naar ronde $2')
 .replace(/Kâbe çevresindeki (\d+)\. tur/g,'Ronde $1 rond de Kaäba')
 .replace(/(\d+)\. şavt(?:ı|a|ta|tı|ın|tır)?(?![\p{L}])/gu,'Ronde $1');
 return translationPattern?text.replace(translationPattern,(match,offset,whole)=>wholeWord(match,offset,whole)?nlDictionary[match]:match):text;
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
const languageObserver=new MutationObserver(records=>{
 // Ignore excluded nodes such as the ritual clock, which updates every second.
 if(localizationQueued||records.every(r=>(r.target.nodeType===1?r.target:r.target.parentElement)?.closest(excludedTranslation)))return;
 localizationQueued=true;
 queueMicrotask(()=>{localizationQueued=false;localizePage();});
});
function setLanguage(next,persist=true){
 if(!['tr','nl'].includes(next))return;
 if(next==='nl'&&!nlDictionary){loadDictionary().then(loaded=>loaded?setLanguage(next,persist):toast(t('Hollandaca dil dosyası yüklenemedi. İnternet bağlantınızı kontrol edip yeniden deneyin.')));return;}
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
