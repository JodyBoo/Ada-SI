import { motion } from 'framer-motion'
import { IconSparkle } from '../icons/GamifiedIcons'

export function Welcome() {
  const chips = ['Start a quest', 'Forge a new skill', 'Cast an unlocked skill']

  return (
    <div className="welcome">
      <div className="welcome-mark" aria-hidden="true">
        <IconSparkle size={22} />
      </div>
      <h2>Ready for your next quest?</h2>
      <p>Talk to ADA, earn XP from chats, and unlock new skills in your loadout.</p>
      <div className="welcome-chips">
        {chips.map((chip, index) => (
          <motion.span
            key={chip}
            className="welcome-chip"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.25 }}
          >
            {chip}
          </motion.span>
        ))}
      </div>
    </div>
  )
}
