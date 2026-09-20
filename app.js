const app = document.getElementById('app');
const homeBtn = document.getElementById('homeBtn');

let timerId = null;
let state = {
  subject: null, topic: null, questions: [], index: 0, answers: [], selected: null,
  timeLeft: 600, finished: false
};

const subjects = {
  Maths:{icon:'🔢',desc:'Numbers, shapes & problem solving',topics:{Addition:'Add 2–3 digit numbers',Subtraction:'Subtract with confidence',Multiplication:'Tables & multiplication',Division:'Simple division',Fractions:'Parts of a whole',Time:'Read clocks & solve time problems'}},
  English:{icon:'📘',desc:'Grammar, words & comprehension',topics:{Nouns:'Naming words',Pronouns:'He, she, they & more',Verbs:'Action words',Adjectives:'Describing words',Articles:'A, an & the',Comprehension:'Read & understand'}},
  Hindi:{icon:'🇮🇳',desc:'हिंदी व्याकरण और शब्द',topics:{'मात्राएँ':'सही मात्रा चुनें','विलोम शब्द':'उलटे अर्थ वाले शब्द','लिंग':'पुल्लिंग और स्त्रीलिंग','वचन':'एकवचन और बहुवचन','संज्ञा':'नाम वाले शब्द','क्रिया':'काम बताने वाले शब्द'}},
  EVS:{icon:'🌱',desc:'Our world, science & everyday life',topics:{Plants:'Parts & needs of plants',Animals:'Animals and habitats',Body:'Our body & senses',Food:'Healthy food & nutrition',Earth:'Earth and environment',Safety:'Safety around us'}}
};

const bank = {
  Maths:{
    Addition:[['245 + 132 = ?',['367','377','357','387'],0],['128 + 246 = ?',['364','374','384','354'],2],['305 + 98 = ?',['393','403','413','383'],1]],
    Subtraction:[['500 − 275 = ?',['215','225','235','245'],1],['643 − 121 = ?',['512','522','532','502'],1],['700 − 356 = ?',['334','344','354','364'],1]],
    Multiplication:[['7 × 8 = ?',['54','56','64','48'],1],['9 × 6 = ?',['45','54','63','56'],1],['12 × 4 = ?',['36','48','44','52'],1],['8 × 7 = ?',['48','54','56','64'],2]],
    Division:[['24 ÷ 6 = ?',['3','4','5','6'],1],['35 ÷ 5 = ?',['6','7','8','9'],1],['48 ÷ 8 = ?',['5','6','7','8'],1]],
    Fractions:[['Which fraction means one half?',['1/3','1/2','2/3','1/4'],1],['Which is bigger?',['1/4','1/2','1/8','1/10'],1],['A pizza has 8 equal slices. You eat 2. What fraction did you eat?',['1/2','1/4','2/8','3/8'],1]],
    Time:[['How many minutes are in 1 hour?',['30','45','60','100'],2],['If the time is 3:30, the minute hand points to…',['3','6','9','12'],1],['Quarter past 5 means…',['5:15','5:30','4:45','6:15'],0]]
  },
  English:{
    Nouns:[['Which word is a noun?',['run','beautiful','school','quickly'],2],['Which is a naming word?',['cat','jump','happy','slowly'],0],['Which word names a place?',['Delhi','sing','blue','softly'],0]],
    Pronouns:[['Riya is happy. ___ is smiling.',['He','She','They','It'],1],['Aman and Ravi are friends. ___ play together.',['He','She','They','It'],2],['The dog is hungry. ___ needs food.',['He','They','It','We'],2]],
    Verbs:[['Which is a verb?',['jump','green','teacher','beautiful'],0],['Birds ___ in the sky.',['swim','fly','sleep','read'],1],['We ___ books.',['read','blue','happy','tall'],0]],
    Adjectives:[['Which word describes the flower?',['flower','red','run','quickly'],1],['Choose the adjective: The big elephant walked.',['elephant','walked','big','the'],2],['The mango is sweet. Which word describes mango?',['mango','is','sweet','the'],2]],
    Articles:[['___ apple a day is healthy.',['A','An','The','No article'],1],['I saw ___ dog in the park.',['an','a','are','am'],1],['She has ___ umbrella.',['a','an','thee','is'],1]],
    Comprehension:[['Read: “Mina has a blue kite. She flies it on Sundays.” What color is the kite?',['Red','Green','Blue','Yellow'],2],['Read: “Raj waters the plants every morning.” When does Raj water them?',['Night','Morning','Afternoon','Evening'],1],['Read: “The rabbit eats a carrot.” What does the rabbit eat?',['Apple','Carrot','Grass','Bread'],1]]
  },
  Hindi:{
    'मात्राएँ':[['“किताब” में कौन-सी मात्रा है?',['ा','ि','ी','ु'],1],['“फूल” में कौन-सी मात्रा है?',['ु','ू','े','ै'],1],['“सेब” में कौन-सी मात्रा है?',['े','ै','ो','ौ'],0]],
    'विलोम शब्द':[['“दिन” का विलोम क्या है?',['सुबह','रात','शाम','दोपहर'],1],['“बड़ा” का विलोम क्या है?',['लंबा','मोटा','छोटा','ऊँचा'],2],['“अच्छा” का विलोम क्या है?',['सुंदर','बुरा','मीठा','नया'],1]],
    'लिंग':[['“राजा” का स्त्रीलिंग क्या है?',['रानी','राजी','राजकुमारी','नारी'],0],['“लड़की” का पुल्लिंग क्या है?',['बालिका','लड़का','महिला','माता'],1],['“मोर” का स्त्रीलिंग क्या है?',['मोरनी','मोरी','मोरिया','मोरिका'],0]],
    'वचन':[['“लड़का” का बहुवचन क्या है?',['लड़की','लड़के','लड़कियाँ','लड़कों'],1],['“किताब” का बहुवचन क्या है?',['किताबी','किताबें','किताबों','किताबा'],1],['“फूल” का बहुवचन क्या है?',['फूले','फूलों','फूलें','फूल'],3]],
    'संज्ञा':[['इनमें से संज्ञा कौन-सा है?',['दौड़ना','दिल्ली','सुंदर','धीरे'],1],['“गाय घास खाती है।” संज्ञा कौन-सी है?',['खाती','है','गाय','घास'],2],['कौन-सा शब्द व्यक्ति का नाम है?',['मोहन','चलना','लाल','जल्दी'],0]],
    'क्रिया':[['“राम दौड़ता है।” क्रिया कौन-सी है?',['राम','दौड़ता','है','कोई नहीं'],1],['“सीमा गाना गाती है।” क्रिया क्या है?',['सीमा','गाना','गाती','है'],2],['“बच्चे खेलते हैं।” क्रिया कौन-सी है?',['बच्चे','खेलते','हैं','खेल'],1]]
  },
  EVS:{
    Plants:[['Which part of a plant makes food?',['Root','Stem','Leaf','Flower'],2],['Which part holds a plant in the soil?',['Root','Leaf','Fruit','Flower'],0],['Plants need sunlight, water and…',['Plastic','Air','Toys','Books'],1]],
    Animals:[['Which animal is a herbivore?',['Tiger','Cow','Lion','Eagle'],1],['Where does a fish live?',['Nest','Water','Burrow','Tree'],1],['Which animal gives us wool?',['Sheep','Dog','Cat','Hen'],0]],
    Body:[['Which organ helps us see?',['Ear','Eye','Nose','Hand'],1],['Which sense organ helps us hear?',['Eye','Ear','Tongue','Skin'],1],['We use our nose to…',['See','Hear','Smell','Walk'],2]],
    Food:[['Which is a healthy snack?',['Chips','Fruit','Candy','Soda'],1],['Which food gives us energy?',['Rice','Water only','Salt','Air'],0],['We should drink plenty of…',['Soda','Water','Paint','Oil'],1]],
    Earth:[['Which planet do we live on?',['Mars','Earth','Jupiter','Venus'],1],['The Sun gives us light and…',['Cold','Heat','Rain','Snow'],1],['Which is good for the Earth?',['Planting trees','Littering','Wasting water','Burning plastic'],0]],
    Safety:[['Before crossing a road, we should…',['Run','Look both ways','Close our eyes','Play'],1],['Which number is used for emergency help in India?',['112','123','999','555'],0],['We should wear a helmet when riding a…',['Bicycle','Sofa','Bed','Chair'],0]]
  }
};

function add(q, subject, topic){ bank[subject][topic].push(q); }
function shuffle(a){ return [...a].sort(()=>Math.random()-.5); }

// Expand the question bank so every topic has 15+ questions. Maths uses generated questions;
// the other subjects use curated Class 3 questions.
function expandBank(){
  // Maths: generated, age-appropriate practice.
  for(let i=0;i<15;i++){
    let a=100+((i*37)%800), b=20+((i*29)%300); add([`${a} + ${b} = ?`,[String(a+b),String(a+b+10),String(a+b-10),String(a+b+20)],0],'Maths','Addition');
    let x=300+((i*43)%600), y=20+((i*17)%250); if(y>x)y=20; let ans=x-y; add([`${x} − ${y} = ?`,[String(ans),String(ans+10),String(ans-10),String(ans+20)],0],'Maths','Subtraction');
    let m=2+(i%11), n=2+((i*3)%10), prod=m*n; add([`${m} × ${n} = ?`,[String(prod),String(prod+ m),String(prod-n),String(prod+2)],0],'Maths','Multiplication');
    let d=2+(i%8), q=3+((i*5)%10), dividend=d*q; add([`${dividend} ÷ ${d} = ?`,[String(q),String(q+1),String(q-1),String(d)],0],'Maths','Division');
    let denom=[2,3,4,5,8][i%5], numer=1+(i%(denom-1)); add([[`Which fraction shows ${numer} out of ${denom} equal parts?`][0],[`${numer}/${denom}`,`1/${denom}`,`${denom}/${numer}`,`${numer+1}/${denom}`],0],'Maths','Fractions');
    let h=1+(i%11), min=[0,15,30,45][i%4], correct=`${h}:${String(min).padStart(2,'0')}`; let wrong1=`${h+1}:${String(min).padStart(2,'0')}`, wrong2=`${h}:${String((min+15)%60).padStart(2,'0')}`, wrong3=`${Math.max(1,h-1)}:${String(min).padStart(2,'0')}`; add([`What time is shown by ${h} hour(s) and ${min} minute(s)?`,[correct,wrong1,wrong2,wrong3],0],'Maths','Time');
  }

  const english={
    Nouns:[['Which word is a noun?',['garden','run','quickly','brightly'],0],['Which word names a person?',['teacher','jump','blue','slowly'],0],['Which word names an animal?',['rabbit','soft','run','quickly'],0],['Which word names a thing?',['pencil','write','happy','slowly'],0],['Which is a place?',['school','laugh','green','quickly'],0],['Which word is a naming word?',['river','swim','cold','carefully'],0],['Choose the noun: The bird sings.',['bird','sings','the','quickly'],0],['Choose the noun: The red ball rolls.',['red','ball','rolls','the'],1],['Which is a noun?',['doctor','help','kind','slowly'],0],['Which word names a fruit?',['mango','sweet','eat','quickly'],0]],
    Pronouns:[['___ am ready for school.',['I','He','They','It'],0],['Meena is reading. ___ likes stories.',['He','She','They','We'],1],['Rahul and I are friends. ___ play together.',['We','He','She','It'],0],['The cats are hungry. ___ need food.',['It','He','They','She'],2],['Aarav is my brother. ___ is eight.',['She','He','We','They'],1],['My mother is kind. ___ helps me.',['He','She','It','They'],1],['The book is new. ___ is on the table.',['He','She','It','We'],2],['Sita and Rina are sisters. ___ sing together.',['She','He','They','It'],2],['___ like mangoes.',['I','He','It','She'],0],['The dog is barking. ___ is loud.',['They','It','We','She'],1]],
    Verbs:[['Which word is an action word?',['dance','blue','teacher','happy'],0],['The baby ___ loudly.',['cries','green','soft','small'],0],['Birds ___ nests.',['build','blue','quiet','tall'],0],['We ___ football after school.',['play','round','happy','slowly'],0],['The sun ___ brightly.',['shines','yellow','warm','sky'],0],['I ___ my teeth every morning.',['brush','clean','white','tooth'],0],['Dogs ___ with their tails.',['wag','brown','friendly','small'],0],['She ___ a song.',['sings','pretty','music','soft'],0],['Fish ___ in water.',['swim','wet','blue','small'],0],['We ___ books in class.',['read','paper','quiet','school'],0]],
    Adjectives:[['The elephant is ___.',['big','run','quickly','elephant'],0],['The ice is ___.',['cold','eat','jump','ice'],0],['The rose is ___.',['red','grow','flower','slowly'],0],['The rabbit is ___.',['small','hop','quickly','rabbit'],0],['The mango is ___.',['sweet','eat','fruit','quickly'],0],['She has a ___ dress.',['pretty','wear','dress','quickly'],0],['It is a ___ day.',['sunny','shine','day','outside'],0],['The turtle is ___.',['slow','walk','shell','quietly'],0],['The giraffe is ___.',['tall','run','neck','quickly'],0],['The pillow is ___.',['soft','sleep','bed','quietly'],0]],
    Articles:[['___ orange is juicy.',['An','A','The','Are'],0],['I have ___ pencil.',['a','an','the','am'],0],['She ate ___ ice cream.',['an','a','thee','is'],0],['He saw ___ elephant.',['an','a','are','am'],0],['This is ___ book I told you about.',['the','a','an','are'],0],['I need ___ umbrella.',['an','a','thee','am'],0],['We saw ___ lion at the zoo.',['a','an','are','is'],0],['She is ___ honest girl.',['an','a','the','are'],0],['He has ___ red ball.',['a','an','are','am'],0],['___ sun rises in the east.',['The','A','An','Are'],0]],
    Comprehension:[['Read: “Asha has a red bag. She takes it to school.” What color is the bag?',['Red','Blue','Green','Yellow'],0],['Read: “Tom eats breakfast at 8 o’clock.” When does Tom eat breakfast?',['8 o’clock','10 o’clock','6 o’clock','12 o’clock'],0],['Read: “The little bird sits on a tree.” Where does the bird sit?',['On a tree','In water','In a house','On a road'],0],['Read: “Neha waters the garden every evening.” When does she water it?',['Every evening','Every morning','At noon','At night'],0],['Read: “Sam has two pencils and one eraser.” How many pencils does Sam have?',['Two','One','Three','Four'],0],['Read: “The puppy is sleeping under the table.” Where is the puppy?',['Under the table','On the chair','In the garden','At school'],0],['Read: “Ravi likes mangoes because they are sweet.” Why does Ravi like mangoes?',['They are sweet','They are green','They are sour','They are cold'],0],['Read: “Maya rides her bicycle to the park on Sunday.” How does Maya go to the park?',['By bicycle','By bus','By car','By train'],0],['Read: “The farmer grows wheat in his field.” What does the farmer grow?',['Wheat','Rice','Apples','Flowers'],0],['Read: “A cat drinks milk from a bowl.” What does the cat drink?',['Milk','Water','Juice','Soup'],0]]
  };
  Object.entries(english).forEach(([t,qs])=>bank.English[t].push(...qs));

  const hindi={
    'मात्राएँ':[['“सीता” में कौन-सी मात्रा है?',['ी','ा','ु','े'],0],['“कुल” में कौन-सी मात्रा है?',['ु','ू','ि','े'],0],['“नील” में कौन-सी मात्रा है?',['ी','ि','ु','ो'],0],['“केला” में कौन-सी मात्रा है?',['े','ै','ो','ौ'],0],['“मोर” में कौन-सी मात्रा है?',['ो','ौ','े','ै'],0],['“नदी” में कौन-सी मात्रा है?',['ी','ि','ु','ू'],0],['“कुर्सी” में कौन-सी मात्रा है?',['ु','ू','े','ै'],0],['“गेंद” में कौन-सी मात्रा है?',['े','ै','ि','ो'],0],['“बैग” में कौन-सी मात्रा है?',['ै','े','ो','ौ'],0],['“दूध” में कौन-सी मात्रा है?',['ू','ु','ि','ी'],0]],
    'विलोम शब्द':[['“ऊँचा” का विलोम क्या है?',['नीचा','मोटा','लंबा','मीठा'],0],['“नया” का विलोम क्या है?',['पुराना','अच्छा','सुंदर','बड़ा'],0],['“दिन” का विलोम क्या है?',['रात','सुबह','सूरज','दोपहर'],0],['“सुख” का विलोम क्या है?',['दुःख','हँसी','खुशी','आनंद'],0],['“पास” का विलोम क्या है?',['दूर','ऊपर','नीचे','आगे'],0],['“काला” का विलोम क्या है?',['सफेद','लाल','नीला','हरा'],0],['“भारी” का विलोम क्या है?',['हल्का','मोटा','लंबा','ऊँचा'],0],['“मीठा” का विलोम क्या है?',['कड़वा','खट्टा','नमकीन','गरम'],0],['“आगे” का विलोम क्या है?',['पीछे','ऊपर','पास','दूर'],0],['“सच” का विलोम क्या है?',['झूठ','बात','ज्ञान','शब्द'],0]],
    'लिंग':[['“राजा” का स्त्रीलिंग क्या है?',['रानी','राजा','राजी','राजकुमार'],0],['“पुत्र” का स्त्रीलिंग क्या है?',['पुत्री','बेटा','माता','बहन'],0],['“शेर” का स्त्रीलिंग क्या है?',['शेरनी','हिरनी','गाय','बकरी'],0],['“घोड़ा” का स्त्रीलिंग क्या है?',['घोड़ी','गाय','मादा','घोड़ा'],0],['“नायक” का स्त्रीलिंग क्या है?',['नायिका','नायकनी','नारी','महिला'],0],['“मोर” का स्त्रीलिंग क्या है?',['मोरनी','मोरी','मोरिया','मादा'],0],['“भाई” का स्त्रीलिंग क्या है?',['बहन','माता','बेटी','चाची'],0],['“अध्यापक” का स्त्रीलिंग क्या है?',['अध्यापिका','शिक्षक','छात्रा','माता'],0],['“बकरा” का स्त्रीलिंग क्या है?',['बकरी','गाय','हिरनी','भेड़'],0],['“दादा” का स्त्रीलिंग क्या है?',['दादी','नानी','माँ','बहन'],0]],
    'वचन':[['“लड़का” का बहुवचन क्या है?',['लड़के','लड़की','लड़कियाँ','लड़कों'],0],['“किताब” का बहुवचन क्या है?',['किताबें','किताबों','किताबी','किताबा'],0],['“गाड़ी” का बहुवचन क्या है?',['गाड़ियाँ','गाड़ी','गाड़ियों','गाड़िया'],0],['“बच्चा” का बहुवचन क्या है?',['बच्चे','बच्चियाँ','बच्चों','बच्चा'],0],['“चिड़िया” का बहुवचन क्या है?',['चिड़ियाँ','चिड़िया','चिड़ियों','चिड़ी'],0],['“नदी” का बहुवचन क्या है?',['नदियाँ','नदी','नदियों','नदिया'],0],['“केला” का बहुवचन क्या है?',['केले','केलों','केलियाँ','केला'],0],['“कुर्सी” का बहुवचन क्या है?',['कुर्सियाँ','कुर्सी','कुर्सियों','कुर्सियाँ'],0],['“फूल” का बहुवचन क्या है?',['फूल','फूले','फूलों','फूलें'],0],['“कमरा” का बहुवचन क्या है?',['कमरे','कमरों','कमरियाँ','कमरा'],0]],
    'संज्ञा':[['इनमें से संज्ञा कौन-सा है?',['मेज','दौड़ना','सुंदर','धीरे'],0],['कौन-सा शब्द व्यक्ति का नाम है?',['सीमा','चलना','लाल','जल्दी'],0],['कौन-सा शब्द स्थान का नाम है?',['दिल्ली','खेलना','सुंदर','तेज'],0],['“बगीचे में फूल हैं।” संज्ञा कौन-सा है?',['बगीचा','हैं','सुंदर','धीरे'],0],['“राम आम खाता है।” संज्ञा कौन-कौन से हैं?',['राम और आम','खाता','है','कोई नहीं'],0],['कौन-सा शब्द वस्तु का नाम है?',['किताब','पढ़ना','अच्छा','धीरे'],0],['“गाय घास खाती है।” संज्ञा कौन-सी है?',['गाय','खाती','है','कोई नहीं'],0],['कौन-सा शब्द जानवर का नाम है?',['हाथी','दौड़ना','नीला','जल्दी'],0],['कौन-सा शब्द फल का नाम है?',['सेब','मीठा','खाना','जल्दी'],0],['कौन-सा शब्द व्यक्ति का नाम है?',['मोहन','सुंदर','दौड़ना','धीरे'],0]],
    'क्रिया':[['“राम दौड़ता है।” क्रिया कौन-सी है?',['दौड़ता','राम','है','कोई नहीं'],0],['“सीमा गाना गाती है।” क्रिया क्या है?',['गाती','सीमा','गाना','है'],0],['“बच्चे खेलते हैं।” क्रिया कौन-सी है?',['खेलते','बच्चे','हैं','खेल'],0],['“रीना पढ़ती है।” क्रिया क्या है?',['पढ़ती','रीना','है','किताब'],0],['“पक्षी उड़ता है।” क्रिया कौन-सी है?',['उड़ता','पक्षी','है','आसमान'],0],['“माँ खाना बनाती है।” क्रिया क्या है?',['बनाती','माँ','खाना','है'],0],['“बच्चा हँसता है।” क्रिया कौन-सी है?',['हँसता','बच्चा','है','खुश'],0],['“रवि दौड़ रहा है।” क्रिया क्या है?',['दौड़ रहा','रवि','है','मैदान'],0],['“हम पढ़ते हैं।” क्रिया कौन-सी है?',['पढ़ते','हम','हैं','किताब'],0],['“गाय घास खाती है।” क्रिया क्या है?',['खाती','गाय','घास','है'],0]]
  };
  Object.entries(hindi).forEach(([t,qs])=>bank.Hindi[t].push(...qs));

  const evs={
    Plants:[['Which part absorbs water from the soil?',['Root','Leaf','Flower','Fruit'],0],['Which part carries water to other parts?',['Stem','Flower','Fruit','Seed'],0],['A seed can grow into a…',['Plant','Rock','Toy','Book'],0],['Which part protects the seed in many plants?',['Fruit','Root','Stem','Leaf'],0],['Plants need sunlight to make…',['Food','Shoes','Books','Toys'],0],['Which part is usually green and makes food?',['Leaf','Root','Seed','Bark'],0],['What should we give a plant when the soil is dry?',['Water','Juice','Soda','Paint'],0],['Which is a living plant?',['Rose plant','Chair','Pencil','Ball'],0],['Roots usually grow…',['Under the soil','In the sky','On clouds','Inside a book'],0],['Flowers can help a plant make…',['Seeds','Shoes','Water','Rocks'],0]],
    Animals:[['Which animal is a carnivore?',['Lion','Cow','Goat','Deer'],0],['Which animal is a herbivore?',['Goat','Tiger','Lion','Eagle'],0],['Which animal lives in a kennel?',['Dog','Fish','Horse','Cow'],0],['Which animal can fly?',['Parrot','Elephant','Cow','Dog'],0],['Which animal gives us milk?',['Cow','Tiger','Lion','Monkey'],0],['Which animal lives in water?',['Fish','Cat','Dog','Horse'],0],['Which animal has a trunk?',['Elephant','Rabbit','Goat','Hen'],0],['Which animal gives us eggs?',['Hen','Cow','Dog','Cat'],0],['Where does a bird live?',['Nest','Pond','Stable','Kennel'],0],['Which animal is commonly kept as a pet?',['Dog','Lion','Tiger','Crocodile'],0]],
    Body:[['Which organ helps us think?',['Brain','Hand','Foot','Ear'],0],['Which organ pumps blood around the body?',['Heart','Lung','Eye','Nose'],0],['Which organ helps us breathe?',['Lungs','Ears','Eyes','Teeth'],0],['We use our ears to…',['Hear','See','Taste','Smell'],0],['We use our tongue to…',['Taste','Hear','See','Walk'],0],['Which body part helps us walk?',['Legs','Ears','Nose','Hair'],0],['Which body part protects the brain?',['Skull','Knee','Hand','Foot'],0],['We use our eyes to…',['See','Hear','Taste','Smell'],0],['Which sense organ helps us smell?',['Nose','Ear','Eye','Tongue'],0],['We should brush our teeth to keep them…',['Clean','Dirty','Wet','Cold'],0]],
    Food:[['Which food is a fruit?',['Apple','Rice','Milk','Bread'],0],['Which food is a vegetable?',['Carrot','Cake','Candy','Juice'],0],['Milk is a good source of…',['Calcium','Plastic','Ink','Sand'],0],['Which is a healthy drink?',['Water','Soda','Paint','Oil'],0],['Which meal is important at the start of the day?',['Breakfast','Dinner','Snack','Dessert'],0],['We should wash fruits before…',['Eating them','Throwing them','Drawing them','Sleeping'],0],['Which food gives protein?',['Egg','Candy','Soda','Sugar'],0],['Which is junk food?',['Chips','Apple','Carrot','Milk'],0],['A balanced diet contains…',['Different healthy foods','Only sweets','Only chips','Only juice'],0],['We should eat fruits and vegetables…',['Every day','Never','Once a year','Only at night'],0]],
    Earth:[['What is the name of our planet?',['Earth','Mars','Venus','Jupiter'],0],['The Sun is a…',['Star','Planet','Moon','Cloud'],0],['The Moon moves around the…',['Earth','Sun only','Mars','Jupiter'],0],['Which is a natural source of water?',['Rain','Plastic bottle','Car','Chair'],0],['Which helps reduce pollution?',['Planting trees','Burning plastic','Littering','Wasting fuel'],0],['We should save…',['Water','Litter','Smoke','Plastic waste'],0],['Which is not a planet?',['Sun','Earth','Mars','Venus'],0],['Day and night happen because Earth…',['Rotates','Stops','Melts','Shrinks'],0],['Which is a source of light?',['Sun','Rock','Soil','Chair'],0],['What should we put in a dustbin?',['Waste','Food from the plate?','Clean water','Books we use'],0]],
    Safety:[['We should cross the road at a…',['Zebra crossing','Playground','River','Garden'],0],['Before crossing, we should look…',['Both ways','Only left','Only right','At the sky'],0],['A helmet protects our…',['Head','Foot','Hand','Ear'],0],['We should never play with…',['Fire','Toys','Books','Balls'],0],['In an emergency, we can call…',['112','000','555','111'],0],['We should wear a seat belt in a…',['Car','Bed','Garden','Classroom'],0],['Wet hands should be kept away from…',['Electrical switches','Books','Pencils','Clothes'],0],['We should walk on the…',['Footpath','Middle of road','Railway track','Pond'],0],['If a stranger offers to take you somewhere, you should…',['Tell a trusted adult','Go with them','Hide it','Follow them'],0],['We should keep medicines…',['Away from children','On the floor','In toys','In school bag'],0]]
  };
  Object.entries(evs).forEach(([t,qs])=>bank.EVS[t].push(...qs));
}
expandBank();

function stopTimer(){ if(timerId){ clearInterval(timerId); timerId=null; } }
function formatTime(sec){ return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`; }

const DIFFICULTIES={
  Easy:{minutes:12,icon:'🟢',desc:'Build confidence with simple questions'},
  Medium:{minutes:10,icon:'🟡',desc:'A balanced Class 3 challenge'},
  Hard:{minutes:8,icon:'🔴',desc:'Challenge yourself and think carefully'}
};
const PAPER_SIZE=20;

function ensurePracticePool(){
  // Keep the existing curated questions, then create harmless practice variants by
  // rotating answer choices and rewording the prompt slightly. This gives each topic
  // a larger pool without requiring any external database.
  Object.entries(bank).forEach(([subject,topics])=>{
    Object.entries(topics).forEach(([topic,qs])=>{
      const original=qs.slice();
      let n=0;
      while(qs.length<60){
        const base=original[n%original.length];
        const rotated=[...base[1]];
        const shift=(n%3)+1;
        for(let k=0;k<shift;k++) rotated.push(rotated.shift());
        const correct=rotated.indexOf(base[1][base[2]]);
        const wording = n%2===0 ? base[0] : `Practice question: ${base[0]}`;
        qs.push([wording,rotated,correct]);
        n++;
      }
    });
  });
}
ensurePracticePool();

function difficultyForQuestion(subject,topic,q,index){
  if(subject==='Maths'){
    const text=q[0];
    const nums=(text.match(/\d+/g)||[]).map(Number);
    if(topic==='Multiplication'){
      const product=(nums[0]||0)*(nums[1]||0);
      return product<=50?'Easy':product<=100?'Medium':'Hard';
    }
    if(topic==='Division'){
      const dividend=nums[0]||0, divisor=nums[1]||1, quotient=dividend/divisor;
      return quotient<=6 && divisor<=5?'Easy':quotient<=12?'Medium':'Hard';
    }
    if(topic==='Fractions'){
      const denom=nums[1]||0;
      return denom<=4?'Easy':denom<=8?'Medium':'Hard';
    }
    if(topic==='Time') return index%3===0?'Easy':index%3===1?'Medium':'Hard';
    const max=Math.max(...nums,0);
    return max<=300?'Easy':max<=700?'Medium':'Hard';
  }
  // For language/EVS, distribute the curated bank across levels while keeping
  // every level well populated. Hard questions are mainly the later variants.
  const mod=index%10;
  return mod<4?'Easy':mod<8?'Medium':'Hard';
}

function buildDifficultyPools(){
  const pools={};
  Object.entries(bank).forEach(([subject,topics])=>{
    pools[subject]={};
    Object.entries(topics).forEach(([topic,qs])=>{
      pools[subject][topic]={Easy:[],Medium:[],Hard:[]};
      qs.forEach((q,i)=>{
        let level=difficultyForQuestion(subject,topic,q,i);
        // Keep each level comfortably stocked for a 20-question paper.
        // For non-maths subjects, the curated bank is intentionally balanced.
        if(subject!=='Maths') level=['Easy','Medium','Hard'][i%3];
        pools[subject][topic][level].push(q);
      });
      Object.values(pools[subject][topic]).forEach(arr=>{
        let i=0;
        while(arr.length<20){ arr.push(qs[i%qs.length]); i++; }
      });
    });
  });
  return pools;
}
const questionPools=buildDifficultyPools();

function saveAttempt(score,total,meta){
  const attempts=JSON.parse(localStorage.getItem('practiceHistory')||'[]');
  attempts.push({date:new Date().toISOString(),score,total,percentage:Math.round(score/total*100),...meta});
  localStorage.setItem('practiceHistory',JSON.stringify(attempts.slice(-100)));
}
function getHistory(){return JSON.parse(localStorage.getItem('practiceHistory')||'[]');}
function resetHistory(){
  if(confirm('Clear all practice history? This cannot be undone.')){localStorage.removeItem('practiceHistory'); dashboard();}
}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}

function home(){
  stopTimer();
  state={subject:null,topic:null,difficulty:null,questions:[],index:0,answers:[],selected:null,timeLeft:600,finished:false,startTime:null};
  homeBtn.classList.add('hidden');
  const history=getHistory();
  app.innerHTML=`<section class="hero"><div class="emoji">🎒✨</div><h1>Ready to Learn?</h1><p>Pick a subject and start your Class 3 practice.</p></section>
  <section class="subject-grid">${Object.entries(subjects).map(([s,x])=>`<button class="subject" data-action="subject" data-value="${s}"><div class="icon">${x.icon}</div><h2>${s}</h2><p>${x.desc}</p></button>`).join('')}</section>
  <div class="home-actions"><button class="btn dashboard-btn" data-action="dashboard">📊 Parent Progress Dashboard</button></div>
  <div class="stats"><div><strong>${history.length}</strong><span> practice papers completed</span></div><div>📝 20 questions • 🎯 3 difficulty levels • ⏱️ timed papers</div></div>`;
}

function chooseSubject(s){
  stopTimer(); state.subject=s;
  homeBtn.classList.remove('hidden');
  app.innerHTML=`<div class="panel"><h1>${subjects[s].icon} ${s} Practice</h1><p class="small">Choose a topic, then select Easy, Medium or Hard. Every paper has ${PAPER_SIZE} questions.</p><div class="topic-grid">${Object.entries(subjects[s].topics).map(([t,d])=>`<button class="topic" data-action="topic" data-value=${JSON.stringify(t)}>${t}<small>${d}</small></button>`).join('')}</div><div class="actions"><button class="btn secondary" data-action="home">← Back</button><button class="btn secondary" data-action="dashboard">📊 Progress</button></div></div>`;
}

function chooseDifficulty(topic){
  state.topic=topic;
  app.innerHTML=`<div class="panel"><div class="pill">${subjects[state.subject].icon} ${state.subject} • ${topic}</div><h1>Choose Your Challenge</h1><p class="small">You will get ${PAPER_SIZE} questions. The timer changes with difficulty.</p><div class="difficulty-grid">${Object.entries(DIFFICULTIES).map(([d,x])=>`<button class="difficulty ${d.toLowerCase()}" data-action="start" data-topic=${JSON.stringify(topic)} data-difficulty=${JSON.stringify(d)}><span>${x.icon}</span><strong>${d}</strong><small>${x.desc}</small><em>${x.minutes} minutes</em></button>`).join('')}</div><div class="actions"><button class="btn secondary" data-action="subject" data-value="${state.subject}">← Topics</button></div></div>`;
}

function start(topic,difficulty='Medium'){
  stopTimer();
  state.topic=topic; state.difficulty=difficulty;
  const pool=questionPools[state.subject][topic][difficulty];
  state.questions=shuffle(pool).slice(0,PAPER_SIZE);
  state.index=0; state.answers=[]; state.selected=null; state.timeLeft=DIFFICULTIES[difficulty].minutes*60; state.finished=false; state.startTime=Date.now();
  renderQuestion(); startTimer();
}

function startTimer(){
  stopTimer();
  timerId=setInterval(()=>{
    if(state.finished) return stopTimer();
    state.timeLeft--;
    const el=document.getElementById('timer');
    if(el){el.textContent=formatTime(state.timeLeft);el.classList.toggle('danger',state.timeLeft<=60);}
    if(state.timeLeft<=0){state.timeLeft=0;stopTimer();finish(true);}
  },1000);
}

function renderQuestion(){
  const q=state.questions[state.index];
  const pct=(state.index/state.questions.length)*100;
  app.innerHTML=`<div class="panel"><div class="paper-head"><div><div class="pill">${subjects[state.subject].icon} ${state.subject} • ${state.topic} • ${DIFFICULTIES[state.difficulty].icon} ${state.difficulty}</div><h1>Practice Paper</h1></div><div class="paper-meta"><div class="timer" id="timer">${formatTime(state.timeLeft)}</div><strong>${state.index+1} / ${state.questions.length}</strong></div></div><div class="progress"><div style="width:${pct}%"></div></div><div class="question">${q[0]}</div><div class="options">${q[1].map((o,i)=>`<button class="option" data-action="option" data-index="${i}" id="opt${i}">${o}</button>`).join('')}</div><div class="actions"><button class="btn secondary" data-action="subject" data-value="${state.subject}">Exit Paper</button><button class="btn primary" data-action="next">${state.index===state.questions.length-1?'Finish 🎉':'Next →'}</button></div></div>`;
  if(state.selected!==null) selectOption(state.selected);
}

function selectOption(i){state.selected=i;document.querySelectorAll('.option').forEach((x,n)=>x.classList.toggle('selected',n===i));}
function nextQuestion(){
  if(state.selected===null){
    const selectedEl=document.querySelector('.option.selected');
    if(selectedEl) state.selected=Number(selectedEl.dataset.index);
  }
  if(state.selected===null){alert('Please choose an answer 😊');return;}
  state.answers.push(state.selected);
  if(state.index<state.questions.length-1){state.index++;state.selected=null;renderQuestion();}
  else finish(false);
}
function finish(timeUp){
  if(state.finished)return;
  state.finished=true;stopTimer();
  if(state.selected!==null&&state.answers.length<state.questions.length)state.answers.push(state.selected);
  while(state.answers.length<state.questions.length)state.answers.push(null);
  result(timeUp);
}
function result(timeUp){
  const score=state.questions.reduce((n,q,i)=>n+(state.answers[i]===q[2]?1:0),0);
  saveAttempt(score,state.questions.length,{subject:state.subject,topic:state.topic,difficulty:state.difficulty,timeAllowed:DIFFICULTIES[state.difficulty].minutes*60,timeUsed:DIFFICULTIES[state.difficulty].minutes*60-state.timeLeft});
  const stars=score===PAPER_SIZE?'⭐⭐⭐⭐⭐':score>=16?'⭐⭐⭐⭐':score>=12?'⭐⭐⭐':score>=8?'⭐⭐':'⭐';
  app.innerHTML=`<div class="panel result"><div style="font-size:55px">${timeUp?'⏰':'🎉'}</div><h1>${timeUp?'Time is up!':'Great job!'}</h1><div class="score">${score}/${state.questions.length}</div><div class="stars">${stars}</div><div class="result-meta"><span>${subjects[state.subject].icon} ${state.subject}</span><span>${state.topic}</span><span>${DIFFICULTIES[state.difficulty].icon} ${state.difficulty}</span></div><p>${timeUp?'Your paper time has ended. Review your answers below.':score===PAPER_SIZE?'Perfect! Amazing work!':score>=16?'Excellent! Keep it up!':score>=12?'Good effort! Practice makes you stronger!':'Nice try! Let’s learn and try again!'}</p><div class="actions"><button class="btn secondary" data-action="subject" data-value="${state.subject}">Try Another Topic</button><button class="btn secondary" data-action="dashboard">📊 View Progress</button><button class="btn primary" data-action="retry" data-topic="${state.topic}" data-difficulty="${state.difficulty}">Try Again 🔄</button></div><div class="review"><h2>Answer Review</h2>${state.questions.map((q,i)=>{let ok=state.answers[i]===q[2];let yours=state.answers[i]===null?'Not answered':q[1][state.answers[i]];return `<div class="review-item ${ok?'correct':'wrong'}"><strong>${i+1}. ${q[0]}</strong><div class="small">Your answer: ${esc(yours)} ${ok?'✓':'• Correct: '+esc(q[1][q[2]])}</div></div>`}).join('')}</div></div>`;
}

function dashboard(){
  stopTimer();homeBtn.classList.remove('hidden');
  const h=getHistory();
  const total=h.length, avg=total?Math.round(h.reduce((a,x)=>a+x.percentage,0)/total):0, best=total?Math.max(...h.map(x=>x.percentage)):0;
  const subjectsSummary=Object.keys(subjects).map(s=>{const a=h.filter(x=>x.subject===s);const av=a.length?Math.round(a.reduce((n,x)=>n+x.percentage,0)/a.length):0;return `<div class="dash-subject"><span>${subjects[s].icon} ${s}</span><strong>${a.length?av+'%':'—'}</strong><div class="bar"><i style="width:${av}%"></i></div><small>${a.length} paper${a.length===1?'':'s'}</small></div>`}).join('');
  const recent=h.slice(-8).reverse();
  const recentHtml=recent.length?recent.map(x=>`<div class="history-row"><div><strong>${subjects[x.subject]?.icon||''} ${esc(x.subject)}</strong><span>${esc(x.topic)} • ${x.difficulty}</span></div><div class="history-score">${x.score}/${x.total}<small>${new Date(x.date).toLocaleDateString()}</small></div></div>`).join(''):`<div class="empty">No practice papers yet. Start a paper and your progress will appear here. 🌟</div>`;
  app.innerHTML=`<div class="panel dashboard"><div class="dashboard-head"><div><div class="pill">👨‍👩‍👧 Parent View</div><h1>📊 Progress Dashboard</h1><p class="small">See how your daughter is improving across practice papers.</p></div><button class="btn secondary" data-action="home">← Practice Home</button></div><div class="metric-grid"><div><span>Total Papers</span><strong>${total}</strong></div><div><span>Average Score</span><strong>${avg}%</strong></div><div><span>Best Score</span><strong>${best}%</strong></div></div><h2>Subject Progress</h2><div class="dash-subjects">${subjectsSummary}</div><h2>Recent Practice</h2><div class="history">${recentHtml}</div><div class="dashboard-actions"><button class="btn secondary" data-action="home">Start Practice</button>${total?'<button class="btn danger-btn" data-action="reset">Clear History</button>':''}</div></div>`;
}

// One click handler for the entire app. It survives innerHTML replacements and is bound only once.
app.addEventListener('click',(event)=>{
  const el=event.target.closest('[data-action]');
  if(!el || !app.contains(el)) return;
  event.preventDefault();
  const action=el.dataset.action;
  try{
    if(action==='subject') chooseSubject(el.dataset.value);
    else if(action==='topic') chooseDifficulty(el.dataset.value);
    else if(action==='dashboard') dashboard();
    else if(action==='home') home();
    else if(action==='start') start(el.dataset.topic,el.dataset.difficulty);
    else if(action==='option') selectOption(Number(el.dataset.index));
    else if(action==='next') nextQuestion();
    else if(action==='reset') resetHistory();
    else if(action==='retry') start(el.dataset.topic,el.dataset.difficulty);
  }catch(err){
    console.error('Practice Zone action failed:',err);
    alert('Something went wrong. Please try again.');
  }
});

homeBtn.addEventListener('click',home);
home();
