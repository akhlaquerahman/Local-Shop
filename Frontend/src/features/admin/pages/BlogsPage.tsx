import React, { useState } from 'react';
import { useAdminBlogsList, useDeleteBlog } from '../services/admin.queries';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';
import { BlogEditorDrawer } from '../components/cms/BlogEditorDrawer';

export const BlogsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = useAdminBlogsList(statusFilter ? { status: statusFilter } : {});
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);

  const deleteMutation = useDeleteBlog();

  const handleCreateNew = () => {
    setEditingBlogId(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingBlogId(id);
    setIsEditorOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this blog post? This cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const blogs = data?.data || [];
  const stats = data?.stats || { total: 0, published: 0, drafts: 0 };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Blog Editor (CMS)
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage SEO content and marketplace articles
          </p>
        </div>
        <Button onClick={handleCreateNew} className="bg-primary text-white font-bold">
          + Write New Article
        </Button>
      </div>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Total Articles" value={stats.total} loading={isLoading} />
        <KPICard title="Published" value={stats.published} loading={isLoading} className="border-success/30 bg-success/5 text-success" />
        <KPICard title="Drafts" value={stats.drafts} loading={isLoading} className="text-warning" />
      </div>

      {/* FILTERS */}
      <div className="flex gap-2">
        <Button variant={statusFilter === '' ? 'primary' : 'outline'} size="sm" onClick={() => setStatusFilter('')}>All</Button>
        <Button variant={statusFilter === 'PUBLISHED' ? 'primary' : 'outline'} size="sm" onClick={() => setStatusFilter('PUBLISHED')}>Published</Button>
        <Button variant={statusFilter === 'DRAFT' ? 'primary' : 'outline'} size="sm" onClick={() => setStatusFilter('DRAFT')}>Drafts</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12 text-text-secondary">Loading Articles...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {blogs.map((blog: any) => (
            <div key={blog._id} className={`bg-surface border rounded-xl overflow-hidden shadow-sm transition-all flex flex-col ${blog.status === 'PUBLISHED' ? 'border-border' : 'border-border/50 opacity-80'}`}>
              <div className="relative h-48 bg-background flex items-center justify-center overflow-hidden">
                {blog.coverImage ? (
                  <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                ) : (
                  <span className="text-text-secondary font-medium">No Cover Image</span>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded shadow ${blog.status === 'PUBLISHED' ? 'bg-success text-white' : 'bg-warning text-black'}`}>
                    {blog.status}
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-text-primary text-lg line-clamp-2 leading-tight">{blog.title}</h3>
                  <p className="text-xs text-text-secondary mt-2 font-mono truncate">/{blog.slug}</p>
                </div>
                
                <div className="mt-4 border-t border-border pt-4">
                  <div className="flex justify-between items-center text-xs text-text-secondary mb-4">
                    <span>{blog.views} Views</span>
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-primary/10 text-primary hover:bg-primary/20" onClick={() => handleEdit(blog._id)}>
                      Edit Article
                    </Button>
                    <Button size="sm" variant="outline" className="text-danger border-danger/30 hover:bg-danger hover:text-white" onClick={() => handleDelete(blog._id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {blogs.length === 0 && (
            <div className="col-span-full text-center p-12 bg-surface rounded-xl border border-border border-dashed">
              <p className="text-text-secondary">No articles found. Write your first post!</p>
            </div>
          )}
        </div>
      )}

      {isEditorOpen && (
        <BlogEditorDrawer 
          isOpen={isEditorOpen} 
          onClose={() => setIsEditorOpen(false)} 
          blogId={editingBlogId}
        />
      )}
    </div>
  );
};

export default BlogsPage;
