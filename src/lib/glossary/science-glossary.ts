/**
 * AI254 English → Kiswahili science glossary (initial compilation).
 *
 * Compiled from established Kiswahili scientific usage (standard terms and the
 * loanwords used in Kenyan and Tanzanian science teaching). Every entry is loaded
 * with status DRAFT: it must be checked by AI254's Kiswahili language specialists
 * before it is marked "Reviewed" in the admin panel. Only "In review" and
 * "Reviewed" terms are sent to the live translation service.
 *
 * Format: one term per line, "English | Kiswahili" or "English | Kiswahili | usage note".
 * Loaded by prisma/seed.ts without overwriting edits made in the admin panel.
 */

type Block = { subject: string; topic: string; lines: string };

const BLOCKS: Block[] = [
  {
    subject: "Biology",
    topic: "Cell biology",
    lines: `
cell | seli | In Biology always "seli", not "chumba" (room) or "simu" (phone).
plasma membrane | utando wa plazima
cell membrane | utando wa seli
cell wall | ukuta wa seli
cytoplasm | saitoplazimu
nucleus | kiini
nucleolus | nukleolasi
nuclear membrane | utando wa kiini
organelle | oganeli
mitochondrion | mitokondrioni
mitochondria | mitokondria
chloroplast | kloroplasti
ribosome | ribosomu
endoplasmic reticulum | retikulamu endoplazimu
rough endoplasmic reticulum | retikulamu endoplazimu yenye ribosomu
smooth endoplasmic reticulum | retikulamu endoplazimu isiyo na ribosomu
Golgi apparatus | kifaa cha Golgi
lysosome | lisosomu
vacuole | vakuoli
centriole | sentrioli
centrosome | sentrosomu
cytoskeleton | kiunzi cha seli
cilia | silia
flagellum | flajela
vesicle | vesikali
plastid | plastidi
chromoplast | kromoplasti
leucoplast | lukoplasti
cell sap | utomvu wa seli
prokaryote | prokarioti
eukaryote | yukarioti
prokaryotic cell | seli ya prokarioti
eukaryotic cell | seli ya yukarioti
unicellular organism | kiumbe chenye seli moja
multicellular organism | kiumbe chenye seli nyingi
tissue | tishu
organ | ogani
organ system | mfumo wa ogani
organism | kiumbe
cell theory | nadharia ya seli
cell division | mgawanyiko wa seli
cell cycle | mzunguko wa seli
stem cell | seli shina
cell differentiation | utofautishaji wa seli
specialised cell | seli maalumu
microscope | hadubini
light microscope | hadubini ya mwanga
electron microscope | hadubini ya elektroni
magnification | ukuzaji
resolution (microscopy) | uwezo wa kubainisha | The ability to distinguish two close points, not "azimio" (a decision).
specimen | sampuli
`,
  },
  {
    subject: "Biology",
    topic: "Transport across membranes",
    lines: `
diffusion | usambaaji
facilitated diffusion | usambaaji uliosaidiwa
osmosis | osmosisi
active transport | usafirishaji amilifu
passive transport | usafirishaji tuli
endocytosis | endositosisi
exocytosis | eksositosisi
phagocytosis | fagositosisi
pinocytosis | pinositosisi
plasmolysis | plazimolisisi
selectively permeable | yenye upenyezaji teule
semi-permeable membrane | utando nusu-penyezi
concentration gradient | mteremko wa ukolezi
concentration | ukolezi
water potential | uwezo wa maji
solution | myeyusho
solute | kiyeyushwa
solvent | kiyeyusho
isotonic solution | myeyusho isotoniki
hypotonic solution | myeyusho hipotoniki
hypertonic solution | myeyusho hipatoniki
surface area to volume ratio | uwiano wa eneo la uso kwa ujazo
`,
  },
  {
    subject: "Biology",
    topic: "Cell division",
    lines: `
mitosis | mitosisi
meiosis | meiosisi
interphase | interfesi
prophase | profesi
metaphase | metafesi
anaphase | anafesi
telophase | telofesi
cytokinesis | saitokinesisi
chromosome | kromosomu
chromatid | kromatidi
centromere | sentromia
spindle fibres | nyuzi za spindeli
homologous chromosomes | kromosomu homologo
diploid | diploidi
haploid | haploidi
crossing over | kubadilishana sehemu za kromosomu
daughter cell | seli binti
cancer | saratani
tumour | uvimbe
`,
  },
  {
    subject: "Biology",
    topic: "Biochemistry",
    lines: `
molecule | molekuli
carbohydrate | kabohidrati
glucose | glukosi
fructose | fruktosi
sucrose | sukrosi
lactose | laktosi
maltose | maltosi
starch | wanga
glycogen | glaikojeni
cellulose | selulosi
monosaccharide | monosakaridi
disaccharide | disakaridi
polysaccharide | polisakaridi
lipid | lipidi
fat | mafuta
fatty acid | asidi ya mafuta
glycerol | gliserol
phospholipid | fosfolipidi
cholesterol | kolesteroli
protein | protini
amino acid | asidi amino
peptide bond | kifungo cha peptidi
polypeptide | polipeptidi
enzyme | kimeng'enya
substrate | substreti
active site | eneo amilifu
enzyme inhibitor | kizuizi cha kimeng'enya
denaturation | kuharibika kwa muundo wa protini | Describes the loss of a protein's shape; translated by meaning.
nucleic acid | asidi nukleiki
DNA (deoxyribonucleic acid) | DNA (asidi deoksiribonukleiki)
RNA (ribonucleic acid) | RNA (asidi ribonukleiki)
messenger RNA | RNA mjumbe
transfer RNA | RNA msafirishaji
nucleotide | nukleotidi
base pair | jozi ya besi
adenine | adenini
thymine | thimini
guanine | guanini
cytosine | saitosini
uracil | urasili
double helix | msokoto pacha
vitamin | vitamini
mineral salts | chumvi madini
hormone | homoni
ATP (adenosine triphosphate) | ATP (adenosini trifosfeti)
metabolism | metaboli
anabolism | anaboli
catabolism | kataboli
`,
  },
  {
    subject: "Biology",
    topic: "Photosynthesis and respiration",
    lines: `
photosynthesis | usanisinuru
chlorophyll | klorofili
light-dependent reaction | mmenyuko unaotegemea mwanga
light-independent reaction | mmenyuko usiotegemea mwanga
Calvin cycle | mzunguko wa Calvin
stomata | stomata (vitundu vya jani)
guard cells | seli linzi
limiting factor | kipengele kikomo
cellular respiration | upumuaji wa seli | Not breathing ("kupumua"): the chemical release of energy in cells.
aerobic respiration | upumuaji wa aerobiki
anaerobic respiration | upumuaji wa anaerobiki
fermentation | uchachushaji
glycolysis | glaikolisisi
Krebs cycle | mzunguko wa Krebs
electron transport chain | mnyororo wa usafirishaji wa elektroni
lactic acid | asidi laktiki
respiratory quotient | kigawo cha upumuaji
powerhouse of the cell | kituo cha nishati cha seli | Teaching metaphor for mitochondria; rendered by meaning.
`,
  },
  {
    subject: "Biology",
    topic: "Genetics",
    lines: `
genetics | jenetiki
gene | jeni
allele | aleli
genotype | jenotipu
phenotype | fenotipu
dominant allele | aleli tawala
recessive allele | aleli fiche
homozygous | homozaigoti
heterozygous | heterozaigoti
heredity | urithi wa sifa
inheritance | urithi
mutation | badiliko la kijeni
variation | tofauti
genome | jenomu
DNA replication | urudufishaji wa DNA
transcription (genetics) | unukuzi | Copying DNA into RNA; not written transcription of speech.
translation (genetics) | usanisi wa protini kutoka RNA | Building a protein from mRNA; not language translation.
protein synthesis | usanisi wa protini
codon | kodoni
anticodon | antikodoni
sex chromosomes | kromosomu za jinsia
sex-linked trait | sifa inayohusiana na jinsia
karyotype | kariotipu
monohybrid cross | mseto wa sifa moja
dihybrid cross | mseto wa sifa mbili
Punnett square | mraba wa Punnett
pedigree chart | mti wa ukoo
co-dominance | utawala sawa
incomplete dominance | utawala usio kamili
genetic engineering | uhandisi jeni
clone | kloni
selective breeding | uzalishaji teule
gamete | gameti
zygote | zaigoti
fertilisation | utungisho
`,
  },
  {
    subject: "Biology",
    topic: "Evolution and classification",
    lines: `
evolution | mageuko
natural selection | uteuzi asilia
adaptation | ubadilikaji
species | spishi
fossil | kisukuku
common ancestor | babu wa pamoja
speciation | kutokea kwa spishi mpya
extinction | kutoweka kwa spishi
homologous structures | miundo homologo
vestigial organ | ogani masalia
classification | uainishaji
taxonomy | taksonomia
kingdom (taxonomy) | himaya
phylum | faila
order (taxonomy) | oda
family (taxonomy) | familia
genus | jenasi
binomial nomenclature | mfumo wa majina mawili
dichotomous key | ufunguo wa utambuzi
vertebrate | mnyama mwenye uti wa mgongo
invertebrate | mnyama asiye na uti wa mgongo
mammal | mamalia
reptile | mtambaazi
amphibian | amfibia
arthropod | athropoda
insect | mdudu
arachnid | araknidi
bacteria | bakteria
virus | virusi
fungi | kuvu
algae | mwani
`,
  },
  {
    subject: "Biology",
    topic: "Plant biology",
    lines: `
root | mzizi
root hair | unywele wa mzizi
stem | shina
leaf | jani
flower | ua
fruit | tunda
seed | mbegu
xylem | zailemu
phloem | floemu
vascular bundle | kifurushi cha mishipa
transpiration | utoaji mvuke
translocation (plants) | uhamishaji wa chakula katika mmea
germination | uotaji
pollination | uchavushaji
pollen | chavua
stamen | stameni
anther | anta
stigma | stigma
ovary (plant) | ovari
ovule | ovuli
petal | petali
sepal | sepali
cotyledon | kotiledoni
monocotyledon | monokotiledoni
dicotyledon | daikotiledoni
tropism | tropizimu
phototropism | fototropizimu
geotropism | jiotropizimu
auxin | oksini
epidermis | epidemisi
mesophyll | mesofili
palisade layer | tabaka la palisedi
cuticle | kutikali
lenticel | lentiseli
cambium | kambiamu
seed dispersal | mtawanyiko wa mbegu
deciduous plant | mmea unaopukutisha majani
perennial plant | mmea wa kudumu
annual plant | mmea wa msimu mmoja
`,
  },
  {
    subject: "Biology",
    topic: "Nutrition and digestion",
    lines: `
nutrition | lishe
nutrient | kirutubishi
balanced diet | mlo kamili
malnutrition | utapiamlo
deficiency disease | ugonjwa wa upungufu wa virutubishi
digestion | mmeng'enyo wa chakula
digestive system | mfumo wa mmeng'enyo wa chakula
saliva | mate
oesophagus | umio
stomach | tumbo
small intestine | utumbo mwembamba
large intestine | utumbo mpana
liver | ini
pancreas | kongosho
gall bladder | kibofu cha nyongo
bile | nyongo
rectum | puru
absorption | ufyonzaji
villi | vilai
peristalsis | peristalsisi
`,
  },
  {
    subject: "Biology",
    topic: "Transport and circulation",
    lines: `
circulatory system | mfumo wa mzunguko wa damu
heart | moyo
artery | ateri
vein | vena
capillary | kapilari
blood | damu
red blood cell | seli nyekundu ya damu
white blood cell | seli nyeupe ya damu
platelet | chembe sahani
plasma (blood) | plazima
haemoglobin | himoglobini
blood pressure | shinikizo la damu
pulse | mapigo ya moyo
atrium | atiria
ventricle | ventrikali
valve | vali
aorta | aota
lymph | limfu
lymphatic system | mfumo wa limfu
`,
  },
  {
    subject: "Biology",
    topic: "Gas exchange and excretion",
    lines: `
respiratory system | mfumo wa upumuaji
lungs | mapafu
trachea | koromeo
bronchus | kikoromeo
alveoli | vifuko vya hewa
diaphragm | kiwambo
breathing | kupumua | Physical movement of air; different from cellular respiration.
inhalation | kuvuta pumzi
exhalation | kutoa pumzi
gaseous exchange | ubadilishanaji wa gesi
excretion | utoaji wa takamwili
excretory system | mfumo wa utoaji takamwili
kidney | figo
nephron | nefroni
urine | mkojo
urea | urea
urinary bladder | kibofu cha mkojo
ureter | yureta
urethra | urethra
sweat | jasho
homeostasis | homeostasisi
osmoregulation | udhibiti wa maji mwilini
thermoregulation | udhibiti wa joto la mwili
`,
  },
  {
    subject: "Biology",
    topic: "Coordination and response",
    lines: `
nervous system | mfumo wa neva
neuron | niuroni
brain | ubongo
spinal cord | uti wa mgongo
nerve | neva
synapse | sinapsi
reflex action | tendo la reflexi
receptor | kipokezi
effector | kitendaji
stimulus | kichocheo | In physiology: something that triggers a response (compare "catalyst" in chemistry).
response | mwitikio
sense organ | ogani ya hisi
retina | retina
lens (eye) | lenzi
endocrine system | mfumo wa tezi-homoni
gland | tezi
insulin | insulini
adrenaline | adrenalini
thyroid gland | tezi ya thairoidi
pituitary gland | tezi ya pituitari
oestrogen | estrojeni
testosterone | testosteroni
`,
  },
  {
    subject: "Biology",
    topic: "Support and movement",
    lines: `
skeleton | kiunzi cha mifupa
bone | mfupa
joint | kiungo
muscle | msuli
tendon | kano
ligament | ligamenti
cartilage | gegedu
skull | fuvu
vertebra | vertebra
locomotion | mwendo
`,
  },
  {
    subject: "Biology",
    topic: "Reproduction and growth",
    lines: `
reproduction | uzazi
sexual reproduction | uzazi wa kujamiiana
asexual reproduction | uzazi bila kujamiiana
binary fission | mgawanyiko pacha
testis | korodani
sperm cell | mbegu ya kiume
ovum | yai
ovary (animal) | ovari
uterus | mfuko wa uzazi
placenta | kondo la nyuma
embryo | kiinitete
foetus | kijusi
menstrual cycle | mzunguko wa hedhi
ovulation | utoaji wa yai
pregnancy | ujauzito
puberty | balehe
growth | ukuaji
metamorphosis | metamofosisi
larva | lava
pupa | pupa
`,
  },
  {
    subject: "Biology",
    topic: "Health, disease and immunity",
    lines: `
immune system | mfumo wa kinga
immunity | kinga
antibody | kingamwili
antigen | antijeni
vaccine | chanjo
vaccination | uchanjaji
pathogen | pathojeni
infection | maambukizi
disease | ugonjwa
antibiotic | kiuavijasumu
microorganism | kijidudu
parasite | kimelea
host organism | kiumbe mwenyeji
disease vector | kienezi cha ugonjwa
HIV | VVU (Virusi vya UKIMWI)
AIDS | UKIMWI
malaria | malaria
tuberculosis | kifua kikuu
cholera | kipindupindu
typhoid | homa ya matumbo
hygiene | usafi
`,
  },
  {
    subject: "Biology",
    topic: "Ecology",
    lines: `
ecology | ikolojia
ecosystem | mfumo ikolojia
habitat | makazi
population (ecology) | idadi ya viumbe
community (ecology) | jamii ya viumbe
environment | mazingira
biodiversity | bioanuwai
food chain | mnyororo wa chakula
food web | mtandao wa chakula
producer | mzalishaji
consumer | mlaji
primary consumer | mlaji wa kwanza
secondary consumer | mlaji wa pili
decomposer | mtenganishaji
herbivore | mla majani
carnivore | mla nyama
omnivore | mla vyote
predator | mwindaji
prey | windo
trophic level | ngazi ya lishe
energy flow | mtiririko wa nishati
pyramid of numbers | piramidi ya idadi
biomass | biomasi
nutrient cycle | mzunguko wa virutubishi
carbon cycle | mzunguko wa kaboni
nitrogen cycle | mzunguko wa naitrojeni
water cycle | mzunguko wa maji
nitrogen fixation | ufungaji wa naitrojeni
symbiosis | simbiosisi
mutualism | kutegemeana
parasitism | ukimelea
competition | ushindani
ecological niche | nafasi ya kiikolojia
abiotic factor | kipengele kisicho hai
biotic factor | kipengele hai
pollution | uchafuzi wa mazingira
conservation | uhifadhi
deforestation | ukataji wa misitu
climate change | mabadiliko ya tabianchi
global warming | ongezeko la joto duniani
soil erosion | mmomonyoko wa udongo
ecological succession | mfuatano wa kiikolojia
carrying capacity | uwezo wa kubeba
endangered species | spishi iliyo hatarini kutoweka
quadrat | kwodreti
sampling | uchukuaji wa sampuli
`,
  },
  {
    subject: "Biology",
    topic: "Microbiology",
    lines: `
microbiology | mikrobiolojia
bacterium | bakteria
fungus | kuvu
yeast | hamira
mould | ukungu
spore | spora
colony (microbiology) | koloni
decomposition | uozaji
sterilisation | uuaji wa vijidudu
`,
  },
  {
    subject: "Chemistry",
    topic: "Chemistry foundations",
    lines: `
matter | maada
atom | atomu
element | elementi
compound | kampaundi
mixture | mchanganyiko
ion | ioni
proton | protoni
neutron | nyutroni
electron | elektroni
isotope | isotopu
periodic table | jedwali la elementi
chemical bond | kifungo cha kemikali
covalent bond | kifungo cha kovalenti
ionic bond | kifungo cha ioni
hydrogen bond | kifungo cha hidrojeni
chemical reaction | mmenyuko wa kemikali
catalyst | kichocheo cha kemikali | Speeds up a reaction without being used up (compare "stimulus" in physiology).
oxidation | uoksidishaji
acid | asidi
base (chemistry) | besi
alkali | alkali
pH | pH
neutralisation | uneutralishaji
indicator | kiashiria
salt | chumvi
solid | yabisi
liquid | kimiminika
gas | gesi
carbon | kaboni
hydrogen | hidrojeni
oxygen | oksijeni
nitrogen | naitrojeni
carbon dioxide | kaboni dioksidi
phosphorus | fosforasi
calcium | kalsiamu
sodium | sodiamu
potassium | potasiamu
iron | chuma
ethanol | ethanoli
`,
  },
  {
    subject: "Physics",
    topic: "Physics foundations",
    lines: `
mass | masi
weight | uzito
volume | ujazo
density | msongamano
temperature | halijoto
pressure | shinikizo
force | nguvu
energy | nishati
heat | joto
light | mwanga
sound | sauti
electricity | umeme
electric current | mkondo wa umeme
voltage | volteji
magnet | sumaku
gravity | graviti
speed | kasi
velocity | kasi yenye mwelekeo
acceleration | mchapuko
wave | wimbi
frequency | marudio
wavelength | urefu wa wimbi
reflection | uakisi
melting point | kiwango cha kuyeyuka
boiling point | kiwango cha kuchemka
freezing point | kiwango cha kuganda
`,
  },
  {
    subject: "General Science",
    topic: "Scientific method and measurement",
    lines: `
experiment | jaribio
hypothesis | dhanio
observation | uchunguzi
variable | kigezo
independent variable | kigezo huru
dependent variable | kigezo tegemezi
control group | kikundi dhibiti
data | data
measurement | kipimo
result | matokeo
conclusion | hitimisho
theory | nadharia
metre | mita
gram | gramu
litre | lita
second (unit) | sekunde
`,
  },
];

export type GlossaryEntry = { subject: string; topic: string; english: string; kiswahili: string; usageNote?: string };

export const SCIENCE_GLOSSARY: GlossaryEntry[] = BLOCKS.flatMap((b) =>
  b.lines
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [english, kiswahili, usageNote] = l.split("|").map((x) => x.trim());
      return { subject: b.subject, topic: b.topic, english, kiswahili, usageNote: usageNote || undefined };
    }),
);
