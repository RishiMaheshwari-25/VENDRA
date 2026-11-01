import { motion } from 'motion/react';
import { fadeUp, staggerParent } from './motion';

const VIEWPORT = { once: true, amount: 0.15, margin: '0px 0px -6% 0px' };

// Fades + lifts its content in when it scrolls into view.
const Reveal = ({ as = 'div', delay = 0, className, children, ...rest }) => {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={{
        hidden: fadeUp.hidden,
        show: { ...fadeUp.show, transition: { ...fadeUp.show.transition, delay } },
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

// Children that are motion elements with `variants={fadeUp}` rise in one after another.
export const Stagger = ({ as = 'div', gap = 0.07, delay = 0, className, children, ...rest }) => {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={staggerParent(gap, delay)}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
