(function(root){
  function shuffled(items){const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function solve(grid,limit=2){
    const a=grid.slice();let count=0,answer=null;
    function search(){
      let pos=-1,options=null;
      for(let i=0;i<81;i++)if(!a[i]){
        const row=Math.floor(i/9),col=i%9,used=new Set();
        for(let k=0;k<9;k++){used.add(a[row*9+k]);used.add(a[k*9+col]);used.add(a[(Math.floor(row/3)*3+Math.floor(k/3))*9+Math.floor(col/3)*3+k%3])}
        const candidates=[1,2,3,4,5,6,7,8,9].filter(n=>!used.has(n));
        if(!candidates.length)return;
        if(!options||candidates.length<options.length){pos=i;options=candidates;if(options.length===1)break}
      }
      if(pos===-1){count++;if(!answer)answer=a.slice();return}
      for(const n of options){a[pos]=n;search();a[pos]=0;if(count>=limit)return}
    }
    search();return {count,solution:answer};
  }
  function generate(difficulty){
    const target={easy:42,medium:33,hard:27}[difficulty]||33;
    let best;
    for(let attempt=0;attempt<5;attempt++){
      const groups=()=>shuffled([0,1,2]).flatMap(g=>shuffled([0,1,2]).map(k=>g*3+k));
      const rows=groups(),cols=groups(),digits=shuffled([1,2,3,4,5,6,7,8,9]);
      const solution=rows.flatMap(r=>cols.map(c=>digits[(r*3+Math.floor(r/3)+c)%9]));
      const given=solution.slice();let clues=81;
      for(const i of shuffled(Array.from({length:81},(_,i)=>i))){
        const previous=given[i];given[i]=0;
        if(solve(given).count!==1)given[i]=previous;else clues--;
        if(clues===target)break;
      }
      if(!best||clues<best.clues)best={given,solution,clues};
      if(clues===target)return best;
    }
    return best;
  }
  const api={generate,solve};if(typeof module!=='undefined')module.exports=api;else root.SudokuEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
