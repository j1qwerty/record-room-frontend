import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, Buildings, Scan, ShieldCheck } from '@phosphor-icons/react';

const roles = [
  { id: 'administrator', label: 'Administrator', icon: ShieldCheck },
  { id: 'record-room-operator', label: 'Record room operator', icon: Archive },
  { id: 'department-user', label: 'Department user', icon: Buildings },
  { id: 'digitization-operator', label: 'Digitization operator', icon: Scan },
] as const;

export function LoginPage() {
  const [selectedRole, setSelectedRole] =
    useState<(typeof roles)[number]['id']>('record-room-operator');
  const navigate = useNavigate();

  const login = () => {
    localStorage.setItem('rr-role', selectedRole);
    navigate('/', { replace: true });
  };

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand">
          <span className="login-brand-mark">
            <Archive size={24} weight="bold" />
          </span>
          <span>Record Room</span>
        </div>
        <div className="mt-8">
          <p className="login-eyebrow">Sign in</p>
          <h1 id="login-title" className="mt-2 text-3xl font-semibold tracking-tight">
            Choose your role
          </h1>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {roles.map((role) => {
            const Icon = role.icon;
            const active = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedRole(role.id)}
                className={'role-option' + (active ? ' role-option-active' : '')}
              >
                <span className="role-option-icon">
                  <Icon size={21} weight={active ? 'fill' : 'regular'} />
                </span>
                <span className="text-sm font-semibold">{role.label}</span>
                <span
                  className={'role-option-radio' + (active ? ' role-option-radio-active' : '')}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>

        <button type="button" onClick={login} className="login-submit mt-6">
          Login
        </button>
      </section>
    </main>
  );
}
