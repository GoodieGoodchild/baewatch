import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import SafetyHeader from '../components/common/SafetyHeader';
import BottomNavigation from '../components/common/BottomNavigation';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Plus, Heart, Star, Camera, Loader, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { storage } from '../firebase';

const categories = [
  { id: 'all', label: 'All', emoji: '📝' },
  { id: 'favorites', label: 'Favorites', emoji: '⭐' },
  { id: 'comfort', label: 'Comfort', emoji: '🥰' },
  { id: 'important', label: 'Important', emoji: '📌' },
  { id: 'dislikes', label: 'Sensory', emoji: '🚫' },
  { id: 'food', label: 'Food', emoji: '🍝' },
  { id: 'photo', label: 'Photos', emoji: '📷' },
];

export const MemoriesPage = ({ onNavigate }) => {
  const { relationshipData, addMemory, deleteMemory } = useApp();
  const { currentUser } = useAuth();
  const memories = relationshipData.memories || [];

  const [activeCategory, setActiveCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showPhotoForm, setShowPhotoForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ category: 'favorites', title: '', value: '' });
  const [photoForm, setPhotoForm] = useState({ caption: '', category: 'photo', file: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filteredMemories = activeCategory === 'all'
    ? memories
    : memories.filter((m) => m.category === activeCategory);

  const handleAddMemory = () => {
    if (formData.title && formData.value) {
      addMemory({
        id: Date.now().toString(),
        category: formData.category,
        title: formData.title,
        value: formData.value,
        emoji: categories.find(c => c.id === formData.category)?.emoji || '💭',
      });
      setFormData({ category: 'favorites', title: '', value: '' });
      setShowForm(false);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoForm.file) return;
    setUploading(true);
    try {
      const uid = currentUser?.uid || 'anonymous';
      const filename = `${Date.now()}_${photoForm.file.name}`;
      const storageRef = ref(storage, `users/${uid}/memories/${filename}`);
      await uploadBytes(storageRef, photoForm.file);
      const photoUrl = await getDownloadURL(storageRef);
      addMemory({
        id: Date.now().toString(),
        category: photoForm.category,
        title: photoForm.caption || 'Photo Memory',
        value: photoForm.caption,
        emoji: '📷',
        photoUrl,
        photoCaption: photoForm.caption,
      });
      setPhotoForm({ caption: '', category: 'photo', file: null });
      setShowPhotoForm(false);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id) => {
    if (deleteConfirm === id) {
      deleteMemory(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-bae-cream pb-32 pt-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <SafetyHeader />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mt-6"
        >
          <h2 className="text-2xl font-bold text-bae-navy mb-2">Relationship Memory</h2>
          <p className="text-sm text-bae-navy/70">Remember what matters. Show you care.</p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'bg-bae-coral text-white'
                  : 'bg-white text-bae-navy/70 border border-bae-peach'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Text Memory Form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Card variant="peach">
              <h3 className="text-lg font-semibold text-bae-navy mb-4">Add to Memory</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-bae-navy/60 mb-2 block">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-bae-peach bg-white focus:outline-none focus:ring-2 focus:ring-bae-coral"
                  >
                    <option value="favorites">Favorites</option>
                    <option value="comfort">Comfort</option>
                    <option value="important">Important</option>
                    <option value="dislikes">Sensory/Dislikes</option>
                    <option value="food">Food</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-bae-navy/60 mb-2 block">Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Favorite Movie"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-bae-peach bg-white placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-bae-navy/60 mb-2 block">Details</label>
                  <textarea
                    placeholder="e.g., Pride and Prejudice (the BBC one)"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-bae-peach bg-white placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral resize-none"
                    rows="3"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button variant="primary" className="flex-1" onClick={handleAddMemory}>Save</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Photo Memory Form */}
        {showPhotoForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Card variant="peach">
              <h3 className="text-lg font-semibold text-bae-navy mb-4">Add Photo Memory</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-bae-navy/60 mb-2 block">Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoForm({ ...photoForm, file: e.target.files[0] })}
                    className="w-full text-sm text-bae-navy/70"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-bae-navy/60 mb-2 block">Caption</label>
                  <input
                    type="text"
                    placeholder="A special moment..."
                    value={photoForm.caption}
                    onChange={(e) => setPhotoForm({ ...photoForm, caption: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-bae-peach bg-white placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-bae-navy/60 mb-2 block">Category</label>
                  <select
                    value={photoForm.category}
                    onChange={(e) => setPhotoForm({ ...photoForm, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-bae-peach bg-white focus:outline-none focus:ring-2 focus:ring-bae-coral"
                  >
                    <option value="photo">Photo</option>
                    <option value="favorites">Favorites</option>
                    <option value="important">Important</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" className="flex-1" onClick={() => setShowPhotoForm(false)}>Cancel</Button>
                  <Button variant="primary" className="flex-1" onClick={handlePhotoUpload} disabled={uploading || !photoForm.file}>
                    {uploading ? (
                      <span className="flex items-center gap-2 justify-center">
                        <Loader className="w-4 h-4 animate-spin" /> Uploading...
                      </span>
                    ) : 'Upload'}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Add Buttons */}
        {!showForm && !showPhotoForm && (
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-bae-coral text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus className="w-5 h-5" />
              Add to Memory
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPhotoForm(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-bae-navy text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              <Camera className="w-5 h-5" />
              Add Photo
            </motion.button>
          </div>
        )}

        {/* Memories Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {filteredMemories.length === 0 && (
            <p className="text-center text-bae-navy/50 py-8">No memories yet. Add your first one!</p>
          )}
          {filteredMemories.map((memory, idx) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card variant="light" className="cursor-pointer hover:shadow-lg">
                {memory.photoUrl && (
                  <img
                    src={memory.photoUrl}
                    alt={memory.photoCaption || memory.title}
                    className="w-full max-h-48 object-cover rounded-xl mb-3"
                  />
                )}
                <div className="flex gap-4">
                  <div className="text-3xl flex-shrink-0">{memory.emoji || '💭'}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-bae-navy text-sm mb-1">{memory.title}</h4>
                    <p className="text-sm text-bae-navy/70 leading-snug">{memory.value}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(memory.id)}
                    className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${
                      deleteConfirm === memory.id ? 'bg-red-100 text-red-500' : 'text-bae-navy/30 hover:text-red-400'
                    }`}
                    title={deleteConfirm === memory.id ? 'Tap again to confirm' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Tips */}
        <Card variant="gradient">
          <h4 className="font-semibold text-bae-navy mb-3 flex items-center gap-2">
            💡 Use These Memories To...
          </h4>
          <ul className="space-y-2 text-sm text-bae-navy/70">
            <li className="flex gap-2"><span>✓</span><span>Personalize your gestures and compliments</span></li>
            <li className="flex gap-2"><span>✓</span><span>Avoid things that stress your person out</span></li>
            <li className="flex gap-2"><span>✓</span><span>Plan surprises they'll actually love</span></li>
            <li className="flex gap-2"><span>✓</span><span>Understand your partner without asking every time</span></li>
          </ul>
        </Card>

        <Card variant="light">
          <p className="text-xs text-bae-navy/60 flex gap-2">
            <Heart className="w-4 h-4 text-bae-coral flex-shrink-0 mt-0.5" />
            <span>This is private to you. You'll see these memories when planning how to support your person.</span>
          </p>
        </Card>
      </div>

      <BottomNavigation activeTab="insights" onTabChange={(tab) => {
        if (tab === 'home') onNavigate?.('home');
        else if (tab === 'checkin') onNavigate?.('checkin');
        else if (tab === 'add') onNavigate?.('coach');
        else if (tab === 'memories') onNavigate?.('memories');
        else if (tab === 'games') onNavigate?.('games');
        else if (tab === 'weather') onNavigate?.('weather');
      }} />
    </motion.div>
  );
};

export default MemoriesPage;
