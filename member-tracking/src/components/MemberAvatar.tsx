import React, { useState } from 'react';
import { 
  getMemberDisplayName, 
  getMemberInitials, 
  getInitialsBackgroundColor 
} from '../utils/member';
import { Member } from '../services/api';


interface MemberAvatarProps {
  member: Member;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const MemberAvatar: React.FC<MemberAvatarProps> = ({ 
  member, 
  size = 'md', 
  className = '' 
}) => {

  const [isError, setIsError] = useState(false);

  const displayName = getMemberDisplayName(member);
  const initials = getMemberInitials(member);
  const backgroundColor = getInitialsBackgroundColor(member.email);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };
  
  const baseClasses = `${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-white ${className}`;
  
  if (member.avatar && !isError) {
    return (
      <img
        src={member.avatar}
        alt={displayName}
        className={`${baseClasses} object-cover`}
        onError={() => setIsError(true)}
      />
    );
  }
  
  return (
    <div 
      className={baseClasses}
      style={{ backgroundColor }}
      title={displayName}
    >
      {initials}
    </div>
  );
};

export default MemberAvatar;