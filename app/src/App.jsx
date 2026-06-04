import { BarChart3, ClipboardCheck, Eye, PlusCircle, Save, Wrench, ChevronRight, Check, X, AlertCircle, Info, Sparkles, Database, ArrowRight, Users } from 'lucide-react';
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
  const [activeStep, setActiveStep] = useState(1); // 1 = Crear, 2 = Vista Previa, 3 = Telemetría
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
      setError('Completa el título, la audiencia y al menos una pregunta antes de guardar.');
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
    setError('');
    setActiveStep(3); // Switch to Results tab automatically
    setSuccessMsg('Encuesta almacenada en la base de telemetría.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const removeDraftQuestion = (index) => {
    setDraft((current) => ({
      ...current,
      questions: current.questions.filter((_, i) => i !== index),
    }));
  };



  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-gray-900 selection:bg-teal-500/20 selection:text-teal-900">
      
      {/* ═══════════ PURPLE GRADIENT BANNER HEADER ═══════════ */}
      <header className="bg-gradient-to-r from-[#4a148c] to-[#311b92] text-white py-6 shadow-md">
        <div className="mx-auto max-w-5xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 select-none">
            <svg viewBox="0 0 24 24" style={{ width: 32, height: 32 }} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400">
              {/* Fluid vortex / pipe flow isotype */}
              <circle cx="12" cy="12" r="10" stroke="rgba(20, 184, 166, 0.2)" />
              <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12S6.5 2 12 2" stroke="#009688" />
              <path d="M12 6a6 6 0 0 1 6 6c0 3.3-2.7 6-6 6s-6-2.7-6-6s2.7-6 6-6" stroke="#009688" strokeDasharray="2 2" />
              <path d="M12 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4" fill="currentColor" stroke="none" />
            </svg>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-widest text-white uppercase" style={{ lineHeight: 1 }}>
                  MECAFLUX
                </span>
                <span style={{ fontSize: 8, fontWeight: 700, tracking: '0.12em', background: '#009688', color: '#fff', padding: '2px 6px', borderRadius: 2 }}>
                  FLUIDOS
                </span>
              </div>
              <p className="text-[10px] text-teal-300 font-sans mt-1" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Sistemas Hidráulicos y Control de Procesos
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 text-xs font-mono bg-black/20 px-4 py-2 rounded-lg">
            <span>Matriz: {surveys.length} Habilitadas</span>
            <span>•</span>
            <span>Respuestas: {surveys.reduce((sum, item) => sum + item.responses, 0)}</span>
          </div>
        </div>
      </header>

      {/* ═══════════ HORIZONTAL STEPPER WIZARD ═══════════ */}
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="stepper-container">
          <div className="stepper-line">
            <div 
              className="stepper-line-fill" 
              style={{ width: activeStep === 1 ? '0%' : activeStep === 2 ? '50%' : '100%' }}
            />
          </div>

          <button 
            onClick={() => setActiveStep(1)}
            className={`step-node focus:outline-none ${activeStep === 1 ? 'active' : activeStep > 1 ? 'completed' : ''}`}
          >
            <div className="step-circle">1</div>
            <span className="step-label">Configurar</span>
          </button>

          <button 
            onClick={() => setActiveStep(2)}
            className={`step-node focus:outline-none ${activeStep === 2 ? 'active' : activeStep > 2 ? 'completed' : ''}`}
          >
            <div className="step-circle">2</div>
            <span className="step-label">Previsualizar</span>
          </button>

          <button 
            onClick={() => setActiveStep(3)}
            className={`step-node focus:outline-none ${activeStep === 3 ? 'active' : ''}`}
          >
            <div className="step-circle">3</div>
            <span className="step-label">Resultados</span>
          </button>
        </div>
      </div>

      {/* ═══════════ STEP WIZARD PANELS ═══════════ */}
      <main className="mx-auto max-w-5xl px-6">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: CONFIGURE/CREATE SURVEY */}
          {activeStep === 1 && (
            <motion.div
              key="step-create"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]"
            >
              
              {/* Left Form Card */}
              <div className="bg-white p-6 rounded-lg elevation-2dp border border-gray-200 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-[#4a148c] uppercase tracking-wider">
                    Estructura del Cuestionario
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Configura el título, destinatarios y preguntas de planta.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 uppercase block tracking-wider">
                      Título de la Encuesta
                    </label>
                    <input
                      className="input-material"
                      placeholder="Ej. Pulso ergonómico en torque final"
                      value={draft.title}
                      onChange={(e) => setDraft((current) => ({ ...current, title: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 uppercase block tracking-wider">
                      Área o Población Destino
                    </label>
                    <input
                      className="input-material"
                      placeholder="Ej. Operarios de celda de torque"
                      value={draft.audience}
                      onChange={(e) => setDraft((current) => ({ ...current, audience: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Add question box */}
                <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg space-y-4">
                  <h3 className="text-xs font-bold text-[#4a148c] uppercase tracking-wide">
                    Añadir Pregunta
                  </h3>

                  <div className="space-y-3">
                    <input
                      className="w-full input-material"
                      placeholder="Texto de la pregunta..."
                      value={question.label}
                      onChange={(e) => setQuestion((current) => ({ ...current, label: e.target.value }))}
                    />
                    
                    <div className="grid gap-3 sm:grid-cols-2">
                      <select
                        className="input-material py-2 text-xs"
                        value={question.type}
                        onChange={(e) => setQuestion((current) => ({ ...current, type: e.target.value }))}
                      >
                        <option value="single">Selección Única</option>
                        <option value="multiple">Selección Múltiple</option>
                        <option value="scale">Escala de Satisfacción (1-5)</option>
                        <option value="text">Respuesta Abierta</option>
                      </select>

                      {['single', 'multiple'].includes(question.type) && (
                        <input
                          className="input-material text-xs"
                          placeholder="Opciones (separa con comas)"
                          value={question.optionsText}
                          onChange={(e) => setQuestion((current) => ({ ...current, optionsText: e.target.value }))}
                        />
                      )}
                    </div>

                    {error && (
                      <div className="text-xs text-red-600 font-bold flex items-center gap-1.5">
                        <AlertCircle size={14} />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={addQuestion}
                      className="w-full bg-[#009688] hover:bg-[#00796b] text-white py-2 rounded-md font-bold text-xs transition uppercase tracking-wider"
                    >
                      Añadir Pregunta
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Draft Summary Card */}
              <div className="bg-white p-6 rounded-lg elevation-2dp border border-gray-200 flex flex-col justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#4a148c] uppercase tracking-wider mb-4">
                    Reactivos Diseñados
                  </h2>
                  
                  {draft.questions.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-xs font-mono">
                      No hay preguntas añadidas en esta encuesta.
                    </div>
                  ) : (
                    <div className="space-y-2 overflow-y-auto max-h-[300px]">
                      {draft.questions.map((item, idx) => (
                        <div key={item.id} className="border border-gray-200 p-3 rounded-md flex justify-between items-start gap-2 bg-gray-50">
                          <div>
                            <span className="text-[8px] font-bold font-mono px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded">
                              {item.type.toUpperCase()}
                            </span>
                            <p className="text-xs font-bold text-gray-900 mt-2">{idx + 1}. {item.label}</p>
                            {item.options.length > 0 && (
                              <p className="text-[9px] text-gray-500 mt-1 font-mono">
                                OPC: {item.options.join(', ')}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeDraftQuestion(idx)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            aria-label="Quitar pregunta"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200 flex gap-2">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="w-1/2 btn-news btn-news-outline py-2.5 text-xs text-[#009688] border-[#009688] hover:bg-[#e0f2f1]"
                  >
                    Ver Vista Previa
                  </button>
                  <button
                    onClick={saveSurvey}
                    className="w-1/2 bg-[#4a148c] hover:bg-[#311b92] text-white py-2.5 rounded-md font-bold text-xs uppercase tracking-wider shadow-sm"
                  >
                    Guardar Encuesta
                  </button>
                </div>
              </div>

            </motion.div>
          )}

          {/* STEP 2: SURVEY PREVIEW CARD */}
          {activeStep === 2 && (
            <motion.div
              key="step-preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              
              {/* Form card mock */}
              <div className="bg-white rounded-lg border-t-8 border-[#4a148c] elevation-4dp p-6 space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  {draft.title || 'Evaluación sin título'}
                </h2>
                <p className="text-sm text-gray-600">
                  Población de estudio: <span className="font-semibold">{draft.audience || 'No especificada'}</span>
                </p>
                <div className="border-b border-gray-200 pb-2 text-[10px] text-gray-400 font-mono">
                  Matriz de Control Técnico de Planta Mecaflux
                </div>
              </div>

              {draft.questions.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-lg elevation-2dp text-gray-400 font-mono text-xs border border-gray-200">
                  Vuelve al paso 1 para añadir reactivos a tu formulario de diseño.
                </div>
              ) : (
                draft.questions.map((item, idx) => (
                  <div key={item.id} className="bg-white p-6 rounded-lg elevation-2dp border border-gray-200 space-y-3">
                    <p className="text-sm font-bold text-gray-900">{idx + 1}. {item.label}</p>
                    
                    {item.type === 'scale' && (
                      <div className="flex justify-between gap-1 max-w-sm">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button key={val} className="flex-1 border border-gray-300 py-2 text-xs font-bold font-mono hover:bg-teal-50 hover:border-teal-500 rounded">
                            {val}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {item.type === 'text' && (
                      <textarea
                        rows={2}
                        className="w-full border border-gray-200 p-2.5 text-xs rounded outline-none focus:border-teal-500 resize-none bg-gray-50"
                        placeholder="Escribe tu respuesta aquí..."
                        disabled
                      />
                    )}
                    
                    {['single', 'multiple'].includes(item.type) && (
                      <div className="space-y-2">
                        {item.options.map((opt) => (
                          <label key={opt} className="flex items-center gap-2 p-2 border border-gray-150 rounded hover:bg-gray-50 cursor-pointer text-xs text-gray-700">
                            <input 
                              type={item.type === 'single' ? 'radio' : 'checkbox'} 
                              name={item.id} 
                              className="text-teal-600 focus:ring-teal-500" 
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setActiveStep(1)}
                  className="bg-white border border-gray-300 px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-100"
                >
                  Volver al Editor
                </button>
                <button
                  onClick={saveSurvey}
                  disabled={draft.questions.length === 0}
                  className="bg-[#009688] hover:bg-[#00796b] text-white px-8 py-2.5 rounded text-xs font-bold uppercase tracking-wider shadow-sm disabled:opacity-50"
                >
                  Guardar Formulario
                </button>
              </div>

            </motion.div>
          )}

          {/* STEP 3: ANALYTICS & RESULTS FEED */}
          {activeStep === 3 && (
            <motion.div
              key="step-results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6 md:grid-cols-[0.8fr_1.2fr]"
            >
              
              {/* Left historical selector */}
              <div className="bg-white p-4 rounded-lg elevation-2dp border border-gray-200 space-y-4">
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Historial de Formularios</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Encuestas activas en planta</p>
                </div>

                {successMsg && (
                  <div className="bg-green-50 border border-green-300 p-3 text-[10px] text-green-800 font-mono rounded flex items-center gap-2">
                    <Check size={14} className="text-green-600" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {surveys.map((survey) => (
                    <button
                      key={survey.id}
                      onClick={() => setSelectedId(survey.id)}
                      className={`w-full text-left p-3.5 border rounded transition-all flex flex-col justify-between ${
                        selectedId === survey.id
                          ? 'border-[#4a148c] bg-purple-50/50 ring-1 ring-[#4a148c]'
                          : 'border-gray-200 hover:bg-gray-50 bg-white'
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-gray-900 text-xs line-clamp-2 leading-tight">
                          {survey.title}
                        </h4>
                        <p className="text-[9px] text-gray-500 mt-1 truncate">Grupo: {survey.audience}</p>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-gray-400 border-t border-gray-150 pt-2 w-full">
                        <span>{survey.questions.length} Reactivos</span>
                        <span className="text-[#009688] font-bold">{survey.responses} Fichas</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right analytics board */}
              <div className="bg-white p-6 rounded-lg elevation-2dp border border-gray-200 space-y-6">
                
                {selected ? (
                  <>
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="px-2 py-0.5 bg-teal-100 text-teal-800 border border-teal-300 text-[8px] font-bold uppercase tracking-wider font-mono">
                          ID MATRIX // {selected.id}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">{selected.responses} Evaluaciones Recopiladas</span>
                      </div>
                      <h2 className="mt-2 text-xl font-bold text-gray-900 font-sans leading-snug">
                        {selected.title}
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">Población objetivo: {selected.audience}</p>
                    </div>

                    {/* Display of survey questions list */}
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Estructura del Formulario</h4>
                      <div className="space-y-2">
                        {selected.questions.map((item, idx) => (
                          <div key={item.id} className="border border-gray-150 p-3 rounded bg-[#fafafa] flex items-center justify-between text-xs">
                            <span className="font-bold text-gray-800">{idx + 1}. {item.label}</span>
                            <span className="text-[8px] font-mono font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                              {item.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Telemetry charts */}
                    <div className="bg-[#fcfaff] border border-purple-200 p-4 rounded-lg space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4a148c] border-b border-purple-100 pb-2">
                        <BarChart3 size={15} />
                        <span>Métricas de Telemetría Mecaflux</span>
                      </div>
                      
                      <p className="text-xs font-mono text-gray-700 leading-relaxed bg-white p-3 border border-purple-100 rounded">
                        {selected.analytics}
                      </p>

                      <div className="grid gap-4 sm:grid-cols-2 pt-2">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[9px] font-mono text-gray-500 font-bold uppercase">
                            <span>Índice de Estabilidad</span>
                            <span>84%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden p-0.5 border border-gray-300">
                            <div className="h-full bg-gradient-to-r from-purple-800 to-indigo-600 rounded-full" style={{ width: '84%' }} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[9px] font-mono text-gray-500 font-bold uppercase">
                            <span>Desviación en Muestreo</span>
                            <span>61%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden p-0.5 border border-gray-300">
                            <div className="h-full bg-gradient-to-r from-[#009688] to-emerald-400 rounded-full" style={{ width: '61%' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-400 text-xs font-mono">
                    Selecciona una encuesta histórica en la lista para revisar su telemetría.
                  </div>
                )}
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="py-8 text-center text-sm border-t mt-auto bg-white" style={{ borderColor: 'var(--color-divider)' }}>
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500">&copy; {new Date().getFullYear()} Mecaflux Fluidos. Todos los derechos reservados.</p>
          <div className="footer-dev">
            <span>Desarrollado por</span>
            <a href="https://jose-socola-jdss.github.io/blyp/" className="footer-logo-link" aria-label="Ir a Blyp">
              <img src="./blyp_logotipo.svg" alt="Blyp Logo" className="footer-logo" />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}



export default App;
