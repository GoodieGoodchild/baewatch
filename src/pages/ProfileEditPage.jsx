import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SafetyHeader from '../components/common/SafetyHeader';
import BottomNavigation from '../components/common/BottomNavigation';

const ProfileEditPage = ({ onNavigate }) => {
  const { relationshipData, updateProfile } = useApp();
  const [formData, setFormData] = useState(relationshipData.profile);

  const handleSave = () => {
    updateProfile(formData);
    onNavigate?.('home');
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bae-cream via-bae-peach/20 to-bae-warm-white">
      <SafetyHeader />

      <div className="px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onNavigate?.('home')}
              className="p-2 hover:bg-bae-peach/30 rounded-full transition"
            >
              <ArrowLeft className="w-5 h-5 text-bae-navy" />
            </motion.button>
            <h1 className="text-2xl font-bold text-bae-navy">Edit Profile</h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-bae-peach/20"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-bae-navy mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formData.yourName}
                    onChange={(e) => handleChange('yourName', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-bae-peach/30 focus:border-bae-coral focus:outline-none bg-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bae-navy mb-2">
                    Partner's Name
                  </label>
                  <input
                    type="text"
                    value={formData.partnerName}
                    onChange={(e) => handleChange('partnerName', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-bae-peach/30 focus:border-bae-coral focus:outline-none bg-white/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-bae-navy mb-2">
                  Relationship Length
                </label>
                <input
                  type="text"
                  value={formData.relationshipLength}
                  onChange={(e) => handleChange('relationshipLength', e.target.value)}
                  placeholder="e.g., 2 years, 6 months"
                  className="w-full px-4 py-3 rounded-xl border border-bae-peach/30 focus:border-bae-coral focus:outline-none bg-white/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-bae-navy mb-2">
                  Partner's Primary Need
                </label>
                <select
                  value={formData.partnerNeed}
                  onChange={(e) => handleChange('partnerNeed', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-bae-peach/30 focus:border-bae-coral focus:outline-none bg-white/50"
                >
                  <option>Emotional support</option>
                  <option>Quality time</option>
                  <option>Physical affection</option>
                  <option>Words of affirmation</option>
                  <option>Acts of service</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-bae-navy mb-2">
                  Your Support Style
                </label>
                <select
                  value={formData.supportPreference}
                  onChange={(e) => handleChange('supportPreference', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-bae-peach/30 focus:border-bae-coral focus:outline-none bg-white/50"
                >
                  <option>Quality time</option>
                  <option>Physical affection</option>
                  <option>Words of affirmation</option>
                  <option>Acts of service</option>
                  <option>Gifts</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-bae-navy mb-2">
                  Current Mood
                </label>
                <select
                  value={formData.currentMood}
                  onChange={(e) => handleChange('currentMood', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-bae-peach/30 focus:border-bae-coral focus:outline-none bg-white/50"
                >
                  <option>Happy and connected</option>
                  <option>Needs connection</option>
                  <option>Feeling distant</option>
                  <option>Stressed</option>
                  <option>Content</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-bae-navy mb-2">
                  Partner's Cup Fullness (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.cupFullness}
                  onChange={(e) => handleChange('cupFullness', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-xl border border-bae-peach/30 focus:border-bae-coral focus:outline-none bg-white/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-bae-navy mb-2">
                  Notes about Partner
                </label>
                <textarea
                  value={formData.partnerNotes}
                  onChange={(e) => handleChange('partnerNotes', e.target.value)}
                  rows={4}
                  placeholder="Any additional insights about your partner's needs..."
                  className="w-full px-4 py-3 rounded-xl border border-bae-peach/30 focus:border-bae-coral focus:outline-none bg-white/50 resize-none"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="w-full bg-gradient-to-r from-bae-coral to-bae-salmon text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ProfileEditPage;