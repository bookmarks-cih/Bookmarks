javascript
const docsData = [
  {
    name: "Internet Archive",
    link: "https://archive.org",
    desc: "Bibliothèque numérique mondiale offrant des millions de livres, films, logiciels et musiques gratuits.",
    cat: "Archive"
  },
  {
    name: "Library Genesis",
    link: "https://libgen.is",
    desc: "Moteur de recherche massif pour articles scientifiques et livres académiques en accès ouvert.",
    cat: "Academic"
  },
  {
    name: "Project Gutenberg",
    link: "https://gutenberg.org",
    desc: "Première bibliothèque numérique offrant plus de 70 000 eBooks gratuits d'œuvres du domaine public.",
    cat: "Books"
  },
  {
    name: "Sci-Hub",
    link: "https://sci-hub.se",
    desc: "Plateforme d'accès libre aux articles de recherche scientifique, contournant les paywalls.",
    cat: "Science"
  },
  {
    name: "Z-Library",
    link: "https://z-lib.gs",
    desc: "Une des plus grandes bibliothèques en ligne avec des millions d'articles et de livres.",
    cat: "Books"
  },
  {
    name: "PDF Drive",
    link: "https://www.pdfdrive.com",
    desc: "Moteur de recherche indexant des centaines de millions de fichiers PDF téléchargeables.",
    cat: "Search"
  },
  {
    name: "Open Library",
    link: "https://openlibrary.org",
    desc: "Catalogue ouvert visant à créer une page web pour chaque livre jamais publié.",
    cat: "Books"
  },
  {
    name: "arXiv",
    link: "https://arxiv.org",
    desc: "Archive ouverte de prépublications scientifiques (physique, mathématiques, informatique).",
    cat: "Science"
  },
  {
    name: "DOAJ",
    link: "https://doaj.org",
    desc: "Directory of Open Access Journals : annuaire mondial de revues académiques en accès libre.",
    cat: "Academic"
  },
  {
    name: "Core",
    link: "https://core.ac.uk",
    desc: "Agrégateur de millions de papiers de recherche en accès libre avec API puissante.",
    cat: "Academic"
  },
  {
    name: "Semantic Scholar",
    link: "https://www.semanticscholar.org",
    desc: "Outil de recherche gratuit utilisant l'IA pour explorer la littérature scientifique.",
    cat: "Science"
  },
  {
    name: "Standard Ebooks",
    link: "https://standardebooks.org",
    desc: "Collection de livres numériques gratuits, formatés avec soin et libres de droits.",
    cat: "Books"
  },
  {
    name: "BioRxiv",
    link: "https://www.biorxiv.org",
    desc: "Archive de prépublications pour la biologie, permettant une diffusion rapide des découvertes.",
    cat: "Science"
  },
  {
    name: "PubMed Central",
    link: "https://www.ncbi.nlm.nih.gov/pmc",
    desc: "Archive gratuite d'articles biomédicaux et de sciences de la vie en texte intégral.",
    cat: "Medical"
  },
  {
    name: "Wikisource",
    link: "https://wikisource.org",
    desc: "Bibliothèque de textes sources libres de droits gérée par la communauté Wikimedia.",
    cat: "Archive"
  },
  {
    name: "SpringerOpen",
    link: "https://www.springeropen.com",
    desc: "Plateforme éditoriale proposant des articles de recherche et livres en accès libre.",
    cat: "Academic"
  },
  {
    name: "HathiTrust",
    link: "https://www.hathitrust.org",
    desc: "Partenariat de grandes bibliothèques offrant un accès à des millions de titres numérisés.",
    cat: "Archive"
  },
  {
    name: "ManyBooks",
    link: "https://manybooks.net",
    desc: "Plateforme offrant des milliers d'eBooks gratuits dans de multiples formats (epub, kindle).",
    cat: "Books"
  },
  {
    name: "FreeComputerBooks",
    link: "https://freecomputerbooks.com",
    desc: "Annuaire spécialisé de livres informatiques, manuels techniques et documentations.",
    cat: "Tech"
  },
  {
    name: "Global Grey Books",
    link: "https://www.globalgreyebooks.com",
    desc: "Bibliothèque d'eBooks du domaine public (ésotérisme, histoire, philosophie) créée par un indépendant.",
    cat: "Books"
  },
  {
    name: "ERIC",
    link: "https://eric.ed.gov",
    desc: "Education Resources Information Center : base de données sur la recherche éducative.",
    cat: "Education"
  },
  {
    name: "SSRN",
    link: "https://www.ssrn.com",
    desc: "Réseau de recherche en sciences sociales proposant des prépublications et articles.",
    cat: "Science"
  },
  {
    name: "PLOS ONE",
    link: "https://journals.plos.org/plosone",
    desc: "Revue multidisciplinaire en accès libre couvrant la science et la médecine.",
    cat: "Science"
  },
  {
    name: "Digital Public Library",
    link: "https://dp.la",
    desc: "Digital Public Library of America : ressources numérisées depuis bibliothèques américaines.",
    cat: "Archive"
  },
  {
    name: "OAPEN",
    link: "https://www.oapen.org",
    desc: "Library of Open Access Academic Books : livres académiques en accès libre.",
    cat: "Academic"
  },
  {
    name: "ManualsLib",
    link: "https://www.manualslib.com",
    desc: "Base de données massive de manuels d'utilisation et guides d'appareils électroniques.",
    cat: "Tech"
  },
  {
    name: "ResearchGate",
    link: "https://www.researchgate.net",
    desc: "Réseau social pour chercheurs partageant publications, données et résultats.",
    cat: "Science"
  },
  {
    name: "O'Reilly Open Books",
    link: "https://www.oreilly.com/openbook",
    desc: "Collection de livres techniques gratuits publiés par O'Reilly Media.",
    cat: "Tech"
  },
  {
    name: "Europe PMC",
    link: "https://europepmc.org",
    desc: "Archive européenne d'articles de recherche biomédicale en accès libre.",
    cat: "Medical"
  },
  {
    name: "World Digital Library",
    link: "https://www.wdl.org",
    desc: "Bibliothèque numérique mondiale proposant manuscrits, cartes et livres rares.",
    cat: "Archive"
  }
];