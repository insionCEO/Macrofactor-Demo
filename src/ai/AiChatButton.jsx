import { useState } from 'react';
import { motion } from 'framer-motion'; // For smooth animation, install it if not present: npm install framer-motion

const AiChatButton = ({ onClick }) => {
    return (
        <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center cursor-pointer"
            aria-label="Open AI Coach"
        >
            💬 {/* You can replace with a chat icon if you want */}
        </motion.button>
    );
};

export default AiChatButton;
