import React, { useState } from 'react';
import { Star, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ReviewFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, isLoading }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [title, setTitle] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit({ rating, title, comment, images });
    setRating(0);
    setComment('');
    setTitle('');
    setImages([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Mock image upload by just using a dummy string
    if (e.target.files && e.target.files.length > 0) {
      setImages([...images, URL.createObjectURL(e.target.files[0])]);
    }
  };

  return (
    <div id="write-review-form" className="bg-surface border border-border rounded-xl p-6 mt-8 shadow-sm">
      <h3 className="text-lg font-bold text-text-primary mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-text-primary">Overall Rating *</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  size={32}
                  className={`${
                    star <= (hoverRating || rating)
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-border fill-background'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-text-primary">Review Title (Optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience..."
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-primary transition-colors"
            maxLength={100}
          />
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-text-primary">Review Description *</label>
          <textarea
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you like or dislike?"
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors min-h-[120px] resize-y"
            minLength={10}
            maxLength={1000}
          />
          <div className="text-right text-xs text-text-secondary">
            {comment.length} / 1000
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-text-primary">Add Photos (Optional)</label>
          <div className="flex flex-wrap gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white hover:bg-black"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors text-text-secondary hover:text-primary">
                <UploadCloud size={24} className="mb-1" />
                <span className="text-[10px] font-medium">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-border flex justify-end">
          <Button
            type="submit"
            className="w-full sm:w-auto px-8"
            disabled={rating === 0 || comment.length < 10 || isLoading}
            isLoading={isLoading}
          >
            Submit Review
          </Button>
        </div>
      </form>
    </div>
  );
};
