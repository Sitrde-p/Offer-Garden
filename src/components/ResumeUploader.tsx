import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { pdfToText } from 'react-pdftotext';
import { Upload, X, Loader2, CheckCircle2 } from 'lucide-react';

interface ResumeUploaderProps {
  onTextExtracted: (text: string) => void;
  onFileRemoved?: () => void;
  initialFileName?: string;
}

export function ResumeUploader({ 
  onTextExtracted, 
  onFileRemoved, 
  initialFileName = '' 
}: ResumeUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState(initialFileName);
  const [error, setError] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('文件大小不能超过 5MB');
      return;
    }

    setUploading(true);
    setError(null);
    setFileName(file.name);

    try {
      const text = await pdfToText(file);
      const truncatedText = text.slice(0, 5000);
      onTextExtracted(truncatedText);
    } catch (err) {
      console.error('PDF 解析失败:', err);
      setError('PDF 解析失败，请尝试手动输入');
      onTextExtracted('');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024
  });

  const handleRemove = () => {
    setFileName('');
    setError(null);
    onTextExtracted('');
    onFileRemoved?.();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white/60">
        简历材料
        <span className="text-white/30 text-xs ml-2">支持 PDF（≤5MB）</span>
      </label>

      {fileName ? (
        <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-sm font-medium text-white/80">{fileName}</div>
              <div className="text-xs text-white/30">简历已解析，AI 将基于此内容生成复盘</div>
            </div>
          </div>
          <button onClick={handleRemove} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/80">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all p-6 text-center
            ${isDragActive ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/20 bg-white/[0.02] hover:border-indigo-400/50'}
            ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-sm text-white/40">正在解析 PDF...</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-white/30 mx-auto mb-3" />
              <p className="text-sm text-white/60">{isDragActive ? '释放 PDF 文件' : '拖拽或点击上传简历'}</p>
              <p className="text-xs text-white/30 mt-2">AI 将读取简历内容，生成个性化复盘</p>
            </>
          )}
        </div>
      )}

      {error && <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded-lg">{error}</div>}
    </div>
  );
}
