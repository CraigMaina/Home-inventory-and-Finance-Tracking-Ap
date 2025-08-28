
import React from 'react';
import type { User } from '../types';
import { Role } from '../types';

interface HeaderProps {
  user: User;
}

const getRoleDisplayName = (role: Role) => {
  switch (role) {
    case Role.Admin:
      return 'Administrator';
    case Role.Editor:
      return 'Editor';
    case Role.Viewer:
      return 'Viewer';
    default:
      return 'User';
  }
};


const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="bg-white h-16 flex items-center justify-end px-8 border-b border-slate-200">
      <div className="flex items-center">
        <div className="text-right mr-4">
          <p className="font-semibold text-slate-700">{user.name}</p>
          <p className="text-xs text-slate-500">{getRoleDisplayName(user.role)}</p>
        </div>
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
        />
      </div>
    </header>
  );
};

export default Header;
