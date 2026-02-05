
import React, { useState } from 'react';

export const InterviewList = ({ sessions, onSelect, onDelete, onNew }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter(s => 
    s.data.metadata.intervieweeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.data.metadata.interviewId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatus = (session) => {
    const meta = session.data.metadata;
    const hasIssues = !meta.intervieweeName || !meta.interviewPlace || session.data.individuals.length === 0;
    return hasIssues ? 'INCOMPLETO' : 'CONCLUÍDO';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Lista de Entrevistas</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Gerencie e revise os registros MZ11 coletados em campo.</p>
        </div>
        <button 
          onClick={onNew}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all text-xs uppercase tracking-widest flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          Nova Entrevista
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            placeholder="Pesquisar por nome ou ID da entrevista..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {sessions.length} Total
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100 text-left">
          <thead className="bg-slate-50">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5">ID</th>
              <th className="px-6 py-5">Entrevistado</th>
              <th className="px-6 py-5">Localidade</th>
              <th className="px-6 py-5">Data</th>
              <th className="px-6 py-5 text-center">Registros</th>
              <th className="px-6 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSessions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-slate-400 font-bold text-sm">Nenhum registro encontrado.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredSessions.map((session) => {
                const status = getStatus(session);
                return (
                  <tr key={session.id} className="group hover:bg-blue-50/20 transition-colors cursor-pointer" onClick={() => onSelect(session)}>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                        status === 'CONCLUÍDO' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-5"><code>{session.data.metadata.interviewId}</code></td>
                    <td className="px-6 py-5 font-black">{session.data.metadata.intervieweeName}</td>
                    <td className="px-6 py-5 text-xs text-slate-500">{session.data.metadata.interviewPlace}</td>
                    <td className="px-6 py-5 text-xs text-slate-400">{new Date(session.timestamp).toLocaleDateString()}</td>
                    <td className="px-6 py-5 text-center font-black">{session.data.individuals.length}</td>
                    <td className="px-6 py-5 text-right">
                      <button onClick={(e) => { e.stopPropagation(); onDelete(session.id); }} className="p-2 text-slate-300 hover:text-rose-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
