
import React from 'react';
import { Individual, ProcessedData } from '../types';

interface ReviewTableProps {
  data: ProcessedData;
  onUpdate: (updatedData: ProcessedData) => void;
}

export const ReviewTable: React.FC<ReviewTableProps> = ({ data, onUpdate }) => {
  const updateIndividual = (id: string, field: keyof Individual, value: any) => {
    const updatedIndividuals = data.individuals.map(ind => 
      ind.id === id ? { ...ind, [field]: value } : ind
    );
    onUpdate({ ...data, individuals: updatedIndividuals });
  };

  const updateMetadata = (field: string, value: any) => {
    onUpdate({
      ...data,
      metadata: { ...data.metadata, [field]: value }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-blue-800">1. Interview Metadata</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">Interview ID</label>
            <input 
              type="text" 
              value={data.metadata.interviewId} 
              onChange={e => updateMetadata('interviewId', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">Date</label>
            <input 
              type="text" 
              value={data.metadata.interviewDate} 
              onChange={e => updateMetadata('interviewDate', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">Place</label>
            <input 
              type="text" 
              value={data.metadata.interviewPlace} 
              onChange={e => updateMetadata('interviewPlace', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </section>

      {/* Individuals Table */}
      <section className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-blue-800">2. Individuals List</h3>
          <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
            {data.individuals.length} Records Detected
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RIN</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rel</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">Full Name</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Birth Info</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Death Info</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conf</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.individuals.map((ind) => (
                <tr key={ind.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-3 py-2">
                    <input 
                      type="number" 
                      value={ind.rin} 
                      onChange={e => updateIndividual(ind.id, 'rin', parseInt(e.target.value))}
                      className="w-16 border-gray-200 rounded p-1 text-sm text-center"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input 
                      type="text" 
                      value={ind.relation} 
                      onChange={e => updateIndividual(ind.id, 'relation', e.target.value)}
                      className="w-10 border-gray-200 rounded p-1 text-sm text-center font-bold"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select 
                      value={ind.sex} 
                      onChange={e => updateIndividual(ind.id, 'sex', e.target.value)}
                      className="border-gray-200 rounded p-1 text-sm bg-transparent"
                    >
                      <option value="M">M</option>
                      <option value="F">F</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input 
                      type="text" 
                      value={ind.fullName} 
                      onChange={e => updateIndividual(ind.id, 'fullName', e.target.value)}
                      className="w-full border-gray-200 rounded p-1 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-1">
                      <input 
                        type="text" 
                        placeholder="Date"
                        value={ind.birthDate} 
                        onChange={e => updateIndividual(ind.id, 'birthDate', e.target.value)}
                        className="w-full border-gray-200 rounded p-1 text-[11px]"
                      />
                      <input 
                        type="text" 
                        placeholder="Place"
                        value={ind.birthPlace} 
                        onChange={e => updateIndividual(ind.id, 'birthPlace', e.target.value)}
                        className="w-full border-gray-200 rounded p-1 text-[11px]"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                     <div className="flex flex-col gap-1">
                      <input 
                        type="text" 
                        placeholder="Date"
                        value={ind.deathDate} 
                        onChange={e => updateIndividual(ind.id, 'deathDate', e.target.value)}
                        className="w-full border-gray-200 rounded p-1 text-[11px]"
                      />
                      <input 
                        type="text" 
                        placeholder="Place"
                        value={ind.deathPlace} 
                        onChange={e => updateIndividual(ind.id, 'deathPlace', e.target.value)}
                        className="w-full border-gray-200 rounded p-1 text-[11px]"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-center ${
                      ind.confidence > 0.8 ? 'bg-green-100 text-green-700' : 
                      ind.confidence > 0.5 ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {Math.round(ind.confidence * 100)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
