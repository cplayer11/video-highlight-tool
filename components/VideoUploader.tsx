import { useCallback } from 'react';

export default function VideoUploader({ onUpload }: { onUpload: (file: File) => void }) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onUpload(file);
    },
    [onUpload]
  );

  return (
    <div>
      <input
        type="file"
        accept="video/*"
        onChange={handleChange}
        className="file-input file-input-bordered"
      />
    </div>
  );
}
