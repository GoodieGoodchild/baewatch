import React from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoMark from '../../assets/logo-mark-tight.png';

export const SafetyHeader = ({ showNotification = false }) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full bg-gradient-to-b from-bae-warm-white to-bae-cream px-6 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-bae-peach/20"
    >
      <div className="flex items-center gap-2">
        <img src={logoMark} alt="Bae Watch" className="w-7 h-8 object-contain" />
        <h1 className="text-xl font-bold text-bae-navy">Bae Watch</h1>
      </div>
      <div className="flex items-center gap-2">
        {/* Notification bell removed: it was decorative (no handler) with a
            permanent fake unread dot. Reinstate when real notifications exist. */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLogout}
          className="p-2 hover:bg-bae-peach/30 rounded-full transition"
          title="Logout"
        >
          <LogOut className="w-5 h-5 text-bae-coral" />
        </motion.button>
      </div>
    </motion.header>
  );
};

export default SafetyHeader;
