const fs = require('fs');
let c = fs.readFileSync('src/pages/CustomerHome.jsx', 'utf8');

c = c.replace(/🛠️/g, '<Wrench size={20} />')
    .replace(/📍/g, '<MapPin size={20} />')
    .replace(/👤/g, '<User size={20} />')
    .replace(/📞/g, '<PhoneCall size={20} />')
    .replace(/🛰️/g, '<Satellite size={20} />')
    .replace(/📋/g, '<ClipboardList size={20} />')
    .replace(/❓/g, '<HelpCircle size={20} />')
    .replace(/🔔/g, '<Bell size={20} />')
    .replace(/👋/g, '<Hand size={36} className="inline text-yellow-400" />')
    .replace(/⭐/g, '<Star size={16} className="fill-current text-yellow-500" />')
    .replace(/⏱️/g, '<Clock size={14} className="inline mr-1" />')
    .replace(/✅/g, '<CheckCircle2 size={14} className="inline mr-1" />')
    .replace(/✏️/g, '<Edit2 size={16} className="inline mr-2" />')
    .replace(/📱/g, '<Smartphone size={16} className="inline mr-2" />')
    .replace(/🔐/g, '<Lock size={16} className="inline mr-2" />')
    .replace(/🗑️/g, '<Trash2 size={16} className="inline mr-2" />')
    .replace(/🚪/g, '<LogOut size={16} className="inline mr-2" />')
    .replace(/☰/g, '<Menu size={24} />');

if (!c.includes('import { Wrench')) {
    c = `import { Wrench, MapPin, User, PhoneCall, Satellite, ClipboardList, HelpCircle, Bell, Hand, Star, Clock, CheckCircle2, Edit2, Smartphone, Lock, Trash2, LogOut, Menu } from 'lucide-react'\n` + c;
}

fs.writeFileSync('src/pages/CustomerHome.jsx', c);
console.log('Done!');
