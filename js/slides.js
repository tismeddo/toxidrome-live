// Lecture content. `deck` = slide number in the PowerPoint (used to pull its evidence chips).
// Question slides: `answer` is the 0-based index of the correct option.

const P10_13 = [
  "20-year-old male with HR 40, BP 70/40, miosis, not breathing over the vent",
  "27-year-old female with HR 40, BP 70/40, who's needed D50 pushes x3",
  "24-year-old female with HR 40, BP 70/40, with sugars persistently in 200s",
  "22-year-old male with HR 110, BP 70/40, and K of 4.8",
];

export const SLIDES = [
  { type: "title", deck: 1, title: "TOX", byline: "Diego Marin, DO, FCCP", sub: "PGY-12" },

  { type: "text", deck: 2, title: "The scenario", bullets: [
    "You are on call when you hear in the news that a local cult just had a mass suicide attempt event",
    "Your attending likes to encourage your autonomy and has decided to remain available only as needed",
    "Patients begin to flood the ER and you are asked to go down to help triage",
    "Every cult member brought their medications and various household items to the event and picked something at random to ingest, so their past medical history is unfortunately not very useful",
    "Ingestion timing varies, but it has been at least 30 minutes for most",
    "The ones who are awake enough to converse refuse to cooperate",
  ]},

  { type: "question", id: "q1", deck: 3, title: "Patient 1",
    stem: "38-year-old male. He appears dyspneic. Very dyspneic. Mental status appears intact but he won't speak to you. Vitals are stable but he is febrile to 102 °F. A BMP and an ABG accompany him.",
    labs: [["BMP", [["Na", "140"], ["Cl", "102"], ["CO₂", "16"]]], ["ABG", [["pH", "7.44"], ["PaO₂", "110"], ["PaCO₂", "16"], ["HCO₃⁻", "18"]]]],
    ask: "What do you do next?",
    options: ["Sepsis bundle and empiric antibiotics", "NGT and attempt activated charcoal", "Acetazolamide to alkalize urine", "Intubate immediately"],
    answer: 1 },

  { type: "question", id: "q2", deck: 4, title: "Patient 1",
    stem: "Decontamination is underway. You want to aid his excretion of the offending agent.",
    ask: "You decide to initiate:",
    options: ["Citrate", "Bicarb IV", "Bicarb PO", "Acetazolamide"],
    answer: 1 },

  { type: "question", id: "q3", deck: 5, title: "Patient 1",
    stem: "He begins to seize and throws up black. You intubate him for airway safety. Repeat ABG shows worsening hypoxia. You control seizures with benzodiazepines and a propofol drip… for now.",
    ask: "What needs to be done next?",
    options: ["Push 23.4% saline (silver bullet) and start a 3% saline infusion", "Insert a dialysis catheter and call nephro to dialyze", "Put him on VV ECMO expecting worsening hypoxia", "Call the nearest liver transplant center for emergent evaluation"],
    answer: 1 },

  { type: "explain", deck: 6, title: "Salicylates", groups: [
    { q: "q1", items: [
      ["Sepsis bundle and empiric antibiotics", "History: you know it's an ingestion"],
      ["NGT and attempt activated charcoal", "Ingestion was recent; no contraindications like decreased mental status, poor GI motility or GI hemorrhage"],
      ["Acetazolamide to alkalize urine", "Causes systemic acidemia, which raises serum salicylate by displacing it from protein binding"],
      ["Intubate immediately", "Protecting the airway is not indicated at this point"]]},
    { q: "q2", items: [
      ["Citrate", "Used for RTA type 2; too slow"],
      ["Bicarb IV", "Alkalizes urine: raising urine pH from 6.1 to 8.1 gives 17x salicylate excretion"],
      ["Bicarb PO", "Contraindicated: speeds dissolution of salicylate tablets in the gut and increases absorption"],
      ["Acetazolamide", "As above: makes toxicity worse"]]},
    { q: "q3", items: [
      ["Push 23.4% saline and start 3% saline", "Not a hyponatremia scenario; treat the underlying cause"],
      ["Insert a dialysis catheter and call nephro", "Enough to seize (levels >90), or coma, seizures, noncardiogenic pulmonary edema or severe renal insufficiency = dialyze"],
      ["VV ECMO for worsening hypoxia", "The hypoxia is from noncardiogenic pulmonary edema"],
      ["Liver transplant evaluation", "Not a hepatic issue"]]},
  ]},

  { type: "images", deck: 7, title: "Salicylates: mechanism, presentation, testing, treatment",
    images: [["img/salicylate-mechanism.png", "Salicylate mechanism of toxicity and clinical presentation by phase"], ["img/salicylate-testing-treatment.png", "Salicylate diagnostic testing, treatment and dialysis indications"]] },

  { type: "background", title: "Background: salicylates",
    points: [
      ["Two acid–base hits", "Direct medullary stimulation drives an early respiratory alkalosis. Uncoupled oxidative phosphorylation then builds an anion-gap metabolic acidosis and heat."],
      ["Acidemia pulls salicylate into the brain", "Salicylic acid (pKa ≈3) is more non-ionized as pH falls, so more crosses into the CNS. The same serum level is more dangerous at a lower pH."],
      ["Alkalinize blood and urine", "IV bicarbonate keeps salicylate ionized in blood and traps it in urine. Replete potassium, or the kidney won't make alkaline urine."],
      ["Intubation is the dangerous moment", "Losing the patient's own hyperventilation drops pH fast. Match the minute ventilation, give bicarbonate around intubation, and line up dialysis."],
    ],
    reading: ["palmer2020", "juurlink2015", "acmt2015"] },

  { type: "question", id: "q4", deck: 8, title: "Patients 2–5",
    stem: "A frantic pharmacist hands you a syringe of physostigmine. You now frantically look for a patient who may need it. Four patients sit in the more acute area of the ER and have already required heavy doses of benzodiazepines.",
    ask: "Which patient requires this medication?",
    options: [
      "28-year-old male with tachycardia, hypertension, febrile to 40 °C, rigid, had a seizure before the benzos were given",
      "21-year-old female with confusion, tachycardia, sweating, incontinence, muscle stiffness, diminished reflexes",
      "29-year-old male who came in tearing, confused, salivating; intubated for airway safety, vomited during intubation, pooling secretions, bradycardic with high peak pressures but low plateaus, and hypoxic",
      "33-year-old female febrile to 40 °C, tachycardic, confused, dry mucous membranes, suprapubic tenderness and fullness"],
    answer: 3, dense: true },

  { type: "question", id: "q5", deck: 10, title: "Patient 4",
    stem: "You gave the medication to the right patient. Now another pharmacist asks what you want from a bag of medications he is carrying around in the chaos. Which of these do you need for the 29-year-old male who came in tearing, confused and salivating, was intubated, vomited during intubation, is pooling secretions, bradycardic with high peak pressures but low plateaus, and hypoxic?",
    options: ["Cyproheptadine", "Hydroxocobalamin", "Methylene blue", "Pralidoxime"],
    answer: 3 },

  { type: "antidotes", deck: 11, title: "Patient 4: what's in the bag", q: "q5",
    items: [["Cyproheptadine", "Serotonin syndrome"], ["Hydroxocobalamin", "Cyanide toxicity"], ["Methylene blue", "Methemoglobinemia"], ["Pralidoxime", "Cholinergic toxicity"]] },

  { type: "toxidromes", deck: 12, title: "Patients 2–5: the toxidromes", q: "q4",
    items: [
      { who: "28-year-old male: tachycardia, hypertension, 40 °C, muscle stiffness, seized before benzos", dx: "Serotonin syndrome", detail: "Hyperreflexia, more likely to seize, usually acute, diarrhea/hyperactive bowel sounds. SSRIs, SNRIs, MAOIs, TCAs, opioids, linezolid, dextromethorphan, methylene blue", tx: "Cyproheptadine" },
      { who: "21-year-old female: confusion, tachycardia, sweating, incontinence, stiffness, diminished reflexes", dx: "NMS", detail: "Bradyreflexia, lasting rigidity, more often evolves over days. Already got her “treatment”: haloperidol, antipsychotics", tx: "Benzodiazepines" },
      { who: "29-year-old male: tearing, salivating, vomiting, secretions, bradycardic, hypoxic", dx: "Cholinergic poisoning", detail: "SLUDGEM: salivation, lacrimation, urinary incontinence, diaphoresis, GI, emesis, miosis. Organophosphates, acetylcholine, methacholine, carbachol, bethanechol, tacrine, pesticides", tx: "Atropine / pralidoxime" },
      { who: "33-year-old female: 40 °C, tachycardic, confused, dry mucosa, urinary retention", dx: "Anticholinergic poisoning", detail: "Hot flushed skin, tachycardia, dilated pupils, delirium. Diphenhydramine, cyclobenzaprine, benztropine, anti-Parkinson drugs like procyclidine", tx: "Physostigmine" },
    ],
    footnote: "Both NMS and serotonin syndrome can have hypertension, tachycardia, tachypnea, hyperthermia, diaphoresis, hypersalivation, altered mental status and rigidity." },

  { type: "images", deck: 13, title: "NMS vs serotonin syndrome, and the classic toxidromes",
    images: [["img/nms-vs-serotonin.png", "Neuroleptic malignant syndrome versus serotonin syndrome comparison table"], ["img/toxidrome-table.png", "Toxidrome table: vitals, pupils, skin and mental status by toxidrome"]] },

  { type: "background", title: "Background: toxidromes and their antidotes",
    points: [
      ["Skin moisture splits the hyperadrenergic patients", "Anticholinergic: hot, dry, flushed, urinary retention, quiet bowel. Sympathomimetic: similar vitals, but diaphoretic."],
      ["Cholinergic: the killer Bs", "Bronchorrhea, bronchospasm and bradycardia kill. Titrate atropine to a clear chest, HR >80 and systolic >80. Pupils should stop being pinpoint; dilating them is not the goal."],
      ["Serotonin toxicity or NMS", "Serotonin: onset in hours, clonus and hyperreflexia, a serotonergic drug. NMS: onset over days, lead-pipe rigidity and slow reflexes, a dopamine antagonist."],
      ["Physostigmine treats the cause", "It crosses into the CNS and reverses anticholinergic delirium. Avoid it when the QRS is wide or a TCA is suspected."],
    ],
    reading: ["boyer2005", "dunkley2003", "eddleston2004"] },

  { type: "question", id: "q6", deck: 14, title: "Patients 6–9",
    stem: "The ER doctor pulls you to the geri unit where they are housing the “drunks.” He asks which patient you think needs to be dialyzed immediately so he can have his resident drop a trialysis.",
    options: [
      "50-year-old male, obtunded, osm 330, Na 140, Cl 106, CO₂ 12, Cr 1.6, BUN 28, glucose 180",
      "29-year-old female, obtunded, osm 330, Na 140, Cl 106, CO₂ 24, Cr 1.8, BUN 28, glucose 180",
      "32-year-old male, obtunded, osm 330, Na 140, Cl 106, CO₂ 9, Cr 5.0, BUN 28, glucose 180",
      "19-year-old female, obtunded, osm 330, Na 140, Cl 106, CO₂ 24, Cr 1.2, BUN 28, glucose 180"],
    answer: 2 },

  { type: "alcohols", deck: 15, title: "Patients 6–9: the alcohols", q: "q6",
    lead: "Every patient has an osmolar gap of 30, so another osmole is present.",
    items: [
      { who: "50-year-old male", math: "AG 22, mild renal dysfunction", dx: "Methanol", tx: "Fomepizole first" },
      { who: "29-year-old female", math: "No anion gap", dx: "Isopropyl alcohol", tx: "Supportive" },
      { who: "32-year-old male", math: "AG 25, severe renal dysfunction", dx: "Ethylene glycol", tx: "Dialyze" },
      { who: "19-year-old female", math: "No gap, no renal dysfunction", dx: "Likely ethanol", tx: "Supportive" },
    ]},

  { type: "images", deck: 16, title: "The alcohols compared", images: [["img/toxic-alcohols.png", "Ethanol, isopropanol, methanol and ethylene glycol compared"]] },

  { type: "background", title: "Background: toxic alcohols",
    points: [
      ["Calculate the osmolal gap", "Measured − (2 Na + glucose/18 + BUN/2.8). Tonight's labs: 330 − (280 + 10 + 10) = 30."],
      ["The gaps trade places", "Early, the parent alcohol raises the osmolal gap. As ADH turns it into acids, the anion gap rises and the osmolal gap falls, so a normal osmolal gap doesn't exclude a late presentation."],
      ["The metabolites do the damage", "Methanol → formic acid: optic nerve and basal ganglia. Ethylene glycol → glycolate and oxalate: acidosis, calcium-oxalate AKI, hypocalcemia. Isopropanol → acetone: ketosis without acidosis."],
      ["Block, then clear", "Fomepizole stops new acid from forming; dialysis removes the alcohol and the acid already made. Add folate for methanol, thiamine and pyridoxine for ethylene glycol."],
    ],
    reading: ["kraut2018", "brent1999", "ghannoum2023"] },

  { type: "question", id: "q7", deck: 17, title: "Patients 10–13",
    stem: "The charge nurse pulls you into fast track, which is now ironically named. Patients have already been intubated, lightly sedated, and are on high-dose norepinephrine with persistent shock. The cardiothoracic attending and perfusionist bust through the doors holding ECMO cannulas.",
    ask: "Who needs to be evaluated for VA-ECMO support first?",
    options: P10_13, answer: 2 },

  { type: "question", id: "q8", deck: 18, title: "Who took what?",
    list: P10_13,
    ask: "Match patients 1–4 to their ingestion:",
    options: ["BB, ACEi, CCB, clonidine", "ACEi, CCB, BB, clonidine", "Clonidine, BB, CCB, ACEi", "BB, CCB, clonidine, ACEi"],
    answer: 2 },

  { type: "cardio", deck: 19, title: "Patients 10–13: who took what", q: "q7",
    items: [
      { who: P10_13[0], dx: "Clonidine", detail: "Bradycardia, hypotension, miosis and respiratory depression" },
      { who: P10_13[1], dx: "β-blocker", detail: "Bradycardia, hypotension, hypoglycemia, especially non-selective agents like propranolol. Second-highest mortality" },
      { who: P10_13[2], dx: "Calcium channel blocker", detail: "Profound hypotension, bradycardia, shock, refractory acidosis; hyperglycemia because β-islet cells need calcium to release insulin. Highest mortality", key: true },
      { who: P10_13[3], dx: "ACE inhibitor", detail: "Low lethality; high K⁺ and renal dysfunction, hypotension, can have refractory tachycardia" },
    ]},

  { type: "question", id: "q9", deck: 20, revealDeck: 21, title: "Next best step",
    stem: "The right patient goes on VA-ECMO.",
    list: P10_13,
    ask: "What's the next best step for these patients?",
    options: [
      "Pacer pads on 1, glucagon to 2, renal replacement for 3, methylene blue to 4",
      "Pacer pads on 1, glucagon to 2, high-dose insulin to 3, supportive care for 4",
      "Atropine to 1, glucagon to 2, IV lipids to 3, methylene blue to 4",
      "High-dose insulin to 1, methylene blue to 2, glucagon to 3, pacer pads on 4"],
    answer: 1, dense: true },

  { type: "background", title: "Background: β-blocker and CCB shock",
    points: [
      ["Same vitals, different glucose", "CCBs block insulin release from β-islet cells, so glucose rises with severity. β-blockers, especially propranolol, can drop it."],
      ["Dihydropyridine or not", "Amlodipine mainly dilates vessels; verapamil and diltiazem also slow the heart and weaken contraction. Selectivity is lost in large overdoses."],
      ["Why high-dose insulin works", "The shocked heart shifts to burning glucose but can't take it up. Insulin restores fuel and contractility; pair it with vasopressors and dextrose."],
      ["Glucagon goes around the β receptor", "It raises cAMP through its own receptor: a reasonable bridge in β-blocker poisoning. Vomiting is common."],
      ["ECMO is a bridge to clearance", "Drug-induced shock reverses once the drug is metabolized, so VA-ECMO can rescue patients who fail maximal therapy."],
    ],
    reading: ["stonge2017", "aha2023", "engebretsen2011"] },

  { type: "question", id: "q10", deck: 22, revealDeck: 23, title: "Running low on bicarb",
    stem: "Things are finally starting to settle and most of the patients seem stable. Despite Dr. Marin's best efforts, bicarb pushes are now in short supply.",
    ask: "Which of these patients does NOT require bicarbonate?",
    options: [
      "42-year-old male with tachycardia, dry mouth, QRS of 150, hypotension, altered, urinary retention",
      "18-year-old male who keeps complaining of the “alarm,” ABG 7.36/22/100",
      "22-year-old male with osmolar gap of 35, CO₂ of 9 and Cr of 10",
      "28-year-old female with bradycardia, hypotension, CO₂ of 9, on triple pressors pending VA-ECMO"],
    answer: 2 },

  { type: "background", title: "Background: sodium-channel blockade",
    points: [
      ["TCAs block fast sodium channels", "Conduction slows: a wide QRS, a terminal R wave in aVR, then hypotension and ventricular arrhythmias."],
      ["The ECG predicts trouble", "QRS ≥100 ms: seizures in 34%; ventricular arrhythmias only at ≥160 ms. A terminal R in aVR ≥3 mm was the strongest predictor in a later cohort."],
      ["Bicarbonate works two ways", "The sodium load and the alkalemia together counteract the channel block. Repeat boluses guided by QRS narrowing."],
      ["Where it fits tonight", "Salicylates: alkalinize to trap and excrete the drug. TCAs: treat the sodium-channel block. Ethylene glycol with renal failure: dialysis clears the alcohol and its acids."],
    ],
    reading: ["boehnert1985", "liebelt1995", "bruccoleri2016"] },

  { type: "list", deck: 24, title: "Review: tonight's ingestions",
    items: ["Methanol", "Isopropyl alcohol", "Ethanol", "Ethylene glycol", "TCA", "Lithium", "CCB", "Clonidine", "BB", "ACEi", "Salicylates", "Sulfonylureas", "Metformin"] },

  { type: "final", deck: 25, title: "Fin" },

  { type: "references", title: "References" },
];

export const QUESTIONS = SLIDES.filter(s => s.type === "question");
export const QUESTION_BY_ID = Object.fromEntries(QUESTIONS.map((q, i) => [q.id, { ...q, number: i + 1 }]));
export const LETTERS = ["A", "B", "C", "D"];
export const ROUND_MS = 30000;

// Kahoot-style scoring: correct answers earn 500–1000 points, scaled by speed.
export function scoreFor(correct, elapsedMs, durMs = ROUND_MS) {
  if (!correct) return 0;
  const e = Math.min(Math.max(elapsedMs, 0), durMs);
  return Math.round(1000 * (1 - e / durMs / 2));
}

export function standings(scores, players) {
  const rows = Object.keys(players || {}).map(id => ({ id, name: players[id]?.name || "Player", score: (scores || {})[id] || 0 }));
  rows.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  let rank = 0, prev = null;
  rows.forEach((r, i) => { if (r.score !== prev) { rank = i + 1; prev = r.score; } r.rank = rank; });
  return rows;
}
