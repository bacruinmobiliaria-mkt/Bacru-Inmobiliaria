'use client';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    const tok = localStorage.getItem('bacru-admin-token');
    if (tok) router.replace('/admin/dashboard');
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al iniciar sesión'); setLoading(false); return; }
      localStorage.setItem('bacru-admin-token', data.token);
      localStorage.setItem('bacru-admin-email', data.email);
      router.push('/admin/dashboard');
    } catch {
      setError('Error de red. Verifica que el servidor esté activo (npm start).');
      setLoading(false);
    }
  };

  return (
    // Explicit dark bg + light text — independent of global CSS
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0D1117',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(14px, 4vw, 24px)',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Card */}
      <div style={{
        width: '100%', maxWidth: '400px',
        backgroundColor: '#161B22',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '16px',
        padding: 'clamp(26px, 7vw, 40px) clamp(18px, 6vw, 32px)',
      }}>
        {/* Logo + title */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            width:64, height:64, borderRadius:16,
            backgroundColor:'rgba(212,175,55,0.12)',
            border:'1px solid rgba(212,175,55,0.3)',
            marginBottom:16,
          }}>
            <Image src="/images/logo-nobg.png" alt="Bacru" width={40} height={40} style={{objectFit:'contain'}}/>
          </div>
          <h1 style={{ color:'#FFFFFF', fontSize:22, fontWeight:700, margin:'0 0 6px 0', letterSpacing:'-0.3px' }}>
            Panel de Administración
          </h1>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14, margin:0 }}>
            Bacru Inmobiliaria · Acceso restringido
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', color:'rgba(255,255,255,0.65)', fontSize:12, fontWeight:600, marginBottom:8, letterSpacing:'0.08em', textTransform:'uppercase' }}>
              Correo electrónico
            </label>
            <input
              required type="email"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="correo@gmail.com"
              style={{
                width:'100%', boxSizing:'border-box',
                backgroundColor:'rgba(255,255,255,0.08)',
                border:'1px solid rgba(255,255,255,0.15)',
                borderRadius:12, padding:'12px 16px',
                color:'#FFFFFF', fontSize:14,
                outline:'none', transition:'border-color 0.2s',
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', color:'rgba(255,255,255,0.65)', fontSize:12, fontWeight:600, marginBottom:8, letterSpacing:'0.08em', textTransform:'uppercase' }}>
              Contraseña
            </label>
            <div style={{ position:'relative' }}>
              <input
                required
                type={showPwd ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width:'100%', boxSizing:'border-box',
                  backgroundColor:'rgba(255,255,255,0.08)',
                  border:'1px solid rgba(255,255,255,0.15)',
                  borderRadius:12, padding:'12px 48px 12px 16px',
                  color:'#FFFFFF', fontSize:14,
                  outline:'none',
                }}
              />
              <button type="button" onClick={() => setShowPwd(s=>!s)}
                style={{
                  position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer',
                  color:'rgba(255,255,255,0.45)', fontSize:12, fontWeight:600,
                }}>
                {showPwd ? <EyeOff style={{width:16,height:16}}/> : <Eye style={{width:16,height:16}}/>}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              backgroundColor:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.35)',
              borderRadius:10, padding:'12px 14px', marginBottom:16,
            }}>
              <p style={{ color:'#FCA5A5', fontSize:13, margin:0 }}>{error}</p>
            </div>
          )}

          <div style={{ height:8 }}/>

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{
              width:'100%', padding:'14px',
              background:'linear-gradient(135deg,#D4AF37,#F4E27A,#B8962A)',
              color:'#000000', fontWeight:700, fontSize:14,
              border:'none', borderRadius:12, cursor:loading?'not-allowed':'pointer',
              opacity:loading?0.6:1, letterSpacing:'0.05em',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            }}>
            {loading ? 'Verificando…' : <><LogIn style={{width:15,height:15}}/> Ingresar al Panel</>}
          </button>
        </form>

        <p style={{ textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:11, marginTop:24 }}>
          Contraseña configurable en <code style={{backgroundColor:'rgba(255,255,255,0.06)',padding:'2px 6px',borderRadius:4}}>ADMIN_PASSWORD</code> en .env.local
        </p>
      </div>
    </div>
  );
}
