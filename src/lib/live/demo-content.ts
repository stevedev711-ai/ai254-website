/**
 * DEMONSTRATION CONTENT
 * ---------------------------------------------------------------------------
 * These scripted lecture segments are used ONLY when AI254 LIVE runs in
 * demonstration mode (no AI254 speech/translation service configured, or a
 * session explicitly created in demo mode). The Kiswahili lines were prepared
 * by hand for illustration. They are NOT output from the AI254 translation
 * pipeline and have NOT been reviewed by the AI254 language specialists.
 * Every screen that shows them is labelled "Demonstration".
 */

export type DemoTerm = {
  key: string;
  english: string;
  kiswahili: string;
  definitionEn: string;
  definitionSw: string;
  usageNote?: string;
};

export type DemoSegment = { en: string; sw: string; terms?: string[] };

export type DemoScript = {
  id: string;
  courseCode: string;
  subject: string;
  title: string;
  introduction: string;
  summary: string;
  segments: DemoSegment[];
};

export const BIOLOGY_TERMS: DemoTerm[] = [
  { key: "cell", english: "Cell", kiswahili: "Seli", definitionEn: "The basic structural and functional unit of all living organisms.", definitionSw: "Kipashio cha msingi cha muundo na utendaji kazi wa viumbe hai vyote.", usageNote: "In Biology always 'seli' — not 'chumba' (room) or 'simu' (mobile phone), which a general translator may choose." },
  { key: "cell-membrane", english: "Cell membrane", kiswahili: "Utando wa seli", definitionEn: "The thin layer that surrounds the cell and controls what enters and leaves it.", definitionSw: "Tabaka jembamba linalozunguka seli na kudhibiti kinachoingia na kutoka." },
  { key: "selectively-permeable", english: "Selectively permeable", kiswahili: "Yenye upenyezaji teule", definitionEn: "Allowing some substances to pass through while blocking others.", definitionSw: "Kuruhusu baadhi ya dutu kupita na kuzuia nyingine.", usageNote: "Describes a property of the membrane; translated as a concept, not word-for-word." },
  { key: "cytoplasm", english: "Cytoplasm", kiswahili: "Saitoplazimu", definitionEn: "The jelly-like fluid inside the cell where many chemical reactions occur.", definitionSw: "Kiowevu kama jeli kilicho ndani ya seli ambamo athari nyingi za kikemikali hutokea." },
  { key: "eukaryotic", english: "Eukaryotic cell", kiswahili: "Seli ya yukarioti", definitionEn: "A cell whose genetic material is enclosed in a membrane-bound nucleus.", definitionSw: "Seli ambayo maada yake ya urithi imefungiwa ndani ya kiini chenye utando." },
  { key: "nucleus", english: "Nucleus", kiswahili: "Kiini", definitionEn: "The membrane-bound structure that contains the cell's DNA.", definitionSw: "Sehemu ya seli yenye utando ambayo ina DNA ya seli." },
  { key: "dna", english: "DNA (deoxyribonucleic acid)", kiswahili: "DNA (asidi deoksiribonukleiki)", definitionEn: "The molecule that carries genetic instructions.", definitionSw: "Molekuli inayobeba maelekezo ya kijenetiki.", usageNote: "The abbreviation DNA is retained in Kiswahili, as in teaching materials." },
  { key: "protein", english: "Protein", kiswahili: "Protini", definitionEn: "A large molecule made of amino acids that performs many functions in the cell.", definitionSw: "Molekuli kubwa iliyoundwa kwa asidi amino inayotekeleza kazi nyingi ndani ya seli." },
  { key: "ribosome", english: "Ribosome", kiswahili: "Ribosomu", definitionEn: "The structure on which proteins are assembled.", definitionSw: "Sehemu ambamo protini huundwa." },
  { key: "endoplasmic-reticulum", english: "Endoplasmic reticulum", kiswahili: "Retikulamu endoplazimu", definitionEn: "A network of membranes involved in making and transporting proteins and lipids.", definitionSw: "Mtandao wa utando unaohusika katika kutengeneza na kusafirisha protini na lipidi." },
  { key: "mitochondria", english: "Mitochondria", kiswahili: "Mitokondria", definitionEn: "Organelles that release energy from glucose through cellular respiration.", definitionSw: "Oganeli zinazotoa nishati kutoka kwa glukosi kupitia upumuaji wa seli." },
  { key: "cellular-respiration", english: "Cellular respiration", kiswahili: "Upumuaji wa seli", definitionEn: "The chemical process that releases energy from glucose inside cells.", definitionSw: "Mchakato wa kikemikali unaotoa nishati kutoka kwa glukosi ndani ya seli.", usageNote: "Not the same as breathing ('kupumua'). The context must keep this distinction." },
  { key: "powerhouse", english: "Powerhouse of the cell", kiswahili: "Kituo cha nishati cha seli", definitionEn: "A common teaching metaphor for mitochondria.", definitionSw: "Tamathali inayotumika kufundishia kuhusu mitokondria.", usageNote: "Rendered by meaning ('energy station'), not literally, so the metaphor still makes sense." },
  { key: "chloroplast", english: "Chloroplast", kiswahili: "Kloroplasti", definitionEn: "The organelle in plant cells where photosynthesis takes place.", definitionSw: "Oganeli katika seli za mimea ambamo usanisinuru hufanyika." },
  { key: "photosynthesis", english: "Photosynthesis", kiswahili: "Usanisinuru", definitionEn: "The process by which plants use light energy to make glucose from carbon dioxide and water.", definitionSw: "Mchakato ambao mimea hutumia nishati ya mwanga kutengeneza glukosi kutoka kwa kaboni dioksidi na maji." },
  { key: "chlorophyll", english: "Chlorophyll", kiswahili: "Klorofili", definitionEn: "The green pigment that absorbs light energy.", definitionSw: "Rangi asilia ya kijani inayofyonza nishati ya mwanga." },
  { key: "cell-wall", english: "Cell wall", kiswahili: "Ukuta wa seli", definitionEn: "A rigid layer outside the cell membrane of plant cells.", definitionSw: "Tabaka imara lililo nje ya utando wa seli katika seli za mimea." },
  { key: "cellulose", english: "Cellulose", kiswahili: "Selulosi", definitionEn: "The carbohydrate that makes up plant cell walls.", definitionSw: "Kabohidrati inayounda kuta za seli za mimea." },
  { key: "osmosis", english: "Osmosis", kiswahili: "Osmosisi", definitionEn: "The movement of water across a selectively permeable membrane from higher to lower water potential.", definitionSw: "Mwendo wa maji kupitia utando wenye upenyezaji teule kutoka uwezo mkubwa wa maji hadi uwezo mdogo." },
  { key: "water-potential", english: "Water potential", kiswahili: "Uwezo wa maji", definitionEn: "A measure of the tendency of water to move from one area to another.", definitionSw: "Kipimo cha mwelekeo wa maji kuhama kutoka eneo moja hadi jingine." },
  { key: "mitosis", english: "Mitosis", kiswahili: "Mitosisi", definitionEn: "Cell division that produces two genetically identical daughter cells.", definitionSw: "Mgawanyiko wa seli unaozalisha seli binti mbili zinazofanana kijenetiki." },
];

export const DEMO_SCRIPTS: DemoScript[] = [
  {
    id: "bio101-cell",
    courseCode: "BIO 101",
    subject: "Biology",
    title: "Biology 101 — The Cell: Structure and Function",
    introduction:
      "This lecture introduces the cell as the basic unit of life. We look at the main structures found in animal and plant cells and what each one does.",
    summary:
      "All organisms are made of cells. The cell membrane controls movement in and out of the cell; the nucleus holds DNA; ribosomes build proteins; mitochondria release energy through cellular respiration; chloroplasts carry out photosynthesis in plant cells; and water moves by osmosis.",
    segments: [
      { en: "Good morning everyone. Today we are looking at the cell, which is the basic unit of life.", sw: "Habari za asubuhi nyote. Leo tunaangazia seli, ambayo ni kipashio cha msingi cha uhai.", terms: ["cell"] },
      { en: "Every living organism is made up of one or more cells.", sw: "Kila kiumbe hai kimeundwa kwa seli moja au zaidi.", terms: ["cell"] },
      { en: "Cells are surrounded by a cell membrane, which controls what enters and leaves the cell.", sw: "Seli zimezungukwa na utando wa seli, ambao hudhibiti kinachoingia na kutoka ndani ya seli.", terms: ["cell-membrane"] },
      { en: "The membrane is selectively permeable. This means it allows some substances to pass through, but not others.", sw: "Utando huu una upenyezaji teule. Hii inamaanisha kwamba huruhusu baadhi ya dutu kupita, lakini si nyingine.", terms: ["selectively-permeable"] },
      { en: "Inside the cell we find the cytoplasm, a jelly-like fluid where many chemical reactions take place.", sw: "Ndani ya seli tunapata saitoplazimu, kiowevu kama jeli ambamo athari nyingi za kikemikali hutokea.", terms: ["cytoplasm"] },
      { en: "In eukaryotic cells, the genetic material is enclosed within the nucleus.", sw: "Katika seli za yukarioti, maada ya urithi imefungiwa ndani ya kiini.", terms: ["eukaryotic", "nucleus"] },
      { en: "The nucleus contains DNA, which carries the instructions the cell uses to make proteins.", sw: "Kiini kina DNA, ambayo hubeba maelekezo ambayo seli hutumia kutengeneza protini.", terms: ["nucleus", "dna", "protein"] },
      { en: "Proteins are assembled on ribosomes, either free in the cytoplasm or attached to the endoplasmic reticulum.", sw: "Protini huundwa kwenye ribosomu, ama zikiwa huru ndani ya saitoplazimu au zikiwa zimeshikamana na retikulamu endoplazimu.", terms: ["protein", "ribosome", "endoplasmic-reticulum"] },
      { en: "The mitochondria release energy from glucose through a process called cellular respiration.", sw: "Mitokondria hutoa nishati kutoka kwa glukosi kupitia mchakato unaoitwa upumuaji wa seli.", terms: ["mitochondria", "cellular-respiration"] },
      { en: "This is why mitochondria are often described as the powerhouse of the cell.", sw: "Hii ndiyo sababu mitokondria mara nyingi hufafanuliwa kama kituo cha nishati cha seli.", terms: ["powerhouse"] },
      { en: "Plant cells also have chloroplasts, where photosynthesis takes place.", sw: "Seli za mimea pia zina kloroplasti, ambamo usanisinuru hufanyika.", terms: ["chloroplast", "photosynthesis"] },
      { en: "Chloroplasts contain chlorophyll, a green pigment that absorbs light energy.", sw: "Kloroplasti zina klorofili, rangi asilia ya kijani inayofyonza nishati ya mwanga.", terms: ["chlorophyll"] },
      { en: "Outside the cell membrane, plant cells have a rigid cell wall made of cellulose.", sw: "Nje ya utando wa seli, seli za mimea zina ukuta wa seli ulio imara uliotengenezwa kwa selulosi.", terms: ["cell-wall", "cellulose"] },
      { en: "Water moves into and out of cells by osmosis, from a region of higher water potential to a region of lower water potential.", sw: "Maji huingia na kutoka kwenye seli kwa njia ya osmosisi, kutoka eneo lenye uwezo mkubwa wa maji hadi eneo lenye uwezo mdogo wa maji.", terms: ["osmosis", "water-potential"] },
      { en: "Next week we will look at how cells divide through mitosis.", sw: "Wiki ijayo tutaangalia jinsi seli zinavyogawanyika kupitia mitosisi.", terms: ["mitosis"] },
    ],
  },
  {
    id: "gsc304-method",
    courseCode: "GSC 304",
    subject: "General Science",
    title: "General Science 304 — The Scientific Method",
    introduction: "An overview of how scientific knowledge is produced: observation, hypotheses, controlled experiments and revision.",
    summary: "Science moves from observation to a testable hypothesis, tested by controlled experiments that change one independent variable at a time. Hypotheses that are not supported are revised and tested again.",
    segments: [
      { en: "Science begins with careful observation of the natural world.", sw: "Sayansi huanza kwa uchunguzi makini wa ulimwengu asilia." },
      { en: "From an observation, we form a hypothesis, which is a testable explanation.", sw: "Kutokana na uchunguzi, tunaunda dhanio, ambalo ni maelezo yanayoweza kujaribiwa." },
      { en: "An experiment must include a control group so that we can compare results fairly.", sw: "Jaribio lazima liwe na kikundi dhibiti ili tuweze kulinganisha matokeo kwa haki." },
      { en: "We change only one variable at a time, called the independent variable.", sw: "Tunabadilisha kigezo kimoja tu kwa wakati mmoja, kinachoitwa kigezo huru." },
      { en: "If the results do not support the hypothesis, we revise it and test again.", sw: "Ikiwa matokeo hayaungi mkono dhanio, tunalirekebisha na kulijaribu tena." },
    ],
  },
  {
    id: "phy202-duality",
    courseCode: "PHY 202",
    subject: "Quantum Physics",
    title: "Quantum Physics 202 — Wave–Particle Duality",
    introduction: "We examine evidence that light and matter show both wave-like and particle-like behaviour.",
    summary: "Light shows interference like a wave but also arrives as photons with energy E = hf. Electrons also diffract, showing that matter has wave properties.",
    segments: [
      { en: "Today we discuss wave–particle duality, one of the central ideas of quantum physics.", sw: "Leo tunajadili uwili wa wimbi na chembe, mojawapo ya mawazo makuu ya fizikia ya kwanta." },
      { en: "Light can behave as a wave, producing interference patterns, but it can also behave as a stream of particles called photons.", sw: "Mwanga unaweza kuwa na tabia ya wimbi, ukizalisha ruwaza za mwingiliano, lakini pia unaweza kuwa na tabia ya mkondo wa chembe zinazoitwa fotoni." },
      { en: "The energy of a photon is proportional to its frequency: E equals h times f.", sw: "Nishati ya fotoni inalingana moja kwa moja na marudio yake: E ni sawa na h mara f." },
      { en: "Here h is Planck's constant, approximately 6.63 times ten to the power of minus thirty-four joule seconds.", sw: "Hapa h ni kisabiti cha Planck, takriban 6.63 mara kumi kipeo cha hasi thelathini na nne, jule sekunde." },
      { en: "Electrons also show wave behaviour, which we observe in electron diffraction experiments.", sw: "Elektroni pia huonyesha tabia ya wimbi, ambayo tunaiona katika majaribio ya mtawanyiko wa elektroni." },
    ],
  },
  {
    id: "csc404-complexity",
    courseCode: "CSC 404",
    subject: "Computer Science",
    title: "Computer Science 404 — Algorithm Complexity",
    introduction: "How to describe and compare the efficiency of algorithms using Big O notation.",
    summary: "Big O notation describes how running time grows with input size. Linear search is O(n); binary search on a sorted list is O(log n).",
    segments: [
      { en: "Today we analyse the efficiency of algorithms using Big O notation.", sw: "Leo tunachanganua ufanisi wa algoriti kwa kutumia nukuu ya Big O." },
      { en: "Big O describes how the running time grows as the size of the input increases.", sw: "Big O hueleza jinsi muda wa utekelezaji unavyoongezeka kadiri ukubwa wa ingizo unavyoongezeka." },
      { en: "A linear search checks each element in turn, so its complexity is O of n.", sw: "Utafutaji wa mstari hukagua kila kipengele kimoja baada ya kingine, kwa hivyo uchangamano wake ni O ya n." },
      { en: "Binary search repeatedly halves a sorted list, giving a complexity of O of log n.", sw: "Utafutaji wa jozi hugawa orodha iliyopangwa katikati mara kwa mara, na kutoa uchangamano wa O ya log n." },
    ],
  },
  {
    id: "mat306-limits",
    courseCode: "MAT 306",
    subject: "Pure Mathematics",
    title: "Pure Maths 306 — Limits and Continuity",
    introduction: "The formal definition of a limit and what it means for a function to be continuous.",
    summary: "A limit describes the value a function approaches. The epsilon–delta definition makes this precise. A function is continuous at a point when its limit there equals its value.",
    segments: [
      { en: "We say a function f has a limit L as x approaches a, if f of x gets arbitrarily close to L.", sw: "Tunasema kwamba kitendakazi f kina kikomo L x inapokaribia a, ikiwa f ya x inakaribia L kwa ukaribu wowote tunaotaka." },
      { en: "Formally, for every epsilon greater than zero, there exists a delta greater than zero.", sw: "Kirasmi, kwa kila epsiloni kubwa kuliko sifuri, kuna delta kubwa kuliko sifuri." },
      { en: "A function is continuous at a point if its limit at that point equals its value there.", sw: "Kitendakazi ni endelevu katika nukta fulani ikiwa kikomo chake katika nukta hiyo ni sawa na thamani yake hapo." },
      { en: "Polynomials are continuous everywhere on the real line.", sw: "Polinomia ni endelevu kila mahali kwenye mstari wa namba halisi." },
    ],
  },
];

export const getDemoScript = (id?: string | null) => DEMO_SCRIPTS.find((s) => s.id === id);

/** Picks the closest demo script for a subject (falls back to Biology). */
export function demoScriptForSubject(subject: string) {
  return DEMO_SCRIPTS.find((s) => s.subject.toLowerCase() === subject.toLowerCase()) ?? null;
}

/** Seconds between scripted segments in demonstration mode. */
export const DEMO_SEGMENT_INTERVAL_MS = 6500;
