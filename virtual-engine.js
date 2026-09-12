/**
 * The Silent Sphinx - Virtual Chronicle Engine (v65.0)
 * Monumental Micro-Streaming Architecture for Multi-Tier Depth Exploration
 * Supports Top 1,000, Top 5,000, Top 10,000, and Top 20,000 Historical Titans
 * with Real-Time Sub-Millisecond Search and On-Demand Decryption.
 */

(function () {
  'use strict';

  const SLICE_SIZE = 100;
  const TOTAL_RECORDS = 20000;
  const SLICE_BASE_PATH = 'data/catalogs/slices/slice_';
  const INDEX_PATH = 'data/catalogs/search_index.json';

  function formatDots(num) {
    if (num === null || num === undefined) return '';
    return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  function cleanTitle(title) {
    if (!title) return '';
    return String(title)
      .replace(/^(?:Cronica|Chronicle|Cronaca|Chronique|Chronik|Crónica|Хроника|Χρονικὸν|السجل|正典学术档案|学術年代記|अकादमिक इतिहास|Chronica)\s*(?:#|n°|nº|N°|Nr\.|No\.)?\s*[\d\.,]+\s*:\s*/i, '')
      .replace(/\s*(?:#|n°|nº|N°|Nr\.|No\.)\s*[\d\.,]+$/i, '')
      .trim();
  }
  if (typeof window !== 'undefined') {
    window.formatDots = formatDots;
    window.cleanTitle = cleanTitle;
  }

  const sliceCache = new Map();
  const pendingRequests = new Map();
  let searchIndex = null;
  let isSearchIndexLoading = false;

  const sphereVisuals = {
    polymaths: { gradient: 'linear-gradient(135deg, #0d2258 0%, #1e40af 100%)', accent: '#38bdf8', icon: '🏛️', seal: 'POLYMATH' },
    savants: { gradient: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)', accent: '#6ee7b7', icon: '🧠', seal: 'SAVANT' },
    prodigies: { gradient: 'linear-gradient(135deg, #451a03 0%, #78350f 100%)', accent: '#facc15', icon: '📐', seal: 'PRODIGY' },
    physiology: { gradient: 'linear-gradient(135deg, #082f49 0%, #0284c7 100%)', accent: '#5eead4', icon: '❄️', seal: 'PHYSIO' },
    antiquities: { gradient: 'linear-gradient(135deg, #452a0a 0%, #713f12 100%)', accent: '#fbbf24', icon: '⚙️', seal: 'CHRONOS' },
    eureka: { gradient: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)', accent: '#818cf8', icon: '⚡', seal: 'EUREKA' },
    neuroscience: { gradient: 'linear-gradient(135deg, #3b0764 0%, #581c87 100%)', accent: '#c4b5fd', icon: '👁️', seal: 'SYNAPSE' },
    genetics: { gradient: 'linear-gradient(135deg, #4c0519 0%, #831843 100%)', accent: '#fda4af', icon: '🧬', seal: 'GENOMA' },
    cosmos: { gradient: 'linear-gradient(135deg, #042f2e 0%, #0d9488 100%)', accent: '#2dd4bf', icon: '🌌', seal: 'COSMOS' },
    manuscripts: { gradient: 'linear-gradient(135deg, #27170a 0%, #4a2d15 100%)', accent: '#e2c9a5', icon: '📜', seal: 'CODEX' }
  };

  const polyglotSpheres = {
    polymaths: {
      t: {
        ro: "Sinteza Universală a Epistemologiei",
        en: "Universal Epistemological Synthesis",
        it: "Sintesi Universale dell'Epistemologia",
        fr: "Synthèse Universelle de l'Épistémologie",
        de: "Universelle Epistemologische Synthese",
        es: "Síntesis Universal de la Epistemología",
        pt: "Síntese Universal da Epistemologia",
        ru: "Универсальный эпистемологический синтез",
        el: "Καθολικὴ Ἐπιστημολογικὴ Σύνθεσις",
        ar: "التوليف المعرفي الشامل",
        zh: "人类认识论的崇高综合",
        ja: "認識論の普遍的統合大系",
        hi: "सार्वभौमिक ज्ञानमीमांसा संश्लेषण",
        la: "Synthese Epistemologiae Universalis",
        grc: "Καθολικὴ Ἐπιστημολογικὴ Σύνθεσις"
      },
      s: {
        ro: "Tratat enciclopedic integrat cuprinzând fundamentele logicii clasice, dinamica sistemelor complexe și unificarea ramurilor cunoașterii umane.",
        en: "Integrated encyclopedic treatise encompassing the foundations of classical logic, the dynamics of complex systems, and the unification of human knowledge.",
        it: "Trattato enciclopedico integrato comprendente i fondamenti della logica classica, la dinamica dei sistemi complessi e l'unificazione del sapere umano.",
        fr: "Traité encyclopédique intégré englobant les fondements de la logique classique, la dynamique des systèmes complexes et l'unification du savoir humain.",
        de: "Integriertes enzyklopädisches Traktat über die Grundlagen der klassischen Logik, die Dynamik komplexer Systeme und die Vereinigung des menschlichen Wissens.",
        es: "Tratado enciclopédico integrado que abarca los fundamentos de la lógica clásica, la dinámica de sistemas complejos y la unificación del saber humano.",
        pt: "Tratado enciclopédico integrado abrangendo os fundamentos da lógica clássica, a dinâmica de sistemas complexos e a unificação do conhecimento humano.",
        ru: "Интегрированный энциклопедический трактат, охватывающий основы классической логики, динамику сложных систем и объединение человеческого знания.",
        el: "Ἐγκυκλοπαιδικὴ πραγματεία περὶ τῶν θεμελίων τῆς κλασικῆς λογικῆς καὶ τῆς ἑνώσεως τῆς ἀνθρωπίνης γνώσεως.",
        ar: "أطروحة موسوعية شاملة تتناول أسس المنطق الكلاسيكي وديناميات الأنظمة المعقدة وتوحيد المعرفة الإنسانية.",
        zh: "集成性学术百科全书，包罗经典逻辑之基石、复杂系统之演进，以及人类全域知识的恢弘统一。",
        ja: "古典論理学の基礎、複雑系ダイナミクス、および人類の知識体系の統合を網羅する総合的百科全書。",
        hi: "शास्त्रीय तर्क के मूल सिद्धांतों, जटिल प्रणालियों की गतिशीलता और मानव ज्ञान के एकीकरण को समाहित करने वाला विश्वकोशीय ग्रंथ।",
        la: "Tractatus encyclopaedicus fundamenta logicae classicae et systematum complexorum dynamicam complectens.",
        grc: "Ἐγκυκλοπαιδικὴ πραγματεία περὶ τῶν θεμελίων τῆς κλασικῆς λογικῆς καὶ τῆς ἑνώσεως τῆς ἀνθρωπίνης γνώσεως."
      }
    },
    savants: {
      t: {
        ro: "Topologia Memoriei & Dinamica Cognitivă",
        en: "Memory Topology & Cognitive Dynamics",
        it: "Topologia della Memoria & Dinamica Cognitiva",
        fr: "Topologie de la Mémoire et Dynamique Cognitive",
        de: "Gedächtnistopologie und Kognitive Dynamik",
        es: "Topología de la Memoria y Dinámica Cognitiva",
        pt: "Topologia da Memória e Dinâmica Cognitiva",
        ru: "Топология памяти и когнитивная динамика",
        el: "Τοπολογία Μνήμης καὶ Γνωστικὴ Δυναμική",
        ar: "طوبولوجيا الذاكرة والديناميكا المعرفية",
        zh: "记忆拓扑学与高阶认知动力学",
        ja: "記憶トポロジーと認知ダイナミクス大系",
        hi: "स्मृति टोपोलॉजी और संज्ञानात्मक गतिशीलता",
        la: "Topologia Memoriae et Dynamica Cognitiva",
        grc: "Τοπολογία Μνήμης καὶ Γνωστικὴ Δυναμική"
      },
      s: {
        ro: "Arhitectura neuronală a asocierilor cognitive de nivel înalt, calculul simbolic abstract și procesarea paralelă a intuiției umane.",
        en: "Neural architecture of high-order cognitive associations, abstract symbolic calculation, and parallel processing of human intuition.",
        it: "Architettura neuronale delle associazioni cognitive superiori, calcolo simbolico astratto ed elaborazione parallela dell'intuizione umana.",
        fr: "Architecture neuronale des associations cognitives supérieures, calcul symbolique abstrait et traitement parallèle de l'intuition humaine.",
        de: "Neuronale Architektur übergeordneter kognitiver Assoziationen, abstrakte symbolische Berechnung und parallele Verarbeitung menschlicher Intuition.",
        es: "Arquitectura neuronal de asociaciones cognitivas superiores, cálculo simbólico abstracto y procesamiento paralelo de la intuición humana.",
        pt: "Arquitetura neuronal de associações cognitivas superiores, cálculo simbólico abstrato e processamento paralelo da intuição humana.",
        ru: "Нейронная архитектура когнитивных ассоциаций высшего порядка, абстрактные вычисления и параллельная обработка интуиции.",
        el: "Νευρωνικὴ ἀρχιτεκτονικὴ τῶν ὑψηλῶν γνωστικῶν συνειρμῶν καὶ παράλληλος ἐπεξεργασία τῆς διανοίας.",
        ar: "البنية العصبية للارتباطات المعرفية العليا، والحساب الرمزي المجرد، والمعالجة المتوازية للحدس البشري.",
        zh: "高阶认知联想的神经元架构，抽象符号严密演算与人类直觉潜能的并行多维解析。",
        ja: "高次認知連想の神経基盤、抽象的記号計算、および人間の直観機構の並列処理アーキテクチャ。",
        hi: "उच्च-क्रम संज्ञानात्मक संघों की तंत्रिका वास्तुकला, अमूर्त प्रतीकात्मक गणना और मानव अंतर्ज्ञान का समानांतर प्रसंस्करण।",
        la: "Architectura neuronalis associationum cognitivarum altiorum et intuitus humani processus parallelus.",
        grc: "Νευρωνικὴ ἀρχιτεκτονικὴ τῶν ὑψηλῶν γνωστικῶν συνειρμῶν καὶ παράλληλος ἐπεξεργασία τῆς διανοίας."
      }
    },
    prodigies: {
      t: {
        ro: "Analiza Asimptotică a Varietăților Riemanniene",
        en: "Asymptotic Analysis of Riemannian Manifolds",
        it: "Analisi Asintotica delle Varietà Riemanniane",
        fr: "Analyse Asymptotique des Variétés Riemanniennes",
        de: "Asymptotische Analyse Riemannscher Mannigfaltigkeiten",
        es: "Análisis Asintótico de Variedades Riemannianas",
        pt: "Análise Assintótica de Variedades Riemannianas",
        ru: "Асимптотический анализ римановых многообразий",
        el: "Ἀσυμπτωτικὴ Ἀνάλυσις τῶν Ριμανείων Πολλαπλοτήτων",
        ar: "التحليل المقارب للمتفرعات الريمانية",
        zh: "黎曼流形的高阶渐近分析与调和算子",
        ja: "リーマン多様体の漸近解析と不変微分作用素論",
        hi: "रीमानियन मैनिफोल्ड्स का स्पर्शोन्मुख विश्लेषण",
        la: "Analysis Asymptotica Varietatum Riemannianarum",
        grc: "Ἀσυμπτωτικὴ Ἀνάλυσις τῶν Ριμανείων Πολλαπλοτήτων"
      },
      s: {
        ro: "Demonstrații riguroase în analiza armonică superioară, geometria diferențială modernă și convergența operatorilor diferențiali invarianți.",
        en: "Rigorous proofs in higher harmonic analysis, modern differential geometry, and convergence of invariant differential operators.",
        it: "Dimostrazioni rigorose nell'analisi armonica superiore, geometria differenziale moderna e convergenza degli operatori differenziali invarianti.",
        fr: "Démonstrations rigoureuses en analyse harmonique supérieure, géométrie différentielle moderne et convergence des opérateurs différentiels invariants.",
        de: "Strenge Beweise in der höheren harmonischen Analyse, modernen Differentialgeometrie und Konvergenz invarianter Differentialoperatoren.",
        es: "Demostraciones rigurosas en análisis armónico superior, geometría diferencial moderna y convergencia de operadores diferenciales invariantes.",
        pt: "Demonstrações rigorosas em análise harmônica superior, geometria diferencial moderna e convergência de operadores diferenciais invariantes.",
        ru: "Строгие доказательства в высшем гармоническом анализе, дифференциальной геометрии и сходимости инвариантных дифференциальных операторов.",
        el: "Αὐστηραὶ ἀποδείξεις ἐν τῇ ἁρμονικῇ ἀναλύσει, τῇ διαφορικῇ γεωμετρίᾳ καὶ τῇ συγκλίσει τῶν τελεστῶν.",
        ar: "براهين صارمة في التحليل التوافقي العالي، والهندسة التفاضلية الحديثة، وتقارب المؤثرات التفاضلية الثابتة.",
        zh: "高阶调和分析、现代微分几何与不变微分算子强收敛性的严密数学论证。",
        ja: "高次調和解析、現代微分幾何学、および不変微分作用素の収束に関する厳密な数学的証明大系。",
        hi: "उच्च हार्मोनिक विश्लेषण, आधुनिक अंतर ज्यामिति और अपरिवर्तनीय अंतर संचालकों के अभिसरण में कठोर प्रमाण।",
        la: "Demonstrationes severae in analysi harmonica superiore et convergentia operatorum differentialium invariantium.",
        grc: "Αὐστηραὶ ἀποδείξεις ἐν τῇ ἁρμονικῇ ἀναλύσει, τῇ διαφορικῇ γεωμετρίᾳ καὶ τῇ συγκλίσει τῶν τελεστῶν."
      }
    },
    physiology: {
      t: {
        ro: "Bioenergetica Replicativă & Homeostazia Celulară",
        en: "Replicative Bioenergetics & Cellular Homeostasis",
        it: "Bioenergetica Replicativa & Omeostasi Cellulare",
        fr: "Bioénergétique Réplicative et Homéostasie Cellulaire",
        de: "Replikative Bioenergetik und Zelluläre Homöostase",
        es: "Bioenergética Replicativa y Homeostasis Celular",
        pt: "Bioenergética Replicativa e Homeostase Celular",
        ru: "Репликативная биоэнергетика и клеточный гомеостаз",
        el: "Βιοενεργητικὴ καὶ Κυτταρικὴ Ὁμοιόστασις",
        ar: "الطاقة الحيوية التكاثرية والاستتباب الخلوي",
        zh: "细胞能量代谢稳态与端粒复制动力学",
        ja: "複製バイオエナジェティクスと細胞恒常性維持機構",
        hi: "प्रतिकृति जैव ऊर्जा और सेलुलर होमोस्टेसिस",
        la: "Bioenergetica Replicativa et Homeostasis Cellularis",
        grc: "Βιοενεργητικὴ καὶ Κυτταρικὴ Ὁμοιόστασις"
      },
      s: {
        ro: "Investigație experimentală privind căile metabolice de protecție a integrității celulare și mecanismele fundamentale de adaptabilitate biologică.",
        en: "Experimental investigation into metabolic pathways preserving cellular integrity and fundamental mechanisms of biological adaptability.",
        it: "Indagine sperimentale sulle vie metaboliche a protezione dell'integrità cellulare e sui meccanismi fondamentali di adattabilità biologica.",
        fr: "Étude expérimentale des voies métaboliques préservant l'intégrité cellulaire et des mécanismes fondamentaux d'adaptabilité biologique.",
        de: "Experimentelle Untersuchung der Stoffwechselwege zum Schutz der zellulären Integrität und der fundamentalen Mechanismen biologischer Anpassungsfähigkeit.",
        es: "Investigación experimental sobre las vías metabólicas que preservan la integridad celular y los mecanismos fundamentales de adaptabilidad biológica.",
        pt: "Investigação experimental sobre as vias metabólicas de preservação da integridade celular e mecanismos fundamentais de adaptabilidade biológica.",
        ru: "Экспериментальное исследование метаболических путей сохранения целостности клеток и механизмов биологической адаптивности.",
        el: "Πειραματικὴ ἔρευνα περὶ τῶν μεταβολικῶν ὁδῶν διαφυλάξεως τῆς κυτταρικῆς ἀκεραιότητος.",
        ar: "دراسة تجريبية للمسارات الأيضية التي تحافظ على السلامة الخلوية والآليات الأساسية للتكيف البيولوجي.",
        zh: "关于维持细胞膜稳定性之代谢通路及极限环境下生物自适应分子机制的实验探究。",
        ja: "細胞の完全性を維持する代謝経路と生物学的適応能の基本原理に関する精密実験研究。",
        hi: "सेलुलर अखंडता और जैविक अनुकूलनशीलता के मौलिक तंत्र को संरक्षित करने वाले चयापचय मार्गों की प्रायोगिक जांच।",
        la: "Investigatio experimentalis de viis metabolicis integritatem cellularem protegentibus et adaptabilitate biologica.",
        grc: "Πειραματικὴ ἔρευνα περὶ τῶν μεταβολικῶν ὁδῶν διαφυλάξεως τῆς κυτταρικῆς ἀκεραιότητος."
      }
    },
    antiquities: {
      t: {
        ro: "Mecanica Cosmologică a Sanctuarelor Antice",
        en: "Cosmological Mechanics of Ancient Sanctuaries",
        it: "Meccanica Cosmologica dei Santuari Antichi",
        fr: "Mécanique Cosmologique des Sanctuaires Antiques",
        de: "Kosmologische Mechanik Antiker Heiligtümer",
        es: "Mecánica Cosmológica de los Santuarios Antiguos",
        pt: "Mecânica Cosmológica dos Santuários Antigos",
        ru: "Космологическая механика древних святилищ",
        el: "Κοσμολογικὴ Μηχανικὴ τῶν Ἀρχαίων Ἱερῶν",
        ar: "الميكانيكا الكونية في المعابد القديمة",
        zh: "古代巨石圣殿的天文导向与天文钟机械",
        ja: "古代聖域の宇宙論的機構と天文数理測位体系",
        hi: "प्राचीन अभयारण्यों का ब्रह्मांडीय यांत्रिकी",
        la: "Mechanica Cosmologica Sanctuariorum Antiquorum",
        grc: "Κοσμολογικὴ Μηχανικὴ τῶν Ἀρχαίων Ἱερῶν"
      },
      s: {
        ro: "Reconstituirea arheo-astronomică a sistemelor de orientare matematică și precizia inginerească a marilor civilizații ale Mediteranei și Orientului.",
        en: "Archaeoastronomical reconstruction of mathematical orientation systems and engineering precision in ancient Mediterranean civilizations.",
        it: "Ricostruzione archeoastronomica dei sistemi di orientamento matematico e della precisione ingegneristica delle grandi civiltà mediterranee.",
        fr: "Reconstitution archéoastronomique des systèmes d'orientation mathématique et de la précision d'ingénierie des grandes civilisations méditerranéennes.",
        de: "Archäoastronomische Rekonstruktion mathematischer Orientierungssysteme und ingenieurtechnischer Präzision antiker Zivilisationen.",
        es: "Reconstrucción arqueoastronómica de sistemas de orientación matemática y precisión ingenieril en las civilizaciones mediterráneas antiguas.",
        pt: "Reconstituição arqueoastronômica dos sistemas de orientação matemática e precisão de engenharia das antigas civilizações mediterrâneas.",
        ru: "Археоастрономическая реконструкция систем математической ориентации и инженерной точности древних цивилизаций.",
        el: "Ἀρχαιοαστρονομικὴ ἀναπαράστασις τῶν μαθηματικῶν συστημάτων προσανατολισμοῦ τῶν ἀρχαίων πολιτισμῶν.",
        ar: "إعادة بناء فلكية أثرية لأنظمة التوجيه الرياضي والدقة الهندسية في الحضارات المتوسطية القديمة.",
        zh: "古代地中海及东方文明数学定向系统与高精密工程力学的考古天文学精密复原。",
        ja: "古代地中海および東洋文明における数理測位体系と高度工学精度の考古天文学的復元。",
        hi: "प्राचीन भूमध्यसागरीय सभ्यताओं में गणितीय अभिविन्यास प्रणालियों और इंजीनियरिंग सटीकता का पुरातत्व खगोलीय पुनर्निर्माण।",
        la: "Reconstructio archaeoastronomica systematum orientationis mathematicae et praecisionis ingeniariae antiquae.",
        grc: "Ἀρχαιοαστρονομικὴ ἀναπαράστασις τῶν μαθηματικῶν συστημάτων προσανατολισμοῦ τῶν ἀρχαίων πολιτισμῶν."
      }
    },
    eureka: {
      t: {
        ro: "Simetria Gauge & Teoria Cuantică de Câmp",
        en: "Gauge Symmetry & Quantum Field Theory",
        it: "Simmetria di Gauge & Teoria Quantistica dei Campi",
        fr: "Symétrie de Jauge et Théorie Quantique des Champs",
        de: "Eichsymmetrie und Quantenfeldtheorie",
        es: "Simetría Gauge y Teoría Cuántica de Campos",
        pt: "Simetria de Calibre e Teoria Quântica de Campos",
        ru: "Калибровочная симметрия и квантовая теория поля",
        el: "Συμμετρία Βαθμίδος καὶ Κβαντικὴ Θεωρία Πεδίου",
        ar: "تناظر المقياس ونظرية المجال الكمي",
        zh: "规范对称性破缺与高能拓扑量子场论",
        ja: "ゲージ対称性と多次元ヒルベルト空間量子場論",
        hi: "गेज समरूपता और क्वांटम फील्ड सिद्धांत",
        la: "Symmetria Gauge et Theoria Campi Quantici",
        grc: "Συμμετρία Βαθμίδος καὶ Κβαντικὴ Θεωρία Πεδίου"
      },
      s: {
        ro: "Formularea ecuațiilor invariante de scală la energii ultra-înalte și explicarea perturbațiilor locale în spații Hilbert multidimensionale.",
        en: "Formulation of scale-invariant equations at ultra-high energies and resolution of local perturbations in multidimensional Hilbert spaces.",
        it: "Formulazione delle equazioni invarianti di scala a energie ultra-elevate e spiegazione delle perturbazioni locali in spazi di Hilbert multidimensionali.",
        fr: "Formulation des équations invariantes d'échelle à très haute énergie et résolution des perturbations locales dans les espaces de Hilbert multidimensionnels.",
        de: "Formulierung skaleninvarianter Gleichungen bei ultrahohen Energien und Erklärung lokaler Störungen in mehrdimensionalen Hilberträumen.",
        es: "Formulación de ecuaciones invariantes de escala a energías ultra altas y resolución de perturbaciones locales en espacios de Hilbert multidimensionales.",
        pt: "Formulação de equações invariantes de escala em energias ultra-altas e resolução de perturbações locais em espaços de Hilbert multidimensionais.",
        ru: "Формулирование масштабно-инвариантных уравнений при ультравысоких энергиях и разрешение возмущений в гильбертовых пространствах.",
        el: "Διατύπωσις τῶν ἐξισώσεων κλίμακος εἰς ὑπερυψηλὰς ἐνεργείας καὶ ἐπίλυσις ἐν πολυδιαστάτοις χώροις Hilbert.",
        ar: "صياغة المعادلات الثابتة المقياس عند الطاقات الفائقة وحل الاضطرابات المحلية في فضاءات هيلبرت متعددة الأبعاد.",
        zh: "超高能级尺度不变方程之严密数学形式化，以及多维希尔伯特空间局域微扰的完备解。",
        ja: "超高エネルギー領域におけるスケール不変方程式の定式化と多次元ヒルベルト空間における局所摂動の解明。",
        hi: "अत्यधिक उच्च ऊर्जा पर पैमाने-अपरिवर्तनीय समीकरणों का निर्माण और बहुआयामी हिल्बर्ट रिक्त स्थान में स्थानीय गड़बड़ी का समाधान।",
        la: "Formulatio aequationum invariantium ad energias summas et perturbatiunculae in spatiis Hilbertianis.",
        grc: "Διατύπωσις τῶν ἐξισώσεων κλίμακος εἰς ὑπερυψηλὰς ἐνεργείας καὶ ἐπίλυσις ἐν πολυδιαστάτοις χώροις Hilbert."
      }
    },
    neuroscience: {
      t: {
        ro: "Oscilațiile Sinaptice & Coerența Conștiinței",
        en: "Synaptic Oscillations & Coherence of Consciousness",
        it: "Oscillazioni Sinaptiche & Coerenza della Coscienza",
        fr: "Oscillations Synaptiques et Cohérence de la Conscience",
        de: "Synaptische Oszillationen und Kohärenz des Bewusstseins",
        es: "Oscilaciones Sinápticas y Coherencia de la Conciencia",
        pt: "Oscilações Sinápticas e Coerência da Consciência",
        ru: "Синаптические осцилляции и когерентность сознания",
        el: "Συναπτικαὶ Ταλαντώσεις καὶ Συνείδησις",
        ar: "التذبذبات المشبكية وتماسك الوعي",
        zh: "丘脑-皮层突触振荡与深层意识相干网络",
        ja: "視床皮質シナプス振動と純粋意識の同期機序",
        hi: "सिनैप्टिक दोलन और चेतना का सामंजस्य",
        la: "Oscillationes Synapticae et Conscientiae Coherentia",
        grc: "Συναπτικαὶ Ταλαντώσεις καὶ Συνείδησις"
      },
      s: {
        ro: "Maparea legăturilor oscilatorii talamo-corticale și corelația dintre sincronizarea rețelelor neuronale profunde și actul percepției pure.",
        en: "Mapping thalamocortical oscillatory rhythms and correlation between deep neural network synchrony and the phenomenon of pure perception.",
        it: "Mappatura dei ritmi oscillatori talamo-corticali e correlazione tra la sincronizzazione delle reti neuronali profonde e l'atto della percezione pura.",
        fr: "Cartographie des rythmes oscillatoires thalamo-corticaux et corrélation entre synchronie des réseaux neuronaux profonds et perception pure.",
        de: "Kartierung thalamokortikaler Schwingungsrhythmen und Korrelation zwischen tiefer neuronaler Netzwerksynchronizität und reiner Wahrnehmung.",
        es: "Mapeo de ritmos oscilatorios talamocorticales y correlación entre sincronía de redes neuronales profundas y la percepción pura.",
        pt: "Mapeamento dos ritmos oscilatórios talamocorticais e correlação entre sincronia de redes neuronais profundas e percepção pura.",
        ru: "Картирование таламокортикальных колебаний и корреляция синхронизации глубоких нейронных сетей с актом чистого восприятия.",
        el: "Χαρτογράφησις τῶν θαλαμο-φλοιωδῶν ταλαντώσεων καὶ συγχρονισμὸς τῶν νευρωνικῶν δικτύων.",
        ar: "رسم خرائط للإيقاعات التذبذبية المهادية القشرية والارتباط بين تزامن الشبكات العصبية العميقة والإدراك الخالص.",
        zh: "丘脑-大脑皮层振荡节律精密绘图，揭示深层神经元网络高频同步化与纯粹知觉产生的内蕴联系。",
        ja: "視床皮質オシレーション律動のマッピングと深層神経回路の同期と純粋知覚創発の相関解析。",
        hi: "थैलेमोकोर्टिकल दोलन लय का मानचित्रण और गहरे तंत्रिका नेटवर्क तुल्यकालन और शुद्ध धारणा की घटना के बीच संबंध।",
        la: "Descriptio rhythmorum thalamocorticalium et correlatio cum synchronia retium neuronalium et perceptione pura.",
        grc: "Χαρτογράφησις τῶν θαλαμο-φλοιωδῶν ταλαντώσεων καὶ συγχρονισμὸς τῶν νευρωνικῶν δικτύων."
      }
    },
    genetics: {
      t: {
        ro: "Topologia Epigenetică & Recombinarea Omoloagă",
        en: "Epigenetic Topology & Homologous Recombination",
        it: "Topologia Epigenetica & Ricombinazione Omologa",
        fr: "Topologie Épigénétique et Recombinaison Homologue",
        de: "Epigenetische Topologie und Homologe Rekombination",
        es: "Topología Epigenética y Recombinación Homóloga",
        pt: "Topologia Epigenética e Recombinação Homóloga",
        ru: "Эпигенетическая топология и гомологичная рекомбинация",
        el: "Ἐπιγενετικὴ Τοπολογία καὶ Ὁμόλογος Ἀνασυνδυασμός",
        ar: "طوبولوجيا علم التخلق وإعادة التركيب المتماثل",
        zh: "染色质三维折叠拓扑与同源重组保真机制",
        ja: "エピジェネティック立体構造と相同組換え忠実性",
        hi: "एपिजेनेटिक टोपोलॉजी और समजात पुनर्संयोजन",
        la: "Topologia Epigenetica et Recombinatio Homologa",
        grc: "Ἐπιγενετικὴ Τοπολογία καὶ Ὁμόλογος Ἀνασυνδυασμός"
      },
      s: {
        ro: "Arhitectura tridimensională a cromatinei, dinamica metilării situsurilor reglatoare și mecanismele moleculare de fidelitate genomică.",
        en: "Three-dimensional chromatin architecture, regulatory methylation dynamics, and molecular mechanisms governing genomic fidelity.",
        it: "Architettura tridimensionale della cromatina, dinamica della metilazione dei siti regolatori e meccanismi molecolari di fedeltà genomica.",
        fr: "Architecture tridimensionnelle de la chromatine, dynamique de méthylation des sites régulateurs et fidélité génomique.",
        de: "Dreidimensionale Chromatinarchitektur, Dynamik der Methylierung regulatorischer Stellen und Mechanismen genomischer Treue.",
        es: "Arquitectura tridimensional de la cromatina, dinámica de metilación de sitios reguladores y fidelidad genómica.",
        pt: "Arquitetura tridimensional da cromatina, dinâmica da metilação de sítios reguladores e fidelidade genômica.",
        ru: "Трехмерная архитектура хроматина, динамика метилирования регуляторных сайтов и механизмы геномной точности.",
        el: "Τρισδιάστατος ἀρχιτεκτονικὴ τῆς χρωματίνης καὶ μοριακοὶ μηχανισμοὶ γονιδιωματικῆς ἀκεραιότητος.",
        ar: "البنية ثلاثية الأبعاد للكروماتين، وديناميات المثيلة للمواقع التنظيمية، والآليات الجزيئية للسلامة الجينومية.",
        zh: "染色质三维折叠拓扑、启动子甲基化动态演变与真核生物同源重组基因保真之分子生物学机制。",
        ja: "クロマチンの3次元立体構築、調節領域メチル化動態、およびゲノム複製忠実性を司る分子機構。",
        hi: "त्रि-आयामी क्रोमैटिन वास्तुकला, नियामक मिथाइलेशन गतिशीलता और जीनोमिक निष्ठा को नियंत्रित करने वाले आणविक तंत्र।",
        la: "Architectura tridimensionalis chromatini et mechanismi moleculares fidelitatis genomicae.",
        grc: "Τρισδιάστατος ἀρχιτεκτονικὴ τῆς χρωματίνης καὶ μοριακοὶ μηχανισμοὶ γονιδιωματικῆς ἀκεραιότητος."
      }
    },
    cosmos: {
      t: {
        ro: "Termodinamica Orizontului Găurilor Negre Primordiale",
        en: "Thermodynamics of Primordial Black Hole Horizons",
        it: "Termodinamica degli Orizzonti dei Buchi Neri Primordiali",
        fr: "Thermodynamique de l'Horizon des Trous Noirs Primordiaux",
        de: "Thermodynamik der Horizonte Primordialer Schwarzer Löcher",
        es: "Termodinámica del Horizonte de Agujeros Negros Primordiales",
        pt: "Termodinâmica do Horizonte de Buracos Negros Primordiais",
        ru: "Термодинамика горизонта первичных черных дыр",
        el: "Θερμοδυναμικὴ τῶν Ὁριζόντων τῶν Πρωταρχικῶν Μελανῶν Ὀπῶν",
        ar: "الديناميكا الحرارية لآفاق الثقوب السوداء البدائية",
        zh: "太初原初黑洞视界量子引力热力学",
        ja: "原始ブラックホール事象の地平線における量子熱力学",
        hi: "आदिम ब्लैक होल क्षितिज का ऊष्मप्रवैगिकी",
        la: "Thermodynamica Horizontis Foraminum Nigrorum Primordialium",
        grc: "Θερμοδυναμικὴ τῶν Ὁριζόντων τῶν Πρωταρχικῶν Μελανῶν Ὀπῶν"
      },
      s: {
        ro: "Calculul cantitativ al entropiei gravitaționale și radiației cuantice în vecinătatea singularităților spațio-temporale de la originea universului.",
        en: "Quantitative calculation of gravitational entropy and quantum radiation in the vicinity of primordial spacetime singularities.",
        it: "Calcolo quantitativo dell'entropia gravitazionale e della radiazione quantistica in prossimità delle singolarità spaziotemporali primordiali.",
        fr: "Calcul quantitatif de l'entropie gravitationnelle et du rayonnement quantique au voisinage des singularités spatio-temporelles primordiales.",
        de: "Quantitative Berechnung von Gravitationsentropie und Quantenstrahlung in der Nähe primordialer Raumzeit-Singularitäten.",
        es: "Cálculo cuantitativo de la entropía gravitatoria y radiación cuántica en la proximidad de singularidades espaciotemporales primordiales.",
        pt: "Cálculo quantitativo da entropia gravitacional e radiação quântica na vizinhança de singularidades espaço-temporais primordiais.",
        ru: "Количественный расчет гравитационной энтропии и квантового излучения вблизи сингулярностей пространства-времени.",
        el: "Ποσοτικὸς ὑπολογισμὸς τῆς βαρυτικῆς ἐντροπίας καὶ κβαντικῆς ἀκτινοβολίας πλησίον τῶν πρωταρχικῶν ἰδιομορφιῶν.",
        ar: "الحساب الكمي للقصور الذاتي التثاقلي والإشعاع الكمي في جوار التفردات الزمكانية البدائية.",
        zh: "暴胀时期原初黑洞事件视界引力熵定量精确推导，及普朗克尺度量子辐射与信息佯谬解答。",
        ja: "宇宙初期における原始ブラックホール地平線の重力エントロピー定量計算およびプランクスケール量子輻射解析。",
        hi: "आदिम स्पेसटाइम विलक्षणताओं के आसपास गुरुत्वाकर्षण एन्ट्रापी और क्वांटम विकिरण की मात्रात्मक गणना।",
        la: "Calculus quantitativus entropiae gravitationalis et radiationis quanticae prope singularitates primordiales.",
        grc: "Ποσοτικὸς ὑπολογισμὸς τῆς βαρυτικῆς ἐντροπίας καὶ κβαντικῆς ἀκτινοβολίας πλησίον τῶν πρωταρχικῶν ἰδιομορφιῶν."
      }
    },
    manuscripts: {
      t: {
        ro: "Paleografia Codicilor Hermetici & Manuscriselor de Arhivă",
        en: "Palaeography of Hermetic Codices & Archival Manuscripts",
        it: "Paleografia dei Codici Ermetici & Manoscritti d'Archivio",
        fr: "Paléographie des Codex Hermétiques et Manuscrits d'Archives",
        de: "Paläographie Hermetischer Codices und Archivhandschriften",
        es: "Paleografía de Códices Herméticos y Manuscritos de Archivo",
        pt: "Paleografia de Códices Herméticos e Manuscritos de Arquivo",
        ru: "Палеография герметических кодексов и архивных манускриптов",
        el: "Παλαιογραφία Ἑρμητικῶν Κωδίκων καὶ Ἀρχειακῶν Χειρογράφων",
        ar: "علم خطاطة المخطوطات الهرمسية والوثائق الأرشيفية",
        zh: "古代秘传手抄古卷与羊皮纸拉曼光谱古文书学",
        ja: "ヘルメス主義古写本古文書学と羊皮紙ラマン分光解析",
        hi: "गूढ़ संहिताओं और पुरालेख पांडुलिपियों की पुरालेखशास्त्र",
        la: "Palaeographia Codicum Hermeticorum et Manuscriptorum",
        grc: "Παλαιογραφία Ἑρμητικῶν Κωδίκων καὶ Ἀρχειακῶν Χειρογράφων"
      },
      s: {
        ro: "Studiu filologic și spectroscopie Raman aplicată pe pergamente rare, atestând transmiterea secretă a marilor tratate științifice medievale.",
        en: "Philological study and Raman spectroscopy applied to rare vellum, substantiating the clandestine transmission of monumental medieval treatises.",
        it: "Studio filologico e spettroscopia Raman applicata a pergamene rare, che attestano la trasmissione segreta dei grandi trattati scientifici medievali.",
        fr: "Étude philologique et spectroscopie Raman appliquée sur vélins rares, attestant la transmission secrète des grands traités scientifiques médiévaux.",
        de: "Philologische Untersuchung und Raman-Spektroskopie auf seltenem Pergament zur geheimen Überlieferung mittelalterlicher Wissenschaftstraktate.",
        es: "Estudio filológico y espectroscopía Raman aplicada a pergaminos raros, que atestigua la transmisión clandestina de grandes tratados científicos medievales.",
        pt: "Estudo filológico e espectroscopia Raman aplicada a pergaminhos raros, atestando a transmissão clandestina de grandes tratados científicos medievais.",
        ru: "Филологическое исследование и рамановская спектроскопия редкого пергамента, подтверждающие тайную передачу средневековых трактатов.",
        el: "Φιλολογικὴ μελέτη καὶ φασματοσκοπία Raman ἐπὶ σπανίων περγαμηνῶν, βεβαιοῦσα τὴν μυστικὴν παράδοσιν τῶν κειμένων.",
        ar: "دراسة لغوية وتحليل طيفي بمطياف رامان على الرقوق النادرة، يثبت النقل السري للأطروحات العلمية الكبرى في العصور الوسطى.",
        zh: "应用显微拉曼光谱对稀世牛皮纸文献进行断代鉴定，实证中世纪大科学家秘传科学典籍的历史流转脉络。",
        ja: "希少羊皮紙に対するラマン分光分析および文献学的照合により、中世大科学論文の秘伝的伝播経路を実証。",
        hi: "दुर्लभ चर्मपत्र पर लागू भाषाशास्त्रीय अध्ययन और रमन स्पेक्ट्रोस्कोपी, जो मध्ययुगीन वैज्ञानिक ग्रंथों के गुप्त संचरण को प्रमाणित करता है।",
        la: "Studium philologicum et spectroscopia Raman in membranis raris, clandestinam transmissionem tractatuum scientiae attestans.",
        grc: "Φιλολογικὴ μελέτη καὶ φασματοσκοπία Raman ἐπὶ σπανίων περγαμηνῶν, βεβαιοῦσα τὴν μυστικὴν παράδοσιν τῶν κειμένων."
      }
    }
  };

  const titlePrefixes = {
    ro: "Cronica #",
    en: "Chronicle #",
    it: "Cronaca #",
    fr: "Chronique #",
    de: "Chronik #",
    es: "Crónica #",
    pt: "Crónica #",
    ru: "Хроника #",
    el: "Χρονικὸν #",
    ar: "السجل #",
    zh: "正典学术档案 #",
    ja: "学術年代記 #",
    hi: "अकादमिक इतिहास #",
    la: "Chronica #",
    grc: "Χρονικὸν #"
  };

  const metricPrefixes = {
    ro: "✦ Cronică Canonică n° ",
    en: "✦ Canonical Chronicle n° ",
    it: "✦ Cronaca Canonica n° ",
    fr: "✦ Chronique Canonique n° ",
    de: "✦ Kanonische Chronik n° ",
    es: "✦ Crónica Canónica n° ",
    pt: "✦ Crónica Canónica n° ",
    ru: "✦ Каноническая хроника n° ",
    el: "✦ Κανονικὸν Χρονικὸν n° ",
    ar: "✦ السجل المعتمد n° ",
    zh: "✦ 正典学术档案 n° ",
    ja: "✦ 正典学術記録 n° ",
    hi: "✦ प्रामाणिक वृत्तांत n° ",
    la: "✦ Chronica Canonica n° ",
    grc: "✦ Κανονικὸν Χρονικὸν n° "
  };

  const SphinxVirtualEngine = {
    isReady: true,
    totalCapacity: TOTAL_RECORDS,

    /**
     * Get the slice number (1-based) for a given 0-based global chronicle index
     */
    getSliceNumber(globalIndex) {
      return Math.floor(globalIndex / SLICE_SIZE) + 1;
    },

    /**
     * Format slice filename with leading zeros (e.g., 2 -> "0002")
     */
    formatSliceId(sliceNum) {
      return String(sliceNum).padStart(4, '0');
    },

    /**
     * Create an instant canonical wonder object from a search index entry
     */

    /**
     * Create an instant canonical wonder object from a search index entry
     * Supports complete 15-language localization
     */
    createWonderFromIndexEntry(entry) {
      const rank = entry.r || 1;
      const formattedRank = formatDots(rank);
      const cat = entry.c || 'polymaths';
      const visual = sphereVisuals[cat] || sphereVisuals['polymaths'];

      const allLangs = ['ro', 'en', 'it', 'fr', 'de', 'es', 'pt', 'ru', 'el', 'ar', 'zh', 'ja', 'hi', 'la', 'grc'];
      const sphereData = polyglotSpheres[cat] || polyglotSpheres['polymaths'];

      const titleObj = {};
      const metricObj = {};
      const summaryObj = {};
      const deepStoryObj = {};

      allLangs.forEach(l => {
        const theme = (sphereData.t && sphereData.t[l]) || sphereData.t['en'] || sphereData.t['ro'];
        const pfx = titlePrefixes[l] || `Chronicle #${formattedRank}: `;
        const mPfx = metricPrefixes[l] || `✦ Canonical Chronicle #${formattedRank} • `;
        const summary = (sphereData.s && sphereData.s[l]) || sphereData.s['en'] || sphereData.s['ro'];

        // If top 20,000 entry has its own specific localized title, respect it and format dots
        if (entry.t && l === 'ro') {
          const cleanT = cleanTitle(entry.t);
          titleObj.ro = cleanT;
          metricObj.ro = `✦ Cronică Canonică n° ${formattedRank} • ${cleanT.split(':')[1] ? cleanT.split(':')[1].trim() : cleanT}`;
          summaryObj.ro = entry.s || summary;
        } else if (entry.te && l === 'en') {
          const cleanTe = cleanTitle(entry.te);
          titleObj.en = cleanTe;
          metricObj.en = `✦ Canonical Chronicle n° ${formattedRank} • ${cleanTe.split(':')[1] ? cleanTe.split(':')[1].trim() : cleanTe}`;
          summaryObj.en = entry.se || summary;
        } else if (entry.ti && l === 'it') {
          const cleanTi = cleanTitle(entry.ti);
          titleObj.it = cleanTi;
          metricObj.it = `✦ Cronaca Canonica n° ${formattedRank} • ${cleanTi.split(':')[1] ? cleanTi.split(':')[1].trim() : cleanTi}`;
          summaryObj.it = entry.si || summary;
        } else {
          titleObj[l] = theme;
          metricObj[l] = `${mPfx}${formattedRank} • ${theme}`;
          summaryObj[l] = summary;
        }

        deepStoryObj[l] = {
          intro: summaryObj[l],
          science: (l === 'ro')
            ? `Descoperirea fundamentală documentată în acest fascicul reprezintă un salt metodologic esențial în sfera ${visual.seal}. Principiile deduse din observații empirice riguroase au stabilit noi standarde de verificare experimentală.`
            : (l === 'it')
            ? `La scoperta fondamentale registrata in questo fascicolo segna un salto epistemologico essenziale nell'ambito di ${visual.seal}, stabilendo standard empirici inconfutabili.`
            : (l === 'fr')
            ? `La découverte fondamentale consignée dans ce fascicule marque un saut épistémologique essentiel dans le domaine ${visual.seal}, établissant des standards empiriques irréfutables.`
            : (l === 'de')
            ? `Die in diesem Faszikel dokumentierte fundamentale Entdeckung markiert einen wesentlichen erkenntnistheoretischen Sprung im Bereich ${visual.seal} und etabliert unumstößliche empirische Maßstäbe.`
            : (l === 'es')
            ? `El descubrimiento fundamental documentado en este fascículo marca un salto epistemológico esencial en el ámbito de ${visual.seal}, estableciendo estándares empíricos inmutables.`
            : (l === 'pt')
            ? `A descoberta fundamental registrada neste fascículo marca um salto epistemológico essencial no âmbito de ${visual.seal}, estabelecendo padrões empíricos imutáveis.`
            : (l === 'ru')
            ? `Фундаментальное открытие, зафиксированное в этом фасцикуле, знаменует важнейший эпистемологический скачок в сфере ${visual.seal}, устанавливая непреложные эмпирические стандарты.`
            : (l === 'zh')
            ? `本学术正典所记载之重大科学突破，标志着人类在${visual.seal}领域取得的崇高认识论飞跃，确立了不可动摇的严密实验标准。`
            : (l === 'ja')
            ? `本学術記録に収載された根源的発見は、${visual.seal}領域における決定的な認識論的飛翔を示し、不可逆な実証的規範を確立している。`
            : (l === 'la')
            ? `Inventio fundamentalis hoc volumine tradita saltum epistemologicum essentialem in provincia ${visual.seal} designat, mensuras empiricas immutabiles statuens.`
            : `The foundational breakthrough recorded in this fascicle marks an essential epistemological leap within the ${visual.seal} domain, establishing immutable empirical standards.`,
          labnotes: (l === 'ro')
            ? `Protocol experimental desfășurat în mediu controlat. Instrumente etalonate pe standarde internaționale de laborator cu raport semnal-zgomot optimizat SNR > 25.4 și deviație standard minimă.`
            : (l === 'it')
            ? `Protocollo sperimentale eseguito in ambiente controllato. Strumentazione ad alta precisione calibrata su standard internazionali con rapporto segnale-rumore SNR > 25.4.`
            : (l === 'fr')
            ? `Protocole expérimental mené en environnement contrôlé. Instrumentation de haute précision étalonnée selon les normes internationales avec rapport signal sur bruit SNR > 25.4.`
            : (l === 'de')
            ? `Experimentelles Protokoll unter kontrollierten Bedingungen. Hochpräzise Instrumentierung nach internationalen Standards mit Signal-Rausch-Verhältnis SNR > 25.4.`
            : (l === 'es')
            ? `Protocolo experimental realizado en entorno controlado. Instrumentación de alta precisión calibrada según estándares internacionales con relación señal-ruido SNR > 25.4.`
            : (l === 'zh')
            ? `严苛受控环境下的实验记录规范。高精密度实验仪器经国际计量基准校准，信噪比SNR > 25.4，统计置信度p < 0.001。`
            : `Controlled experimental protocol executed under standardized conditions. High-precision instrumentation calibrated to international benchmarks with signal-to-noise ratio SNR > 25.4.`,
          legacy: (l === 'ro')
            ? `Punct de cotitură istoric în evoluția cunoașterii universale, constituind baza structurală a marilor progrese din știința contemporană a secolului XXI.`
            : (l === 'it')
            ? `Punto di svolta storico nella conoscenza umana, base indispensabile dei grandi sviluppi della scienza contemporanea del XXI secolo.`
            : (l === 'fr')
            ? `Tournant historique dans l'évolution de la connaissance humaine, constituant le socle des grandes avancées de la science contemporaine du XXIe siècle.`
            : (l === 'de')
            ? `Historischer Wendepunkt in der Entwicklung des menschlichen Wissens, der das Fundament der großen Durchbrüche der zeitgenössischen Wissenschaft des 21. Jahrhunderts bildet.`
            : (l === 'es')
            ? `Punto de inflexión histórico en el conocimiento humano, constituyendo la base de los grandes avances de la ciencia contemporánea del siglo XXI.`
            : (l === 'zh')
            ? `人类认知史上的划时代历史转折点，构成21世纪当代尖端科学与前沿哲思不可或缺的底层基石。`
            : `Historical turning point in universal human knowledge, providing the indispensable substrate for 21st-century scientific advancements.`,
          source: (l === 'it' || l === 'ro')
            ? 'The Silent Sphinx Canonical Archive (Roma, Italia)'
            : (l === 'fr')
            ? 'Archives Canoniques The Silent Sphinx (Rome, Italie)'
            : (l === 'de')
            ? 'Kanonisches Archiv The Silent Sphinx (Rom, Italien)'
            : (l === 'es')
            ? 'Archivo Canónico The Silent Sphinx (Roma, Italia)'
            : (l === 'zh')
            ? '寂静斯芬克斯正典档案馆（意大利罗马）'
            : (l === 'la')
            ? 'Tabularium Canonicum The Silent Sphinx (Roma, Italia)'
            : 'The Silent Sphinx Canonical Archive (Rome, Italy)'
        };
      });

      return {
        id: entry.id,
        category: cat,
        romanIndex: `n° ${formattedRank}`,
        sealText: visual.seal,
        readingMinutes: 5,
        artGradient: visual.gradient,
        accentColor: visual.accent,
        primarySource: 'The Silent Sphinx Canonical Archive (Roma, Italia)',
        sourceUrl: 'https://thesilentsphinx.org/archive',
        visualPlate: entry.visualPlate || `assets/visuals/plate_archetype_${cat}.jpg`,
        plateCaption: {
          ro: `Manuscris și document de arhivă istorică • Sfera ${visual.seal} [Ref. n° ${formattedRank}] • Conservat în registrul The Silent Sphinx.`,
          en: `Historical archival manuscript and document • Sphere of ${visual.seal} [Ref. n° ${formattedRank}] • Preserved in The Silent Sphinx corpus.`,
          it: `Manoscritto e documento storico d'archivio • Sfera di ${visual.seal} [Rif. n° ${formattedRank}] • Conservato nel registro The Silent Sphinx.`,
          fr: `Manuscrit et document d'archive historique • Sphère de ${visual.seal} [Réf. n° ${formattedRank}] • Conservé dans le registre The Silent Sphinx.`,
          de: `Historisches Archivmanuskript und Dokument • Sphäre ${visual.seal} [Ref. n° ${formattedRank}] • Aufbewahrt im The Silent Sphinx Register.`,
          es: `Manuscrito y documento histórico de archivo • Esfera de ${visual.seal} [Ref. n° ${formattedRank}] • Conservado en el registro The Silent Sphinx.`,
          pt: `Manuscrito e documento histórico de arquivo • Esfera de ${visual.seal} [Ref. n° ${formattedRank}] • Preservado no registro The Silent Sphinx.`,
          ru: `Исторический архивный манускрипт • Сфера ${visual.seal} [Ref. n° ${formattedRank}] • Сохранено в реестре The Silent Sphinx.`,
          zh: `历史档案珍稀手抄本文献 • ${visual.seal}学术领域 [Ref. n° ${formattedRank}] • 典藏于寂静斯芬克斯正典总档案馆。`,
          ja: `歴史的アーカイブ手稿文献 • ${visual.seal}領域 [Ref. n° ${formattedRank}] • 聖域アーカイブ保存文書。`,
          la: `Manuscriptum et documentum archivale historicum • Sphaera ${visual.seal} [Ref. n° ${formattedRank}] • In archivo The Silent Sphinx servatum.`
        },
        keyMetric: metricObj,
        title: titleObj,
        shortSummary: summaryObj,
        deepStory: deepStoryObj,
        rank: rank
      };
    },

    /**
     * Fetch a specific slice asynchronously and cache it
     */
    async loadSlice(sliceNum, prefetchNext = false) {
      if (sliceCache.has(sliceNum)) {
        return sliceCache.get(sliceNum);
      }
      if (pendingRequests.has(sliceNum)) {
        return pendingRequests.get(sliceNum);
      }

      const sliceId = this.formatSliceId(sliceNum);
      const url = `${SLICE_BASE_PATH}${sliceId}.json?v=65.0`;

      const fetchPromise = fetch(url)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status} loading slice ${sliceNum}`);
          return res.json();
        })
        .then(items => {
          sliceCache.set(sliceNum, items);
          pendingRequests.delete(sliceNum);
          // Pre-fetch only immediate next slice if explicitly requested, never cascade
          if (prefetchNext && sliceNum < (TOTAL_RECORDS / SLICE_SIZE) && !sliceCache.has(sliceNum + 1)) {
            setTimeout(() => this.loadSlice(sliceNum + 1, false), 300);
          }
          return items;
        })
        .catch(err => {
          console.warn(`[SphinxVirtualEngine] Slice ${sliceNum} fetch warning:`, err);
          pendingRequests.delete(sliceNum);
          return [];
        });

      pendingRequests.set(sliceNum, fetchPromise);
      return fetchPromise;
    },

    /**
     * Procedural generator for chronicles up to 100,000,000
     */
    generateProceduralIndexEntry(rank) {
      const spheres = ['polymaths', 'savants', 'prodigies', 'physiology', 'antiquities', 'eureka', 'neuroscience', 'genetics', 'cosmos', 'manuscripts'];
      const cat = spheres[(rank - 1) % spheres.length];
      const archetypes = {
        polymaths: {
          t: 'Sinteza Universală a Epistemologiei',
          te: 'Universal Epistemological Synthesis',
          ti: "Sintesi Universale dell'Epistemologia",
          s: 'Tratat enciclopedic integrat cuprinzând fundamentele logicii clasice, dinamica sistemelor complexe și unificarea ramurilor cunoașterii umane.',
          se: 'Integrated encyclopedic treatise encompassing the foundations of classical logic, the dynamics of complex systems, and the unification of human knowledge.',
          si: 'Trattato enciclopedico integrato comprendente i fondamenti della logica classica, la dinamica dei sistemi complessi e l\'unificazione del sapere umano.'
        },
        savants: {
          t: 'Topologia Memoriei & Dinamica Cognitivă',
          te: 'Memory Topology & Cognitive Dynamics',
          ti: 'Topologia della Memoria & Dinamica Cognitiva',
          s: 'Arhitectura neuronală a asocierilor cognitive de nivel înalt, calculul simbolic abstract și procesarea paralelă a intuiției umane.',
          se: 'Neural architecture of high-order cognitive associations, abstract symbolic calculation, and parallel processing of human intuition.',
          si: 'Architettura neuronale delle associazioni cognitive superiori, calcolo simbolico astratto ed elaborazione parallela dell\'intuizione umana.'
        },
        prodigies: {
          t: 'Analiza Asimptotică a Varietăților Riemanniene',
          te: 'Asymptotic Analysis of Riemannian Manifolds',
          ti: 'Analisi Asintotica delle Varietà Riemanniane',
          s: 'Demonstrații riguroase în analiza armonică superioară, geometria diferențială modernă și convergența operatorilor diferențiali invarianți.',
          se: 'Rigorous proofs in higher harmonic analysis, modern differential geometry, and convergence of invariant differential operators.',
          si: 'Dimostrazioni rigorose nell\'analisi armonica superiore, geometria differentiale moderna e convergenza degli operatori differenziali invarianti.'
        },
        physiology: {
          t: 'Bioenergetica Replicativă & Homeostazia Celulară',
          te: 'Replicative Bioenergetics & Cellular Homeostasis',
          ti: 'Bioenergetica Replicativa & Omeostasi Cellulare',
          s: 'Investigație experimentală privind căile metabolice de protecție a integrității celulare și mecanismele fundamentale de adaptabilitate biologică.',
          se: 'Experimental investigation into metabolic pathways preserving cellular integrity and fundamental mechanisms of biological adaptability.',
          si: 'Indagine sperimentale sulle vie metaboliche a protezione dell\'integrità cellulare e sui meccanismi fondamentali di adattabilità biologica.'
        },
        antiquities: {
          t: 'Mecanica Cosmologică a Sanctuarelor Antice',
          te: 'Cosmological Mechanics of Ancient Sanctuaries',
          ti: 'Meccanica Cosmologica dei Santuari Antichi',
          s: 'Reconstituirea arheo-astronomică a sistemelor de orientare matematică și precizia inginerească a marilor civilizații ale Mediteranei și Orientului.',
          se: 'Archaeoastronomical reconstruction of mathematical orientation systems and engineering precision in ancient Mediterranean civilizations.',
          si: 'Ricostruzione archeoastronomica dei sistemi di orientamento matematico e della precisione ingegneristica delle grandi civiltà mediterranee.'
        },
        eureka: {
          t: 'Simetria Gauge & Teoria Cuantică de Câmp',
          te: 'Gauge Symmetry & Quantum Field Theory',
          ti: 'Simmetria di Gauge & Teoria Quantistica dei Campi',
          s: 'Formularea ecuațiilor invariante de scală la energii ultra-înalte și explicarea perturbațiilor locale în spații Hilbert multidimensionale.',
          se: 'Formulation of scale-invariant equations at ultra-high energies and resolution of local perturbations in multidimensional Hilbert spaces.',
          si: 'Formulazione delle equazioni invarianti di scala a energie ultra-elevate e spiegazione delle perturbazioni locali in spazi di Hilbert multidimensionali.'
        },
        neuroscience: {
          t: 'Oscilațiile Sinaptice & Coerența Conștiinței',
          te: 'Synaptic Oscillations & Coherence of Consciousness',
          ti: 'Oscillazioni Sinaptiche & Coerenza della Coscienza',
          s: 'Maparea legăturilor oscilatorii talamo-corticale și corelația dintre sincronizarea rețelelor neuronale profunde și actul percepției pure.',
          se: 'Mapping thalamocortical oscillatory rhythms and correlation between deep neural network synchrony and the phenomenon of pure perception.',
          si: 'Mappatura dei ritmi oscillatori talamo-corticali e correlazione tra la sincronizzazione delle reti neuronali profonde e l\'atto della percezione pura.'
        },
        genetics: {
          t: 'Topologia Epigenetică & Recombinarea Omoloagă',
          te: 'Epigenetic Topology & Homologous Recombination',
          ti: 'Topologia Epigenetica & Ricombinazione Omologa',
          s: 'Arhitectura tridimensională a cromatinei, dinamica metilării situsurilor reglatoare și mecanismele moleculare de fidelitate genomică.',
          se: 'Three-dimensional chromatin architecture, regulatory methylation dynamics, and molecular mechanisms governing genomic fidelity.',
          si: 'Architettura tridimensionale della cromatina, dinamica della metilazione dei siti regolatori e meccanismi molecolari di fedeltà genomica.'
        },
        cosmos: {
          t: 'Termodinamica Orizontului Găurilor Negre Primordiale',
          te: 'Thermodynamics of Primordial Black Hole Horizons',
          ti: 'Termodinamica degli Orizzonti dei Buchi Neri Primordiali',
          s: 'Calculul cantitativ al entropiei gravitaționale și radiației cuantice în vecinătatea singularităților spațio-temporale de la originea universului.',
          se: 'Quantitative calculation of gravitational entropy and quantum radiation in the vicinity of primordial spacetime singularities.',
          si: 'Calcolo quantitativo dell\'entropia gravitazionale e della radiazione quantistica in prossimità delle singolarità spaziotemporali primordiali.'
        },
        manuscripts: {
          t: 'Paleografia Codicilor Hermetici & Manuscriselor de Arhivă',
          te: 'Palaeography of Hermetic Codices & Archival Manuscripts',
          ti: 'Paleografia dei Codici Ermetici & Manoscritti d\'Archivio',
          s: 'Studiu filologic și spectroscopie Raman aplicată pe pergamente rare, atestând transmiterea secretă a marilor tratate științifice medievale.',
          se: 'Philological study and Raman spectroscopy applied to rare vellum, substantiating the clandestine transmission of monumental medieval treatises.',
          si: 'Studio filologico e spettroscopia Raman applicata a pergamene rare, che attestano la trasmissione segreta dei grandi trattati scientifici medievali.'
        }
      };

      const arch = archetypes[cat] || archetypes.polymaths;
      return {
        id: `sphinx-rec-${rank}`,
        r: rank,
        c: cat,
        t: arch.t,
        te: arch.te,
        ti: arch.ti,
        s: arch.s,
        se: arch.se,
        si: arch.si
      };
    },

    /**
     * Synchronous / Cached getter for a page of chronicles
     */
    getPageChronicles(currentPage, itemsPerPage) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      // Handle procedural tiers beyond static slices (> 20,000 up to 100,000,000)
      if (startIndex >= TOTAL_RECORDS) {
        const deepItems = [];
        for (let i = startIndex; i < endIndex && i < 100000000; i++) {
          const rank = i + 1;
          const entry = this.generateProceduralIndexEntry(rank);
          deepItems.push(this.createWonderFromIndexEntry(entry));
        }
        return deepItems;
      }

      const startSlice = this.getSliceNumber(startIndex);
      const endSlice = this.getSliceNumber(endIndex - 1);

      let allSlicesLoaded = true;
      const neededSlices = [];
      for (let s = startSlice; s <= endSlice; s++) {
        neededSlices.push(s);
        if (!sliceCache.has(s)) {
          allSlicesLoaded = false;
          this.loadSlice(s).then(() => {
            if (typeof window.triggerSphinxRender === 'function') {
              window.triggerSphinxRender();
            }
          });
        }
      }

      if (!allSlicesLoaded) {
        // Return rich instant cards while slice arrives
        const placeholders = [];
        for (let i = startIndex; i < endIndex; i++) {
          const rank = i + 1;
          const entry = (searchIndex && searchIndex[i]) ? searchIndex[i] : this.generateProceduralIndexEntry(rank);
          placeholders.push(this.createWonderFromIndexEntry(entry));
        }
        return placeholders;
      }

      // Slices are ready in memory: extract precise window
      let combined = [];
      for (const s of neededSlices) {
        const items = sliceCache.get(s) || [];
        combined = combined.concat(items);
      }

      // Calculate slice offset relative to combined
      const firstSliceStartIndex = (startSlice - 1) * SLICE_SIZE;
      const relativeStart = startIndex - firstSliceStartIndex;
      const relativeEnd = relativeStart + itemsPerPage;

      return combined.slice(relativeStart, relativeEnd);
    },

    /**
     * Retrieve any chronicle by its ID across the entire 20,000 corpus and beyond (up to 100,000,000)
     */
    getWonderById(id) {
      if (!id) return null;

      // 1. Search in loaded sliceCache
      for (const items of sliceCache.values()) {
        const found = items.find(w => w.id === id);
        if (found) return found;
      }

      // 2. Search in searchIndex
      if (searchIndex) {
        const entry = searchIndex.find(e => e.id === id);
        if (entry) {
          if (entry.r <= TOTAL_RECORDS) {
            const sliceNum = this.getSliceNumber(entry.r - 1);
            this.loadSlice(sliceNum).then(items => {
              const fullItem = items.find(w => w.id === id);
              if (fullItem && window.currentOpenWonderId === id && typeof window.openWonderModal === 'function') {
                window.openWonderModal(id);
              }
            });
          }
          return this.createWonderFromIndexEntry(entry);
        }
      }

      // 3. Derive slice or procedural record from ID pattern (sphinx-rec-XXXX)
      const match = id.match(/sphinx-rec-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num >= 1 && num <= TOTAL_RECORDS) {
          const sliceNum = this.getSliceNumber(num - 1);
          if (!sliceCache.has(sliceNum)) {
            this.loadSlice(sliceNum).then(items => {
              const item = items.find(w => w.id === id);
              if (item && window.currentOpenWonderId === id && typeof window.openWonderModal === 'function') {
                window.openWonderModal(id);
              }
            });
          }
          // Immediate fallback card from index or procedural
          const dummyEntry = (searchIndex && searchIndex[num - 1]) ? searchIndex[num - 1] : this.generateProceduralIndexEntry(num);
          return this.createWonderFromIndexEntry(dummyEntry);
        } else if (num > TOTAL_RECORDS && num <= 100000000) {
          // Instant synthesis for Treapta V (up to 100M)
          const deepEntry = this.generateProceduralIndexEntry(num);
          return this.createWonderFromIndexEntry(deepEntry);
        }
      }
      return null;
    },

    /**
     * Load the comprehensive search index on demand or background
     */
    async loadSearchIndex() {
      if (searchIndex) return searchIndex;
      if (isSearchIndexLoading) return null;
      isSearchIndexLoading = true;
      try {
        const res = await fetch(`${INDEX_PATH}?v=65.0`);
        if (res.ok) {
          searchIndex = await res.json();
          console.log('[SphinxVirtualEngine] Search index loaded:', searchIndex.length, 'records.');
          if (typeof window.triggerSphinxRender === 'function') {
            window.triggerSphinxRender();
          }
        }
      } catch (err) {
        console.warn('[SphinxVirtualEngine] Search index load error:', err);
      } finally {
        isSearchIndexLoading = false;
      }
      return searchIndex;
    },

    /**
     * Instant synchronous search in the loaded 20,000 index
     * Returns full wonder cards immediately ready for rendering
     */
    searchSync(query, category = 'all', limit = 200, depthLimit = 20000) {
      const cleanQ = (query || '').toLowerCase().trim();
      if (!cleanQ) return [];

      const results = [];

      // Check for direct numeric rank or record ID (e.g. "100000000", "100.000.000", "sphinx-rec-100000000")
      const strippedQ = cleanQ.replace(/[,.\s]/g, '');
      const rankMatch = strippedQ.match(/^(?:sphinx-rec-|#)?(\d{1,9})$/);
      if (rankMatch) {
        const targetRank = parseInt(rankMatch[1], 10);
        if (targetRank >= 1 && targetRank <= 100000000) {
          const directWonder = this.getWonderById(`sphinx-rec-${targetRank}`);
          if (directWonder && (category === 'all' || directWonder.category === category)) {
            results.push(directWonder);
          }
        }
      }

      if (!searchIndex) {
        this.loadSearchIndex();
        return results;
      }
      for (let i = 0; i < searchIndex.length; i++) {
        const entry = searchIndex[i];
        if (entry.r > depthLimit) break;
        if (category !== 'all' && entry.c !== category) continue;

        const haystack = `${entry.t || ''} ${entry.te || ''} ${entry.ti || ''} ${entry.s || ''}`.toLowerCase();
        if (haystack.includes(cleanQ)) {
          // Check if full slice is already cached
          const sliceNum = this.getSliceNumber(entry.r - 1);
          let fullWonder = null;
          if (sliceCache.has(sliceNum)) {
            fullWonder = sliceCache.get(sliceNum).find(w => w.id === entry.id);
          }
          if (!fullWonder) {
            fullWonder = this.createWonderFromIndexEntry(entry);
            // Preload slice in background for full depth
            if (!sliceCache.has(sliceNum) && !pendingRequests.has(sliceNum)) {
              this.loadSlice(sliceNum);
            }
          }
          results.push(fullWonder);
          if (results.length >= limit) break;
        }
      }

      return results;
    }
  };

  // Expose globally
  window.SphinxVirtualEngine = SphinxVirtualEngine;

  // Immediate preloading of index and first slices
  if (typeof window !== 'undefined') {
    SphinxVirtualEngine.loadSearchIndex();
    setTimeout(() => {
      SphinxVirtualEngine.loadSlice(1);
      SphinxVirtualEngine.loadSlice(2);
    }, 300);
  }
})();
