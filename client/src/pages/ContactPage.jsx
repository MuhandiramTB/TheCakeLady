import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import Card from '../ui/Card.jsx';
import { SkeletonPage } from '../ui/Skeleton.jsx';

export default function ContactPage() {
  const [info, setInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api('/store-info').then((r) => setInfo(r.data)).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <SkeletonPage cards={3} />;
  if (!info) return <p className="text-center text-white/60 py-12">Contact info not available.</p>;

  const hours = []; // cakes don't have operating hours — leave empty so section is skipped

  const waLink = info.whatsapp ? `https://wa.me/${info.whatsapp.replace(/[^0-9]/g, '')}` : null;
  const mapsLink = info.googleMapsUrl || (info.address ? `https://maps.google.com/?q=${encodeURIComponent(info.address)}` : null);

  return (
    <div className="max-w-3xl mx-auto py-6 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Contact Us</h1>
        <p className="text-white/60">We're here to help — call, WhatsApp, or visit us.</p>
      </div>

      {/* Primary contact grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {info.phone && (
          <a href={`tel:${info.phone.replace(/\s+/g, '')}`}
             className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-accent/40 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider">Call</p>
                <p className="font-semibold text-white">{info.phone}</p>
              </div>
            </div>
          </a>
        )}

        {waLink && (
          <a href={waLink} target="_blank" rel="noopener noreferrer"
             className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-green-500/40 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider">WhatsApp</p>
                <p className="font-semibold text-white">{info.whatsapp}</p>
              </div>
            </div>
          </a>
        )}

        {info.email && (
          <a href={`mailto:${info.email}`}
             className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-blue-500/40 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-white/50 uppercase tracking-wider">Email</p>
                <p className="font-semibold text-white truncate">{info.email}</p>
              </div>
            </div>
          </a>
        )}

        {mapsLink && (
          <a href={mapsLink} target="_blank" rel="noopener noreferrer"
             className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-red-500/40 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-white/50 uppercase tracking-wider">Visit Us</p>
                <p className="font-semibold text-white truncate">{info.address}</p>
              </div>
            </div>
          </a>
        )}
      </div>

      {/* Operating hours */}
      {hours.length > 0 && (
        <Card className="mb-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Opening Hours
          </h2>
          <div className="divide-y divide-white/5">
            {hours.map((h) => (
              <div key={h.dayOfWeek} className="flex items-center justify-between py-2.5">
                <span className="text-white/80 font-medium">{h.dayName || ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][h.dayOfWeek]}</span>
                {h.isClosed ? (
                  <span className="text-red-400 text-sm font-medium">Closed</span>
                ) : (
                  <span className="text-accent text-sm font-mono">{h.openTime} – {h.closeTime}</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Order note */}
      {info.orderNote && (
        <Card className="bg-accent/5 border-accent/20">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm text-white/80">{info.orderNote}</p>
          </div>
        </Card>
      )}

      {/* Socials */}
      {(info.facebookUrl || info.instagramUrl) && (
        <div className="flex justify-center gap-3 mt-6">
          {info.facebookUrl && (
            <a href={info.facebookUrl} target="_blank" rel="noopener noreferrer"
               className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-500/40 transition-colors">
              <svg className="w-5 h-5 text-white/80" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          )}
          {info.instagramUrl && (
            <a href={info.instagramUrl} target="_blank" rel="noopener noreferrer"
               className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-pink-500/20 hover:border-pink-500/40 transition-colors">
              <svg className="w-5 h-5 text-white/80" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
