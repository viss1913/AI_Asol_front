import React, { useState } from 'react';
import { Scissors, X } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { formatTime, parseTime } from '../../utils/editorUtils';

const ClipEditor = () => {
    const { clips, selectedClipId, updateClip, setSelectedClipId } = useEditor();
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(0);

    const selectedClip = clips.find(c => c.id === selectedClipId);

    if (!selectedClip) {
        return (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                <p>Выберите клип для редактирования</p>
            </div>
        );
    }

    const handleTrimChange = () => {
        const newDuration = trimEnd - trimStart;
        if (newDuration > 0 && newDuration <= selectedClip.duration) {
            updateClip(selectedClipId, {
                trimStart,
                trimEnd,
                duration: newDuration
            });
        }
    };

    return (
        <div className="h-full flex flex-col p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Scissors size={16} />
                    Редактирование клипа
                </h3>
                <button
                    onClick={() => setSelectedClipId(null)}
                    className="p-1 hover:bg-slate-100 rounded transition-all"
                >
                    <X size={16} className="text-slate-600" />
                </button>
            </div>

            <div className="flex-1 space-y-3">
                <div>
                    <p className="text-xs font-bold text-slate-900 mb-1 truncate">{selectedClip.name}</p>
                    <p className="text-[10px] text-slate-500">
                        Длительность: {formatTime(selectedClip.duration)}
                    </p>
                </div>

                <div className="space-y-2">
                    <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                            Начало (сек)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max={selectedClip.duration}
                            step="0.1"
                            value={trimStart}
                            onChange={(e) => setTrimStart(parseFloat(e.target.value))}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                            Конец (сек)
                        </label>
                        <input
                            type="number"
                            min={trimStart}
                            max={selectedClip.duration}
                            step="0.1"
                            value={trimEnd || selectedClip.duration}
                            onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                        />
                    </div>

                    <button
                        onClick={handleTrimChange}
                        className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-all"
                    >
                        Применить обрезку
                    </button>
                </div>

                <div className="pt-2 border-t border-slate-200">
                    <p className="text-[9px] text-slate-500">
                        💡 Укажите время начала и конца фрагмента в секундах
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ClipEditor;
