export const SECTION_CONFIG = {
  "GENERAL WARD": { icon: "🏥", color: "#0ea5e9" },
  "DEMENTIA UNIT": { icon: "🏠", color: "#22c55e" },
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
      { id: "ir",       label: "Incident Report",               detail: "Complete facility incident report form" },
      { id: "neuro",    label: "Neuro Obs",                     detail: "GCS, pupils (PEARL), orientation to TPP, limb strength x4, ROM and rotation" },
      { id: "skin",     label: "Skin Assessment",               detail: "Full skin check — nil new injury or describe/measure/photograph findings" },
      { id: "wound",    label: "Wound Assessment",              detail: "If skin tear/laceration — measure, photograph, dress, update wound chart" },
      { id: "pain",     label: "Pain Assessment",               detail: "Pain score, location, character — administer PRN if indicated and document effect" },
      { id: "delirium", label: "Delirium Screening",            detail: "Complete DOSS or facility delirium tool — document result and score" },
      { id: "msu",      label: "? MSU if Indicated",            detail: "Consider UTI as contributing factor — collect MSU if clinically appropriate" },
      { id: "frat",     label: "FRAT",                          detail: "Update Falls Risk Assessment Tool — adjust care plan if score changed" },
      { id: "gp",       label: "Contact GP",                    detail: "Report fall and findings — document GP name, time, outcome, plan" },
      { id: "nok",      label: "Contact NOK",                   detail: "Open disclosure as per policy — document name, time, response" },
      { id: "mgmt",     label: "Notify Management",             detail: "Inform via huddle or direct contact — document method and time" },
      { id: "note",     label: "Progress Note",                 detail: "Write full clinical progress note documenting assessment, interventions, communications" },
    ],
    reportPrompt: `Format these fall incident notes into a structured aged care clinical progress note using ABCDE framework. Include: incident description, O/E findings (neuro obs, skin assessment, pain), medications given, GP/NOK/management communications. Use nursing abbreviations (NP, S/C, PRN, SOB, RR, SpO2, GCS, PEARL, ROM, TPP). Use RM [number] for resident identifier. Leave [placeholder] for missing info. Output note only.`,
    followUp: {
      label: "Post-Fall Follow-up",
      tasks: ["Progress note", "Pain charting", "Neuro obs"],
    },
  },

  medication: {
    label: "💊 Medication Incident",
    color: "#a78bfa",
    steps: [
      { id: "ir",       label: "Incident Report",               detail: "Complete facility incident report — type, medication, dose, time, discovered by" },
      { id: "vitals",   label: "Vital Signs",                   detail: "BP, HR, RR, SpO2, Temp — document and compare to baseline" },
      { id: "pain",     label: "Adverse Effect Monitoring",     detail: "Assess for adverse effects, pain, discomfort related to medication incident" },
      { id: "pharmacy", label: "Notify Pharmacy",               detail: "Inform pharmacist — document name, time, advice given" },
      { id: "gp",       label: "Contact GP",                    detail: "Report incident and clinical status — document GP name, time, management plan" },
      { id: "nok",      label: "Contact NOK",                   detail: "Open disclosure — document name, time, response" },
      { id: "mgmt",     label: "Notify Management",             detail: "Report per facility policy — document method and time" },
      { id: "note",     label: "Progress Note",                 detail: "Document incident, assessment, communications, monitoring plan" },
    ],
    reportPrompt: `Format these medication incident notes into a structured aged care clinical progress note. Include: type of incident, medication involved, resident assessment post-incident (vitals, symptoms), actions taken, pharmacy/GP/NOK/management communications, monitoring plan. Use RM [number] for resident identifier. Use nursing abbreviations. Leave [placeholder] for missing info. Output note only.`,
    followUp: {
      label: "Post-Medication Incident Follow-up",
      tasks: ["Progress note", "Pain charting", "Vital signs"],
    },
  },

  wound: {
    label: "🩹 Wound",
    color: "#ef4444",
    steps: [
      { id: "ir",     label: "Incident Report",             detail: "Complete incident report if new or worsened wound" },
      { id: "assess", label: "Wound Assessment",            detail: "Location, type, size (cm x cm), wound bed, exudate (amount/colour), surrounding skin, odour, pain score" },
      { id: "photo",  label: "Wound Photo",                 detail: "Photograph with ruler — upload to resident file with date/time" },
      { id: "wmp",    label: "Wound Management Plan",       detail: "Document or update WMP — dressing type, frequency, review date, goals" },
      { id: "chart",  label: "Wound Chart",                 detail: "Complete wound chart with all measurement and assessment findings" },
      { id: "gp",     label: "Contact GP",                  detail: "Notify if new significant wound, signs of infection, or deterioration" },
      { id: "nok",    label: "Contact NOK",                 detail: "Inform of wound and management plan — document name, time, response" },
      { id: "note",   label: "Progress Note",               detail: "Document wound assessment, treatment applied, plan, communications" },
    ],
    reportPrompt: `Format these wound assessment notes into a structured aged care clinical progress note. Include: wound location, type, dimensions, wound bed, exudate, surrounding skin, pain, dressing applied, WMP updated, communications. Use RM [number] for resident identifier. Use nursing abbreviations. Leave [placeholder] for missing info. Output note only.`,
    followUp: null,
  },

  sirs: {
    label: "⚠️ SIRS / Reportable",
    color: "#ef4444",
    steps: [
      { id: "ir",         label: "Incident Report",                  detail: "Complete facility incident report immediately — factual and objective" },
      { id: "escalate",   label: "Escalate to Management",           detail: "Notify manager immediately — they determine SIRS category" },
      { id: "sirs_cat",   label: "Determine SIRS Category",          detail: "Cat 1 (serious): report to Commission within 24hrs. Cat 2: within 30 days" },
      { id: "police",     label: "? Contact Police if Appropriate",  detail: "Consider if incident involves assault, abuse, or unexplained injury — document decision either way" },
      { id: "gp",         label: "Contact GP",                       detail: "Inform GP of incident — document name, time, clinical plan" },
      { id: "nok",        label: "Inform NOK",                       detail: "Open disclosure per policy — document name, time, response" },
      { id: "commission", label: "Report to Aged Care Commission",   detail: "Complete SIRS notification via My Aged Care portal within required timeframe" },
      { id: "note",       label: "Progress Note",                    detail: "Factual, objective clinical note — avoid subjective language or assumptions" },
    ],
    reportPrompt: `Format these SIRS/reportable incident notes into a factual, objective aged care clinical progress note. Be factual — no subjective language. Include: incident description, immediate actions, escalation steps, clinical assessment if applicable, communications. Use RM [number] for resident identifier. Use nursing abbreviations. Leave [placeholder] for missing info. Output note only.`,
    followUp: {
      label: "Post-SIRS Follow-up",
      tasks: ["Progress note", "Vital signs", "Pain charting", "Behaviour charting", "Emotional wellbeing check"],
    },
  },

  behavioural: {
    label: "🧠 Behavioural Escalation",
    color: "#f59e0b",
    steps: [
      { id: "ir",           label: "Incident Report (if applicable)",  detail: "Complete incident report if behaviour led to an incident or injury" },
      { id: "invest",       label: "Incident Investigation",           detail: "Review triggers, timing, environment — what preceded the escalation?" },
      { id: "5p_pain",      label: "5P — Pain",                        detail: "Pain score, location, character — PRN administered and effect?" },
      { id: "5p_piss",      label: "5P — Urinary",                     detail: "Check for urinary retention, UTI, incontinence episode, need to void" },
      { id: "5p_poo",       label: "5P — Bowel",                       detail: "Last bowel motion, constipation, faecal loading, bowel discomfort" },
      { id: "5p_pus",       label: "5P — Infection",                   detail: "Signs of infection — wound, chest, urinary, skin — Temp, any systemic signs" },
      { id: "5p_psych",     label: "5P — Psychological",               detail: "Unmet need, fear, confusion, grief, positioning discomfort, environmental triggers" },
      { id: "inf_temp",     label: "Infection Screen — Temp & Vitals", detail: "Full vitals — flag Temp >38 or <36, HR >90, RR >20 as SIRS indicators" },
      { id: "inf_urine",    label: "Infection Screen — Urinary",       detail: "Offensive urine, frequency, dysuria, retention — dip if indicated, MSU if positive" },
      { id: "inf_chest",    label: "Infection Screen — Respiratory",   detail: "Cough, SOB, SpO2 change, sputum — compare to baseline" },
      { id: "inf_wound",    label: "Infection Screen — Wound/Skin",    detail: "Any wounds, pressure injuries, skin tears — signs of infection (erythema, warmth, discharge, odour)" },
      { id: "inf_other",    label: "Infection Screen — Other Sources", detail: "IV/PEG sites, oral cavity, eyes — any other potential infection source" },
      { id: "deescalate",   label: "De-escalation Documented",         detail: "Document techniques used, resident response, current status" },
      { id: "note",         label: "Progress Note",                    detail: "Document 5P assessment, infection screening findings, interventions, outcome, plan" },
    ],
    reportPrompt: `Format these behavioural escalation notes into a structured aged care clinical progress note using the 5P framework (Pain, Urinary, Bowel, Infection, Psychological) followed by infection screening results. Include: behaviour description, 5P findings, infection screen results (vitals, urinary, respiratory, wound/skin, other), interventions, response, plan. Use RM [number] for resident identifier. Use nursing abbreviations. Leave [placeholder] for missing info. Output note only.`,
    followUp: null,
  },

  confusion: {
    label: "🌀 Confusion / Delirium",
    color: "#38bdf8",
    steps: [
      { id: "cam",       label: "CAM Assessment",             detail: "Confusion Assessment Method — acute onset? inattention? disorganised thinking? altered consciousness?" },
      { id: "doss",      label: "Delirium Screening (DOSS)",  detail: "Complete DOSS score — document result and change from baseline" },
      { id: "baseline",  label: "Establish Baseline",         detail: "Is this a change? Review last documented cognitive status, GCS, orientation" },
      { id: "vitals",    label: "Vital Signs",                detail: "BP, HR, RR, SpO2, Temp — fever is key, note any hypotension" },
      { id: "msu",       label: "Dip or Not to Dip",         detail: "Assess UTI indicators — new confusion, fever, offensive urine. Collect MSU if indicated" },
      { id: "ua",        label: "UA / MSU Findings",          detail: "Document dipstick — leukocytes, nitrites, blood, protein. Send MSU to lab if positive" },
      { id: "infection", label: "Infection Screening",        detail: "Other ports of entry — chest (cough, SpO2), wound, skin, IV site" },
      { id: "meds",      label: "Medication Review",          detail: "Causative medications — sedatives, anticholinergics, new/recent changes" },
      { id: "environ",   label: "Environment / Safety",       detail: "Reduce stimulation, reorient, ensure safety, consider 1:1 if needed" },
      { id: "gp",        label: "Contact GP",                 detail: "Report findings — name, time, plan (antibiotics, investigations, monitoring)" },
      { id: "nok",       label: "Contact NOK",                detail: "Inform family of change in condition — document name, time, response" },
      { id: "note",      label: "Progress Note",              detail: "Document CAM result, DOSS score, assessment, investigations, plan" },
    ],
    reportPrompt: `Format these confusion/delirium assessment notes into a structured aged care clinical progress note. Include: presenting change in cognition, CAM result, DOSS score, vital signs, infection screening (UTI — dip result, MSU sent, other sources), medication review, safety measures, GP/NOK communications, management plan. Use RM [number] for resident identifier. Use nursing abbreviations. Leave [placeholder] for missing info. Output note only.`,
    followUp: null,
  },

  choking: {
    label: "🫁 Choking",
    color: "#ef4444",
    steps: [
      { id: "immediate",  label: "Immediate Response",         detail: "Encourage coughing, back blows, abdominal thrusts if needed — call for help" },
      { id: "000",        label: "000 if Required",            detail: "Call emergency services if airway not cleared or resident deteriorates" },
      { id: "airway",     label: "Airway Cleared",             detail: "Document how airway was cleared and resident response" },
      { id: "vitals",     label: "Vital Signs",                detail: "BP, HR, RR, SpO2, Temp post-event — compare to baseline" },
      { id: "assess",     label: "Post-Event Assessment",      detail: "Respiratory assessment — SpO2, breath sounds, any distress. Oral cavity check" },
      { id: "pain",       label: "Pain Assessment",            detail: "Throat, chest, abdominal pain post-event — administer PRN if indicated" },
      { id: "diet",       label: "Dietary / SLP Review",       detail: "Review current diet texture and fluid consistency — consider SLP referral" },
      { id: "ir",         label: "Incident Report",            detail: "Complete facility incident report" },
      { id: "gp",         label: "Contact GP",                 detail: "Notify GP — document name, time, management plan" },
      { id: "nok",        label: "Contact NOK",                detail: "Open disclosure — document name, time, response" },
      { id: "mgmt",       label: "Notify Management",          detail: "Inform manager — document method and time" },
      { id: "note",       label: "Progress Note",              detail: "Document incident, assessment, interventions, communications, dietary review" },
    ],
    reportPrompt: `Format these choking incident notes into a structured aged care clinical progress note. Include: choking event description, immediate response, airway clearance method, post-event assessment (vitals, respiratory, pain), dietary considerations, GP/NOK/management communications, plan. Use RM [number] for resident identifier. Use nursing abbreviations. Leave [placeholder] for missing info. Output note only.`,
    followUp: {
      label: "Post-Choking Follow-up",
      tasks: ["Progress note", "Pain charting", "Vital signs"],
    },
  },

  infection: {
    label: "🦠 Infection",
    color: "#22c55e",
    steps: [
      { id: "source",    label: "Identify Source",             detail: "Urinary, respiratory, wound, skin, IV/PEG site, other — document suspected source" },
      { id: "vitals",    label: "Vital Signs",                 detail: "BP, HR, RR, SpO2, Temp — flag SIRS criteria: Temp >38 or <36, HR >90, RR >20" },
      { id: "urine",     label: "Urinary Assessment",          detail: "Dipstick — leukocytes, nitrites, blood, protein. MSU if positive. Document findings" },
      { id: "chest",     label: "Respiratory Assessment",      detail: "Cough, sputum, SpO2, breath sounds — document findings" },
      { id: "wound_inf", label: "Wound/Skin Assessment",       detail: "Erythema, warmth, swelling, discharge, odour — measure and document" },
      { id: "sirs_chk",  label: "SIRS Criteria Check",        detail: "If 2+ SIRS criteria met — escalate to management, consider SIRS reporting pathway" },
      { id: "abx",       label: "Antibiotics Charted",         detail: "Document antibiotic, dose, route, start date, duration, prescriber" },
      { id: "inf_report",label: "Infection Report",            detail: "Complete facility infection report / surveillance form" },
      { id: "gp",        label: "Contact GP",                  detail: "Report findings and await management plan — document name, time, plan" },
      { id: "nok",       label: "Contact NOK",                 detail: "Inform of infection and treatment plan — document name, time, response" },
      { id: "note",      label: "Progress Note",               detail: "Document source, assessment findings, investigations, treatment, communications" },
    ],
    reportPrompt: `Format these infection management notes into a structured aged care clinical progress note. Include: suspected infection source, vital signs (SIRS criteria assessment), investigations (MSU, dipstick findings), respiratory/wound assessment if applicable, antibiotic treatment if charted, GP/NOK communications, monitoring plan. Use RM [number] for resident identifier. Use nursing abbreviations. Leave [placeholder] for missing info. Output note only.`,
    followUp: {
      label: "Infection Follow-up",
      tasks: ["Progress note", "Vital signs", "Pain charting"],
    },
  },

  medical: {
    label: "🚑 Medical Incident",
    color: "#ef4444",
    steps: [
      { id: "000",      label: "000 if Life-Threatening",    detail: "Call emergency services if required — document time called and handover given" },
      { id: "vitals",   label: "Vital Signs",                detail: "BP, HR, RR, SpO2, Temp, BGL if indicated — full set, compare to baseline" },
      { id: "assess",   label: "Clinical Assessment",        detail: "ABCDE assessment relevant to presentation" },
      { id: "ir",       label: "Incident Report",            detail: "Complete facility incident report" },
      { id: "gp",       label: "Contact GP (ISBAR)",         detail: "ISBAR handover — Identify, Situation, Background, Assessment, Recommendation" },
      { id: "mgmt",     label: "Notify Management",          detail: "Inform manager as per facility policy — document method and time" },
      { id: "nok",      label: "Contact NOK",                detail: "Inform of incident and plan — document name, time, response" },
      { id: "monitor",  label: "Monitoring Plan",            detail: "Document frequency of obs, parameters to escalate, review time" },
      { id: "followup", label: "Follow-up Documented",       detail: "Outcome of plan, response to treatment, any changes to care" },
      { id: "note",     label: "Progress Note",              detail: "Full clinical progress note — assessment, interventions, communications, ongoing plan" },
    ],
    reportPrompt: `Format these medical incident notes into a structured aged care clinical progress note using ABCDE framework. Include: presenting concern, full clinical assessment, medications/interventions, ISBAR to GP, management plan, NOK/management communications, monitoring plan. Use RM [number] for resident identifier. Use nursing abbreviations. Leave [placeholder] for missing info. Output note only.`,
    followUp: null,
  },
};

export const HANDOVER_SYSTEM_PROMPT = `You are a clinical handover assistant for an aged care nurse. Given a list of patients and their incomplete tasks, generate a concise, professional end-of-shift handover note. Use RM [number] format for resident identifiers — never use real names.

Format exactly as:
HANDOVER — [date] [shift]
RN: [name]

OUTSTANDING PATIENTS:
[For each patient: RM number (ward, URGENT if applicable): outstanding tasks listed. Any clinical context on same line.]

PRIORITY FOR ONCOMING SHIFT:
1. [Most urgent item]
2. [Second]
3. [Third]

Keep it concise and clinical. Use standard nursing abbreviations. Do not pad or add waffle.`;

export const NURSING_WORKFLOWS = {
  rod: {
    label: "📋 Resident of the Day",
    color: "#22c55e",
    frequency: "Monthly",
    steps: [
      { id: "weight",   label: "Weight",                      detail: "Weigh resident — document weight and compare to previous. Flag >3kg change to GP" },
      { id: "vitals",   label: "Vital Signs",                 detail: "Full set — BP, HR, RR, SpO2, Temp. Document and compare to baseline" },
      { id: "medreview",label: "Medication Review",           detail: "Review current medication chart — any concerns, PRN usage patterns, side effects to raise with GP" },
      { id: "note",     label: "Progress Note",               detail: "Write ROD progress note — general wellbeing, any changes since last ROD, goals, preferences" },
      { id: "family",   label: "Contact Family / NOK",        detail: "Phone call to NOK — general update, any concerns from family, document name, time, response" },
      { id: "rodfom",   label: "Complete ROD Form",           detail: "Fill in facility ROD assessment form — all fields completed and signed" },
      { id: "careplan", label: "Care Plan Current & Reflective", detail: "Review care plan — is it up to date? Does it reflect current preferences, needs, goals? Update if needed" },
    ],
    reportPrompt: `Format these Resident of the Day assessment notes into a structured aged care ROD progress note. Include: weight (and change from last), vital signs, medication review summary, general wellbeing, any changes or concerns, care plan status, family contact. Use RM [number] for resident identifier. Use nursing abbreviations. Leave [placeholder] for missing info. Output note only.`,
  },

  careplan: {
    label: "📁 Care Plan Review",
    color: "#a78bfa",
    frequency: "3-Monthly",
    steps: [
      { id: "personal",  label: "Personal Care Domain",       detail: "Assess personal hygiene, grooming, dressing, continence — current and reflective of preferences?" },
      { id: "mobility",  label: "Mobility & Falls Domain",    detail: "Assess mobility, transfers, falls risk, aids, FRAT — current and reflective of needs?" },
      { id: "nutrition", label: "Nutrition & Hydration Domain", detail: "Assess diet, fluid intake, weight trends, texture, supplements — current and reflective?" },
      { id: "skin",      label: "Skin Integrity Domain",      detail: "Assess skin condition, pressure areas, wound status, Braden score — current?" },
      { id: "pain",      label: "Pain Management Domain",     detail: "Assess pain — current pain management plan, PRN use, effectiveness — reflective of needs?" },
      { id: "cognition", label: "Cognition & Behaviour Domain", detail: "Assess cognitive status, BPSD, strategies, triggers — current and reflective?" },
      { id: "social",    label: "Psychosocial & Lifestyle Domain", detail: "Assess social engagement, activities, spiritual needs, preferences — current?" },
      { id: "medical",   label: "Medical & Medication Domain", detail: "Assess diagnoses, medications, monitoring needs — all current and documented?" },
      { id: "palliative",label: "Goals of Care / Palliative", detail: "Are goals of care documented? Advanced care planning in place and current?" },
      { id: "update",    label: "Update All Domains",         detail: "Update any domains that are not current — ensure all reflect current needs and preferences" },
      { id: "nok_copy",  label: "Send Copy to NOK",           detail: "Send or provide copy of updated care plan to NOK — document method, name, date" },
      { id: "meeting",   label: "Platform to Discuss Concerns", detail: "Offer family meeting or phone discussion — document outcome, any concerns raised, follow-up plan" },
    ],
    reportPrompt: `Format these care plan review notes into a structured aged care progress note. Summarise each domain reviewed (personal care, mobility, nutrition, skin, pain, cognition/behaviour, psychosocial, medical, goals of care), note any updates made, and document NOK communication and any concerns raised. Use RM [number] for resident identifier. Use nursing abbreviations. Leave [placeholder] for missing info. Output note only.`,
  },

  gpround: {
    label: "🩺 GP Round",
    color: "#38bdf8",
    frequency: "As scheduled",
    steps: [
      { id: "concerns",  label: "Prepare Concerns List",      detail: "Document each concern clearly — what changed, since when, relevant observations" },
      { id: "interv",    label: "Interventions to Date",      detail: "What nursing interventions have already been trialled or implemented for each concern?" },
      { id: "outcome",   label: "Suggested Outcome / Goal",   detail: "What outcome are you seeking? (e.g. medication review, investigation, referral, treatment change)" },
      { id: "monitoring",label: "Monitoring Plan Agreed",     detail: "Document GP management plan and agreed monitoring — frequency, parameters, review date" },
      { id: "nok",       label: "Inform NOK",                 detail: "Contact NOK with outcome of GP round — document name, time, information shared, response" },
      { id: "mgmt",      label: "Inform Management",          detail: "Brief management on any significant outcomes or changes from GP round — document method and time" },
      { id: "note",      label: "Progress Note",              detail: "Document GP round — concerns raised, GP findings, management plan, communications" },
    ],
    reportPrompt: `Format these GP round notes into a structured aged care progress note. For each concern include: the issue, nursing interventions to date, GP assessment/plan, agreed monitoring. Then document NOK and management communication. Use RM [number] for resident identifier. Use ISBAR-style where appropriate. Use nursing abbreviations. Leave [placeholder] for missing info. Output note only.`,
  },
};
