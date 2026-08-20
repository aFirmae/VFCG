import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-navy-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-saffron-500 flex items-center justify-center text-white font-bold font-display text-lg">
                RS
              </div>
              <div>
                <div className="font-display font-semibold text-sm">Revenue Services Portal</div>
                <div className="text-navy-300 text-xs">Government of India</div>
              </div>
            </div>
            <p className="text-navy-300 text-sm leading-relaxed max-w-xs">
              Multilingual Voice-First Certificate Services Platform. Delivering 25+ revenue services
              with accessible channels for all citizens.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4 text-saffron-400">Quick Links</h4>
            <ul className="space-y-2 list-none p-0 m-0">
              {['Income Certificate', 'Domicile Certificate', 'Caste Certificate', 'Solvency Certificate', 'Nativity Certificate'].map(item => (
                <li key={item}>
                  <a href="#" className="text-navy-300 hover:text-white text-sm transition-colors no-underline">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4 text-saffron-400">Contact</h4>
            <div className="space-y-2 text-sm text-navy-300">
              <p className="m-0">📧 support@revenueservices.gov.in</p>
              <p className="m-0">📞 1800-XXX-XXXX (Toll Free)</p>
              <p className="m-0">🕐 Mon-Sat: 9:00 AM - 6:00 PM</p>
            </div>
            <div className="mt-4 flex gap-3">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-saffron-500 flex items-center justify-center text-white text-xs transition-all no-underline" aria-label="Twitter">𝕏</a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-saffron-500 flex items-center justify-center text-white text-xs transition-all no-underline" aria-label="Facebook">f</a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-saffron-500 flex items-center justify-center text-white text-xs transition-all no-underline" aria-label="YouTube">▶</a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-navy-400 text-xs m-0">
            © 2026 Revenue Department, Government of India. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-navy-400 hover:text-white text-xs transition-colors no-underline">Terms of Service</a>
            <a href="#" className="text-navy-400 hover:text-white text-xs transition-colors no-underline">Privacy Policy</a>
            <a href="#" className="text-navy-400 hover:text-white text-xs transition-colors no-underline">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
