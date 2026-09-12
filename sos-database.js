/**
 * The Silent Sphinx - Community Sanctuary & Discussions Database
 * 100% Focused on Neuroscience, Exceptional Minds, Quantum Biology & Cosmic Frontiers.
 */

const defaultCommunityPosts = [
  {
    id: "post-neuro-agenesis",
    author: "Dr. Elena Vancea",
    badge: {
      ro: "Neurobiologie Cognitivă",
      it: "Neurobiologia Cognitiva",
      en: "Cognitive Neurobiology"
    },
    title: {
      ro: "Agenezia de corp calos și compensarea căilor neuronale la savanți",
      it: "Agenesia del corpo calloso e compensazione delle vie neuronali nei savant",
      en: "Corpus Callosum Agenesis and Neural Pathway Compensation in Savants"
    },
    upvotes: 48,
    replies: 14,
    solved: true,
    category: "Neuroștiințe",
    content: {
      ro: "Cazul lui Kim Peek arată că lipsa punții dintre emisfere poate determina creierul să creeze autostrăzi sinaptice directe în fiecare emisferă, permițând procesarea concomitentă și independentă a fluxurilor vizuale.",
      it: "Il caso di Kim Peek dimostra che l'assenza del ponte interemisferico può indurre il cervello a creare autostrade sinaptiche dirette in ciascun emisfero, consentendo l'elaborazione simultanea e indipendente dei flussi visivi.",
      en: "The case of Kim Peek reveals that the absence of the interhemispheric bridge can prompt the brain to create direct synaptic highways within each hemisphere, enabling simultaneous and independent visual processing."
    }
  },
  {
    id: "post-antikythera-gears",
    author: "Prof. Marcus Thorne",
    badge: {
      ro: "Arheologie & Istoria Științei",
      it: "Archeologia & Storia della Scienza",
      en: "Archaeology & History of Science"
    },
    title: {
      ro: "Mecanismul de la Antikythera și precizia calculului eclipselor Saros",
      it: "Il meccanismo di Anticitera e la precisione del calcolo delle eclissi di Saros",
      en: "The Antikythera Mechanism and the Precision of Saros Eclipse Calculations"
    },
    upvotes: 62,
    replies: 19,
    solved: true,
    category: "Mistere Istorice",
    content: {
      ro: "Reconstrucțiile AMRP cu micro-tomografie X demonstrează că angrenajul cu știft și fantă reproducea a doua anomalie lunară Kepleriană cu 1.500 de ani înainte de formularea legilor mecanicii cerești moderne.",
      it: "Le ricostruzioni AMRP con microtomografia a raggi X dimostrano che l'ingranaggio con perno e fessura riproduceva la seconda anomalia lunare kepleriana 1.500 anni prima delle leggi della meccanica celeste moderna.",
      en: "AMRP X-ray microtomography reconstructions prove that the pin-and-slot gear reproduced Kepler's second lunar anomaly 1,500 years before modern celestial mechanics were formulated."
    }
  },
  {
    id: "post-dna-storage",
    author: "Dr. Claire Laurent",
    badge: {
      ro: "Biologie Moleculară (Harvard Fellow)",
      it: "Biologia Molecolare (Harvard Fellow)",
      en: "Molecular Biology (Harvard Fellow)"
    },
    title: {
      ro: "Stabilitatea termodinamică a ADN-ului sintetic pentru arhivarea universală",
      it: "Stabilità termodinamica del DNA sintetico per l'archiviazione universale",
      en: "Thermodynamic Stability of Synthetic DNA for Universal Archiving"
    },
    upvotes: 39,
    replies: 9,
    solved: true,
    category: "Bio-Computație",
    content: {
      ro: "Densitatea de 215 petabiți per gram nu este doar teoretică; experimentele George Church & Goldman demonstrează că nucleotidele conservate în vid la temperaturi scăzute rămân intacte zeci de mii de ani.",
      it: "La densità di 215 petabit per grammo non è puramente teorica; gli esperimenti di George Church & Goldman dimostrano che i nucleotidi conservati sottovuoto a basse temperature rimangono intatti per decine di migliaia di anni.",
      en: "A density of 215 petabits per gram is not merely theoretical; experiments by George Church & Goldman demonstrate that nucleotides stored in a vacuum at low temperatures endure intact for tens of thousands of years."
    }
  },
  {
    id: "post-synesthesia-tammet",
    author: "Dr. Akira Tanaka",
    badge: {
      ro: "Științe Cognitive",
      it: "Scienze Cognitive",
      en: "Cognitive Sciences"
    },
    title: {
      ro: "Cartografierea fMRI a sinesteziei lingvistice și geometrice",
      it: "Mappatura fMRI della sinestesia linguistica e geometrica",
      en: "fMRI Mapping of Linguistic and Geometric Synesthesia"
    },
    upvotes: 53,
    replies: 11,
    solved: true,
    category: "Cogniție Umană",
    content: {
      ro: "La Daniel Tammet, activarea girusului angular în timpul calculelor complexe coincide cu o descărcare simultană în cortexul vizual V4, transformând aritmetica într-o navigare spațială de peisaje colorate.",
      it: "In Daniel Tammet, l'attivazione del giro angolare durante calcoli complessi coincide con una scarica simultanea nella corteccia visiva V4, trasformando l'aritmetica in una navigazione spaziale tra paesaggi cromatici.",
      en: "In Daniel Tammet, angular gyrus activation during complex calculation coincides with co-activation in visual area V4, translating arithmetic into spatial navigation across colored landscapes."
    }
  },
  {
    id: "post-autonomic-nervous",
    author: "Prof. Arvind Sharma",
    badge: {
      ro: "Fiziologie Integrativă",
      it: "Fisiologia Integrativa",
      en: "Integrative Physiology"
    },
    title: {
      ro: "Concluziile studiilor Radboud (PNAS 2014) asupra metodei Wim Hof",
      it: "Conclusioni degli studi Radboud (PNAS 2014) sul metodo Wim Hof",
      en: "Conclusions of the Radboud Studies (PNAS 2014) on the Wim Hof Method"
    },
    upvotes: 71,
    replies: 22,
    solved: true,
    category: "Fiziologie Extremă",
    content: {
      ro: "Studiul clinic cu endotoxină administrată intravenos a demonstrat suprimarea semnificativă a citokinelor pro-inflamatorii (TNF-α, IL-6) prin hiperventilație controlată și stimularea axei hipotalamo-hipofizo-suprarenale.",
      it: "Lo studio clinico con endotossina somministrata per via endovenosa ha dimostrato una significativa soppressione delle citochine pro-infiammatorie (TNF-α, IL-6) mediante iperventilazione controllata e stimolazione dell'asse ipotalamo-ipofisi-surrene.",
      en: "The clinical trial with intravenous endotoxin demonstrated significant downregulation of pro-inflammatory cytokines (TNF-α, IL-6) through controlled hyperventilation and hypothalamic-pituitary-adrenal axis stimulation."
    }
  }
];

function getStoredData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error("Storage read error:", e);
    return fallback;
  }
}

function setStoredData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage write error:", e);
  }
}

window.SphinxDB = {
  getCommunityPosts: () => getStoredData('sphinx_community_v3', defaultCommunityPosts),
  saveCommunityPost: (post) => {
    const current = window.SphinxDB.getCommunityPosts();
    current.unshift(post);
    setStoredData('sphinx_community_v3', current);
  },
  
  exportDatabase: () => {
    const db = {
      wonders: window.SphinxWondersDB ? window.SphinxWondersDB.getWonders() : [],
      community: window.SphinxDB.getCommunityPosts(),
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TheSilentSphinx_Sanctuary_Backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
  
  importDatabase: (jsonContent) => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (parsed.wonders && window.SphinxWondersDB) {
        localStorage.setItem('sphinx_wonders_v2', JSON.stringify(parsed.wonders));
      }
      if (parsed.community) {
        setStoredData('sphinx_community_v2', parsed.community);
      }
      return true;
    } catch (e) {
      console.error("Import parse error:", e);
      return false;
    }
  }
};
