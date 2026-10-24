// Lecture content. Each question is followed by a `discuss` slide (answer reasoning, background, further reading).
// `deck` = slide number in the PowerPoint (used to pull its evidence chips).
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

  { type: "discuss", q: "q1", title: "Question 1: NGT and activated charcoal",
    why: [
      ["Sepsis bundle", "You already know it's an ingestion; the fever and tachypnea are the salicylate."],
      ["NGT and charcoal", "Recent ingestion, mental status intact, no GI contraindication."],
      ["Acetazolamide", "Acidifies the blood, which pulls salicylate off proteins and into tissue."],
      ["Intubate now", "No airway indication yet, and intubation is the most dangerous moment in salicylate poisoning."],
    ],
    points: [
      ["Read the ABG", "Anion gap 22 and PaCO₂ 16 at pH 7.44: an anion-gap metabolic acidosis plus a primary respiratory alkalosis, the classic adult pattern."],
      ["Two acid–base hits", "Medullary stimulation causes the early respiratory alkalosis; uncoupled oxidative phosphorylation then builds the acidosis and the fever."],
      ["Charcoal is an option, not a rescue", "Consider it for a recent ingestion of an adsorbable drug with a protected airway; it hasn't been shown to change outcomes."],
    ],
    reading: ["chyka2005", "palmer2020", "stolbach2008"] },

  { type: "question", id: "q2", deck: 4, title: "Patient 1",
    stem: "Decontamination is underway. You want to aid his excretion of the offending agent.",
    ask: "You decide to initiate:",
    options: ["Citrate", "Bicarb IV", "Bicarb PO", "Acetazolamide"],
    answer: 1 },

  { type: "discuss", q: "q2", title: "Question 2: IV sodium bicarbonate",
    why: [
      ["Citrate", "Used for type 2 RTA; far too slow to alkalinize urine here."],
      ["Bicarb IV", "Raising urine pH from 6.1 to 8.1 increases salicylate clearance about 17-fold."],
      ["Bicarb PO", "Speeds dissolution of tablets in the gut and increases absorption."],
      ["Acetazolamide", "Alkalinizes the urine but acidifies the blood, pushing salicylate into the brain."],
    ],
    points: [
      ["Ion trapping", "Salicylic acid (pKa ≈3) is ionized at alkaline pH. Ionized drug can't cross membranes, so it stays out of the brain and is trapped in urine."],
      ["Potassium first", "Hypokalemia is the most common complication, and it stops the kidney from making alkaline urine. Replete it alongside the bicarbonate."],
      ["Watch the blood pH", "The goal is urine pH ≥7.5; serum alkalemia approaching 7.70 has been reported."],
    ],
    reading: ["proudfoot2004", "acmt2015", "palmer2020"] },

  { type: "question", id: "q3", deck: 5, title: "Patient 1",
    stem: "He begins to seize and throws up black. You intubate him for airway safety. Repeat ABG shows worsening hypoxia. You control seizures with benzodiazepines and a propofol drip… for now.",
    ask: "What needs to be done next?",
    options: ["Push 23.4% saline (silver bullet) and start a 3% saline infusion", "Insert a dialysis catheter and call nephro to dialyze", "Put him on VV ECMO expecting worsening hypoxia", "Call the nearest liver transplant center for emergent evaluation"],
    answer: 1 },

  { type: "discuss", q: "q3", title: "Question 3: call nephrology to dialyze",
    why: [
      ["23.4% saline", "Not a hyponatremia problem; treat the salicylate."],
      ["Dialysis", "Seizures and new hypoxemia each meet EXTRIP criteria, whatever the level."],
      ["VV ECMO", "The hypoxemia is noncardiogenic pulmonary edema from the salicylate; remove the drug."],
      ["Liver transplant", "Not a hepatic injury."],
    ],
    points: [
      ["EXTRIP: dialyze if any", "Level >100 mg/dL (>90 with kidney injury), altered mental status, new hypoxemia needing oxygen, or failed standard therapy. Suggested at >90 mg/dL or pH ≤7.20."],
      ["The intubation trap", "Ventilated salicylate patients become acidemic. Match the pre-intubation minute ventilation and give bicarbonate around intubation."],
      ["Dialysis in intubated patients", "With levels >50 mg/dL, survival was 84% with hemodialysis vs 56% without."],
    ],
    reading: ["juurlink2015", "mccabe2017", "stolbach2008"] },

  { type: "images", deck: 7, title: "Salicylates: mechanism, presentation, testing, treatment",
    images: [["img/salicylate-mechanism.png", "Salicylate mechanism of toxicity and clinical presentation by phase"], ["img/salicylate-testing-treatment.png", "Salicylate diagnostic testing, treatment and dialysis indications"]] },

  { type: "question", id: "q4", deck: 8, title: "Patients 2–5",
    stem: "A frantic pharmacist hands you a syringe of physostigmine. You now frantically look for a patient who may need it. Four patients sit in the more acute area of the ER and have already required heavy doses of benzodiazepines.",
    ask: "Which patient requires this medication?",
    options: [
      "28-year-old male with tachycardia, hypertension, febrile to 40 °C, rigid, had a seizure before the benzos were given",
      "21-year-old female with confusion, tachycardia, sweating, incontinence, muscle stiffness, diminished reflexes",
      "29-year-old male who came in tearing, confused, salivating; intubated for airway safety, vomited during intubation, pooling secretions, bradycardic with high peak pressures but low plateaus, and hypoxic",
      "33-year-old female febrile to 40 °C, tachycardic, confused, dry mucous membranes, suprapubic tenderness and fullness"],
    answer: 3, dense: true },

  { type: "discuss", q: "q4", title: "Question 4: the anticholinergic patient",
    why: [
      ["28-year-old male", "Serotonin toxicity: acute, rigid, seized, hyperthermic. Benzodiazepines and cyproheptadine."],
      ["21-year-old female", "NMS: sweating, stiffness and diminished reflexes after an antipsychotic. Benzodiazepines and supportive care."],
      ["29-year-old male", "Cholinergic crisis: secretions, bronchorrhea, bradycardia. Physostigmine would make him worse."],
      ["33-year-old female", "Anticholinergic: hot, dry, delirious, urinary retention. Physostigmine reverses the delirium."],
    ],
    points: [
      ["Skin moisture splits the hot patients", "Anticholinergic patients are dry; sympathomimetic and serotonergic patients sweat."],
      ["Serotonin toxicity or NMS", "Serotonin: hours, clonus and hyperreflexia, a serotonergic drug. NMS: days, lead-pipe rigidity and slow reflexes, a dopamine antagonist."],
      ["Physostigmine beats benzodiazepines", "It reversed delirium in 87% (benzodiazepines in none), with fewer complications. Avoid it when the QRS is wide."],
    ],
    reading: ["burns2000", "boyer2005", "dunkley2003"] },

  { type: "question", id: "q5", deck: 10, title: "Patient 4",
    stem: "You gave the medication to the right patient. Now another pharmacist asks what you want from a bag of medications he is carrying around in the chaos. Which of these do you need for the 29-year-old male who came in tearing, confused and salivating, was intubated, vomited during intubation, is pooling secretions, bradycardic with high peak pressures but low plateaus, and hypoxic?",
    options: ["Cyproheptadine", "Hydroxocobalamin", "Methylene blue", "Pralidoxime"],
    answer: 3 },

  { type: "discuss", q: "q5", title: "Question 5: pralidoxime",
    why: [
      ["Cyproheptadine", "Serotonin antagonist, for serotonin toxicity."],
      ["Hydroxocobalamin", "Binds cyanide."],
      ["Methylene blue", "Treats methemoglobinemia, and can itself trigger serotonin toxicity."],
      ["Pralidoxime", "Reactivates acetylcholinesterase in organophosphate poisoning, alongside atropine."],
    ],
    points: [
      ["The killer Bs", "Bronchorrhea, bronchospasm and bradycardia explain his hypoxia and high peak pressures. Atropine first, titrated until the chest is clear."],
      ["Oximes are contested", "The largest placebo-controlled RCT found no benefit (mortality 24.8% vs 15.8%, p = 0.12); a high-dose infusion trial found fewer deaths."],
    ],
    reading: ["eddleston2008", "eddleston2009", "pawar2006"] },

  { type: "images", deck: 13, title: "NMS vs serotonin syndrome, and the classic toxidromes",
    images: [["img/nms-vs-serotonin.png", "Neuroleptic malignant syndrome versus serotonin syndrome comparison table"], ["img/toxidrome-table.png", "Toxidrome table: vitals, pupils, skin and mental status by toxidrome"]] },

  { type: "question", id: "q6", deck: 14, title: "Patients 6–9",
    stem: "The ER doctor pulls you to the geri unit where they are housing the “drunks.” He asks which patient you think needs to be dialyzed immediately so he can have his resident drop a trialysis.",
    options: [
      "50-year-old male, obtunded, osm 330, Na 140, Cl 106, CO₂ 12, Cr 1.6, BUN 28, glucose 180",
      "29-year-old female, obtunded, osm 330, Na 140, Cl 106, CO₂ 24, Cr 1.8, BUN 28, glucose 180",
      "32-year-old male, obtunded, osm 330, Na 140, Cl 106, CO₂ 9, Cr 5.0, BUN 28, glucose 180",
      "19-year-old female, obtunded, osm 330, Na 140, Cl 106, CO₂ 24, Cr 1.2, BUN 28, glucose 180"],
    answer: 2 },

  { type: "discuss", q: "q6", title: "Question 6: dialyze the ethylene glycol",
    why: [
      ["50-year-old male", "AG 22, mild AKI: methanol. Fomepizole now, then recheck against EXTRIP criteria."],
      ["29-year-old female", "Osmolal gap without an anion gap: isopropanol (acetone gives ketosis without acidosis). Supportive."],
      ["32-year-old male", "AG 25 with severe AKI (Cr 5.0): ethylene glycol. AKI alone meets EXTRIP criteria for dialysis."],
      ["19-year-old female", "No anion gap, normal kidneys: likely ethanol. Supportive."],
    ],
    points: [
      ["Calculate the osmolal gap", "Measured − (2 Na + glucose/18 + BUN/2.8) = 330 − (280 + 10 + 10) = 30 for every patient."],
      ["The gaps trade places", "The parent alcohol raises the osmolal gap early; its acids raise the anion gap later. Methanol → formate: optic nerve. Ethylene glycol → glycolate and oxalate: AKI, hypocalcemia."],
      ["Block, then clear", "Fomepizole stops new acid; dialysis removes the alcohol and the acid already made. Folate for methanol; thiamine and pyridoxine for ethylene glycol."],
    ],
    reading: ["kraut2018", "ghannoum2023", "roberts2015"] },

  { type: "images", deck: 16, title: "The alcohols compared", images: [["img/toxic-alcohols.png", "Ethanol, isopropanol, methanol and ethylene glycol compared"]] },

  { type: "question", id: "q7", deck: 17, title: "Patients 10–13",
    stem: "The charge nurse pulls you into fast track, which is now ironically named. Patients have already been intubated, lightly sedated, and are on high-dose norepinephrine with persistent shock. The cardiothoracic attending and perfusionist bust through the doors holding ECMO cannulas.",
    ask: "Who needs to be evaluated for VA-ECMO support first?",
    options: P10_13, answer: 2 },

  { type: "question", id: "q8", deck: 18, title: "Who took what?",
    list: P10_13,
    ask: "Match patients 1–4 to their ingestion:",
    options: ["BB, ACEi, CCB, clonidine", "ACEi, CCB, BB, clonidine", "Clonidine, BB, CCB, ACEi", "BB, CCB, clonidine, ACEi"],
    answer: 2 },

  { type: "discuss", q: "q7", marks: "numbers", title: "Questions 7–8: who took what",
    why: [
      ["Clonidine", "Bradycardia, hypotension, miosis and apnea: it mimics an opioid."],
      ["β-blocker", "Bradycardia, hypotension and hypoglycemia, especially propranolol."],
      ["Calcium channel blocker", "Shock with hyperglycemia from blocked insulin release. Highest mortality, so evaluate for VA-ECMO first."],
      ["ACE inhibitor", "Hypotension with tachycardia and high K⁺; low lethality."],
    ],
    points: [
      ["Same vitals, different glucose", "CCBs block insulin release, so glucose rises with severity; β-blockers can drop it."],
      ["Dihydropyridine or not", "Amlodipine mainly dilates vessels; verapamil and diltiazem also slow the heart. Selectivity is lost in large overdoses."],
      ["ECMO is a bridge to clearance", "Drug-induced shock reverses once the drug is metabolized, so VA-ECMO can rescue patients who fail maximal therapy."],
    ],
    reading: ["levine2007", "aha2023", "masson2012"] },

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

  { type: "discuss", q: "q9", title: "Question 9: pads, glucagon, insulin",
    why: [
      ["Renal replacement for 3", "Dialysis doesn't remove CCBs (EXTRIP recommends against it), and the ACEi patient doesn't need methylene blue."],
      ["Pads, glucagon, insulin, supportive", "Pacing for clonidine bradycardia, glucagon for the β-blocker, high-dose insulin for the CCB, supportive care for the ACEi."],
      ["IV lipids for 3", "Lipid emulsion isn't first-line for CCB poisoning, and the ACEi patient doesn't need methylene blue."],
      ["Insulin to 1", "Every therapy goes to the wrong patient, including pacing the one who is tachycardic."],
    ],
    points: [
      ["Why high-dose insulin works", "The shocked heart shifts to burning glucose but can't take it up. Insulin restores fuel and contractility; pair it with vasopressors and dextrose."],
      ["Glucagon goes around the β receptor", "It raises cAMP through its own receptor: a reasonable bridge in β-blocker poisoning. Vomiting is common."],
      ["Lipid is a last resort", "Recommended for local-anesthetic toxicity; for CCBs and β-blockers only when standard therapy has failed."],
    ],
    reading: ["stonge2017", "engebretsen2011", "gosselin2016"] },

  { type: "question", id: "q10", deck: 22, revealDeck: 23, title: "Running low on bicarb",
    stem: "Things are finally starting to settle and most of the patients seem stable. Despite Dr. Marin's best efforts, bicarb pushes are now in short supply.",
    ask: "Which of these patients does NOT require bicarbonate?",
    options: [
      "42-year-old male with tachycardia, dry mouth, QRS of 150, hypotension, altered, urinary retention",
      "18-year-old male who keeps complaining of the “alarm,” ABG 7.36/22/100",
      "22-year-old male with osmolar gap of 35, CO₂ of 9 and Cr of 10",
      "28-year-old female with bradycardia, hypotension, CO₂ of 9, on triple pressors pending VA-ECMO"],
    answer: 2 },

  { type: "discuss", q: "q10", title: "Question 10: no bicarb for the glycol",
    why: [
      ["42-year-old male", "TCA with QRS 150 ms: bicarbonate treats the sodium-channel block."],
      ["18-year-old male", "Tinnitus (the \u201calarm\u201d) and a mixed acid–base picture: salicylate. Bicarbonate to alkalinize."],
      ["22-year-old male", "Ethylene glycol with renal failure: fomepizole and dialysis clear the alcohol and its acids."],
      ["28-year-old female", "Refractory shock with profound acidemia (CO₂ 9): bicarbonate supports pH until VA-ECMO."],
    ],
    points: [
      ["TCAs block fast sodium channels", "A wide QRS and a terminal R wave in aVR, then hypotension and ventricular arrhythmias."],
      ["The ECG predicts trouble", "QRS ≥100 ms: seizures in 34%; ventricular arrhythmias only at ≥160 ms. R in aVR ≥3 mm was the strongest predictor in a later cohort."],
      ["Bicarbonate works two ways", "The sodium load and the alkalemia counteract the channel block. Repeat boluses guided by QRS narrowing."],
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
