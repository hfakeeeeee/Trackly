import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { Category } from '../types';

interface CategorySectionProps {
  categories: Category[];
  onUpdateCategories: (categories: Category[]) => void;
}

const PRESET_COLORS = [
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ec4899', // pink
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#14b8a6', // teal
  '#f97316', // orange
  '#ef4444', // red
  '#6b7280', // gray
];

export const CategorySection: React.FC<CategorySectionProps> = ({ categories, onUpdateCategories }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [showColorModal, setShowColorModal] = useState(false);

  const getRandomColor = () => {
    return PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    
    const newCategory: Category = {
      id: Date.now().toString(),
      name: newName.trim(),
      color: getRandomColor()
    };
    
    onUpdateCategories([...categories, newCategory]);
    setNewName('');
    setIsAdding(false);
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setNewName(category.name);
    setNewColor(category.color);
    setShowColorModal(true);
  };

  const handleUpdate = (id: string) => {
    if (!newName.trim()) return;
    
    onUpdateCategories(
      categories.map(cat =>
        cat.id === id ? { ...cat, name: newName.trim(), color: newColor } : cat
      )
    );
    setEditingId(null);
    setNewName('');
    setNewColor(PRESET_COLORS[0]);
    setShowColorModal(false);
  };

  const handleDelete = (id: string) => {
    onUpdateCategories(categories.filter(cat => cat.id !== id));
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewName('');
    setNewColor(PRESET_COLORS[0]);
    setShowColorModal(false);
  };

  return (
    <div className="glass rounded-2xl p-6 animate-slideUp">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">CATEGORIES</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="glass-hover px-4 py-2 rounded-xl text-gray-800 font-medium flex items-center gap-2 transition-all hover:scale-105"
          >
            <Plus size={18} />
            Add Category
          </button>
        )}
      </div>

      <div className="space-y-3">
        {categories.map(category => (
          <div
            key={category.id}
            className="glass-strong rounded-xl p-4 flex items-center justify-between group hover:scale-[1.02] transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-gray-800 font-medium">{category.name}</span>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(category)}
                className="p-2 glass-hover rounded-lg text-cyan-300 hover:text-cyan-200 transition-colors"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="p-2 glass-hover rounded-lg text-red-300 hover:text-red-200 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {isAdding && (
          <div className="glass-strong rounded-xl p-4 flex items-center gap-3 animate-slideIn">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1 bg-white/40 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="New category name (color will be random)"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-300 transition-colors"
              >
                <Check size={18} />
              </button>
              <button
                onClick={handleCancel}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showColorModal && editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleCancel}>
          <div className="glass rounded-2xl p-6 max-w-md w-full mx-4 animate-slideIn" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Category</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white/40 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
                  placeholder="Category name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewColor(color)}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        newColor === color ? 'ring-2 ring-purple-500 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 rounded-lg text-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdate(editingId)}
                  className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-700 font-medium transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
