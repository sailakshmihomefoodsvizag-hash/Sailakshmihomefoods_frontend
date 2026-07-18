import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { navLinks } from '../data';

const Footer = () => {

  const policyLinks = [
    { name: 'Terms & Conditions', href: '/terms-and-conditions.html' },
    { name: 'Shipping Policy', href: '/shipping-policy.html' },
    { name: 'Refund and Return Policy', href: '/refund-return-policy.html' },
    { name: 'Privacy Policy', href: '/privacy-policy.html' },
  ];

  return (
    <footer
      className="relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/FooterBg.jpg')" }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Quick Links */}
          <div>
            <h3 className="font-rubik font-bold text-[22px] text-white mb-6">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/80 hover:text-white transition-colors duration-200 font-montserrat text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policy Links */}
          <div>
            <h3 className="font-rubik font-bold text-[22px] text-white mb-6">
              Policies
            </h3>
            <ul className="space-y-3">
              {policyLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors duration-200 font-montserrat text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-rubik font-bold text-[22px] text-white mb-6">
              Contact Information
            </h3>
            <div className="space-y-4">
              <p className="font-rubik font-semibold text-white text-lg">
                Sai Lakshmi Home Foods
              </p>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-secondary flex-shrink-0" />
                <a
                  href="tel:+919966539144"
                  className="text-white/80 hover:text-white transition-colors duration-200 font-montserrat text-sm"
                >
                  +91 99665 39144
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary flex-shrink-0" />
                <a
                  href="mailto:sailakshmihomefoods.vskp@gmail.com"
                  className="text-white/80 hover:text-white transition-colors duration-200 font-montserrat text-sm break-all"
                >
                  sailakshmihomefoods.vskp@gmail.com
                </a>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <p className="text-white/80 font-montserrat text-sm leading-relaxed">
                  50-27-14, Gurudwara Up Road,
                  <br />
                  Opp. Electrical Substation, Akkayapalem,
                  <br />
                  Balayya Sastri Layout, Seethammadara,
                  <br />
                  Visakhapatnam, Andhra Pradesh 530013
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
