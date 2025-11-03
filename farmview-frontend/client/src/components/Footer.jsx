import { Link } from 'react-router-dom';
import { 
  FaSeedling, 
  FaTwitter, 
  FaFacebook, 
  FaLinkedin, 
  FaGithub,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', path: '/#features' },
      { label: 'Pricing', path: '/#pricing' },
      { label: 'Documentation', path: '/docs' },
      { label: 'API', path: '/api' }
    ],
    company: [
      { label: 'About Us', path: '/about' },
      { label: 'Team', path: '/team' },
      { label: 'Careers', path: '/careers' },
      { label: 'Blog', path: '/blog' }
    ],
    support: [
      { label: 'Help Center', path: '/help' },
      { label: 'Contact', path: '/contact' },
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' }
    ]
  };

  const socialLinks = [
    { icon: <FaTwitter />, url: 'https://twitter.com', label: 'Twitter' },
    { icon: <FaFacebook />, url: 'https://facebook.com', label: 'Facebook' },
    { icon: <FaLinkedin />, url: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: <FaGithub />, url: 'https://github.com', label: 'GitHub' }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <FaSeedling className="text-white text-xl" />
              </div>
              <span className="text-xl font-bold text-white">FarmView AI</span>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Empowering farmers with AI-powered satellite monitoring, insurance integration, 
              and smart farm management solutions for sustainable agriculture.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <FaEnvelope className="text-primary-500" />
                <span>support@farmviewai.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaPhone className="text-primary-500" />
                <span>+91 1800-123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-primary-500" />
                <span>Pune, Maharashtra, India</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path} 
                    className="hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path} 
                    className="hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path} 
                    className="hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-gray-400 text-sm text-center md:text-left">
              &copy; {currentYear} FarmView AI. SSPU Hackathon Project. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Made with Love */}
            <p className="text-gray-400 text-sm text-center md:text-right">
              Made with ❤️ for Indian Farmers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
