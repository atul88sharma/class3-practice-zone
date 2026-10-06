/* Kanak Sharma Class 3 Practice Zone — V4 Adaptive + V3.1 Question Bank */
'use strict';

// Firebase Cloud Sync (Student ID + PIN + Firestore)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyA4w0VFVmSlzNFbxdbHOH8fY02tyzt7mds',
  authDomain: 'kanakpracticezone.firebaseapp.com',
  projectId: 'kanakpracticezone',
  storageBucket: 'kanakpracticezone.firebasestorage.app',
  messagingSenderId: '843655813046',
  appId: '1:843655813046:web:3a3b8d10b781740fbf9317'
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const AUTH_DOMAIN_SUFFIX = '@kanakpracticezone.firebaseapp.com';
let currentUser = null;
let authReady = false;
let cloudReady = false;
let cloudBusy = false;

const STORAGE_KEY = 'kanakPracticeV4';
const BANK_VERSION = 'v4-1440';
const LEVELS = {
  easy:   { name:'Easy', emoji:'🟢', minutes:15, color:'easy' },
  medium: { name:'Medium', emoji:'🟡', minutes:12, color:'medium' },
  hard:   { name:'Hard', emoji:'🔴', minutes:10, color:'hard' }
};

const SUBJECTS = {
  maths:{name:'Maths',icon:'🔢',desc:'Numbers, shapes & problem solving',topics:[
    ['addition','Addition','Add 2–3 digit numbers'],['subtraction','Subtraction','Subtract with confidence'],['multiplication','Multiplication','Tables & multiplication'],['division','Division','Divide and share'],['fractions','Fractions','Parts of a whole'],['time','Time','Read clocks & solve time problems']
  ]},
  english:{name:'English',icon:'📘',desc:'Grammar, vocabulary & comprehension',topics:[
    ['nouns','Nouns','People, places, animals & things'],['pronouns','Pronouns','I, you, he, she, they & more'],['verbs','Verbs','Action and being words'],['adjectives','Adjectives','Words that describe'],['tenses','Tenses','Past, present & future'],['comprehension','Comprehension','Read and understand']
  ]},
  hindi:{name:'Hindi',icon:'🇮🇳',desc:'हिंदी व्याकरण और शब्द',topics:[
    ['sangya','संज्ञा','नाम बताने वाले शब्द'],['sarvanam','सर्वनाम','संज्ञा के स्थान पर शब्द'],['kriya','क्रिया','काम बताने वाले शब्द'],['ling','लिंग','पुल्लिंग और स्त्रीलिंग'],['vachan','वचन','एकवचन और बहुवचन'],['vilom','विलोम शब्द','उल्टे अर्थ वाले शब्द']
  ]},
  evs:{name:'EVS',icon:'🌱',desc:'Our world, science & everyday life',topics:[
    ['family','My Family','Families and relationships'],['caring','Sharing and Caring','Helping and kindness'],['games','Games Are Fun!','Play, exercise & teamwork'],['work','Work People Do','Jobs and community helpers'],['plants','World of Plants','Plants around us'],['animals','World of Animals','Animals and their needs']
  ]}
};

const TOPIC_NAMES = Object.fromEntries(Object.entries(SUBJECTS).flatMap(([s,v])=>v.topics.map(t=>[`${s}:${t[0]}`,t[1]])));

function esc(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function pick(arr){return arr[Math.floor(Math.random()*arr.length)];}
function uniqueOptions(correct, distractors){const ds=[...new Set(distractors.map(String).filter(x=>x!==String(correct)))];return shuffle([String(correct),...shuffle(ds).slice(0,3)]);}
function makeQ(id,subject,topic,level,prompt,options,answer,explanation){return {id,subject,topic,level,prompt,options,answer,explanation};}
function numericOptions(correct,step=1){const n=Number(correct);return [String(n),String(Math.max(0,n+step)),String(Math.max(0,n-step)),String(Math.max(0,n+step*2))];}
function pad2(n){return String(n).padStart(2,'0');}
function timeText(total){let h=Math.floor(total/60)%24,m=total%60;return `${h}:${pad2(m)}`;}
function gcd(a,b){while(b){[a,b]=[b,a%b]}return a;}
function frac(n,d){const g=gcd(n,d);return `${n/g}/${d/g}`;}

/* -------------------- Large original question bank: 20 questions per topic x level -------------------- */
const BANK = [];
const SET_COUNTERS = {};
function addSet(subject,topic,level,items){const key=`${subject}-${topic}-${level}`;items.forEach(x=>{SET_COUNTERS[key]=(SET_COUNTERS[key]||0)+1;const raw=x[1].map(String), correctText=raw[x[2]];const opts=[...new Set(raw)];const filler=subject==='hindi'?'इनमें से कोई नहीं':'None of these';if(!opts.includes(filler))opts.push(filler);const finalOpts=opts.slice(0,4);if(!finalOpts.includes(correctText))finalOpts[3]=correctText;const answer=finalOpts.indexOf(correctText);BANK.push(makeQ(`${key}-${SET_COUNTERS[key]}`,subject,topic,level,x[0],finalOpts,answer,x[3]||''));});}

function buildMaths(){
  for(let i=0;i<20;i++){
    let a=12+i*3,b=7+i*2,c=a+b;
    addSet('maths','addition','easy',[[`What is ${a} + ${b}?`,numericOptions(c,2),numericOptions(c,2).indexOf(String(c)),`Add the ones first, then the tens.`]]);
    a=145+i*11;b=76+i*7;c=a+b;
    addSet('maths','addition','medium',[[`What is ${a} + ${b}?`,numericOptions(c,10),numericOptions(c,10).indexOf(String(c)),`Add hundreds, tens and ones carefully.`]]);
    a=324+i*13;b=187+i*9;c=a+b;
    const word=[`A library has ${a} books and receives ${b} more. How many books are there now?`,`A school collected ${a} stickers and then got ${b} more. How many stickers altogether?`,`A shop had ${a} pencils and added ${b}. How many pencils now?`][i%3];
    addSet('maths','addition','hard',[[word,numericOptions(c,10),numericOptions(c,10).indexOf(String(c)),`This is an addition problem because the amount increases.`]]);

    a=30+i*2;b=9+i;c=a-b;
    addSet('maths','subtraction','easy',[[`What is ${a} − ${b}?`,numericOptions(c,2),numericOptions(c,2).indexOf(String(c)),`Subtract the ones and then the tens.`]]);
    a=412+i*9;b=135+i*4;c=a-b;
    addSet('maths','subtraction','medium',[[`What is ${a} − ${b}?`,numericOptions(c,10),numericOptions(c,10).indexOf(String(c)),`Line up hundreds, tens and ones.`]]);
    a=650+i*8;b=278+i*5;c=a-b;
    const sw=[`A school has ${a} sheets of paper. ${b} are used. How many remain?`,`There are ${a} seats in a hall. ${b} are occupied. How many are empty?`,`A shop has ${a} balloons and sells ${b}. How many are left?`][i%3];
    addSet('maths','subtraction','hard',[[sw,numericOptions(c,10),numericOptions(c,10).indexOf(String(c)),`The word “remain/left/empty” tells us to subtract.`]]);

    let x=2+(i%9),y=2+((i*2)%8),p=x*y;
    addSet('maths','multiplication','easy',[[`What is ${x} × ${y}?`,numericOptions(p,2),numericOptions(p,2).indexOf(String(p)),`Multiplication is repeated addition.`]]);
    x=6+(i%7);y=7+((i*3)%6);p=x*y;
    addSet('maths','multiplication','medium',[[`What is ${x} × ${y}?`,numericOptions(p,3),numericOptions(p,3).indexOf(String(p)),`Think of ${x} groups of ${y}.`]]);
    x=12+(i%8);y=4+((i*2)%7);p=x*y;
    const mw=[`There are ${x} boxes with ${y} crayons in each. How many crayons?`,`A farmer puts ${y} apples in each of ${x} baskets. How many apples?`,`There are ${x} rows with ${y} chairs in each row. How many chairs?`][i%3];
    addSet('maths','multiplication','hard',[[mw,numericOptions(p,5),numericOptions(p,5).indexOf(String(p)),`Equal groups are multiplied.`]]);

    y=2+(i%8);p=4+y*2;let dividend=y*p/y;
    // Keep easy divisions exact and simple
    let divisor=2+(i%6), quotient=3+(i%7), dividend2=divisor*quotient;
    addSet('maths','division','easy',[[`${dividend2} ÷ ${divisor} = ?`,numericOptions(quotient,1),numericOptions(quotient,1).indexOf(String(quotient)),`Division asks how many equal groups we can make.`]]);
    divisor=3+(i%7);quotient=8+(i%8);dividend2=divisor*quotient;
    addSet('maths','division','medium',[[`${dividend2} ÷ ${divisor} = ?`,numericOptions(quotient,2),numericOptions(quotient,2).indexOf(String(quotient)),`Check by multiplying ${quotient} × ${divisor}.`]]);
    divisor=4+(i%6);quotient=10+(i%9);dividend2=divisor*quotient;
    const dw=[`${dividend2} sweets are shared equally among ${divisor} children. How many does each child get?`,`${dividend2} pencils are put equally into ${divisor} boxes. How many pencils per box?`][i%2];
    addSet('maths','division','hard',[[dw,numericOptions(quotient,2),numericOptions(quotient,2).indexOf(String(quotient)),`Equal sharing means divide ${dividend2} by ${divisor}.`]]);

    const den=3+(i%7),num=1+(i%(den-1));
    let fractionChoices=[];for(let n=1;n<=den;n++)if(n!==num)fractionChoices.push(`${n}/${den}`);
    let opts=shuffle([`${num}/${den}`,...fractionChoices.slice(0,3)]);let ans=opts.indexOf(`${num}/${den}`);
    addSet('maths','fractions','easy',[[`What fraction of the ${den} equal parts is ${num} part${num>1?'s':''}?`,opts,ans,`A fraction tells us how many parts we have out of the total equal parts.`]]);
    const d1=5+(i%5), n1=1+(i%3), n2=Math.min(d1-1,n1+1);let correct=`${n2}/${d1}`;
    let mediumChoices=[];for(let n=1;n<=d1;n++)if(n!==n2)mediumChoices.push(`${n}/${d1}`);
    opts=shuffle([correct,...mediumChoices.slice(0,3)]);ans=opts.indexOf(correct);
    addSet('maths','fractions','medium',[[`Which fraction is greater: ${n1}/${d1} or ${n2}/${d1}?`,opts,ans,`When denominators are equal, the larger numerator means the larger fraction.`]]);
    const base=2+(i%5), eq=`${base*2}/${base*4}`;
    opts=shuffle([eq,'1/3','3/4','2/5']);ans=opts.indexOf(eq);
    addSet('maths','fractions','hard',[[`Which fraction is equivalent to 1/2?`,opts,ans,`Equivalent fractions have the same value even when the numbers are different.`]]);

    const start=8*60+i*3, mins=15+(i%6), end=start+mins;
    const startTxt=timeText(start), endTxt=timeText(end);
    opts=shuffle([`${mins} minutes`,`${mins+5} minutes`,`${mins-5} minutes`,`${mins+10} minutes`]);ans=opts.indexOf(`${mins} minutes`);
    addSet('maths','time','easy',[[`A class starts at ${startTxt} and ends at ${endTxt}. How long is it?`,opts,ans,`Count the minutes from the start time to the end time.`]]);
    const h=2+(i%5),m=10+(i%6)*5,total=(h*60+m+35);let hh=Math.floor(total/60),mm=total%60,correctTime=timeText(total);
    opts=shuffle([correctTime,timeText(total+10),timeText(total-10),timeText(total+20)]);ans=opts.indexOf(correctTime);
    addSet('maths','time','medium',[[`${timeText(h*60+m)} plus 35 minutes is:`,opts,ans,`Move the minute hand forward by 35 minutes.`]]);
    const st=6*60+20+i*4,dur=65+(i%5)*10,et=st+dur,ct=timeText(et);
    opts=shuffle([ct,timeText(et+15),timeText(et-15),timeText(et+30)]);ans=opts.indexOf(ct);
    addSet('maths','time','hard',[[`A train leaves at ${timeText(st)} and travels for ${dur} minutes. When does it arrive?`,opts,ans,`Add the travel time to the departure time.`]]);
  }
}

function buildEnglish(){
  const nounSets=[['teacher','runs','school','quickly'],['garden','green','jump','softly'],['London','beautiful','walk','slowly'],['puppy','happy','barks','very']];
  const pron=[['Riya is kind. ___ helps her friend.','She'],['Aman and I play. ___ are happy.','We'],['The birds are hungry. ___ need food.','They'],['My father is a doctor. ___ helps people.','He']];
  const adj=[['The ___ kitten slept.',['small','sleep','kitten','quietly']],['I ate a ___ mango.',['sweet','eat','mango','quickly']],['We saw a ___ rainbow.',['bright','see','rainbow','slowly']],['The ___ elephant walked.',['large','walk','elephant','softly']]];
  const verbs=['runs','jumps','reads','writes','sings','eats'];
  for(let i=0;i<20;i++){
    const ns=nounSets[i%4], nounCorrect=ns[0];let opts=shuffle([nounCorrect,ns[1],ns[2],ns[3]]);addSet('english','nouns','easy',[[`Which word is a noun?`,opts,opts.indexOf(nounCorrect),`A noun names a person, place, animal or thing.`]]);
    const name=['Aarav','Meera','Rohan','Anaya'][i%4], place=['Delhi','school','park','Jaipur'][i%4];opts=shuffle([name,place,'quickly','happy']);let nounCorrect2=pick([name,place]);opts=shuffle([nounCorrect2,'quickly','happy',pick(['runs','blue','soft'])]);addSet('english','nouns','medium',[[`Which word in this group is a noun?`,opts,opts.indexOf(nounCorrect2),`A noun names a person or place.`]]);
    const np=['Riya','school','doctor','garden'][i%4], verb=['runs','opens','helps','grows'][i%4];opts=shuffle([np,verb,'quickly','beautiful']);addSet('english','nouns','hard',[[`In the sentence “The ${np} ${verb} every day”, which word is a noun?`,opts,opts.indexOf(np),`The noun names the person/place/thing.`]]);

    let pr=pron[i%4];opts=shuffle([pr[1],'He','They','It']);addSet('english','pronouns','easy',[[pr[0],opts,opts.indexOf(pr[1]),`The pronoun replaces the noun without changing who we mean.`]]);
    const pair=[['Asha and Riya are friends. ___ play together.','They'],['My brother and I read. ___ enjoy stories.','We'],['The cat is hungry. ___ wants milk.','It'],['Kabir is tall. ___ plays basketball.','He']][i%4];opts=shuffle([pair[1],'She','We','It']);addSet('english','pronouns','medium',[[pair[0],opts,opts.indexOf(pair[1]),`Choose the pronoun that matches the person or people.`]]);
    const pp=[['Maya and I went to the library. ___ borrowed two books.','We'],['Rahul and his sister are ready. ___ will leave soon.','They'],['The puppy found its ball. ___ carried it home.','It'],['Neha is my cousin. ___ lives nearby.','She']][i%4];opts=shuffle([pp[1],'He','We','It']);addSet('english','pronouns','hard',[[pp[0],opts,opts.indexOf(pp[1]),`Check whether the noun is one person, more than one, or a thing.`]]);

    const v=verbs[i%verbs.length];opts=shuffle([v,'blue','chair','happy']);addSet('english','verbs','easy',[[`Which word is a verb?`,opts,opts.indexOf(v),`A verb tells about an action or state.`]]);
    const subject=['The girl','The birds','My mother','The boys'][i%4], vv=['reads','fly','cooks','play'][i%4];opts=shuffle([vv,'green','soft','quiet']);addSet('english','verbs','medium',[[`${subject} ___ every morning.`,opts,opts.indexOf(vv),`The verb tells what the subject does.`]]);
    const base=['Yesterday, I','Every day, she','Tomorrow, we','Last Sunday, they'][i%4], forms=[['walked','walks','will walk','walking'],['played','plays','will play','playing'],['visited','visits','will visit','visiting'],['cleaned','cleans','will clean','cleaning']][i%4];let verbCorrect=forms[i%3];opts=shuffle(forms);addSet('english','verbs','hard',[[`${base} ___ to the park.`,opts,opts.indexOf(verbCorrect),`Use the time clue to choose the correct verb.`]]);

    const ad=adj[i%4];opts=shuffle(ad[1]);addSet('english','adjectives','easy',[[`Which word describes the noun in “${ad[0]}”?`,opts,opts.indexOf(ad[1][0]),`An adjective describes a noun.`]]);
    const colors=['red','blue','yellow','green'],objects=['ball','kite','bag','shirt'],co=colors[i%4],ob=objects[i%4];opts=shuffle([co,ob,'run','quickly']);addSet('english','adjectives','medium',[[`In “The ${co} ${ob} is new”, which word is an adjective?`,opts,opts.indexOf(co),`The adjective tells us what the object is like.`]]);
    const aa=[['The tiny brown bird flew away.','tiny and brown'],['We saw a huge green tree.','huge and green'],['She wore a bright yellow dress.','bright and yellow'],['He carried a heavy black bag.','heavy and black']][i%4];opts=shuffle([aa[1],'bird and flew','she and dress','away and bag']);addSet('english','adjectives','hard',[[`Which two words are adjectives in: “${aa[0]}” ?`,opts,opts.indexOf(aa[1]),`Both words describe the noun.`]]);

    const tense=[['Every day, Tara ___ to school.','walks'],['Yesterday, Tara ___ to school.','walked'],['Tomorrow, Tara ___ to school.','will walk'],['Every Sunday, we ___ football.','play']][i%4];let tenseForms=['walks','walked','will walk','walking'];if(i%4===3)tenseForms=['play','played','will play','playing'];opts=shuffle(tenseForms);addSet('english','tenses','easy',[[tense[0],opts,opts.indexOf(tense[1]),`The time clue tells us which tense to use.`]]);
    const tense2=[['Last night, we ___ a story.','read'],['Now, she ___ a picture.','is drawing'],['Next week, they ___ a museum.','will visit'],['Yesterday, he ___ his room.','cleaned']][i%4];opts=shuffle([tense2[1],['go','went','will go','going'][i%4],'eats','plays']);if(!opts.includes(tense2[1]))opts[3]=tense2[1];addSet('english','tenses','medium',[[tense2[0],opts,opts.indexOf(tense2[1]),`Look for the clue: past, now or future.`]]);
    const t3=[['When I was five, I ___ very small.','was'],['Tomorrow, my family ___ travel.','will'],['Yesterday, the children ___ happy.','were'],['Today, I ___ my homework.','am doing']][i%4];opts=shuffle([t3[1],'is','are','will']);addSet('english','tenses','hard',[[t3[0],opts,opts.indexOf(t3[1]),`The sentence tells you when the action happens.`]]);

    const passages=[
      ['Mina planted three tomato seeds in a pot. She watered them every morning. After a few days, tiny green leaves appeared.','What appeared after a few days?',['Flowers','Green leaves','Red tomatoes','Big trees'],'Green leaves'],
      ['Kabir packed a raincoat before leaving home. The sky was dark and the wind was cool. On his way to school, it began to rain.','Why did Kabir take a raincoat?',['He expected rain','He wanted a toy','It was very hot','He was going swimming'],'He expected rain'],
      ['Asha found a lost pencil box near the classroom door. She gave it to her teacher so its owner could get it back.','What did Asha do with the pencil box?',['She kept it','She threw it away','She gave it to the teacher','She sold it'],'She gave it to the teacher'],
      ['Rohan feeds his pet rabbit fresh vegetables and gives it clean water every day. He also keeps its home clean.','Which thing does Rohan give the rabbit every day?',['Candy','Fresh vegetables and clean water','Only milk','Biscuits'],'Fresh vegetables and clean water']
    ];
    const ps=passages[i%4];opts=shuffle(ps[2]);addSet('english','comprehension','easy',[[ps[0]+' '+ps[1],opts,opts.indexOf(ps[3]),`The answer is stated directly in the short passage.`]]);
    const p2=[...ps];p2[1]=['What is the main idea?','Why did the child act this way?','What happened first?','Which detail is true?'][i%4];opts=shuffle([ps[3],'The opposite happened','The passage gives no clue','A different event']);addSet('english','comprehension','medium',[[ps[0]+' '+p2[1],opts,opts.indexOf(ps[3]),`Use details from the passage rather than guessing.`]]);
    const inference=[['Mina kept watering the plant even when no leaves were visible. What does this show?','She was patient and caring'],['Kabir carried his raincoat even though it was sunny when he left. What can we infer?','He thought the weather might change'],['Asha returned the pencil box instead of keeping it. What quality did she show?','Honesty'],['Rohan cleans the rabbit’s home regularly. Why is this helpful?','It keeps the rabbit healthy']][i%4];opts=shuffle([inference[1],'He/She forgot about it','It was impossible','The passage says the opposite']);addSet('english','comprehension','hard',[[ps[0]+' '+inference[0],opts,opts.indexOf(inference[1]),`An inference is a sensible idea supported by details in the passage.`]]);
  }
}

function buildHindi(){
  const sets={
    sangya:[['किताब','दौड़ना','सुंदर','धीरे'],['दिल्ली','मीठा','चलना','जल्दी'],['पेड़','हँसना','लाल','धीरे'],['अध्यापक','खेलना','नीला','सुंदर']],
    sarvanam:[['रीना बाजार गई। ___ फल लाई।','वह'],['मोहन और मैं मित्र हैं। ___ साथ पढ़ते हैं।','हम'],['बच्चे खेल रहे हैं। ___ बहुत खुश हैं।','वे'],['कुत्ता भूखा है। ___ खाना चाहता है।','वह']],
    kriya:[['बच्चे मैदान में दौड़ते हैं।','दौड़ते'],['माँ खाना बनाती है।','बनाती'],['रवि पुस्तक पढ़ता है।','पढ़ता'],['चिड़िया उड़ती है।','उड़ती']],
    ling:[['लड़का','लड़की'],['राजा','रानी'],['मोर','मोरनी'],['अध्यापक','अध्यापिका']],
    vachan:[['लड़का','लड़के'],['किताब','किताबें'],['फूल','फूल'],['बच्चा','बच्चे']],
    vilom:[['दिन','रात'],['बड़ा','छोटा'],['अच्छा','बुरा'],['ऊपर','नीचे']]
  };
  for(let i=0;i<20;i++){
    let s=sets.sangya[i%4],opts=shuffle(s);addSet('hindi','sangya','easy',[[`इनमें से संज्ञा शब्द कौन-सा है?`,opts,opts.indexOf(s[0]),`संज्ञा किसी व्यक्ति, स्थान, वस्तु या जीव का नाम बताती है।`]]);
    const sc=['रीमा','विद्यालय','कुत्ता','दिल्ली'][i%4], so=shuffle([sc,'सुंदर','दौड़ना','धीरे']);addSet('hindi','sangya','medium',[[`निम्न समूह में संज्ञा शब्द पहचानिए।`,so,so.indexOf(sc),`संज्ञा नाम बताने वाला शब्द है।`]]);
    const sentence=[['राम बाजार गया और आम खरीदे।','राम और बाजार और आम'],['सीमा ने बगीचे में फूल देखे।','सीमा और बगीचा और फूल'],['दिल्ली भारत का एक बड़ा शहर है।','दिल्ली और भारत और शहर'],['कक्षा में बच्चे किताब पढ़ते हैं।','कक्षा और बच्चे और किताब']][i%4];opts=shuffle([sentence[1],'गया और पढ़ते','बड़ा और एक','ने और में']);addSet('hindi','sangya','hard',[[`${sentence[0]} इसमें संज्ञा शब्दों का समूह कौन-सा है?`,opts,opts.indexOf(sentence[1]),`वाक्य में नाम बताने वाले शब्द संज्ञा हैं।`]]);

    let pr=sets.sarvanam[i%4],po=shuffle([pr[1],'मैं','वह','वे']);addSet('hindi','sarvanam','easy',[[pr[0],po,po.indexOf(pr[1]),`सर्वनाम संज्ञा के स्थान पर प्रयोग होता है।`]]);
    const pr2=[['अमन स्कूल गया। ___ पढ़ने लगा।','वह'],['सीमा और रीना बहनें हैं। ___ साथ खेलती हैं।','वे'],['मैं और मेरा भाई घर गए। ___ जल्दी लौटे।','हम'],['किताब मेज पर है। ___ नई है।','यह']][i%4];po=shuffle([pr2[1],'वह','वे','हम']);addSet('hindi','sarvanam','medium',[[pr2[0],po,po.indexOf(pr2[1]),`संज्ञा की संख्या और संदर्भ देखकर सर्वनाम चुनें।`]]);
    const pr3=[['रवि और मैं पुस्तकालय गए। ___ दो किताबें लाए।','हम'],['नेहा और पूजा नृत्य करती हैं। ___ बहुत खुश हैं।','वे'],['मोहन बहुत अच्छा तैरता है। ___ रोज अभ्यास करता है।','वह'],['सीमा की गुड़िया नई है। ___ बहुत सुंदर है।','यह']][i%4];po=shuffle([pr3[1],'मैं','वह','वे']);addSet('hindi','sarvanam','hard',[[pr3[0],po,po.indexOf(pr3[1]),`वाक्य में जिस नाम की जगह शब्द आया है, उसे ध्यान से पहचानें।`]]);

    let kr=sets.kriya[i%4];let kop=['दौड़ते','खेलते','लिखते','पढ़ते','सुंदर'].filter(x=>x!==kr[1]);opts=shuffle([kr[1],...kop]).slice(0,4);if(!opts.includes(kr[1]))opts[3]=kr[1];addSet('hindi','kriya','easy',[[`वाक्य में क्रिया शब्द पहचानिए: ${kr[0]}`,opts,opts.indexOf(kr[1]),`क्रिया काम या होने का बोध कराती है।`]]);
    const kr2=[['बच्चे गेंद खेलते हैं।','खेलते'],['माँ पानी भरती है।','भरती'],['राहुल चित्र बनाता है।','बनाता'],['पक्षी घोंसला बनाते हैं।','बनाते']][i%4];opts=shuffle([kr2[1],'बच्चे','पानी','सुंदर']);addSet('hindi','kriya','medium',[[`${kr2[0]} क्रिया शब्द कौन-सा है?`,opts,opts.indexOf(kr2[1]),`काम बताने वाला शब्द क्रिया है।`]]);
    const kr3=[['सुबह बच्चे मैदान में दौड़ते हुए हँस रहे थे।','दौड़ते और हँस'],['रीना ने खाना बनाया और सबको खिलाया।','बनाया और खिलाया'],['पिता जी बाजार गए और फल लाए।','गए और लाए'],['चिड़िया उड़कर पेड़ पर बैठ गई।','उड़कर और बैठ']][i%4];opts=shuffle([kr3[1],'सुबह और मैदान','बच्चे और बाजार','पेड़ और फल']);addSet('hindi','kriya','hard',[[`${kr3[0]} में क्रिया शब्दों का समूह कौन-सा है?`,opts,opts.indexOf(kr3[1]),`वाक्य में किए गए कामों को पहचानें।`]]);

    let li=sets.ling[i%4], lopts=shuffle([li[1],li[0],['किताब','पेड़'][i%2],['नदी','घर'][i%2]]);addSet('hindi','ling','easy',[[`${li[0]} का स्त्रीलिंग क्या है?`,lopts,lopts.indexOf(li[1]),`सही स्त्रीलिंग रूप चुनें।`]]);
    const lp=[['भाई','बहन'],['पुत्र','पुत्री'],['घोड़ा','घोड़ी'],['नर','मादा']][i%4];lopts=shuffle([lp[1],lp[0],'बच्चे','कुर्सी']);addSet('hindi','ling','medium',[[`${lp[0]} का सही स्त्रीलिंग क्या है?`,lopts,lopts.indexOf(lp[1]),`पुल्लिंग और स्त्रीलिंग जोड़ी को याद करें।`]]);
    const lp2=[['राजा','रानी'],['शेर','शेरनी'],['अभिनेता','अभिनेत्री'],['अध्यापक','अध्यापिका']][i%4];lopts=shuffle([`${lp2[0]}—${lp2[1]}`,`${lp2[1]}—${lp2[0]}`,'लड़का—घोड़ा','भाई—पुत्र']);addSet('hindi','ling','hard',[[`सही पुल्लिंग—स्त्रीलिंग जोड़ी चुनिए।`,lopts,lopts.indexOf(`${lp2[0]}—${lp2[1]}`),`पहला शब्द पुल्लिंग और दूसरा उसका स्त्रीलिंग रूप है।`]]);

    let va=sets.vachan[i%4];let vopts=shuffle([va[1],va[0],'लड़की','किताबें']);addSet('hindi','vachan','easy',[[`${va[0]} का बहुवचन क्या है?`,vopts,vopts.indexOf(va[1]),`एक से अधिक के लिए बहुवचन प्रयोग होता है।`]]);
    const vp=[['बच्चा','बच्चे'],['चिड़िया','चिड़ियाँ'],['कुर्सी','कुर्सियाँ'],['कमरा','कमरे']][i%4];vopts=shuffle([vp[1],vp[0],'घर','मेज']);addSet('hindi','vachan','medium',[[`${vp[0]} का बहुवचन चुनिए।`,vopts,vopts.indexOf(vp[1]),`शब्द का सही बहुवचन रूप चुनें।`]]);
    const vp2=[['लड़के मैदान में खेलते हैं।','बहुवचन'],['रीना किताब पढ़ती है।','एकवचन'],['पक्षी आकाश में उड़ते हैं।','बहुवचन'],['बच्चा हँस रहा है।','एकवचन']][i%4];vopts=shuffle([vp2[1],vp2[1]==='बहुवचन'?'एकवचन':'बहुवचन','स्त्रीलिंग','क्रिया']);addSet('hindi','vachan','hard',[[`${vp2[0]} में वचन कौन-सा है?`,vopts,vopts.indexOf(vp2[1]),`वाक्य में व्यक्ति/वस्तुओं की संख्या देखें।`]]);

    let vi=sets.vilom[i%4];let vio=shuffle([vi[1],vi[0],'सुंदर','लंबा']);addSet('hindi','vilom','easy',[[`${vi[0]} का विलोम क्या है?`,vio,vio.indexOf(vi[1]),`विलोम शब्द विपरीत अर्थ बताता है।`]]);
    const vip=[['सुख','दुख'],['नया','पुराना'],['आगे','पीछे'],['पास','दूर']][i%4];vio=shuffle([vip[1],vip[0],'ऊँचा','मीठा']);addSet('hindi','vilom','medium',[[`${vip[0]} का विलोम शब्द चुनिए।`,vio,vio.indexOf(vip[1]),`सही विपरीत अर्थ वाला शब्द चुनें।`]]);
    const vip2=[['सत्य','असत्य'],['जीत','हार'],['प्रकाश','अंधकार'],['आरंभ','अंत']][i%4];vio=shuffle([`${vip2[0]}—${vip2[1]}`,`${vip2[1]}—${vip2[0]}`,'बड़ा—लंबा','मीठा—सुंदर']);addSet('hindi','vilom','hard',[[`सही विलोम शब्दों की जोड़ी चुनिए।`,vio,vio.indexOf(`${vip2[0]}—${vip2[1]}`),`दोनों शब्दों के अर्थ एक-दूसरे के विपरीत हैं।`]]);
  }
}

function buildEVS(){
  const data={
    family:[
      ['A family is made of people who are usually:',['related','identical','strangers','only friends'],'related'],
      ['Your mother’s parents are your:',['maternal grandparents','paternal grandparents','siblings','cousins'],'maternal grandparents'],
      ['Two children born to the same mother at the same time are:',['twins','neighbours','teachers','cousins'],'twins'],
      ['A family with parents and their children is commonly called a:',['nuclear family','school family','market family','sports family'],'nuclear family']],
    caring:[
      ['Which action shows caring?',['Helping an injured friend','Ignoring a friend','Wasting food','Breaking a toy'],'Helping an injured friend'],
      ['Why should we share?',['It helps us be kind and fair','It makes others sad','It wastes things','It stops people playing'],'It helps us be kind and fair'],
      ['If a family member is tired, we can:',['offer help','make more noise','hide their things','laugh at them'],'offer help'],
      ['A good way to solve a disagreement is to:',['talk calmly and listen','shout','push','run away without speaking'],'talk calmly and listen']],
    games:[
      ['Regular play and exercise help keep our body:',['healthy','dirty','weak','sleepy all day'],'healthy'],
      ['Which is a team game?',['football','reading silently','sleeping','drawing alone'],'football'],
      ['Why do games have rules?',['To keep play fair and safe','To stop all fun','To confuse players','Rules are never needed'],'To keep play fair and safe'],
      ['A good player should:',['respect others and follow rules','cheat','argue with everyone','ignore the referee'],'respect others and follow rules']],
    work:[
      ['Who usually treats sick people?',['doctor','carpenter','farmer','tailor'],'doctor'],
      ['Who puts out fires?',['firefighter','teacher','chef','gardener'],'firefighter'],
      ['A person who grows crops is a:',['farmer','pilot','driver','nurse'],'farmer'],
      ['Who helps children learn in school?',['teacher','plumber','baker','postman'],'teacher']],
    plants:[
      ['Which part of a plant usually takes in water from soil?',['roots','flowers','fruits','leaves'],'roots'],
      ['Which part helps make food for the plant?',['leaves','roots','fruit','seed'],'leaves'],
      ['A seed can grow into a:',['new plant','stone','toy','cloud'],'new plant'],
      ['Plants need water, air and:',['sunlight','plastic','paint','music'],'sunlight']],
    animals:[
      ['Which animal is a herbivore?',['cow','tiger','eagle','cat'],'cow'],
      ['Which animal is a bird?',['sparrow','frog','rabbit','lion'],'sparrow'],
      ['Animals need food, water and a safe:',['home','pencil','book','ball'],'home'],
      ['Which animal lays eggs?',['hen','cow','dog','goat'],'hen']]
  };
  const harder={
    family:[['A family can be small or large because:',['families can have different numbers of members','all families have the same size','only adults count','friends are always relatives'],'families can have different numbers of members']],
    caring:[['Why is listening important when a friend is upset?',['It helps us understand how they feel','It makes the problem bigger','It means we must always agree','It stops us helping'],'It helps us understand how they feel']],
    games:[['Why is warming up before exercise useful?',['It prepares the body for activity','It makes us tired before playing','It replaces drinking water','It means we need no rules'],'It prepares the body for activity']],
    work:[['Why are different jobs important in a community?',['People provide different useful services','Everyone should do only one job','Jobs are only for adults','No one needs help'],'People provide different useful services']],
    plants:[['Why should we protect plants?',['They provide food, oxygen and habitats','They are only decorations','They do not help living things','They use no resources'],'They provide food, oxygen and habitats']],
    animals:[['Why should wild animals have safe habitats?',['They need places to find food, water and shelter','They should live in every house','They do not need plants','Habitats are only for people'],'They need places to find food, water and shelter']]
  };
  for(let i=0;i<20;i++)for(const topic of Object.keys(data)){
    const d=data[topic][i%data[topic].length];let opts=shuffle(d[1]);addSet('evs',topic,'easy',[[d[0],opts,opts.indexOf(d[2]),`Use what you know about everyday life and the natural world.`]]);
    const variants=[
      [d[0].replace(':','.'),d[1],d[2]],
      [d[0].replace('Which','Think carefully: which'),d[1],d[2]],
      [d[0]+' Choose the best answer.',d[1],d[2]],
      [d[0]+' What is the most sensible choice?',d[1],d[2]]
    ][i%4];opts=shuffle(variants[1]);addSet('evs',topic,'medium',[[variants[0],opts,opts.indexOf(variants[2]),`Choose the answer that best matches the concept.`]]);
    const hd=harder[topic][0];let hopts=shuffle([hd[2],'It is not important','Only adults need it','It happens by itself']);addSet('evs',topic,'hard',[[hd[0],hopts,hopts.indexOf(hd[2]),`Think about the reason behind the fact, not just the word.`]]);
  }
}

buildMaths();buildEnglish();buildHindi();buildEVS();

// Guardrail: exactly 20 unique questions per topic/level.
const BANK_INDEX={};
for(const q of BANK){const k=`${q.subject}:${q.topic}:${q.level}`;(BANK_INDEX[k]??=[]).push(q);}

function emptyStats(){return {version:BANK_VERSION,papers:[],topicStats:{},questionStats:{}};}
function loadStats(){
  try{const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(raw&&raw.version===BANK_VERSION)return raw;}catch(e){}
  return emptyStats();
}
function saveStats(s,{cloud=true}={}){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(s));
  if(cloud&&currentUser) cloudSave(s);
}
function rebuildStatsFromPapers(papers){
  const s={version:BANK_VERSION,papers:[...papers].slice(-100),topicStats:{},questionStats:{}};
  for(const p of s.papers){
    for(const a of (p.answers||[])){
      const k=topicKey(a.subject,a.topic);
      s.topicStats[k]??={correct:0,questions:0};
      s.topicStats[k].questions++;
      if(a.correct)s.topicStats[k].correct++;
      s.questionStats[a.id]??={correct:0,attempts:0};
      s.questionStats[a.id].attempts++;
      if(a.correct)s.questionStats[a.id].correct++;
    }
  }
  return s;
}
function paperIdentity(p,i){
  return p.id || `${p.date||'legacy'}-${p.subject||'mixed'}-${p.topic||'smart'}-${p.score||0}-${p.time||0}-${i}`;
}
function mergeStats(local,cloud){
  const map=new Map();
  for(const [i,p] of (cloud.papers||[]).entries()) map.set(paperIdentity(p,i),{...p,id:paperIdentity(p,i)});
  for(const [i,p] of (local.papers||[]).entries()) map.set(paperIdentity(p,i),{...p,id:paperIdentity(p,i)});
  const papers=[...map.values()].sort((a,b)=>new Date(a.date||0)-new Date(b.date||0)).slice(-100);
  return rebuildStatsFromPapers(papers);
}
async function cloudSave(s){
  if(!currentUser||cloudBusy)return;
  cloudBusy=true;
  try{
    const clean={...s,updatedAt:serverTimestamp(),profile:{name:'Kanak Sharma',class:'3'}};
    await setDoc(doc(db,'users',currentUser.uid),clean);
  }catch(err){
    console.error('Firebase save failed:',err);
    showCloudStatus('Cloud save failed. Your progress is still saved on this device.',true);
  }finally{cloudBusy=false;}
}
async function syncCloud(){
  if(!currentUser)return;
  showCloudStatus('Syncing your progress…');
  try{
    const ref=doc(db,'users',currentUser.uid);
    const snap=await getDoc(ref);
    const local=loadStats();
    const cloud=snap.exists()?snap.data():emptyStats();
    const merged=mergeStats(local,cloud);
    localStorage.setItem(STORAGE_KEY,JSON.stringify(merged));
    await setDoc(ref,{...merged,updatedAt:serverTimestamp(),profile:{name:'Kanak Sharma',class:'3'}},{merge:true});
    cloudReady=true;
    showCloudStatus('☁️ Progress synced');
  }catch(err){
    console.error('Firebase sync failed:',err);
    cloudReady=false;
    showCloudStatus('Offline mode: progress is saved on this device.',true);
  }
}
function showCloudStatus(message,error=false){
  const el=document.getElementById('cloudStatus');
  if(el){el.textContent=message;el.classList.toggle('error',error);}
}
function studentEmail(studentId){
  return `${studentId.trim().toLowerCase()}${AUTH_DOMAIN_SUFFIX}`;
}
function cleanStudentId(v){
  return String(v||'').trim().toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,24);
}
function cleanPin(v){return String(v||'').trim();}
function loginView(){
  return `<section class="authpage">
    <div class="authshell">
      <div class="authstars" aria-hidden="true"><span>⭐</span><span>✨</span><span>🌈</span><span>💫</span></div>
      <div class="authcard card">
        <div class="authbadge">🎒 KANAK'S LEARNING WORLD</div>
        <div class="authheroemoji">🧑‍🎓💛</div>
        <h1>Hey Kanak! 👋</h1>
        <p class="authlead">Welcome to the little learning world Dad built specially for you.</p>
        <div class="dadnote"><div class="dadnoteicon">❤️</div><div><b>A message from Dad</b><p>“Keep learning, keep trying and keep smiling. You don't have to be perfect — just get a little better every day!”</p><small>— Dad</small></div></div>
        <div class="loginform">
          <label for="studentId">🌟 Your Student ID</label>
          <input id="studentId" class="authinput" maxlength="24" autocomplete="username" placeholder="e.g. KANAK001" />
          <label for="studentPin">🔐 Your secret PIN</label>
          <input id="studentPin" class="authinput" type="password" inputmode="numeric" maxlength="32" autocomplete="current-password" placeholder="Enter your PIN" />
          <div class="loginhint">Your ID + PIN keeps your progress safe and lets you continue on another device. ☁️</div>
          <button class="primary authgo" id="studentLogin">🚀 Let's Learn!</button>
          <button class="secondary authsetup" id="studentCreate">✨ First time? Create my learning account</button>
        </div>
        <div id="cloudStatus" class="cloudstatus">☁️ Your progress will be saved securely.</div>
      </div>
      <div class="authfooter">Made with ❤️ by Dad • For Kanak • Class 3</div>
    </div>
  </section>`;
}
function authValues(){
  const id=cleanStudentId(document.getElementById('studentId')?.value);
  const pin=cleanPin(document.getElementById('studentPin')?.value);
  if(!id||id.length<4){alert('Please enter your Student ID 😊');return null;}
  if(pin.length<6){alert('Your PIN should be at least 6 characters. 🔐');return null;}
  return {id,pin,email:studentEmail(id)};
}
async function loginWithStudent(){
  const v=authValues();if(!v)return;
  try{
    showCloudStatus('🔄 Signing you in…');
    await signInWithEmailAndPassword(auth,v.email,v.pin);
  }catch(err){
    console.error('Student sign-in failed:',err);
    const code=err.code||'';
    if(code==='auth/user-not-found'||code==='auth/invalid-credential'){
      showCloudStatus('That Student ID or PIN is not correct. Try again, or use “Create my learning account” if this is your first visit.',true);
    }else if(code==='auth/invalid-email'){
      showCloudStatus('Please check the Student ID and try again.',true);
    }else{
      showCloudStatus('We could not sign you in right now. Your local progress is still safe on this device.',true);
    }
  }
}
async function createStudentAccount(){
  const v=authValues();if(!v)return;
  if(!confirm(`Create a new learning account for Student ID ${v.id}?\n\nUse this same ID and PIN whenever Kanak returns.`))return;
  try{
    showCloudStatus('✨ Creating Kanak’s learning account…');
    const cred=await createUserWithEmailAndPassword(auth,v.email,v.pin);
    await updateProfile(cred.user,{displayName:'Kanak Sharma'});
    showCloudStatus('🎉 Account created! Loading your learning world…');
  }catch(err){
    console.error('Student account creation failed:',err);
    if(err.code==='auth/email-already-in-use'){
      showCloudStatus('This Student ID already exists. Please use “Let’s Learn!” to sign in.',true);
    }else if(err.code==='auth/weak-password'){
      showCloudStatus('Please choose a stronger PIN with at least 6 characters.',true);
    }else{
      showCloudStatus('We could not create the account right now. Please try again.',true);
    }
  }
}
function topicKey(s,t){return `${s}:${t}`;}
function levelAccuracy(s,level){const rows=s.papers.filter(p=>p.level===level);const total=rows.reduce((n,p)=>n+p.total,0);const correct=rows.reduce((n,p)=>n+p.score,0);return total?Math.round(correct/total*100):0;}
function topicMetrics(s){
  const all=[];
  for(const [subject,obj] of Object.entries(SUBJECTS))for(const [topic,name] of obj.topics.map(t=>[t[0],t[1]])){
    const key=topicKey(subject,topic),m=s.topicStats[key]||{attempts:0,correct:0,questions:0};
    all.push({subject,topic,name,attempts:m.attempts||0,correct:m.correct||0,questions:m.questions||0,accuracy:m.questions?Math.round(m.correct/m.questions*100):0});
  }
  return all;
}
function recommendations(s){
  const rows=topicMetrics(s);
  const practiced=rows.filter(r=>r.questions>0);
  const weak=practiced.filter(r=>r.questions>=5).sort((a,b)=>a.accuracy-b.accuracy||a.questions-b.questions);
  if(weak.length) return weak.slice(0,3).map(r=>({subject:r.subject,topic:r.topic,level:r.accuracy<55?'easy':r.accuracy<75?'medium':'hard',reason:`${r.accuracy}% accuracy across ${r.questions} questions`}));
  return rows.sort((a,b)=>a.questions-b.questions).slice(0,3).map(r=>({subject:r.subject,topic:r.topic,level:'easy',reason:r.questions?`${r.accuracy}% accuracy`:'Not practised yet'}));
}
function makePaper(subject,topic,level){
  const pool=BANK_INDEX[`${subject}:${topic}:${level}`]||[];return shuffle(pool).slice(0,20);
}
function makeSmartPaper(s){
  const rec=recommendations(s).slice(0,2);let chosen=[];
  rec.forEach(r=>{const pool=BANK_INDEX[`${r.subject}:${r.topic}:${r.level}`]||[];chosen=chosen.concat(shuffle(pool).slice(0,10));});
  if(chosen.length<20)chosen=shuffle(BANK).slice(0,20);
  return {questions:shuffle(chosen).slice(0,20),label:rec.map(r=>`${SUBJECTS[r.subject].name} • ${TOPIC_NAMES[`${r.subject}:${r.topic}`]}`).join(' + ')||'Mixed practice'};
}
function formatTime(sec){const m=Math.floor(sec/60),s=sec%60;return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;}
function currentPaperLevel(){return state.mode==='smart'?'smart':state.level;}

let state={screen:'home',subject:null,topic:null,level:null,mode:null,paper:[],index:0,selected:null,locked:false,score:0,secondsLeft:0,started:0,timer:null,answers:[],paperLabel:''};
function stats(){return loadStats();}
function render(){
  const app=document.getElementById('app');
  if(!authReady){
    app.innerHTML=`<section class="page authpage"><div class="authcard card"><div class="authicon">⏳</div><h1>Loading Kanak's Practice Zone…</h1><p>Connecting secure cloud sync.</p></div></section>`;
  }else if(!currentUser){
    app.innerHTML=loginView();
  }else{
    app.innerHTML=views[state.screen]();
  }
  const hb=document.getElementById('homeBtn');if(hb)hb.classList.toggle('hidden',!currentUser||state.screen==='home');
}
function home(){
  const s=stats(), rec=recommendations(s), completed=s.papers.length, total=s.papers.reduce((n,p)=>n+p.total,0),correct=s.papers.reduce((n,p)=>n+p.score,0),acc=total?Math.round(correct/total*100):0;
  return `<section class="hero"><div class="herohello">🌈✨ Welcome back, Kanak! ✨🌈</div><div class="emoji">🎒📚💛</div><h1>Ready for your next adventure?</h1><p>Dad built this learning zone just for you. Pick a subject, have fun and show your super-brain what it can do!</p></section>
  <div class="grid">${Object.entries(SUBJECTS).map(([id,x])=>`<button class="card subject" data-subject="${id}"><div class="icon">${x.icon}</div><h2>${x.name}</h2><p>${x.desc}</p></button>`).join('')}</div>
  <div class="dadmessage card"><div class="dadmessageemoji">🧡</div><div><span class="smarttag">A LITTLE NOTE FROM DAD</span><h2>“I built this for you, Kanak.”</h2><p>Every question is a chance to learn something new. Try your best, celebrate your wins and don't worry about mistakes. <b>Dad is cheering for you! 🥰</b></p></div></div>
  <div class="smart card"><div><span class="smarttag">🤖 SMART PRACTICE</span><h2>What should Kanak practise next?</h2><p>${rec[0]?`Based on her progress, the app recommends <b>${esc(TOPIC_NAMES[`${rec[0].subject}:${rec[0].topic}`])}</b> (${esc(rec[0].reason)}).`: 'Complete a paper and the dashboard will start identifying weak areas automatically.'}</p></div><button class="primary" id="smartStart">Start Smart Practice →</button></div>
  <button class="dashbtn secondary" id="dash">📊 Parent Progress Dashboard</button>
  <div class="achievementstrip"><span>🏆 <b>${completed}</b> papers completed</span><span>🧠 <b>${correct}</b> correct answers</span><span>🎯 <b>${acc}%</b> overall accuracy</span><span>☁️ Progress saved</span></div>
  <div class="strip"><span><b>${completed}</b> practice papers completed</span><span>📝 <b>20</b> questions · 🎯 <b>3</b> levels · ⏱️ timed papers · 📚 <b>1,440</b> original questions</span><span>Overall accuracy: <b>${acc}%</b></span></div>`;
}
function subject(){const x=SUBJECTS[state.subject];return `<section class="page"><div class="head"><div><h1>${x.icon} ${x.name} Practice</h1><p>Choose a topic, then Easy, Medium or Hard. Every paper has 20 questions.</p></div></div><div class="topicgrid">${x.topics.map(t=>`<div class="card topic"><h3>${esc(t[1])}</h3><p>${esc(t[2])}</p><div class="levels">${Object.entries(LEVELS).map(([id,l])=>`<button class="level ${l.color}" data-topic="${t[0]}" data-level="${id}">${l.emoji} ${l.name}</button>`).join('')}</div></div>`).join('')}</div><div class="actions"><button class="secondary" id="back">← Home</button><button class="secondary" id="dash2">📊 Progress</button></div></section>`}
function paperView(){const q=state.paper[state.index],l=state.mode==='smart'?LEVELS[q.level]:LEVELS[state.level],elapsed=Math.floor((Date.now()-state.started)/1000),pct=Math.round((state.index/20)*100);return `<section class="page paper"><div class="paperhead"><div><span class="badge">${SUBJECTS[q.subject].icon} ${SUBJECTS[q.subject].name} • ${esc(TOPIC_NAMES[`${q.subject}:${q.topic}`])} • ${l.emoji} ${l.name}</span><h1>Practice Paper</h1>${state.mode==='smart'?`<p class="smartline">🤖 Smart Practice: ${esc(state.paperLabel)}</p>`:''}</div><div class="timer" id="timer">${formatTime(state.secondsLeft)}</div><div class="count">${state.index+1}/20</div></div><div class="progress"><div style="width:${pct}%"></div></div><div class="q"><h2>${esc(q.prompt)}</h2><div class="options">${q.options.map((o,i)=>`<button class="option ${state.selected===i?'selected':''}" data-answer="${i}">${esc(o)}</button>`).join('')}</div>${state.locked?`<div class="feedback ${state.selected===q.answer?'good':'bad'}">${state.selected===q.answer?'✅ Correct! Great job!':'💡 Not quite.'} ${esc(q.explanation)} ${state.selected!==q.answer?`<br><b>Correct answer: ${esc(q.options[q.answer])}</b>`:''}</div>`:''}</div><div class="actions"><button class="secondary" id="exit">Exit Paper</button><button class="primary" id="next">${state.locked?(state.index===19?'Finish 🎉':'Next →'):'Check Answer ✓'}</button></div></section>`}
function result(){const p=Math.round(state.score/20*100);return `<section class="page result"><div class="big">${p>=90?'🏆':p>=75?'🌟':p>=50?'💪':'🌱'}</div><h1>${p>=90?'Fantastic work!':p>=75?'Great job!':'Keep practising!'}</h1><p>${state.mode==='smart'?'Smart Practice is complete. The dashboard has updated her recommendations.':'You completed the practice paper.'}</p><div class="resultgrid"><div class="card stat"><div class="num">${state.score}/20</div><small>Score</small></div><div class="card stat"><div class="num">${p}%</div><small>Accuracy</small></div><div class="card stat"><div class="num">${formatTime(Math.floor((Date.now()-state.started)/1000))}</div><small>Time</small></div></div><div class="actions"><button class="secondary" id="again">↻ Try Again</button><button class="primary" id="dash3">📊 View Progress</button></div></section>`}
function dashboard(){const s=stats(),total=s.papers.reduce((a,p)=>a+p.total,0),correct=s.papers.reduce((a,p)=>a+p.score,0),rec=recommendations(s);return `<section class="page"><div class="head"><div><h1>📊 Kanak's Progress</h1><p>☁️ Progress is securely synced to Kanak's Firebase learning account.</p><div class="accountrow"><span id="cloudStatus">${cloudReady?'☁️ Cloud synced':'Syncing…'}</span><button class="secondary small" id="logout">🚪 Sign out</button></div></div></div><div class="resultgrid"><div class="card stat"><div class="num">${s.papers.length}</div><small>Papers completed</small></div><div class="card stat"><div class="num">${correct}</div><small>Correct answers</small></div><div class="card stat"><div class="num">${total?Math.round(correct/total*100):0}%</div><small>Overall accuracy</small></div></div><div class="card recommend"><h2>🤖 Recommended next</h2><p>The app uses her saved results to find topics that need more practice. Recommendations improve as more papers are completed.</p><div class="recgrid">${rec.map(r=>`<div class="recitem"><div><b>${SUBJECTS[r.subject].icon} ${esc(TOPIC_NAMES[`${r.subject}:${r.topic}`])}</b><small>${esc(SUBJECTS[r.subject].name)} • ${esc(r.reason)}</small></div><button class="primary small" data-recommend-subject="${r.subject}" data-recommend-topic="${r.topic}" data-recommend-level="${r.level}">Practise</button></div>`).join('')}</div><button class="smartbtn" id="smartStart2">🤖 Start Smart Practice</button></div><div class="card dashcard"><h2>Subject performance</h2>${Object.entries(SUBJECTS).map(([id,x])=>{const rows=s.papers.filter(p=>p.subject===id),a=rows.reduce((n,p)=>n+p.total,0),c=rows.reduce((n,p)=>n+p.score,0),p=a?Math.round(c/a*100):0;return `<div class="barrow"><b>${x.icon} ${x.name}</b><div class="bar"><span style="width:${p}%"></span></div><strong>${p}%</strong></div>`}).join('')}</div><div class="card dashcard"><h2>Topic performance</h2>${topicMetrics(s).map(r=>`<div class="topicrow"><span>${SUBJECTS[r.subject].icon} ${esc(r.name)}</span><div class="bar"><span style="width:${r.accuracy}%"></span></div><strong>${r.questions?r.accuracy+'%':'—'}</strong><small>${r.questions} questions</small></div>`).join('')}</div><div class="card dashcard"><h2>Difficulty performance</h2>${Object.entries(LEVELS).map(([id,l])=>`<div class="barrow"><b>${l.emoji} ${l.name}</b><div class="bar"><span style="width:${levelAccuracy(s,id)}%"></span></div><strong>${levelAccuracy(s,id)}%</strong></div>`).join('')}</div><div class="card dashcard"><h2>Recent papers</h2>${s.papers.length?[...s.papers].reverse().slice(0,10).map(p=>`<div class="history"><span>${SUBJECTS[p.subject].icon} ${esc(TOPIC_NAMES[`${p.subject}:${p.topic}`])}</span><span>${esc(p.level)}</span><strong>${p.score}/20</strong><small>${new Date(p.date).toLocaleDateString()}</small></div>`).join(''):'<div class="empty">No papers yet. Start practising to build the dashboard.</div>'}</div><div class="actions"><button class="secondary" id="backhome">← Home</button>${s.papers.length?'<button class="secondary" id="reset">Reset Progress</button>':''}</div></section>`}

const views={home,subject,paper:paperView,result,dashboard};
function startPaper(subject,topic,level){state={...state,screen:'paper',subject,topic,level,mode:'normal',paper:makePaper(subject,topic,level),index:0,selected:null,locked:false,score:0,secondsLeft:LEVELS[level].minutes*60,started:Date.now(),answers:[],paperLabel:''};startTimer();render();}
function startSmart(){clearInterval(state.timer);const s=stats(),sp=makeSmartPaper(s);state={...state,screen:'paper',subject:sp.questions[0].subject,topic:sp.questions[0].topic,level:null,mode:'smart',paper:sp.questions,index:0,selected:null,locked:false,score:0,secondsLeft:12*60,started:Date.now(),answers:[],paperLabel:sp.label};startTimer();render();}
function startTimer(){clearInterval(state.timer);state.timer=setInterval(()=>{state.secondsLeft--;const el=document.getElementById('timer');if(el)el.textContent=formatTime(state.secondsLeft);if(state.secondsLeft<=0){clearInterval(state.timer);state.timer=null;finish(true)}},1000);}
function finish(timeUp=false){
  clearInterval(state.timer);state.timer=null;
  const s=stats();
  const now=new Date().toISOString();
  const paper={
    id:`${currentUser?currentUser.uid:'local'}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    date:now,
    subject:state.mode==='smart'?'mixed':state.subject,
    topic:state.mode==='smart'?'smart':state.topic,
    level:state.mode==='smart'?'smart':state.level,
    score:state.score,total:20,
    time:Math.round((Date.now()-state.started)/1000),
    timeUp,
    answers:state.answers.map(a=>({id:a.id,subject:a.subject,topic:a.topic,level:a.level,correct:a.correct}))
  };
  const updated=rebuildStatsFromPapers([...(s.papers||[]),paper]);
  saveStats(updated);
  state.screen='result';
  render();
}

document.addEventListener('click',e=>{
  if(e.target.closest('#studentLogin')){loginWithStudent();return;}
  if(e.target.closest('#studentCreate')){createStudentAccount();return;}
  if(e.target.closest('#logout')){
    if(confirm('Sign out of Kanak Practice Zone?')){clearInterval(state.timer);signOut(auth);}
    return;
  }
  let b=e.target.closest('[data-subject]');if(b){state.subject=b.dataset.subject;state.screen='subject';render();return;}
  b=e.target.closest('[data-topic][data-level]');if(b){startPaper(state.subject,b.dataset.topic,b.dataset.level);return;}
  b=e.target.closest('[data-recommend-subject]');if(b){startPaper(b.dataset.recommendSubject,b.dataset.recommendTopic,b.dataset.recommendLevel);return;}
  if(e.target.closest('#smartStart,#smartStart2')){startSmart();return;}
  if(e.target.closest('#homeBtn,#back,#backhome')){clearInterval(state.timer);state.screen='home';render();return;}
  if(e.target.closest('#dash,#dash2,#dash3')){clearInterval(state.timer);state.screen='dashboard';render();return;}
  b=e.target.closest('[data-answer]');if(b&&!state.locked){state.selected=Number(b.dataset.answer);render();return;}
  if(e.target.closest('#next')){
    if(state.selected===null){alert('Please choose an answer 😊');return;}
    const q=state.paper[state.index];
    if(!state.locked){state.locked=true;const ok=state.selected===q.answer;if(ok)state.score++;state.answers.push({id:q.id,subject:q.subject,topic:q.topic,level:q.level,correct:ok});render();return;}
    if(state.index===19)finish(false);else{state.index++;state.selected=null;state.locked=false;if(state.mode==='smart'){state.subject=state.paper[state.index].subject;state.topic=state.paper[state.index].topic;}render();}
    return;
  }
  if(e.target.closest('#exit')){if(confirm('Exit this paper? Your current paper will not be saved.')){clearInterval(state.timer);state.screen='subject';render()}return;}
  if(e.target.closest('#again')){state.mode==='smart'?startSmart():startPaper(state.subject,state.topic,state.level);return;}
  if(e.target.closest('#reset')){if(confirm('Reset all of Kanak\'s cloud-saved progress? This cannot be undone.')){const blank=emptyStats();saveStats(blank);render()}return;}
});

// Expose a small diagnostic object for browser-console testing.
window.KanakPractice={bankSize:BANK.length,bankIndex:BANK_INDEX,storageKey:STORAGE_KEY,version:BANK_VERSION,firebaseProject:firebaseConfig.projectId};

onAuthStateChanged(auth,async user=>{
  currentUser=user;
  authReady=true;
  cloudReady=false;
  render();
  if(user){
    await syncCloud();
    render();
  }
});
