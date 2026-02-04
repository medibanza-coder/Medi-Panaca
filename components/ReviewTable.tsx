import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Individual, ProcessedData } from '../types';
import { generateGEDCOM } from '../services/gedcomService';

interface ReviewTableProps {
  data: ProcessedData;
  onUpdate: (updatedData: ProcessedData) => void;
  onSave: () => Promise<void>;
  isSaving?: boolean;
}

export const ReviewTable: React.FC<ReviewTableProps> = ({ data, onUpdate, onSave, isSaving }) => {
  const [isListening, setIsListening] = useState<string | null>(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Verificação de segurança robusta
  const individuals = useMemo(() => data?.individuals || [], [data]);
  const sourceFiles = useMemo(() => data?.sourceFiles || [], [data]);

  if (individuals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-[3rem] shadow-xl border border-slate-100 p-12 text-center animate-in fade-in zoom-in-95">
        <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-8 shadow-inner">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-3">Dados não encontrados</h3>
        <p className="text-slate-500 font-medium max-w-sm mb-8">Não foi possível carregar os registros extraídos. Verifique o arquivo original ou tente processar novamente.</p>
        <button onClick={() => window.location.reload()} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">Recarregar Sistema</button>
      </div>
    );
  }

  const updateIndividual = (id: string, field: keyof Individual, value: any) => {
    const updated = individuals.map(ind => ind.id === id ? { ...ind, [field]: value } : ind);
    onUpdate({ ...data, individuals: updated });
  };

  const handleSave = async () => {
    try {
      await onSave();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  const nextFile = () => sourceFiles.length > 0 && setActiveFileIndex((prev) => (prev + 1) % sourceFiles.length);
  const prevFile = () => sourceFiles.length > 0 && setActiveFileIndex((prev) => (prev - 1 + sourceFiles.length) % sourceFiles.length);

  const startVoiceInput = (id: string, field: keyof Individual) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.start();
    setIsListening(`${id}-${field}`);
    recognition.onresult = (event: any) => {
      updateIndividual(id, field, event.results[0][0].transcript);
      setIsListening(null);
    };
    recognition.onerror = () => setIsListening(null);
    recognition.onend = () => setIsListening(null);
  };

  const uniquePages = Array.from(new Set(individuals.map(ind => ind.page || 1)))
    // Fixed TypeScript error: explicitly typing sort parameters to allow arithmetic subtraction
    .sort((a: number, b: number) => a - b);
  
  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden">
      
      {/* LADO ESQUERDO: Visualizador Estático do PDF/Imagem */}
      <aside className="w-[45%] bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden ring-1 ring-slate-100">
        <header className="px-8 py-5 border-b flex justify-between items-center bg-slate-50/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </div>
            <div>
              <h3 className="text-[11px] font-black uppercase text-slate-800 tracking-widest leading-none">Conferência Original</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Pág {activeFileIndex + 1} de {sourceFiles.length}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={prevFile} disabled={sourceFiles.length <= 1} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-90 disabled:opacity-20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={nextFile} disabled={sourceFiles.length <= 1} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-90 disabled:opacity-20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </header>
        <div className="flex-1 bg-slate-100 flex items-center justify-center p-6 overflow-hidden relative group">
          {sourceFiles.length > 0 ? (
            sourceFiles[activeFileIndex].mimeType === 'application/pdf' ? (
              <object
                data={`data:application/pdf;base64,${sourceFiles[activeFileIndex].data}#toolbar=0&navpanes=0&scrollbar=0`}
                type="application/pdf"
                className="w-full h-full rounded-2xl shadow-inner border border-slate-200"
              >
                <iframe src={`data:application/pdf;base64,${sourceFiles[activeFileIndex].data}`} className="w-full h-full rounded-2xl" />
              </object>
            ) : (
              <div className="w-full h-full overflow-auto custom-scrollbar flex items-center justify-center p-4">
                <img 
                  src={`data:${sourceFiles[activeFileIndex].mimeType};base64,${sourceFiles[activeFileIndex].data}`} 
                  className="max-w-none w-full h-auto object-contain drop-shadow-2xl rounded-sm transition-transform duration-300"
                  alt="MZ11 Original"
                />
              </div>
            )
          ) : (
            <div className="flex flex-col items-center opacity-30">
              <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="text-[10px] font-black uppercase tracking-widest">Sem visualização disponível</p>
            </div>
          )}
        </div>
      </aside>

      {/* LADO DIREITO: Editor de Dados MZ11 */}
      <main className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar flex flex-col">
        
        {/* Barra de Ações Fixa */}
        <section className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-[2rem] p-5 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-40 shadow-xl shadow-slate-200/50">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tighter uppercase leading-none">
              {data.metadata?.originalFilename || 'Sessão de Revisão'}
            </h2>
            <div className="flex items-center gap-2 mt-2.5">
              <span className="bg-blue-600 w-2 h-2 rounded-full animate-pulse"></span>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Confira RIN por RIN com o original</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleSave} 
              disabled={isSaving} 
              className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg active:scale-95 ${
                saveSuccess ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
              } disabled:opacity-50`}
            >
              {isSaving ? (
                <><svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Sincronizando</>
              ) : saveSuccess ? (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> Alterações Salvas</>
              ) : 'Finalizar Revisão'}
            </button>
            <button 
              onClick={() => {
                const gedcom = generateGEDCOM(data);
                const blob = new Blob([gedcom], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `MZ11_GED_${Date.now()}.ged`;
                link.click();
              }}
              className="bg-blue-50 text-blue-600 px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100/50"
            >
              Exportar GEDCOM
            </button>
          </div>
        </section>

        {/* Tabelas de Páginas */}
        <div className="space-y-10 pb-12">
          {uniquePages.map((pageNum) => (
            <div key={pageNum} className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-slate-50/80 px-8 py-4 border-b flex items-center gap-4">
                <span className="bg-white text-blue-600 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm font-black text-xs border border-slate-100 ring-4 ring-slate-50">P{pageNum}</span>
                <h3 className="text-[11px] font-black uppercase text-slate-800 tracking-widest">Bloco MZ11 - Registros 01-25</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed">
                  <thead>
                    <tr className="text-[9px] font-black uppercase text-slate-400 tracking-[0.25em] bg-white border-b">
                      <th className="px-6 py-5 w-20 text-center border-r">RIN</th>
                      <th className="px-4 py-5 w-24 text-center text-blue-600">eBuild</th>
                      <th className="px-6 py-5 text-left">Nome do Indivíduo</th>
                      <th className="px-4 py-5 w-16 text-center">Sex</th>
                      <th className="px-8 py-5 text-left border-l bg-slate-50/30">Eventos Vitais</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {individuals
                      .filter(ind => (ind.page || 1) === pageNum)
                      .sort((a, b) => a.rin - b.rin)
                      .map((ind) => (
                        <tr key={ind.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4 text-center text-[11px] font-black text-slate-300 border-r">{ind.rin}</td>
                          <td className="px-4 py-4">
                            <input 
                              type="text" 
                              value={ind.relation || ''} 
                              onChange={e => updateIndividual(ind.id, 'relation', e.target.value.toUpperCase())}
                              className="w-full text-center text-[10px] font-black text-blue-600 border border-transparent focus:border-blue-100 focus:bg-blue-50/50 rounded-lg p-2 uppercase transition-all"
                              placeholder="-"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <input 
                                type="text" 
                                value={ind.fullName || ''} 
                                onChange={e => updateIndividual(ind.id, 'fullName', e.target.value)}
                                className="w-full text-xs font-black text-slate-800 border-none bg-transparent focus:ring-0 p-0 placeholder:text-slate-200"
                                placeholder="Nome Completo..."
                              />
                              <button 
                                onClick={() => startVoiceInput(ind.id, 'fullName')} 
                                className={`p-2 rounded-xl text-slate-200 hover:text-blue-600 hover:bg-blue-50 transition-all ${isListening === `${ind.id}-fullName` ? 'animate-pulse text-blue-600 bg-blue-50 scale-110' : ''}`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <input 
                              type="text" 
                              value={ind.sex || ''} 
                              onChange={e => updateIndividual(ind.id, 'sex', e.target.value.toUpperCase())}
                              className="w-full text-center text-[10px] font-black text-slate-400 border border-transparent focus:border-blue-100 rounded-lg p-1 bg-transparent uppercase"
                              maxLength={1}
                              placeholder="?"
                            />
                          </td>
                          <td className="px-8 py-4 border-l">
                            <div className="grid grid-cols-1 gap-3">
                              <div className="flex items-center gap-3">
                                <span className="text-[8px] font-black text-slate-300 w-6">NASC</span>
                                <input type="text" value={ind.birthDate} onChange={e => updateIndividual(ind.id, 'birthDate', e.target.value)} className="font-bold text-slate-700 p-0 border-none bg-transparent focus:ring-0 text-[11px] w-24" placeholder="Data" />
                                <input type="text" value={ind.birthPlace} onChange={e => updateIndividual(ind.id, 'birthPlace', e.target.value)} className={`p-0 border-none bg-transparent focus:ring-0 text-[11px] flex-1 ${ind.isDitto ? 'text-blue-500 italic' : 'text-slate-400'}`} placeholder="Localidade" />
                              </div>
                              <div className="flex items-center gap-3 opacity-40">
                                <span className="text-[8px] font-black text-slate-300 w-6">ÓBIT</span>
                                <input type="text" value={ind.deathDate} onChange={e => updateIndividual(ind.id, 'deathDate', e.target.value)} className="font-bold text-slate-700 p-0 border-none bg-transparent focus:ring-0 text-[11px] w-24" placeholder="Data" />
                                <input type="text" value={ind.deathPlace} onChange={e => updateIndividual(ind.id, 'deathPlace', e.target.value)} className="text-slate-400 p-0 border-none bg-transparent focus:ring-0 text-[11px] flex-1" placeholder="Localidade" />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};