import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ShieldCheck, Award, Github, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white text-[#111827] relative overflow-hidden border-t border-[#E5E7EB]">
      {/* Stack Queue Brand Colors Linear Gradient Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-[#E02B91] to-[#8B2BE2]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Institute Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block group" title="STACK QUEUE — Inclusive Learning">
              <img
                src="/stackqueue-logo-light.png"
                alt="STACK QUEUE — Inclusive Learning"
                className="h-16 w-auto object-contain group-hover:opacity-90 transition-opacity"
              />
            </Link>
            <p className="text-sm text-[#4B5563] leading-relaxed pr-4">
              Empowering students with industry-oriented technology training, practical learning, internship opportunities, and real-world product development.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <span className="inline-flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Govt &amp; Industry Recognized</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 text-xs text-[#E02B91] bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
                <Award className="w-3.5 h-3.5 text-[#E02B91]" />
                <span>100% Practical Learning</span>
              </span>
            </div>
          </div>

          {/* Col 2: Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#111827]">Company</h4>
            <ul className="space-y-2 text-sm text-[#4B5563]">
              <li><Link to="/about" className="hover:text-[#E02B91] transition">About Us</Link></li>
              <li><Link to="/courses" className="hover:text-[#E02B91] transition">Courses</Link></li>
              <li><Link to="/internships" className="hover:text-[#E02B91] transition">Internships</Link></li>
              <li><Link to="/products" className="hover:text-[#E02B91] transition">Products</Link></li>
              <li><Link to="/contact" className="hover:text-[#E02B91] transition">Contact Us</Link></li>
            </ul>
          </div>

          {/* Col 3: Learning */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#111827]">Learning</h4>
            <ul className="space-y-2 text-sm text-[#4B5563]">
              <li><Link to="/courses" className="hover:text-[#E02B91] transition">All Courses (50+)</Link></li>
              <li><Link to="/internships" className="hover:text-[#E02B91] transition">Internship Domains (50+)</Link></li>
              <li><Link to="/#offers" className="hover:text-[#E02B91] transition">Special Offers</Link></li>
              <li><Link to="/about" className="hover:text-[#E02B91] transition">Certifications</Link></li>
              <li><Link to="/login" className="hover:text-[#E02B91] transition">Student LMS Portal</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact & Social */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#111827]">Contact</h4>
            <div className="space-y-2.5 text-sm text-[#4B5563]">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>+91 79049 25991 / +91 73053 70425</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#E02B91] shrink-0" />
                <a href="mailto:stackqueue2023@gmail.com" className="hover:underline">stackqueue2023@gmail.com</a>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#8B2BE2] shrink-0 mt-0.5" />
                <span>Kondalampatty, Salem - 636010, Tamil Nadu</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B5563] block mb-2">Connect With Us</span>
              <div className="flex items-center space-x-3">
                <a href="#" className="p-2 bg-[#F9FAFB] hover:bg-pink-50 border border-[#E5E7EB] hover:border-pink-200 rounded-lg transition text-[#4B5563] hover:text-[#E02B91]">
                  <Github className="w-4 h-4" />
                </a>
                <a href="#" className="p-2 bg-[#F9FAFB] hover:bg-pink-50 border border-[#E5E7EB] hover:border-pink-200 rounded-lg transition text-[#4B5563] hover:text-[#E02B91]">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" className="p-2 bg-[#F9FAFB] hover:bg-pink-50 border border-[#E5E7EB] hover:border-pink-200 rounded-lg transition text-[#4B5563] hover:text-[#E02B91]">
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Legal & Copyright */}
        <div className="mt-12 pt-8 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B7280] gap-4">
          <p>&copy; {new Date().getFullYear()} Stack Queue Technologies Inc. All rights reserved. Inclusive Learning — Educational Training &amp; Product Development.</p>
          <div className="flex items-center space-x-6">
            <Link to="/about" className="hover:text-[#E02B91] transition">Privacy Policy</Link>
            <Link to="/about" className="hover:text-[#E02B91] transition">Terms &amp; Conditions</Link>
            <Link to="/contact" className="hover:text-[#E02B91] transition">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

