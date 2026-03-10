export const SECTION_CONFIG = {
  "GENERAL WARD": { icon: "🏥", color: "#0ea5e9" },
  "ROD":          { icon: "🏠", color: "#22c55e" },
  "HIGH CARE":    { icon: "❤️", color: "#f97316" },
  "MEMORY CARE":  { icon: "🧠", color: "#a78bfa" },
  "QUERY":        { icon: "❓", color: "#f59e0b" },
};

export const RECURRING_DEFAULTS = ["Vitals", "Medications", "Pain assessment"];

export const INCIDENT_WORKFLOWS = {
  fall: {
    label: "🪜 Fall",
    color: "#f97316",
    steps: [
      { id: "ir",       label: "Incident Report",       detail: "Complete facility incident report form" },
      { id: "neuro",    label: "Neuro Obs",              detail: "GCS, pupils (PEARL), orientation to TPP, limb strength x4, ROM and rotation" },
      { id: "skin",     label: "Skin Assessment",        detail: "Full skin check — nil new injury or describe/measure/photograph findings" },
      { id: "wound",    label: "Wound Assessment",       detail: "If skin tear/laceration — measure, photograph, dress, update wound chart" },
      { id: "pain",     label: "Pain Assessment",        detail: "Pain score, location, character — administer PRN if indicated and document effect" },
      { id: "delirium", label: "Delirium Screening",     detail: "Complete DOSS or facility delirium tool — document result and score" },
      { id: "msu",      label: "? MSU if Indicated",     detail: "Consider UTI as contributing factor — collect MSU if clinically appropriate" },
      { id: "frat",     label: "FRAT",                   detail: "Update Falls Risk Assessment Tool — adjust care plan if score has changed" },
      { id: "gp",       label: "Contact GP",             detail: "Report fall and findings — document GP name, time, outcome, plan" },
      { id: "nok",      label: "Contact NOK",            detail: "Open disclosure as per policy — document name, time, response" },
      { id: "mgmt",     label: "Notify Management",      detail: "Inform via huddle or direct contact — document method and time" },
      { id: "note",     label: "Progress Note",          detail: "Write full clinical progress note documenting assessment, interventions, communications" },
    ],
    reportPrompt: `Format these fall incident notes into a structured aged care clinical progress note using ABCDE framework. Include: incident description, O/E findings (neuro obs, skin assessment, pain), any medications given, GP/NOK/management communications. Use nursing abbreviations (NP, S/C, PRN, SOB, RR, SpO2, GCS, PEARL, ROM, TPP). Leave [placeholder] for missing info. Output note only.`,
  },

  medication: {
    label: "💊 Medication Incident",
    color: "#a78bfa",
    steps: [
      { id: "ir",       label: "Incident Report",        detail: "Complete facility incident report — type, medication, dose, time, discovered by" },
      { id: "vitals",   label: "Vital Signs",            detail: "BP, HR, RR, SpO2, Temp — document and compare to baseline" },
      { id: "pain",     label: "Adverse Effect Monitoring", detail: "Assess for adverse effects, pain, discomfort related to medication incident" },
      { id: "pharmacy", label: "Notify Pharmacy",        detail: "Inform pharmacist of incident — document name, time, advice given" },
      { id: "gp",       label: "Contact GP",             detail: "Report incident and clinical status — document GP name, time, management plan" },
      { id: "nok",      label: "Contact NOK",            detail: "Open disclosure — document name, time, response" },
      { id: "mgmt",     label: "Notify Management",      detail: "Report per facility policy — document method and time" },
      { id: "note",     label: "Progress Note",          detail: "Document incident, assessment findings, communications, monitoring plan" },
    ],
    reportPrompt: `Format these medication incident notes into a structured aged care clinical progress note. Include: type of incident, medication involved, dose discrepancy if applicable, resident assessment post-incident (vitals, symptoms), actions taken, pharmacy/GP/NOK/management communications, monitoring plan. Use nursing abbreviations. Leave [placeholder] for missing info. Output note only.`,
  },

  wound: {
    label: "🩹 Wound",
    color: "#ef4444",
    steps: [
      { id: "ir",     label: "Incident Report",           detail: "Complete incident report if new or worsened wound" },
      { id: "assess", label: "Wound Assessment",          detail: "Location, type, size (cm x cm), wound bed, exudate (amount/colour), surrounding skin, odour, pain score" },
      { id: "photo",  label: "Wound Photo",               detail: "Photograph with ruler — upload to resident file with date/time" },
      { id: "wmp",    label: "Wound Management Plan",     detail: "Document or update WMP — dressing type, frequency, review date, goals" },
      { id: "chart",  label: "Wound Chart",               detail: "Complete wound chart with all measurement and assessment findings" },
      { id: "gp",     label: "Contact GP",                detail: "Notify if new significant wound, signs of infection, or clinical deterioration" },
      { id: "nok",    label: "Contact NOK",               detail: "Inform of wound and management plan — document name, time, response" },
      { id: "note",   label: "Progress Note",             detail: "Document wound assessment, treatment applied, plan, communications" },
    ],
    reportPrompt: `Format these wound assessment notes into a structured aged care clinical progress note. Include: wound location, type, dimensions, wound bed description, exudate, surrounding skin condition, pain, dressing applied, WMP updated, communications. Use nursing abbreviations. Leave [placeholder] for missing info. Output note only.`,
  },

  sirs: {
    label: "⚠️ SIRS / Reportable",
    color: "#ef4444",
    steps: [
      { id: "ir",         label: "Incident Report",              detail: "Complete facility incident report immediately — be factual and objective" },
      { id: "escalate",   label: "Escalate to Management",       detail: "Notify manager immediately — they determine SIRS category" },
      { id: "sirs_cat",   label: "Determine SIRS Category",      detail: "Cat 1 (serious): report to Commission within 24hrs. Cat 2: within 30 days" },
      { id: "police",     label: "? Contact Police if Appropriate", detail: "Consider if incident involves assault, abuse, or unexplained injury — document decision either way" },
      { id: "gp",         label: "Contact GP",                   detail: "Inform GP of incident — document name, time, clinical plan" },
      { id: "nok",        label: "Inform NOK",                   detail: "Open disclosure per policy — document name, time, response" },
      { id: "commission", label: "Report to Aged Care Commission", detail: "Complete SIRS notification via My Aged Care portal within required timeframe" },
      { id: "note",       label: "Progress Note",                detail: "Factual, objective clinical note — avoid subjective language or assumptions" },
    ],
    reportPrompt: `Format these SIRS/reportable incident notes into a factual, objective aged care clinical progress note. Be factual — no subjective language. Include: incident description, immediate actions taken, escalation steps, clinical assessment if applicable, communications with management/GP/NOK. Use nursing abbreviations. Leave [placeholder] for missing info. Output note only.`,
  },

  behavioural: {
    label: "🧠 Behavioural Escalation",
    color: "#f59e0b",
    steps: [
      { id: "ir",        label: "Incident Report",          detail: "Complete incident report if behaviour led to an incident" },
      { id: "invest",    label: "Incident Investigation",   detail: "Review triggers, timing, environment — what preceded the escalation?" },
      { id: "5p_pain",   label: "5P — Pain",               detail: "Pain score, location, character — PRN administered and effect?" },
      { id: "5p_piss",   label: "5P — Urinary",            detail: "Check for urinary retention, UTI, incontinence episode, need to void" },
      { id: "5p_poo",    label: "5P — Bowel",              detail: "Last bowel motion, constipation, faecal loading, bowel discomfort" },
      { id: "5p_pus",    label: "5P — Infection",          detail: "Signs of infection — wound, chest, urinary, skin — Temp, any systemic signs" },
      { id: "5p_psych",  label: "5P — Psychological",      detail: "Unmet need, fear, confusion, grief, positioning discomfort, environmental triggers" },
      { id: "deescalate", label: "De-escalation Documented", detail: "Document techniques used, resident response, current status" },
      { id: "note",      label: "Progress Note",            detail: "Document 5P assessment, triggers identified, interventions, outcome, plan" },
    ],
    reportPrompt: `Format these behavioural escalation notes into a structured aged care clinical progress note using the 5P framework (Pain, Urinary, Bowel, Infection, Psychological). Include: behaviour description, 5P assessment findings, interventions used, resident response, current status, plan. Use nursing abbreviations. Leave [placeholder] for missing info. Output note only.`,
  },

  confusion: {
    label: "🌀 Confusion / Delirium",
    color: "#38bdf8",
    steps: [
      { id: "cam",       label: "CAM Assessment",           detail: "Complete Confusion Assessment Method — document: acute onset, inattention, disorganised thinking, altered consciousness" },
      { id: "doss",      label: "Delirium Screening (DOSS)", detail: "Complete DOSS score — document result and change from baseline" },
      { id: "baseline",  label: "Establish Baseline",       detail: "Is this a change? Review last documented cognitive status, GCS, orientation" },
      { id: "vitals",    label: "Vital Signs",              detail: "BP, HR, RR, SpO2, Temp — fever is key, note any hypotension" },
      { id: "msu",       label: "Dip or Not to Dip",       detail: "Assess for UTI indicators — symptoms, new confusion, fever, offensive urine. Collect MSU if indicated" },
      { id: "ua",        label: "UA / MSU Findings",        detail: "Document dipstick results — leukocytes, nitrites, blood, protein. Send MSU to lab if positive" },
      { id: "infection", label: "Infection Screening",      detail: "Assess other ports of entry — chest (cough, SpO2), wound, skin, IV site" },
      { id: "meds",      label: "Medication Review",        detail: "Review for causative medications — sedatives, anticholinergics, new medications, recent changes" },
      { id: "environ",   label: "Environment / Safety",     detail: "Reduce stimulation, reorient, ensure safety, consider 1:1 if needed" },
      { id: "gp",        label: "Contact GP",               detail: "Report findings — document name, time, plan (antibiotics, investigations, monitoring)" },
      { id: "nok",       label: "Contact NOK",              detail: "Inform family of change in condition — document name, time, response" },
      { id: "note",      label: "Progress Note",            detail: "Document CAM result, DOSS score, assessment findings, investigations, plan" },
    ],
    reportPrompt: `Format these confusion/delirium assessment notes into a structured aged care clinical progress note. Include: presenting change in cognition, CAM assessment result, DOSS score, vital signs, infection screening (UTI — dip result, MSU sent, other sources), medication review, safety measures, GP/NOK communications, management plan. Use nursing abbreviations. Leave [placeholder] for missing info. Output note only.`,
  },

  medical: {
    label: "🚑 Medical Incident",
    color: "#ef4444",
    steps: [
      { id: "000",      label: "000 if Life-Threatening",  detail: "Call emergency services if required — document time called and handover given" },
      { id: "vitals",   label: "Vital Signs",              detail: "BP, HR, RR, SpO2, Temp, BGL if indicated — full set, compare to baseline" },
      { id: "assess",   label: "Clinical Assessment",      detail: "ABCDE assessment relevant to presentation" },
      { id: "ir",       label: "Incident Report",          detail: "Complete facility incident report" },
      { id: "gp",       label: "Contact GP (ISBAR)",       detail: "ISBAR handover — I: identify, S: situation, B: background, A: assessment, R: recommendation" },
      { id: "mgmt",     label: "Notify Management",        detail: "Inform manager as per facility policy — document method and time" },
      { id: "nok",      label: "Contact NOK",              detail: "Inform of incident and plan — document name, time, response" },
      { id: "monitor",  label: "Monitoring Plan",          detail: "Document frequency of obs, parameters to escalate, review time" },
      { id: "followup", label: "Follow-up Documented",     detail: "Outcome of plan, response to treatment, any changes to care" },
      { id: "note",     label: "Progress Note",            detail: "Full clinical progress note — assessment, interventions, communications, ongoing plan" },
    ],
    reportPrompt: `Format these medical incident notes into a structured aged care clinical progress note using ABCDE framework. Include: presenting concern, full clinical assessment, medications/interventions, ISBAR to GP, management plan, NOK/management communications, monitoring plan. Use nursing abbreviations. Leave [placeholder] for missing info. Output note only.`,
  },
};

export const HANDOVER_SYSTEM_PROMPT = `You are a clinical handover assistant for an aged care nurse. Given a list of patients and their incomplete tasks, generate a concise, professional end-of-shift handover note.

Format exactly as:
HANDOVER — [date] [shift]
RN: [name]

OUTSTANDING PATIENTS:
[For each patient: Name (ward, URGENT if applicable): outstanding tasks listed. Any clinical context on same line.]

PRIORITY FOR ONCOMING SHIFT:
1. [Most urgent item]
2. [Second]
3. [Third]

Keep it concise and clinical. Use standard nursing abbreviations. Do not pad or add waffle.`;
