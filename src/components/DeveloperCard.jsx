import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

// LinkedIn SVG — official brand blue, rendered inline so no extra dependency
const LinkedInIcon = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M20.447 20.452H17.21v-5.569c0-1.328-.024-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.985V9h3.105v1.561h.044c.432-.82 1.489-1.685 3.065-1.685 3.277 0 3.882 2.156 3.882 4.961v6.615zM5.337 7.433a1.8 1.8 0 1 1 0-3.601 1.8 1.8 0 0 1 0 3.601zm1.554 13.019H3.782V9h3.109v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

// Phone SVG — clean call icon
const PhoneIcon = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const DEVELOPERS = [
  {
    role: 'Developer',
    name: 'YASWANTH KUMAR RAYI',
    linkedin: 'https://www.linkedin.com/in/yaswanthkumarrayi/',
    phone: '+918332929646',
  },
  {
    role: 'Co-Developer',
    name: 'ROOP HARSHAD KUMAR',
    linkedin: 'http://linkedin.com/in/roop-harshad-kumar-55212533b/',
    phone: null,
  },
];

const DeveloperCard = ({ onClose }) => {
  const handleKey = useCallback(
    (e) => { if (e.key === 'Escape') onClose(); },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-5"
      role="dialog"
      aria-modal="true"
      aria-label="Developer information"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative w-full max-w-xs bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">

        {/* Header — reuses footer background for theme consistency */}
        <div
          className="relative bg-cover bg-center px-5 py-4"
          style={{ backgroundImage: "url('/FooterBg.jpg')" }}
        >
          <div className="absolute inset-0 bg-black/72" />
          <div className="relative z-10 flex items-center justify-between">
            <p className="font-montserrat text-[11px] font-semibold text-white/60 uppercase tracking-[0.15em]">
              Built with care
            </p>
            <button
              onClick={onClose}
              aria-label="Close developer card"
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/15 active:bg-white/25 transition-all duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Entries */}
        <div className="p-5 space-y-3">
          {DEVELOPERS.map((dev, index) => (
            <div key={dev.name}>
              {/* Divider between entries */}
              {index > 0 && <div className="border-t border-gray-100 mb-3" />}

              <div className="flex items-center justify-between gap-3">
                {/* Left: role + name */}
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-semibold font-montserrat text-primary/70 uppercase tracking-[0.12em] mb-0.5">
                    {dev.role}
                  </span>
                  <p className="font-rubik font-bold text-[13px] sm:text-sm text-gray-900 leading-snug truncate">
                    {dev.name}
                  </p>
                </div>

                {/* Right: icon buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* LinkedIn icon button */}
                  <a
                    href={dev.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${dev.name} on LinkedIn`}
                    className="
                      w-9 h-9 rounded-xl flex items-center justify-center
                      bg-[#0A66C2]/10 text-[#0A66C2]
                      hover:bg-[#0A66C2] hover:text-white
                      active:scale-90
                      transition-all duration-200
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66C2]/50
                    "
                  >
                    <LinkedInIcon className="w-[18px] h-[18px]" />
                  </a>

                  {/* Phone icon button — only when phone exists */}
                  {dev.phone && (
                    <a
                      href={`tel:${dev.phone}`}
                      aria-label={`Call ${dev.name}`}
                      className="
                        w-9 h-9 rounded-xl flex items-center justify-center
                        bg-gray-100 text-gray-600
                        hover:bg-gray-800 hover:text-white
                        active:scale-90
                        transition-all duration-200
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400
                      "
                    >
                      <PhoneIcon className="w-[17px] h-[17px]" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom copyright */}
        <div className="px-5 pb-4 pt-0">
          <p className="text-center text-[10px] text-gray-300 font-montserrat tracking-wide">
            Sai Lakshmi Home Foods &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeveloperCard;
