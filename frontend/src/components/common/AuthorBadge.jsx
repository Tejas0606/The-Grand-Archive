import React from 'react';
import { Feather } from 'lucide-react';

const AuthorBadge = ({ penName, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 bg-oxblood text-cream font-mono text-[10px] tracking-widest font-bold px-1.5 py-0.5 border border-oxblood-hover shadow-sm ${className}`}
      title={penName ? `Verified Author: ${penName}` : 'Verified Author'}
    >
      <Feather className="w-2.5 h-2.5 text-brass" />
      <span>AUTHOR</span>
    </span>
  );
};

export default AuthorBadge;
