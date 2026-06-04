import { BarChart3, ClipboardCheck, Eye, PlusCircle, Save, Wrench, ChevronRight, Check, X, AlertCircle, Info, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const seededSurveys = [
  {
    id: 'mf-301',
    title: 'Pulso de eficiencia en celda robotizada de ensamblaje',
    audience: 'Supervisores de línea y mantenimiento',
    questions: [
      { id: 'q1', type: 'scale', label: 'Nivel de estabilidad del ciclo productivo', options: [] },
      { id: 'q2', type: 'single', label: '¿La programación semanal refleja la capacidad real?', options: ['Sí', 'Parcialmente', 'No'] },
    ],
    responses: 38,
    analytics: 'Promedio 4.2/5 en estabilidad. El 61% indica que la programación es parcialmente consistente con la capacidad real del área.'
  },
  {
    id: 'mf-302',
    title: 'Diagnóstico interno de ergonomía en estaciones de torque final',
    audience: 'Ingeniería de procesos y seguridad',
    questions: [
      { id: 'q1', type: 'multiple', label: 'Factores que generan mayor fatiga', options: ['Altura de herramental', 'Ritmo de lote', 'Giros repetitivos'] },
      { id: 'q2', type: 'text', label: 'Comentario abierto del área', options: [] },
    ],
    responses: 24,
    analytics: 'Los factores con mayor presencia son altura de herramental y giros repetitivos. Se registran 11 comentarios sobre rediseño de soporte lateral.'
  },
];

const emptyQuestion = { label: '', type: 'single', optionsText: '' };

function App() {
  const [surveys, setSurveys] = useState(() => {
    try {
      const saved = localStorage.getItem('mecaflux-surveys');
      return saved ? JSON.parse(saved) : seededSurveys;
    } catch {
      return seededSurveys;
    }
  });
  const [draft, setDraft] = useState(() => {
    try {
      const saved = localStorage.getItem('mecaflux-draft');
      return saved ? JSON.parse(saved) : { title: '', audience: '', questions: [] };
    } catch {
      return { title: '', audience: '', questions: [] };
    }
  });
  const [question, setQuestion] = useState(emptyQuestion);
  const [preview, setPreview] = useState(false);
  const [selectedId, setSelectedId] = useState(seededSurveys[0].id);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    localStorage.setItem('mecaflux-surveys', JSON.stringify(surveys));
  }, [surveys]);

  useEffect(() => {
    localStorage.setItem('mecaflux-draft', JSON.stringify(draft));
  }, [draft]);

  const selected = useMemo(() => surveys.find((survey) => survey.id === selectedId) || surveys[0], [surveys, selectedId]);

  const addQuestion = () => {
    if (!question.label.trim()) {
      setError('Escribe el texto de la pregunta.');
      return;
    }
    const needsOptions = ['single', 'multiple'].includes(question.type);
    const options = question.optionsText.split(',').map((item) => item.trim()).filter(Boolean);
    if (needsOptions && options.length < 2) {
      setError('Las preguntas de opción única o múltiple requieren al menos dos opciones separadas por comas.');
      return;
    }
    setDraft((current) => ({
      ...current,
      questions: [...current.questions, { id: `q-${Date.now()}`, type: question.type, label: question.label.trim(), options }],
    }));
    setQuestion(emptyQuestion);
    setError('');
  };

  const saveSurvey = () => {
    if (!draft.title.trim() || !draft.audience.trim() || draft.questions.length === 0) {
      setError('Completa el título, la audiencia y al menos una pregunta.');
      return;
    }
    const newSurvey = {
      ...draft,
      id: `mf-${Date.now()}`,
      responses: 0,
      analytics: 'Encuesta nueva. Aún no hay respuestas recopiladas en la celda de manufactura.',
    };
    setSurveys((current) => [newSurvey, ...current]);
    setSelectedId(newSurvey.id);
    setDraft({ title: '', audience: '', questions: [] });
    setQuestion(emptyQuestion);
    setPreview(false);
    setError('');
    setSuccessMsg('Encuesta almacenada en la base de telemetría.');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const removeDraftQuestion = (index) => {
    setDraft((current) => ({
      ...current,
      questions: current.questions.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen text-slate-100 selection:bg-fuchsia-500/20 selection:text-fuchsia-300">
      
      {/* CNC GRID HEADER */}
      <header className="border-b border-blue-500/20 bg-slate-950/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-700 to-fuchsia-600 p-2.5 flex items-center justify-center shadow-lg shadow-blue-950/30">
              <Wrench className="h-7 w-7 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-400">MECAFLUX MANUFACTURA</p>
                <span className="text-[9px] tracking-widest font-mono font-bold bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">
                  TELEMETRY SURVEYS
                </span>
              </div>
              <h1 className="text-2xl font-black text-white">Generador de Evaluaciones de Planta</h1>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm shrink-0">
            <CardMetric label="Encuestas" value={surveys.length} />
            <CardMetric label="Preguntas" value={draft.questions.length} />
            <CardMetric label="Respuestas" value={surveys.reduce((sum, item) => sum + item.responses, 0)} />
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE */}
      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1.1fr_1.1fr_0.8fr]">
        
        {/* COLUMN 1: SURVEY BUILDER */}
        <section className="glass rounded-[2rem] p-6 border-white/5 shadow-2xl flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-blue-400">PROCESADOR CNC</p>
                <h2 className="mt-1 text-xl font-black text-white">Configurar Encuesta</h2>
              </div>
              <Wrench className="h-5 w-5 text-blue-400" />
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Título del Cuestionario</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-colors"
                  placeholder="Ej. Pulso ergonómico en torque final"
                  value={draft.title}
                  onChange={(e) => setDraft((current) => ({ ...current, title: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Población Objetivo / Área</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-colors"
                  placeholder="Ej. Técnicos de celda A1"
                  value={draft.audience}
                  onChange={(e) => setDraft((current) => ({ ...current, audience: e.target.value }))}
                />
              </div>
            </div>

            {/* Question Adder Panel */}
            <div className="rounded-2xl border border-white/5 bg-slate-950 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-white/5 pb-2">Insertar Reactivo</p>
              
              <div className="space-y-3">
                <input
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                  placeholder="Texto de la pregunta..."
                  value={question.label}
                  onChange={(e) => setQuestion((current) => ({ ...current, label: e.target.value }))}
                />
                
                <div className="grid gap-2 sm:grid-cols-2">
                  <select
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-350 outline-none focus:border-blue-500"
                    value={question.type}
                    onChange={(e) => setQuestion((current) => ({ ...current, type: e.target.value }))}
                  >
                    <option value="single" className="bg-slate-950">Opción Única</option>
                    <option value="multiple" className="bg-slate-950">Opción Múltiple</option>
                    <option value="scale" className="bg-slate-950">Escala de Satisfacción (1-5)</option>
                    <option value="text" className="bg-slate-950">Texto Abierto</option>
                  </select>
                  
                  {['single', 'multiple'].includes(question.type) && (
                    <input
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                      placeholder="Opciones (separar con comas)"
                      value={question.optionsText}
                      onChange={(e) => setQuestion((current) => ({ ...current, optionsText: e.target.value }))}
                    />
                  )}
                </div>

                <button
                  type="button"
                  onClick={addQuestion}
                  className="w-full rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2.5 text-xs transition flex items-center justify-center gap-1.5 shadow-md hover:shadow-fuchsia-500/20"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Insertar Reactivo</span>
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[10px] font-mono text-fuchsia-400 font-bold flex items-center gap-1">
                <AlertCircle className="h-3 w-3 animate-bounce" />
                {error}
              </p>
            )}

            {/* Added Questions List */}
            <div className="space-y-2 mt-4 max-h-48 overflow-y-auto pr-1">
              <AnimatePresence>
                {draft.questions.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="rounded-xl border border-white/5 bg-slate-950/60 p-3.5 relative group flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/10">
                          {item.type}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">Reactivo {index + 1}</span>
                      </div>
                      <p className="font-bold text-xs text-slate-200 mt-2 leading-normal">{item.label}</p>
                      {item.options.length > 0 && (
                        <p className="mt-1.5 text-[10px] text-slate-500 font-mono">
                          OPC: {item.options.join(' | ')}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDraftQuestion(index)}
                      className="rounded-lg p-1.5 hover:bg-white/5 text-slate-500 hover:text-rose-400 transition"
                      aria-label="Eliminar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-6 flex gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              className="flex-1 rounded-xl border border-blue-500/30 hover:border-blue-500/50 bg-blue-500/5 text-blue-300 hover:text-white font-bold py-2.5 text-xs transition flex items-center justify-center gap-1.5"
              onClick={() => setPreview((current) => !current)}
            >
              <Eye className="h-4 w-4" />
              <span>{preview ? 'Ver Diagnósticos' : 'Ver Previsualización'}</span>
            </button>
            <button
              type="button"
              className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 text-xs transition flex items-center justify-center gap-1.5 shadow-md hover:shadow-blue-500/20"
              onClick={saveSurvey}
            >
              <Save className="h-4 w-4" />
              <span>Guardar Matriz</span>
            </button>
          </div>
        </section>

        {/* COLUMN 2: PREVIEW AND TELEMETRY ANALYTICS */}
        <section className="glass rounded-[2rem] p-6 border-white/5 shadow-2xl flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
              <ClipboardCheck className="h-5 w-5 text-fuchsia-400 animate-pulse" />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-fuchsia-400">TELEMETRÍA E INTERFAZ</span>
                <h2 className="text-xl font-black text-white">Visualizador Técnico</h2>
              </div>
            </div>

            {successMsg && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs text-emerald-300 font-mono flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {preview ? (
                /* PREVIEW BUILDER MODE */
                <motion.div
                  key="preview-screen"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  <div>
                    <h3 className="text-xl font-bold text-white leading-snug">{draft.title || 'Evaluación sin título'}</h3>
                    <p className="text-xs text-slate-400 mt-1">Audiencia: {draft.audience || 'No parametrizada'}</p>
                  </div>

                  {draft.questions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-500 font-mono">
                      Introduce preguntas en la consola izquierda para previsualizar los campos de llenado técnico.
                    </div>
                  ) : (
                    draft.questions.map((item, index) => (
                      <div key={item.id} className="rounded-2xl border border-white/5 bg-slate-900/40 p-4 space-y-3">
                        <p className="text-xs font-bold text-fuchsia-400">{index + 1}. {item.label}</p>
                        
                        {item.type === 'scale' && (
                          <div className="flex justify-between gap-1.5 max-w-xs">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <button key={value} type="button" className="flex-1 rounded-lg border border-white/10 bg-slate-950 py-2.5 text-xs font-mono font-bold hover:border-blue-500 hover:text-blue-300 transition">
                                {value}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {item.type === 'text' && (
                          <textarea rows={2} disabled className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs text-slate-600 resize-none" placeholder="Campo habilitado para respuesta del operario..." />
                        )}
                        
                        {['single', 'multiple'].includes(item.type) && (
                          <div className="space-y-2">
                            {item.options.map((option) => (
                              <div key={option} className="rounded-xl border border-white/5 bg-slate-950 p-3 text-xs text-slate-400 flex items-center gap-2 cursor-pointer hover:border-blue-500/30">
                                <div className="h-3 w-3 rounded-full border border-slate-600 shrink-0" />
                                <span>{option}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </motion.div>
              ) : selected ? (
                /* ANALYTICS PREseeded MODE */
                <motion.div
                  key="analytics-screen"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  <div>
                    <h3 className="text-xl font-bold text-white leading-snug">{selected.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">Grupo objetivo: {selected.audience}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-wider">
                    <span className="rounded bg-blue-500/10 px-2.5 py-1 text-blue-300 border border-blue-500/10">
                      {selected.questions.length} Reactivos
                    </span>
                    <span className="rounded bg-fuchsia-500/10 px-2.5 py-1 text-fuchsia-300 border border-fuchsia-500/10">
                      {selected.responses} Fichas Resueltas
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selected.questions.map((item, index) => (
                      <div key={item.id} className="rounded-2xl border border-white/5 bg-slate-900/40 p-4">
                        <span className="text-[9px] font-mono text-slate-500">Reactivo {index + 1} · {item.type}</span>
                        <p className="font-bold text-xs text-slate-200 mt-1 leading-normal">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* HIGH FIDELITY VISUAL TELEMETRY GAUGE */}
                  <div className="rounded-2xl border border-fuchsia-500/10 bg-fuchsia-500/5 p-4 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-fuchsia-400 border-b border-fuchsia-500/10 pb-2">
                      <BarChart3 className="h-4.5 w-4.5" />
                      <span>Reporte Operativo Automatizado</span>
                    </div>
                    
                    <p className="text-xs leading-relaxed text-slate-300 font-mono">
                      {selected.analytics}
                    </p>

                    {/* FAKE VISUAL CHARTS USING SIMPLE HTML5 GRAPHS */}
                    <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-white/5">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 font-bold uppercase">
                          <span>Índice de Estabilidad</span>
                          <span>84%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full" style={{ width: '84%' }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 font-bold uppercase">
                          <span>Desviación Muestras</span>
                          <span>61%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-gradient-to-r from-fuchsia-600 to-indigo-500 rounded-full" style={{ width: '61%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </section>

        {/* COLUMN 3: CREATED LIST */}
        <aside className="space-y-4">
          <div className="glass rounded-2xl p-4 flex flex-col gap-4 border-white/5">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">HISTORIAL CNC</span>
              <span className="text-[9px] font-mono text-slate-500">{surveys.length} Registros</span>
            </div>
            
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {surveys.map((survey) => (
                <button
                  key={survey.id}
                  onClick={() => { setSelectedId(survey.id); setPreview(false); }}
                  className={`w-full rounded-xl border p-4 text-left transition-all duration-300 relative overflow-hidden group flex flex-col justify-between ${
                    selectedId === survey.id && !preview
                      ? 'border-blue-500 bg-slate-900 shadow-md'
                      : 'border-white/5 bg-slate-950/60 hover:border-blue-500/30'
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-white text-xs group-hover:text-blue-300 transition-colors line-clamp-2 leading-snug">
                      {survey.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1 truncate">{survey.audience}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-slate-500 border-t border-white/5 pt-2 w-full">
                    <span>{survey.questions.length} Reactivos</span>
                    <span className="text-fuchsia-400 font-bold">{survey.responses} Fichas</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

// Subcomponents Helpers
function CardMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-center shrink-0 min-w-[90px] shadow-3xs">
      <div className="text-lg font-black text-white leading-tight font-mono">{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-0.5">{label}</div>
    </div>
  );
}

export default App;
