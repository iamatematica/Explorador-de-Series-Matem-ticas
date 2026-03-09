import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, StepForward, Info, Calculator, Sigma } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Bar
} from 'recharts';
import Chatbot from './components/Chatbot';

type SeriesType = 'harmonic' | 'p-series' | 'geometric';

interface DataPoint {
  n: number;
  term: number;
  sum: number;
}

const SERIES_INFO = {
  harmonic: {
    name: 'Serie Armónica',
    formula: '1/n',
    description: 'Aunque los términos se acercan a 0, la suma total crece sin límite. ¡Es divergente!',
    color: '#ef4444', // red
    calculateTerm: (n: number) => 1 / n,
    limit: null,
  },
  'p-series': {
    name: 'Serie de Basilea',
    formula: '1/n²',
    description: 'Los términos disminuyen lo suficientemente rápido para que la suma total se acerque a un valor fijo (π²/6 ≈ 1.645). ¡Es convergente!',
    color: '#3b82f6', // blue
    calculateTerm: (n: number) => 1 / (n * n),
    limit: Math.PI * Math.PI / 6,
  },
  geometric: {
    name: 'Serie Geométrica',
    formula: '(1/2)ⁿ',
    description: 'Cada término es la mitad del anterior. La suma total se acerca exactamente a 1. ¡Es convergente!',
    color: '#10b981', // green
    calculateTerm: (n: number) => Math.pow(0.5, n),
    limit: 1,
  }
};

export default function App() {
  const [activeSeries, setActiveSeries] = useState<SeriesType>('harmonic');
  const [data, setData] = useState<DataPoint[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(200); // ms per step
  const [maxN, setMaxN] = useState(50); // x-axis max
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const reset = () => {
    setIsPlaying(false);
    setData([]);
  };

  const step = () => {
    setData(prev => {
      const n = prev.length + 1;
      if (n > maxN) {
        setIsPlaying(false);
        return prev;
      }
      const term = SERIES_INFO[activeSeries].calculateTerm(n);
      const sum = (prev.length > 0 ? prev[prev.length - 1].sum : 0) + term;
      return [...prev, { n, term, sum }];
    });
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(step, speed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, activeSeries, maxN]);

  useEffect(() => {
    reset();
  }, [activeSeries, maxN]);

  const currentInfo = SERIES_INFO[activeSeries];
  const currentData = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Sigma className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Explorador de Series Matemáticas</h1>
            <p className="text-sm text-slate-500">Convergencia vs Divergencia</p>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Series Selector */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">1. Selecciona una Serie</h2>
            <div className="space-y-3">
              {Object.entries(SERIES_INFO).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setActiveSeries(key as SeriesType)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    activeSeries === key 
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                      : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className={`font-semibold ${activeSeries === key ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {info.name}
                    </div>
                    <div className={`text-sm font-mono px-2 py-1 rounded-md ${activeSeries === key ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                      Σ {info.formula}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">2. Controles de Animación</h2>
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  isPlaying 
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                }`}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {isPlaying ? 'Pausar' : 'Reproducir'}
              </button>
              <button
                onClick={step}
                disabled={isPlaying || (data.length >= maxN)}
                className="p-2.5 border-2 border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:border-slate-200 text-slate-600 transition-colors"
                title="Paso a paso"
              >
                <StepForward className="w-5 h-5" />
              </button>
              <button
                onClick={reset}
                className="p-2.5 border-2 border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 text-slate-600 transition-colors"
                title="Reiniciar"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="text-slate-600 font-medium">Velocidad de animación</label>
                  <span className="text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">{speed}ms</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="20"
                  value={1020 - speed}
                  onChange={(e) => setSpeed(1020 - parseInt(e.target.value))}
                  className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Lenta</span>
                  <span>Rápida</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="text-slate-600 font-medium">Límite de términos (n)</label>
                  <span className="text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">{maxN}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={maxN}
                  onChange={(e) => setMaxN(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-5 text-blue-900">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2 text-blue-800">¿Qué está pasando?</h3>
                <p className="text-sm leading-relaxed text-blue-800/80">
                  {currentInfo.description}
                </p>
                {activeSeries === 'harmonic' && (
                  <div className="mt-4 bg-white/60 p-3.5 rounded-lg border border-blue-100/50 shadow-sm">
                    <p className="text-sm leading-relaxed text-slate-700">
                      <strong className="text-red-600 block mb-1">💡 Nota del profesor:</strong> 
                      La serie armónica es engañosa. Aunque los términos se hacen cada vez más pequeños (1/100, 1/1000...), no disminuyen lo suficientemente rápido. 
                      <br/><br/>
                      ¡Si sumas infinitos términos, el resultado es infinito! Para llegar a una suma de 10, necesitaríamos más de 12,000 términos.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Chart & Stats */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-center">
              <div className="text-sm text-slate-500 font-medium mb-1">Término actual (n)</div>
              <div className="text-4xl font-bold text-slate-800 font-mono tracking-tight">
                {currentData?.n || 0}
                <span className="text-lg text-slate-400 font-normal ml-1">/ {maxN}</span>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-center">
              <div className="text-sm text-slate-500 font-medium mb-1">Valor del término (aₙ)</div>
              <div className="text-4xl font-bold text-slate-800 font-mono tracking-tight">
                {currentData ? currentData.term.toFixed(4) : '0.0000'}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 opacity-10" style={{ backgroundColor: currentInfo.color, borderRadius: '0 0 0 100%' }}></div>
              <div className="text-sm text-slate-500 font-medium mb-1 relative z-10">Suma Parcial (Sₙ)</div>
              <div className="text-4xl font-bold font-mono tracking-tight relative z-10" style={{ color: currentInfo.color }}>
                {currentData ? currentData.sum.toFixed(4) : '0.0000'}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex-1 min-h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-800">Gráfica de la Serie</h2>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                  <span className="text-slate-600">Término (aₙ)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentInfo.color }}></div>
                  <span className="text-slate-600">Suma Parcial (Sₙ)</span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="n" 
                    type="number"
                    domain={[1, maxN]}
                    label={{ value: 'n (Número de términos)', position: 'bottom', offset: 0 }} 
                    stroke="#64748b"
                    tick={{ fill: '#64748b' }}
                    tickCount={10}
                  />
                  <YAxis 
                    yAxisId="left" 
                    label={{ value: 'Suma Parcial (Sₙ)', angle: -90, position: 'insideLeft', offset: 15 }} 
                    stroke="#64748b"
                    domain={[0, 'auto']}
                    tick={{ fill: '#64748b' }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    label={{ value: 'Término (aₙ)', angle: 90, position: 'insideRight', offset: 5 }} 
                    stroke="#94a3b8"
                    domain={[0, 'auto']}
                    tick={{ fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => value.toFixed(4)}
                    labelFormatter={(label) => `n = ${label}`}
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="term" 
                    name="Término (aₙ)" 
                    fill="#cbd5e1" 
                    radius={[2, 2, 0, 0]} 
                    maxBarSize={20} 
                    animationDuration={300}
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="sum" 
                    name="Suma Parcial (Sₙ)" 
                    stroke={currentInfo.color} 
                    strokeWidth={3} 
                    dot={data.length < 40 ? { r: 4, strokeWidth: 2, fill: '#fff' } : false} 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    animationDuration={300}
                    isAnimationActive={false} // Disable line animation to prevent snake effect on every new point, making it feel more like a growing graph
                  />
                  {currentInfo.limit && (
                    <ReferenceLine 
                      yAxisId="left" 
                      y={currentInfo.limit} 
                      stroke={currentInfo.color} 
                      strokeDasharray="5 5" 
                      strokeOpacity={0.5}
                      label={{ 
                        position: 'top', 
                        value: `Límite: ${currentInfo.limit.toFixed(4)}`, 
                        fill: currentInfo.color, 
                        fontSize: 12,
                        opacity: 0.8
                      }} 
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
      <Chatbot />
    </div>
  );
}
