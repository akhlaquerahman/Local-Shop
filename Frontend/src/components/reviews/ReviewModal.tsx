import React, { useState } from 'react';
import { X, Star, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { rating: number; title: string; comment: string; images: string[] }) => void;
  isSubmitting: boolean;
  targetName: string;
  targetImage?: string;
  initialData?: { rating: number; title: string; comment: string; images: string[] };
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  targetName,
  targetImage,
  initialData
}) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(initialData?.title || '');
  const [comment, setComment] = useState(initialData?.comment || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Reset state when opened with different data
  React.useEffect(() => {
    if (isOpen) {
      setRating(initialData?.rating || 0);
      setTitle(initialData?.title || '');
      setComment(initialData?.comment || '');
      setImages(initialData?.images || []);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || comment.length < 10) return;
    onSubmit({ rating, title, comment, images });
  };

  const handleAddImage = () => {
    if (imageUrlInput && images.length < 5) {
      setImages([...images, imageUrlInput]);
      setImageUrlInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">Write a Review</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-background text-text-secondary">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-1">
          <div className="flex items-center gap-3 mb-6 p-3 bg-background rounded-xl border border-border/50">
            {targetImage ? (
              <img src={targetImage} alt={targetName} className="w-12 h-12 object-cover rounded-lg" />
            ) : (
              <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center">
                <ImageIcon size={20} className="text-text-secondary/50" />
              </div>
            )}
            <div className="font-semibold text-text-primary text-sm truncate">{targetName}</div>
          </div>

          <form id="review-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">Overall Rating *</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={(hoverRating || rating) >= star ? 'fill-accent text-accent' : 'text-border'}
                    />
                  </button>
                ))}
              </div>
              {rating === 0 && <p className="text-danger text-xs mt-1">Please select a rating</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">Review Title (Optional)</label>
              <input
                type="text"
                placeholder="Summarize your experience"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">Review Comment *</label>
              <textarea
                placeholder="What did you like or dislike? (Min 10 chars)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
              />
              <div className="flex justify-between text-xs mt-1">
                <span className={comment.length > 0 && comment.length < 10 ? 'text-danger' : 'text-text-secondary'}>
                  {comment.length} / 1000 chars
                </span>
                {comment.length > 1000 && <span className="text-danger">Too long</span>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">Images (Optional, Max 5)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  placeholder="Paste image URL"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  disabled={images.length >= 5}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleAddImage}
                  disabled={!imageUrlInput || images.length >= 5}
                >
                  Add
                </Button>
              </div>
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group w-16 h-16 rounded-lg border border-border overflow-hidden">
                      <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-border bg-background">
          <Button 
            type="submit" 
            form="review-form" 
            className="w-full"
            disabled={rating === 0 || comment.length < 10 || comment.length > 1000 || isSubmitting}
            isLoading={isSubmitting}
          >
            Submit Review
          </Button>
        </div>
        
      </div>
    </div>
  );
};
