(()=>{
'use strict';
const videos=Array.from(document.querySelectorAll('video[data-stream]'));
const dialog=document.createElement('dialog');
dialog.className='event-video-dialog';
dialog.setAttribute('aria-labelledby','video-dialog-title');
dialog.innerHTML='<div class="event-video-dialog-header"><h2 id="video-dialog-title"></h2><button type="button" class="event-video-close" aria-label="動画を閉じる">×</button></div><div class="event-video-dialog-content"></div>';
document.body.appendChild(dialog);
const dialogContent=dialog.querySelector('.event-video-dialog-content');
let restore=null;
dialog.querySelector('.event-video-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{if(restore){restore();restore=null;}document.body.classList.remove('event-video-modal-open');});
videos.forEach(video=>{
 const section=video.closest('.event-interview');
 const button=section.querySelector('.event-video-start'),status=section.querySelector('.event-video-status');
 const label=button.textContent;
 const isModal=!!video.closest('.event-video-grid');
 const frame=video.closest('.event-video-frame');
 if(isModal){
  video.removeAttribute('controls');
  button.setAttribute('aria-haspopup','dialog');
  frame.classList.add('event-video-thumbnail');
  frame.addEventListener('click',event=>{if(!dialog.open&&event.target!==button)button.click();});
 }
 function openModal(){
  if(!isModal||dialog.open)return;
  const marker=document.createElement('div');
  marker.className='event-video-placeholder';
  const poster=document.createElement('img');poster.src=video.poster;poster.alt='';marker.appendChild(poster);
  frame.before(marker);
  const statusMarker=document.createComment('video-status');status.before(statusMarker);
  dialog.querySelector('h2').textContent=section.querySelector('.event-video-heading').textContent;
  dialogContent.append(frame,status);
  video.controls=true;
  restore=()=>{video.pause();marker.replaceWith(frame);statusMarker.replaceWith(status);video.controls=false;starting=false;button.disabled=false;button.hidden=false;button.textContent=label;button.focus();};
  document.body.classList.add('event-video-modal-open');
  dialog.showModal();
  dialog.querySelector('.event-video-close').focus();
 }
 let player=null,starting=false,loaded=false;
 function failure(){starting=false;loaded=false;button.disabled=false;button.hidden=false;button.textContent='もう一度再生';status.hidden=false;status.textContent='動画を読み込めませんでした。通信状態を確認して、もう一度再生してください。';if(player){player.destroy();player=null;}}
 function play(){if(isModal&&!dialog.open)return;video.play().catch(()=>{starting=false;button.disabled=false;button.hidden=false;button.textContent=label;});}
 button.addEventListener('click',()=>{
  if(starting)return;
  openModal();
  starting=true;status.hidden=true;button.disabled=true;button.textContent='読み込み中…';
  if(loaded){play();return;}
  const source=video.dataset.stream;
  if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=source;loaded=true;play();}
  else if(window.Hls&&Hls.isSupported()){
   if(player)player.destroy();
   player=new Hls({maxBufferLength:30,backBufferLength:30});
   player.on(Hls.Events.MANIFEST_PARSED,()=>{loaded=true;play();});
   player.on(Hls.Events.ERROR,(_,data)=>{if(data.fatal)failure();});
   player.loadSource(source);player.attachMedia(video);
  }else{failure();status.textContent='このブラウザーでは動画を再生できません。Safari、Chrome、Edgeなどでお試しください。';}
 });
 video.addEventListener('play',()=>{videos.forEach(other=>{if(other!==video)other.pause();});});
 video.addEventListener('playing',()=>{starting=false;button.disabled=false;button.hidden=true;status.hidden=true;});
 video.addEventListener('error',failure);
});
})();
