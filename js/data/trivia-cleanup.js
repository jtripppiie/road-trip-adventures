(function(){
window.RTA_TRIVIA_QUESTIONS=(window.RTA_TRIVIA_QUESTIONS||[]);
const seen=new Set();
window.RTA_TRIVIA_QUESTIONS=window.RTA_TRIVIA_QUESTIONS.filter(q=>{
 const key=(q.question||'').toLowerCase().trim();
 if(seen.has(key)) return false;
 seen.add(key);
 if(key.includes('how many u.s. national parks are there as of 2026')){
   q.question='How many U.S. national parks are there currently?';
 }
 return true;
});
})();