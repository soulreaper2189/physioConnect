const fs = require('fs');

const files = [
    'c:/Users/likhi/Desktop/healthcare/frontend/src/pages/DoctorDashboard.jsx'
];

const repls = {
    'bg-brand-bg/50': 'bg-slate-50/50',
    'bg-brand-bg/30': 'bg-slate-50/50',
    'bg-brand-bg': 'bg-slate-50',
    'bg-brand-card-hover/30': 'bg-slate-50',
    'bg-brand-card-hover/20': 'bg-gradient-to-br from-indigo-50 to-blue-50',
    'bg-brand-card-hover': 'bg-slate-50',
    'hover:bg-brand-card-hover': 'hover:bg-slate-50',
    'bg-brand-card': 'bg-white',
    'border-brand-border': 'border-slate-200',
    'text-brand-text-main': 'text-slate-900',
    'text-brand-text-muted': 'text-slate-500',
    'bg-brand-accent/10': 'bg-blue-50',
    'bg-brand-accent/20': 'bg-blue-100',
    'bg-brand-accent/5': 'bg-indigo-50',
    'border-brand-accent/20': 'border-indigo-200',
    'border-brand-accent/30': 'border-indigo-300',
    'border-brand-accent/50': 'border-indigo-500',
    'border-brand-accent/60': 'border-indigo-400',
    'hover:border-brand-accent/30': 'hover:border-indigo-300',
    'hover:border-brand-accent/50': 'hover:border-indigo-400',
    'hover:border-brand-accent/60': 'hover:border-indigo-400',
    'ring-brand-accent/50': 'ring-indigo-200',
    'ring-brand-accent/30': 'ring-indigo-200',
    'bg-brand-accent': 'bg-indigo-600',
    'text-brand-accent': 'text-indigo-600',
    'border-brand-accent': 'border-indigo-500',
    'ring-brand-accent': 'ring-indigo-500',
    'hover:bg-brand-accent-hover': 'hover:bg-indigo-700',
    'shadow-brand-accent/20': 'shadow-indigo-500/20',
    'shadow-brand-accent/30': 'shadow-indigo-500/30',
    'bg-red-900/30': 'bg-red-50',
    'text-red-400': 'text-red-700',
    'border-red-800': 'border-red-200',
    'bg-yellow-900/30': 'bg-yellow-50',
    'text-yellow-400': 'text-yellow-700',
    'border-yellow-800': 'border-yellow-200',
    'bg-green-900/30': 'bg-green-50',
    'text-green-400': 'text-green-700',
    'border-green-800': 'border-green-200',
};

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    for (const [k, v] of Object.entries(repls)) {
        content = content.split(k).join(v);
    }
    fs.writeFileSync(file, content);
});
console.log('Replacements completed successfully');
