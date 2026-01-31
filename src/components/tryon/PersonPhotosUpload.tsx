import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  IconUpload,
  IconCamera,
  IconPlus,
  IconTrash,
  IconCheck,
  IconAlertCircle,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';

interface PersonPhotosUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  minImages?: number;
  maxImages?: number;
  title?: string;
  subtitle?: string;
}

export function PersonPhotosUpload({
  images,
  onImagesChange,
  minImages = 3,
  maxImages = 5,
  title = 'Upload Your Photos',
  subtitle = 'Upload 3-5 photos from different angles (front, side, full body)',
}: PersonPhotosUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > maxImages) {
      return;
    }

    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 10 * 1024 * 1024) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        onImagesChange([...images, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [images, maxImages, onImagesChange]);

  const removeImage = useCallback((index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  }, [images, onImagesChange]);

  const getAngleLabel = (index: number) => {
    const labels = ['Front', 'Side', 'Full Body', 'Back', 'Close-up'];
    return labels[index] || `Photo ${index + 1}`;
  };

  const isComplete = images.length >= minImages;

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          <IconCamera className="w-5 h-5 text-primary" />
          {title}
        </h3>
        <Badge variant={isComplete ? 'default' : 'secondary'}>
          {isComplete ? (
            <>
              <IconCheck className="w-3 h-3 mr-1" />
              {images.length}/{maxImages}
            </>
          ) : (
            <>
              <IconAlertCircle className="w-3 h-3 mr-1" />
              {images.length}/{minImages} min
            </>
          )}
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {images.map((img, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-border group"
          >
            <img src={img} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <IconTrash className="w-3 h-3" />
            </button>
            <Badge className="absolute bottom-2 left-2" variant="secondary">
              {getAngleLabel(index)}
            </Badge>
          </motion.div>
        ))}

        {images.length < maxImages && (
          <label className="aspect-[3/4] rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-2">
            <IconPlus className="w-8 h-8 text-muted-foreground" />
            <span className="text-xs text-muted-foreground text-center px-2">
              Add {getAngleLabel(images.length)}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        {subtitle}
      </p>
    </div>
  );
}
