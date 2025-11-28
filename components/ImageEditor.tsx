import React, { useState, useRef } from 'react';
import { editImageWithGemini } from '../services/geminiService';

const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setOriginalImage(event.target.result as string);
          setEditedImage(null); // Reset edited image
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!originalImage || !prompt.trim()) return;

    setLoading(true);
    setError(null);
    try {
      // Basic MIME type extraction
      const mimeType = originalImage.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)?.[0] || 'image/png';
      
      const result = await editImageWithGemini(originalImage, mimeType, prompt);
      setEditedImage(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-8 shadow-2xl">
        <header className="mb-8 text-center">
          <h2 className="text-3xl font-neon font-bold text-cyan-400 mb-2">AI Neural Editor</h2>
          <p className="text-slate-400">Powered by Gemini 2.5 Flash Image. Upload, prompt, and transform.</p>
        </header>

        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Upload Area */}
          <div 
            className={`
              relative h-80 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden
              ${originalImage ? 'border-cyan-500/50 bg-slate-800' : 'border-slate-600 hover:border-cyan-400 bg-slate-800/50 hover:bg-slate-800'}
            `}
            onClick={() => !originalImage && fileInputRef.current?.click()}
          >
            {originalImage ? (
              <>
                <img src={originalImage} alt="Original" className="h-full w-full object-contain" />
                <button 
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="absolute bottom-4 right-4 bg-slate-900/80 text-white px-3 py-1 rounded-lg text-sm hover:bg-black"
                >
                  Change Image
                </button>
              </>
            ) : (
              <div className="text-center p-6 cursor-pointer">
                <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-slate-300 font-medium">Click to Upload Image</p>
                <p className="text-slate-500 text-sm mt-2">Supports JPG, PNG, WEBP</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>

          {/* Controls & Output */}
          <div className="flex flex-col h-80">
             {editedImage ? (
               <div className="flex-1 relative rounded-xl border border-cyan-500/50 bg-slate-800 overflow-hidden group">
                 <img src={editedImage} alt="Edited" className="h-full w-full object-contain" />
                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                   <button 
                     onClick={() => downloadImage(editedImage, 'gemini-edit.png')}
                     className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-cyan-500/20"
                   >
                     Download
                   </button>
                 </div>
               </div>
             ) : (
               <div className="flex-1 rounded-xl border border-slate-700 bg-slate-800/30 flex items-center justify-center text-slate-500">
                 {loading ? (
                    <div className="flex flex-col items-center animate-pulse">
                      <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p className="text-cyan-400 font-mono text-sm">PROCESSING...</p>
                    </div>
                 ) : (
                    "Generated image will appear here"
                 )}
               </div>
             )}
          </div>
        </div>

        {/* Prompt Bar */}
        <div className="relative">
          <div className="flex gap-4">
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your edit (e.g., 'Add a retro filter', 'Make it cyberpunk style')"
              className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-6 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button 
              onClick={handleGenerate}
              disabled={loading || !originalImage || !prompt}
              className={`
                px-8 py-4 rounded-xl font-bold font-neon tracking-wider transition-all
                ${loading || !originalImage || !prompt 
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] active:scale-95'}
              `}
            >
              {loading ? 'GENERATING' : 'EXECUTE'}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-300 text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ImageEditor;
