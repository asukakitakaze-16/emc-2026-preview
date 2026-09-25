(()=>{
'use strict';
const videos=Array.from(document.querySelectorAll('video[data-stream]'));
videos.forEach(video=>{
 const section=video.closest('.event-interview');
 const button=section.querySelector('.event-video-start'),status=section.querySelector('.event-video-status');
 const label=button.textContent;
 let player=null,starting=false,loaded=false;
 function failure(){starting=false;loaded=false;button.disabled=false;button.hidden=false;button.textContent='もう一度再生';status.hidden=false;status.textContent='動画を読み込めませんでした。通信状態を確認して、もう一度再生してください。';if(player){player.destroy();player=null;}}
 function play(){video.play().catch(()=>{starting=false;button.disabled=false;button.hidden=false;button.textContent=label;});}
 button.addEventListener('click',()=>{
  if(starting)return;
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
