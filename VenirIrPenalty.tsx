import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, RotateCcw, ChevronRight, CheckCircle2, 
  XCircle, Info, Star, Timer, Sparkles, 
  Target, Dumbbell, PlayCircle, BookOpen, User,
  CircleDot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

// --- Types ---

interface Challenge {
  text: string;
  options: string[];
  answer: string;
  translation: string;
  reason: string;
}

// --- Data ---

const CHALLENGES: Challenge[] = [
  { text: "Yo ___ a la fiesta ahora.", options: ["voy", "vengo"], answer: "vengo", translation: "Ես հիմա գալիս եմ խնջույքին (երբ խոսակիցը արդեն այնտեղ է):", reason: "Coming to the speaker's location: Venir." },
  { text: "Yo ___ al cine esta tarde.", options: ["voy", "vengo"], answer: "voy", translation: "Ես այսօր երեկոյան կինո եմ գնում:", reason: "Going to a destination: Ir." },
  { text: "Nosotros ___ de Armenia.", options: ["vamos", "venimos"], answer: "venimos", translation: "Մենք գալիս ենք Հայաստանից:", reason: "Origin/Coming from: Venir." },
  { text: "¿___ tú con nosotros al parque?", options: ["Vas", "Vienes"], answer: "Vienes", reason: "Asking if someone is coming with the speaker: Venir.", translation: "Գալի՞ս ես մեզ հետ այգի:" },
  { text: "Ellos ___ a Madrid mañana.", options: ["van", "vienen"], answer: "van", translation: "Նրանք վաղը գնում են Մադրիդ:", reason: "Destination movement: Ir." },
  { text: "Mi amigo ___ a mi casa pronto.", options: ["va", "viene"], answer: "viene", translation: "Ընկերս շուտով գալու է իմ տուն:", reason: "Movement towards speaker: Venir." },
  { text: "Yo ___ a trabajar en bus.", options: ["voy", "vengo"], answer: "voy", translation: "Ես աշխատանքի եմ գնում ավտոբուսով:", reason: "Directional movement: Ir." },
  { text: "Ustedes ___ del aeropuerto.", options: ["van", "vienen"], answer: "vienen", translation: "Դուք գալիս եք օդանավակայանից:", reason: "Returning/Coming from: Venir." }
];

// --- Components ---

const PenaltyStage = ({ ballState, keeperState, feedback }: { ballState: 'ready' | 'shooting', keeperState: 'center' | 'left' | 'right', feedback: 'correct' | 'wrong' | null }) => {
  return (
    <div className="relative w-full h-[400px] mb-8 overflow-hidden rounded-[3rem] bg-emerald-900/10 border-4 border-emerald-500/20" style={{ perspective: '1200px' }}>
      {/* 3D Grass Pitch */}
      <div 
        className="absolute inset-0 bg-emerald-700/30"
        style={{ 
          transform: 'rotateX(55deg) translateY(-30%)',
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.05) 30px, rgba(255,255,255,0.05) 60px)`,
        }}
      >
        {/* Goal Frame */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[280px] h-[140px] border-x-8 border-t-8 border-white/60 rounded-t-lg">
           <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
           {/* Net lines */}
           <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '10px 10px', opacity: 0.1 }} />
        </div>

        {/* Ernesto the Keeper */}
        <motion.div 
          animate={{ 
            x: keeperState === 'left' ? -90 : keeperState === 'right' ? 90 : 0,
            y: keeperState !== 'center' ? -20 : 0,
            rotate: keeperState === 'left' ? -45 : keeperState === 'right' ? 45 : 0
          }}
          className="absolute top-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
        >
          <div className="relative">
             <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/20">
                <User size={32} className="text-white" />
             </div>
             <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 px-3 py-1 rounded-full border border-blue-500 whitespace-nowrap">
                <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Էրնեստո</span>
             </div>
          </div>
          <div className="w-20 h-5 bg-black/30 blur-md rounded-full mt-2" />
        </motion.div>

        {/* Ball */}
        <motion.div 
          animate={ballState === 'shooting' ? { 
            y: -180,
            x: feedback === 'correct' ? (Math.random() > 0.5 ? -100 : 100) : 0,
            scale: 0.4,
            rotate: 720
          } : { 
            y: 0, 
            x: 0, 
            scale: 1,
            rotate: 0 
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 border-slate-300">
             <CircleDot size={20} className="text-slate-800" />
          </div>
          <div className="w-16 h-4 bg-black/50 blur-lg rounded-full mt-2" />
        </motion.div>
      </div>
      
      {/* Spot */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/20 rounded-full blur-[2px]" />
    </div>
  );
};

export default function VenirIrPenalty() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'end'>('start');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [goals, setGoals] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [ballState, setBallState] = useState<'ready' | 'shooting'>('ready');
  const [keeperState, setKeeperState] = useState<'center' | 'left' | 'right'>('center');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [shuffledChallenges, setShuffledChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    setShuffledChallenges([...CHALLENGES].sort(() => Math.random() - 0.5));
  }, [gameState]);

  const handleAnswer = (option: string) => {
    const isCorrect = option === shuffledChallenges[currentIdx].answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setBallState('shooting');
    setAttempts(a => a + 1);

    if (isCorrect) {
      // Ernesto dives the wrong way or reacts late
      setKeeperState(Math.random() > 0.5 ? 'left' : 'right');
      setGoals(g => g + 1);
    } else {
      // Ernesto stays center or dives correctly to block
      setKeeperState('center');
    }

    setTimeout(() => {
      if (currentIdx + 1 >= shuffledChallenges.length || goals + (isCorrect ? 1 : 0) >= 10) {
         setGameState('end');
         confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      } else {
        setBallState('ready');
        setKeeperState('center');
        setFeedback(null);
        setCurrentIdx(i => i + 1);
      }
    }, 2000);
  };

  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-12">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
           <div className="relative">
              <CircleDot size={140} className="text-white mx-auto animate-bounce drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]" />
              <Target className="absolute -top-4 -right-4 text-emerald-500 animate-spin" size={48} />
           </div>
           
           <div className="space-y-2">
              <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
                 VENIR VS <span className="text-emerald-500">IR</span>
              </h1>
              <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-xs">Պենալտի Սերիա: Էրնեստոյի Դեմ</p>
           </div>

           <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 text-sm max-w-sm mx-auto text-left space-y-4">
              <div className="flex gap-3">
                 <Info size={18} className="text-emerald-500 shrink-0" />
                 <p><span className="font-bold text-white">Ir:</span> Գնալ (շարժում դեպի հեռու):</p>
              </div>
              <div className="flex gap-3">
                 <Info size={18} className="text-emerald-500 shrink-0" />
                 <p><span className="font-bold text-white">Venir:</span> Գալ (շարժում դեպի խոսողը):</p>
              </div>
           </div>

           <button 
             onClick={() => setGameState('playing')}
             className="px-16 py-8 bg-emerald-600 rounded-[2.5rem] font-black text-3xl uppercase tracking-widest shadow-2xl shadow-emerald-500/20 hover:scale-105 transition-transform active:scale-95"
           >
             ՍԿՍԵԼ ԽԱՂԸ
           </button>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'end') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center space-y-12">
        <div className="bg-emerald-500/20 p-12 rounded-full border-4 border-emerald-500 animate-bounce shadow-[0_0_50px_rgba(16,185,129,0.3)]">
           <Trophy size={160} className="text-yellow-400" />
        </div>
        <div className="space-y-4">
           <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter">ԱՎԱՐՏ!</h1>
           <p className="text-2xl font-bold text-emerald-400 italic">Քո արդյունքը: {goals} / {attempts}</p>
        </div>
        <button 
          onClick={() => { setGoals(0); setAttempts(0); setGameState('start'); }}
          className="px-12 py-6 bg-slate-900 border-2 border-slate-800 rounded-full font-black text-xl uppercase tracking-widest hover:border-emerald-500 transition-all"
        >
          <RotateCcw className="inline mr-2" /> ՆՈՐԻՑ ԽԱՂԱԼ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full">
        
        {/* Scoreboard */}
        <div className="flex justify-between items-center bg-slate-900/90 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl mb-8">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                 <User size={24} />
              </div>
              <div className="text-left">
                 <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">ԴՈՒ</div>
                 <div className="font-black italic uppercase">Հարձակվող</div>
              </div>
           </div>

           <div className="flex flex-col items-center">
              <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">ԳՈԼԵՐ</div>
              <div className="text-4xl font-black italic text-emerald-400">{goals}</div>
           </div>

           <div className="flex items-center gap-4">
              <div className="text-right">
                 <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">ԷՐՆԵՍՏՈ</div>
                 <div className="font-black italic uppercase text-blue-400">Դարպասապահ</div>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                 <User size={24} />
              </div>
           </div>
        </div>

        {/* 3D Penalty Area */}
        <PenaltyStage ballState={ballState} keeperState={keeperState} feedback={feedback} />

        {/* Question Panel */}
        <AnimatePresence mode="wait">
          {!feedback && shuffledChallenges[currentIdx] && (
            <motion.div 
               key={currentIdx}
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.1 }}
               className="bg-slate-900/80 border border-slate-800 rounded-[3rem] p-8 md:p-12 text-center space-y-8 backdrop-blur-xl shadow-2xl"
            >
               <div className="space-y-4">
                  <div className="bg-emerald-500/10 inline-block px-4 py-1 rounded-full text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                     ՀԱՐՑ {currentIdx + 1}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-tight">
                    {shuffledChallenges[currentIdx].text.split('___').map((part, i) => (
                       <React.Fragment key={i}>
                         {part}{i === 0 && <span className="text-emerald-500 underline decoration-emerald-500/30 decoration-4 underline-offset-8"> ___ </span>}
                       </React.Fragment>
                    ))}
                  </h2>
                  <p className="text-slate-500 font-bold italic">({shuffledChallenges[currentIdx].translation})</p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  {shuffledChallenges[currentIdx].options.map(opt => (
                    <button 
                      key={opt}
                      onClick={() => handleAnswer(opt)}
                      className="px-8 py-6 bg-slate-950 border-4 border-slate-900 rounded-3xl font-black text-3xl uppercase tracking-tighter hover:border-emerald-500 transition-all hover:scale-105 active:scale-95 shadow-xl"
                    >
                      {opt}
                    </button>
                  ))}
               </div>
            </motion.div>
          )}

          {feedback && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-12 rounded-[3rem] text-center space-y-4 border-4 ${feedback === 'correct' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}
            >
               <div className={`text-7xl font-black italic uppercase tracking-tighter ${feedback === 'correct' ? 'text-emerald-400' : 'text-rose-500'}`}>
                  {feedback === 'correct' ? 'ԳՈՈՈԼ!' : 'ԷՐՆԵՍՏՈՆ ԲՌՆԵՑ!'}
               </div>
               <p className="text-slate-400 font-bold italic max-w-sm mx-auto">
                 {shuffledChallenges[currentIdx].reason}
               </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tip */}
        <div className="mt-8 flex items-center justify-center gap-3 text-slate-500 italic text-[10px] font-black uppercase tracking-widest opacity-60">
           <Sparkles size={14} className="text-emerald-500" />
           Ճիշտ պատասխանիր՝ Էրնեստոյին հաղթելու համար:
        </div>

      </div>
    </div>
  );
}
