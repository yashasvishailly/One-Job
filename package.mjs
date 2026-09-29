// Pure, dependency-free export helpers. No network calls or credentials.
export const ROLE_OPTIONS = ['Chief of Staff', "Founder’s Office", 'GTM & Growth', 'Revenue Operations', 'Strategy & Operations', 'First Generalist'];
export const CURRENCIES = ['INR', 'USD', 'GBP', 'EUR', 'SGD', 'AED'];
export const STATUSES = ['Saved', 'Applied', 'Contacted', 'Replied', 'Interviewing', 'Closed'];
export const ASSISTANTS = ['Not decided yet', 'Claude', 'Gemini', 'Copilot', 'Another assistant'];
export const EMPTY_PROFILE = Object.freeze({name:'', roles:[], customRole:'', experience:'', locations:'', workStyle:'Any arrangement', salary:'', currency:'INR', flexible:false, industries:'', exclusions:'', assistant:'Not decided yet', remember:false});

export function normalizeProfile(raw = {}) {
  const p = {...EMPTY_PROFILE, roles:[]};
  for (const key of ['name','customRole','experience','locations','salary','industries','exclusions']) p[key] = typeof raw[key] === 'string' ? raw[key].trim().slice(0, key === 'exclusions' ? 1500 : 500) : '';
  p.roles = Array.isArray(raw.roles) ? ROLE_OPTIONS.filter(role => raw.roles.includes(role)) : [];
  if (CURRENCIES.includes(raw.currency)) p.currency = raw.currency;
  if (['Any arrangement','Remote','Hybrid','On-site'].includes(raw.workStyle)) p.workStyle = raw.workStyle;
  if (ASSISTANTS.includes(raw.assistant)) p.assistant = raw.assistant;
  p.flexible = raw.flexible === true;
  p.remember = raw.remember === true;
  return p;
}
export function allRoles(p) { return [...p.roles, ...p.customRole.split(',').map(s=>s.trim()).filter(Boolean)]; }
export function validateProfile(p, step = 2) {
  p = normalizeProfile(p);
  if (!allRoles(p).length) return 'Choose at least one role or add your own.';
  if (!p.experience) return 'Describe the seniority or scope you are looking for.';
  if (step >= 2 && !p.locations) return 'Add at least one location or country you can work from.';
  if (step >= 2 && !p.flexible && (!/^\d+(\.\d{1,2})?$/.test(p.salary) || Number(p.salary) <= 0 || Number(p.salary) > 1e12)) return 'Enter a positive annual salary floor, or select “Keep compensation flexible”.';
  return '';
}
export function profileData(p) {
  return {
    name:p.name || '[Your Name]', assistant:p.assistant, target_roles:allRoles(p), seniority_and_scope:p.experience,
    acceptable_locations:p.locations, work_arrangement:p.workStyle,
    annual_compensation_floor:p.flexible ? {flexible:true} : {currency:p.currency, amount:Number(p.salary)},
    priority_industries:p.industries || 'Open to any industry', exclusions:p.exclusions || 'No additional exclusions specified',
    resume:'Attach directly in your assistant; not collected by this website.',
    source_access:'Confirm available browsing and connected tools before research.',
    tracker:'Use the attached tracker template, or ask for an existing tracker to update.'
  };
}
export const TRACKER_COLUMNS = ['lead_id','company','role','location','source_url','source_posted_date','verified_date','decision','fit_reason','risk','contact_name','contact_evidence_url','date_added','last_seen_date','applied_date','outreach_sent_date','reply_date','outcome_date','status','follow_up_date','next_action','notes'];
export function csv(rows) {
  return rows.map(row => row.map(value => {
    let s = String(value ?? '');
    if (/^[\s]*[=+@-]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"','""') + '"';
  }).join(',')).join('\r\n') + '\r\n';
}
export const TRACKER = csv([TRACKER_COLUMNS]);
