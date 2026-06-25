import React, { useState, useEffect } from 'react';
import { useAdminBlogDetails, useCreateBlog, useUpdateBlog } from '../../services/admin.queries';
import { Button } from '@/components/ui/Button';

export const BlogEditorDrawer = ({ isOpen, onClose, blogId }: { isOpen: boolean, onClose: () => void, blogId: string | null }) => {
  const { data, isLoading } = useAdminBlogDetails(blogId || '');
  const isEditing = !!blogId;

  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    coverImage: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    tags: '',
    status: 'DRAFT'
  });

  useEffect(() => {
    if (isEditing && data) {
      setFormData({
        title: data.title || '',
        slug: data.slug || '',
        content: data.content || '',
        coverImage: data.coverImage || '',
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        keywords: data.keywords || '',
        tags: data.tags ? data.tags.join(', ') : '',
        status: data.status || 'DRAFT'
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        content: '',
        coverImage: '',
        metaTitle: '',
        metaDescription: '',
        keywords: '',
        tags: '',
        status: 'DRAFT'
      });
    }
  }, [data, isEditing, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (statusToSave: string) => {
    const payload = {
      ...formData,
      status: statusToSave,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    if (isEditing) {
      updateMutation.mutate({ id: blogId, payload }, {
        onSuccess: () => onClose()
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onClose()
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
      <div className="w-full max-w-4xl bg-background h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface">
          <h2 className="text-xl font-extrabold text-text-primary">
            {isEditing ? 'Edit Article' : 'Write New Article'}
          </h2>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>Cancel</Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-warning border-warning/50 hover:bg-warning/10"
              onClick={() => handleSubmit('DRAFT')}
              disabled={isPending}
            >
              Save as Draft
            </Button>
            <Button 
              size="sm" 
              className="bg-primary text-white"
              onClick={() => handleSubmit('PUBLISHED')}
              disabled={isPending}
            >
              Publish Now
            </Button>
          </div>
        </div>

        {isEditing && isLoading ? (
          <div className="flex-1 flex items-center justify-center text-text-secondary">Loading Editor...</div>
        ) : (
          <div className="flex-1 overflow-y-auto flex">
            {/* Main Content Area */}
            <div className="flex-1 p-8 space-y-6 border-r border-border overflow-y-auto">
              <div className="space-y-2">
                <input 
                  required
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Article Title..."
                  className="w-full bg-transparent text-3xl font-extrabold text-text-primary focus:outline-none placeholder:text-text-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <textarea 
                  required
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Write your article content here... (Supports HTML/Markdown)"
                  className="w-full h-[60vh] bg-surface border border-border rounded-lg p-6 text-base text-text-primary focus:outline-none focus:border-primary resize-none font-mono"
                />
              </div>
            </div>

            {/* Sidebar Settings Area */}
            <div className="w-80 bg-surface/30 p-6 overflow-y-auto space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2">Article Settings</h3>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary">Custom Slug</label>
                  <input 
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="Leave empty to auto-generate"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary">Cover Image URL</label>
                  <input 
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                  />
                  {formData.coverImage && (
                    <img src={formData.coverImage} alt="Cover Preview" className="mt-2 w-full h-24 object-cover rounded border border-border" />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary">Tags (Comma separated)</label>
                  <input 
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="tech, tips, review"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2">SEO Metadata</h3>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary">Meta Title (Max 60 chars)</label>
                  <input 
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    placeholder="SEO Title"
                    maxLength={60}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary">Meta Description (Max 160 chars)</label>
                  <textarea 
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    placeholder="Brief description for search engines..."
                    maxLength={160}
                    rows={4}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary">Keywords</label>
                  <input 
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleChange}
                    placeholder="keyword1, keyword2"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
