(() => {
  const $=s=>document.querySelector(s), board=$('#board');
  let state, sound=false, audio, history=[];
  const format=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  function beep(ok=true){if(!sound)return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=ok?620:220;g.gain.setValueAtTime(.04,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.12);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.12)}catch{}}
  function init(diff=state?.difficulty||'medium'){
    const pack=SudokuEngine.generate(diff);
    state={difficulty:diff,puzzle:pack.given,solution:pack.solution,values:pack.given.slice(),notes:Array.from({length:81},()=>[]),selected:null,mistakes:0,hints:3,seconds:0,started:false,paused:false,complete:false,noteMode:false};history=[];$('#modalBackdrop').hidden=true;render();
  }
  function editable(){return !state.paused&&!state.complete&&state.selected!==null&&!state.puzzle[state.selected]}
  function remember(){history.push({values:state.values.slice(),notes:state.notes.map(a=>a.slice())});if(history.length>100)history.shift()}
  function render(){
    board.innerHTML='';board.inert=state.paused;
    state.values.forEach((value,i)=>{
      const el=document.createElement('button'),r=Math.floor(i/9),c=i%9,s=state.selected;
      el.className='cell '+(state.puzzle[i]?'given':'entry');el.dataset.index=i;el.setAttribute('role','gridcell');el.setAttribute('aria-selected',String(i===s));el.tabIndex=(s===null?i===0:i===s)?0:-1;
      el.setAttribute('aria-label',`${r+1}行${c+1}列${value||'空'}${state.puzzle[i]?'，题目数字':''}`);
      if(value)el.textContent=value;else if(state.notes[i].length){const notes=document.createElement('span');notes.className='notes';for(let n=1;n<=9;n++){const mark=document.createElement('span');mark.textContent=state.notes[i].includes(n)?n:'';notes.append(mark)}el.append(notes)}
      if(s!==null){const sr=Math.floor(s/9),sc=s%9;if(r===sr||c===sc||(Math.floor(r/3)===Math.floor(sr/3)&&Math.floor(c/3)===Math.floor(sc/3)))el.classList.add('related');if(value&&value===state.values[s])el.classList.add('same-number');if(i===s)el.classList.add('selected')}
      if(value&&value!==state.solution[i])el.classList.add('error');
      el.addEventListener('click',()=>select(i));board.append(el);
    });
    const filled=state.values.filter((v,i)=>v===state.solution[i]).length;
    $('#timer').textContent=format(state.seconds);$('#mistakes').textContent=state.mistakes;$('#hintsLeft').textContent=state.hints;
    $('#hintBtn').textContent=`✦ 使用提示（剩余 ${state.hints} 次）`;$('#hintBtn').disabled=!state.hints||state.paused||state.complete;
    $('#progressText').textContent=`${filled} / 81`;$('#progressBar').style.width=`${filled/81*100}%`;
    $('#difficultyPill').textContent={easy:'简单',medium:'中等',hard:'困难'}[state.difficulty];
    $('.board-wrap').classList.toggle('paused',state.paused);$('#pauseCover').hidden=!state.paused;
    $('#pauseBtn').textContent=state.paused?'▶ 继续':'Ⅱ 暂停';$('#pauseBtn').disabled=state.complete;
    $('#statusText').textContent=state.complete?'已完成':state.paused?'已暂停':state.started?'进行中':'准备开始';
    $('#selectedHint').textContent=state.selected===null?'选择一个格子开始':`第 ${Math.floor(state.selected/9)+1} 行 · 第 ${state.selected%9+1} 列`;
    $('#notesBtn').textContent=`✎ 笔记${state.noteMode?'：开':'：关'}`;$('#notesBtn').setAttribute('aria-pressed',String(state.noteMode));$('#undoBtn').disabled=!history.length||state.paused||state.complete;
    document.querySelectorAll('.difficulty').forEach(b=>{b.classList.toggle('active',b.dataset.diff===state.difficulty);b.setAttribute('aria-pressed',String(b.dataset.diff===state.difficulty))});
  }
  function select(i){if(state.paused||state.complete)return;state.selected=i;render();board.children[i].focus({preventScroll:true})}
  function finish(){if(!state.values.every((v,i)=>v===state.solution[i]))return;state.complete=true;$('#completeCopy').textContent=`你用 ${format(state.seconds)} 完成了这局数独，共有 ${state.mistakes} 次错误。`;$('#modalBackdrop').hidden=false;$('#modalBackdrop').classList.add('open');$('#modalNew').focus();beep();}
  function enter(n){if(!editable())return;const i=state.selected;if(!state.noteMode&&state.values[i]===n)return;remember();state.started=true;
    if(state.noteMode){if(state.values[i]){history.pop();return}const a=state.notes[i];state.notes[i]=a.includes(n)?a.filter(v=>v!==n):a.concat(n)}
    else{state.values[i]=n;state.notes[i]=[];if(n!==state.solution[i])state.mistakes++;beep(n===state.solution[i]);finish()}render();
  }
  function erase(){if(!editable())return;remember();state.values[state.selected]=0;state.notes[state.selected]=[];render()}
  function hint(){if(state.paused||state.complete||!state.hints)return;let i=state.selected;if(i===null||state.values[i]===state.solution[i])i=state.values.findIndex((v,k)=>v!==state.solution[k]);if(i<0)return;remember();state.started=true;state.selected=i;state.hints--;state.values[i]=state.solution[i];state.notes[i]=[];beep();finish();render()}
  function pause(){if(state.complete)return;state.paused=!state.paused;render()}
  function undo(){if(!history.length||state.paused||state.complete)return;Object.assign(state,history.pop());render()}
  function toggleNotes(){if(state.paused||state.complete)return;state.noteMode=!state.noteMode;render()}
  for(let n=1;n<=9;n++){const b=document.createElement('button');b.className='num';b.textContent=n;b.onclick=()=>enter(n);$('#numberPad').append(b)}
  const eraser=document.createElement('button');eraser.className='num erase';eraser.textContent='⌫ 擦除';eraser.onclick=erase;$('#numberPad').append(eraser);
  document.querySelectorAll('.difficulty').forEach(b=>b.onclick=()=>init(b.dataset.diff));
  $('#newPuzzle').onclick=$('#newPuzzleTop').onclick=$('#modalNew').onclick=()=>init();
  $('#hintBtn').onclick=hint;$('#pauseBtn').onclick=$('#resumeBtn').onclick=pause;$('#undoBtn').onclick=undo;$('#notesBtn').onclick=toggleNotes;
  $('#soundToggle').onclick=()=>{sound=!sound;$('#soundToggle').textContent=sound?'♪':'♩';$('#soundToggle').setAttribute('aria-pressed',String(sound));$('#soundToggle').title=sound?'关闭音效':'开启音效';beep()};
  $('#helpBtn').onclick=()=>$('#helpDialog').showModal();$('#closeHelp').onclick=()=>$('#helpDialog').close();
  document.addEventListener('keydown',e=>{
    if($('#helpDialog').open||!$('#modalBackdrop').hidden)return;
    if(e.ctrlKey||e.metaKey){if(e.key.toLowerCase()==='z'){e.preventDefault();undo()}return}
    if(/^[1-9]$/.test(e.key)){e.preventDefault();enter(+e.key)}
    else if(['Backspace','Delete','0'].includes(e.key)){e.preventDefault();erase()}
    else if(e.key.toLowerCase()==='n')toggleNotes();
    else if(e.key.toLowerCase()==='p')pause();
    else if(e.key.startsWith('Arrow')){e.preventDefault();const i=state.selected??0,r=Math.floor(i/9),c=i%9;select(e.key==='ArrowRight'?r*9+Math.min(8,c+1):e.key==='ArrowLeft'?r*9+Math.max(0,c-1):e.key==='ArrowDown'?Math.min(8,r+1)*9+c:Math.max(0,r-1)*9+c)}
  });
  setInterval(()=>{if(state.started&&!state.paused&&!state.complete&&!document.hidden){state.seconds++;$('#timer').textContent=format(state.seconds)}},1000);
  init();
})();
