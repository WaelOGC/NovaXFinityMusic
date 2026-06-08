import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Library, Heart, Settings, LogOut, Crown, BarChart3, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
    <Icon size={18} />
    {label}
  </NavLink>
);

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="logo">
        <img src="/icons/NovaXFinity.png" style={{ width: 28, height: 28, borderRadius: 6 }} /> Nova XFinity
      </div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', padding: '4px 12px 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Menu
        </div>
        <NavItem to="/" icon={Home} label="Home" />
        <NavItem to="/search" icon={Search} label="Search" />
        <NavItem to="/library" icon={Library} label="Library" />
      </div>

      {user && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', padding: '12px 12px 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Your Music
          </div>
          <NavItem to="/liked" icon={Heart} label="Liked Songs" />
        </div>
      )}

      {isAdmin() && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', padding: '12px 12px 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Admin
          </div>
          <NavItem to="/admin" icon={BarChart3} label="Dashboard" />
          <NavItem to="/admin/albums" icon={Library} label="Albums" />
          <NavItem to="/admin/users" icon={Settings} label="Users" />
        </div>
      )}

      <div style={{ flex: 1 }} />

      {user ? (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 4 }}>
            {user.avatar_url
              ? <img src={user.avatar_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
              : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>
                  {(user.display_name || user.email)?.[0]?.toUpperCase()}
                </div>
            }
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.display_name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {user.subscription === 'premium'
                  ? <span className="badge badge-premium"><Crown size={9} /> Premium</span>
                  : <span className="badge badge-free">Free</span>
                }
              </div>
            </div>
          </div>
          <NavItem to="/profile" icon={User} label="My Account" />
          <button className="nav-item" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      ) : (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <NavLink to="/login" className="btn btn-ghost" style={{ width: '100%' }}>Sign In</NavLink>
          <NavLink to="/register" className="btn btn-primary" style={{ width: '100%' }}>Create Account</NavLink>
        </div>
      )}
    </aside>
  );
}