const QUESTIONS_B1 = [

  // ============================================================
  // GRAMMAR (12 questions)
  // ============================================================

  {
    id: 'b1_grammar_01',
    section: 'grammar',
    level: 'b1',
    topic: 'subjonctif présent — il faut que',
    question: 'Complétez : Il faut que vous ___ votre demande de résidence permanente avant la date limite.',
    context: null,
    audioHint: null,
    options: ['envoyez', 'envoyiez', 'envoyer', 'envoyerez'],
    correct: 1,
    explanation: "Après « il faut que », on utilise le subjonctif. Le subjonctif présent de « envoyer » avec « vous » est « envoyiez » (radical envo- + terminaison -yiez)."
  },

  {
    id: 'b1_grammar_02',
    section: 'grammar',
    level: 'b1',
    topic: 'subjonctif présent — bien que / pour que',
    question: 'Complétez : Bien qu\'il ___ froid à Montréal en hiver, beaucoup d\'immigrants s\'y installent.',
    context: null,
    audioHint: null,
    options: ['fait', 'fasse', 'fera', 'ferait'],
    correct: 1,
    explanation: "« Bien que » est toujours suivi du subjonctif. Le subjonctif de « faire » à la 3e personne du singulier est « fasse »."
  },

  {
    id: 'b1_grammar_03',
    section: 'grammar',
    level: 'b1',
    topic: 'conditionnel présent — si + imparfait',
    question: 'Complétez : Si j\'avais un meilleur niveau de français, je ___ m\'inscrire au programme universitaire.',
    context: null,
    audioHint: null,
    options: ['peux', 'pouvais', 'pourrais', 'pourrai'],
    correct: 2,
    explanation: "Dans une phrase hypothétique « si + imparfait », la proposition principale se met au conditionnel présent. Pouvoir → je pourrais. Ne pas confondre « pourrai » (futur) et « pourrais » (conditionnel)."
  },

  {
    id: 'b1_grammar_04',
    section: 'grammar',
    level: 'b1',
    topic: 'plus-que-parfait',
    question: 'Complétez : Quand je suis arrivé au bureau, mes collègues ___ déjà ___ la réunion.',
    context: null,
    audioHint: null,
    options: ['ont … commencé', 'avaient … commencé', 'avaient … commencer', 'étaient … commencés'],
    correct: 1,
    explanation: "Le plus-que-parfait exprime une action antérieure à une autre action passée. Il se forme avec l'auxiliaire à l'imparfait + participe passé : « avaient commencé »."
  },

  {
    id: 'b1_grammar_05',
    section: 'grammar',
    level: 'b1',
    topic: 'pronoms relatifs — dont / où / lequel',
    question: 'Complétez : Le programme ___ je vous ai parlé accepte les candidats francophones.',
    context: null,
    audioHint: null,
    options: ['que', 'qui', 'dont', 'lequel'],
    correct: 2,
    explanation: "On dit « parler de quelque chose », donc on utilise « dont » (= de qui / de quoi / duquel). « Le programme dont je vous ai parlé » remplace « je vous ai parlé de ce programme »."
  },

  {
    id: 'b1_grammar_06',
    section: 'grammar',
    level: 'b1',
    topic: 'voix passive',
    question: 'Mettez à la voix passive : Le gouvernement a adopté une nouvelle loi sur l\'immigration.',
    context: null,
    audioHint: null,
    options: [
      'Une nouvelle loi sur l\'immigration est adoptée par le gouvernement.',
      'Une nouvelle loi sur l\'immigration a été adoptée par le gouvernement.',
      'Une nouvelle loi sur l\'immigration avait été adoptée par le gouvernement.',
      'Une nouvelle loi sur l\'immigration sera adoptée par le gouvernement.'
    ],
    correct: 1,
    explanation: "À la voix passive, le passé composé actif (a adopté) devient « a été + participe passé » → « a été adoptée ». Le participe passé s'accorde avec le sujet « loi » (féminin singulier)."
  },

  {
    id: 'b1_grammar_07',
    section: 'grammar',
    level: 'b1',
    topic: 'discours indirect',
    question: 'Transformez au discours indirect : Il a dit : « Je partirai demain. »',
    context: null,
    audioHint: null,
    options: [
      'Il a dit qu\'il partirait le lendemain.',
      'Il a dit qu\'il partira demain.',
      'Il a dit qu\'il partait le lendemain.',
      'Il a dit qu\'il est parti demain.'
    ],
    correct: 0,
    explanation: "Au discours indirect au passé, le futur simple (« partirai ») devient conditionnel présent (« partirait ») et « demain » devient « le lendemain »."
  },

  {
    id: 'b1_grammar_08',
    section: 'grammar',
    level: 'b1',
    topic: 'gérondif — en + participe présent',
    question: 'Complétez : ___ au Canada, elle a découvert la culture québécoise.',
    context: null,
    audioHint: null,
    options: ['En arrivé', 'En arrivant', 'En arriver', 'En être arrivée'],
    correct: 1,
    explanation: "Le gérondif se forme avec « en + participe présent » (radical de la 1re personne du pluriel + -ant). Arriver → nous arrivons → arrivant → en arrivant. Il exprime la simultanéité ou la manière."
  },

  {
    id: 'b1_grammar_09',
    section: 'grammar',
    level: 'b1',
    topic: 'ne…que — restriction',
    question: 'Complétez : Pour ce poste, nous ___ acceptons ___ les candidats bilingues.',
    context: null,
    audioHint: null,
    options: ['ne … que', 'ne … pas', 'ne … plus', 'ne … jamais'],
    correct: 0,
    explanation: "« Ne…que » exprime la restriction et signifie « seulement ». La phrase signifie : « Nous acceptons seulement les candidats bilingues. » Ce n'est pas une négation complète."
  },

  {
    id: 'b1_grammar_10',
    section: 'grammar',
    level: 'b1',
    topic: 'accord du participe passé avec avoir',
    question: 'Complétez : Les documents que j\'ai ___ sont sur votre bureau.',
    context: null,
    audioHint: null,
    options: ['préparé', 'préparés', 'préparée', 'préparées'],
    correct: 1,
    explanation: "Avec l'auxiliaire « avoir », le participe passé s'accorde avec le COD quand celui-ci est placé avant le verbe. Le COD « que » reprend « les documents » (masculin pluriel), donc → « préparés »."
  },

  {
    id: 'b1_grammar_11',
    section: 'grammar',
    level: 'b1',
    topic: 'futur antérieur',
    question: 'Complétez : Quand vous ___ votre test de français, vous pourrez soumettre votre dossier.',
    context: null,
    audioHint: null,
    options: ['réussissez', 'réussirez', 'aurez réussi', 'avez réussi'],
    correct: 2,
    explanation: "Le futur antérieur (aurez réussi) exprime une action future achevée avant une autre action future. Structure : « quand + futur antérieur, … futur simple »."
  },

  {
    id: 'b1_grammar_12',
    section: 'grammar',
    level: 'b1',
    topic: 'concession / opposition — bien que / malgré',
    question: 'Complétez : ___ ses difficultés en français, il a obtenu un bon résultat au TEF.',
    context: null,
    audioHint: null,
    options: ['Bien que', 'Malgré', 'Pourtant', 'Bien qu\''],
    correct: 1,
    explanation: "« Malgré » est suivi d'un nom ou d'un groupe nominal (ici « ses difficultés »). « Bien que » serait suivi du subjonctif (« bien qu'il ait des difficultés »). « Pourtant » s'utilise entre deux phrases complètes."
  },

  // ============================================================
  // VOCABULARY (10 questions)
  // ============================================================

  {
    id: 'b1_vocab_01',
    section: 'vocabulary',
    level: 'b1',
    topic: 'vocabulaire professionnel',
    question: 'Dans un contexte professionnel, que signifie « postuler à un emploi » ?',
    context: null,
    audioHint: null,
    options: ['Démissionner d\'un emploi', 'Présenter sa candidature pour un emploi', 'Refuser une offre d\'emploi', 'Occuper un poste depuis longtemps'],
    correct: 1,
    explanation: "« Postuler à un emploi » signifie soumettre sa candidature, envoyer un CV et une lettre de motivation pour obtenir un poste. C'est un terme formel du monde du travail."
  },

  {
    id: 'b1_vocab_02',
    section: 'vocabulary',
    level: 'b1',
    topic: 'termes académiques / éducation',
    question: 'Complétez : Pour s\'inscrire à l\'université au Québec, il faut fournir une ___ de ses diplômes étrangers.',
    context: null,
    audioHint: null,
    options: ['évaluation comparative', 'traduction libre', 'copie certifiée', 'note de passage'],
    correct: 0,
    explanation: "Au Québec, une « évaluation comparative des études effectuées hors du Québec » est le document officiel délivré par le MIDI (maintenant MIFI) pour faire reconnaître ses diplômes étrangers."
  },

  {
    id: 'b1_vocab_03',
    section: 'vocabulary',
    level: 'b1',
    topic: 'concepts abstraits',
    question: 'Quel mot désigne le principe selon lequel tous les citoyens sont traités de la même façon devant la loi ?',
    context: null,
    audioHint: null,
    options: ['La liberté', 'La fraternité', 'L\'égalité', 'La solidarité'],
    correct: 2,
    explanation: "« L'égalité » est le principe selon lequel tous les individus ont les mêmes droits devant la loi, sans discrimination. C'est l'une des valeurs fondamentales des sociétés démocratiques comme le Canada."
  },

  {
    id: 'b1_vocab_04',
    section: 'vocabulary',
    level: 'b1',
    topic: 'registre formel — synonymes',
    question: 'Dans une lettre formelle, quel verbe remplace le mieux « demander » dans « Je vous demande de bien vouloir considérer ma candidature » ?',
    context: null,
    audioHint: null,
    options: ['veux', 'prie', 'souhaite', 'exige'],
    correct: 1,
    explanation: "« Je vous prie de bien vouloir… » est la formule la plus soutenue et appropriée dans une correspondance formelle. « Souhaite » est poli mais moins formel ; « exige » est trop direct ; « veux » est trop familier."
  },

  {
    id: 'b1_vocab_05',
    section: 'vocabulary',
    level: 'b1',
    topic: 'vocabulaire des médias',
    question: 'Comment appelle-t-on un article de journal qui exprime l\'opinion personnelle de son auteur ?',
    context: null,
    audioHint: null,
    options: ['Un reportage', 'Une chronique', 'Un éditorial', 'Un fait divers'],
    correct: 2,
    explanation: "Un « éditorial » est un article d'opinion rédigé par le rédacteur en chef ou un éditorialiste qui engage la position du journal sur un sujet d'actualité. Une « chronique » est régulière ; un « reportage » est factuel."
  },

  {
    id: 'b1_vocab_06',
    section: 'vocabulary',
    level: 'b1',
    topic: 'vocabulaire environnemental',
    question: 'Complétez : Le Canada s\'est engagé à réduire ses ___ de gaz à effet de serre.',
    context: null,
    audioHint: null,
    options: ['émissions', 'pollutions', 'productions', 'consommations'],
    correct: 0,
    explanation: "L'expression consacrée est « les émissions de gaz à effet de serre » (GES). On « émet » des gaz, donc on parle d'« émissions ». C'est un terme clé du vocabulaire environnemental."
  },

  {
    id: 'b1_vocab_07',
    section: 'vocabulary',
    level: 'b1',
    topic: 'vocabulaire du système de santé',
    question: 'Au Québec, que doit obtenir un nouvel arrivant pour accéder aux soins de santé publics ?',
    context: null,
    audioHint: null,
    options: ['Un passeport canadien', 'Une carte d\'assurance maladie (carte RAMQ)', 'Un certificat de naissance', 'Une carte de crédit'],
    correct: 1,
    explanation: "La carte d'assurance maladie, délivrée par la RAMQ (Régie de l'assurance maladie du Québec), est obligatoire pour accéder gratuitement aux services de santé publics au Québec."
  },

  {
    id: 'b1_vocab_08',
    section: 'vocabulary',
    level: 'b1',
    topic: 'termes administratifs / bureaucratiques',
    question: 'Que signifie « obtenir un accusé de réception » ?',
    context: null,
    audioHint: null,
    options: [
      'Recevoir une confirmation que son document a bien été reçu',
      'Être accusé d\'un crime',
      'Recevoir un refus de sa demande',
      'Obtenir un reçu pour un achat'
    ],
    correct: 0,
    explanation: "Un « accusé de réception » est un document officiel confirmant qu'un envoi (lettre, dossier, demande) a bien été reçu par le destinataire. C'est un terme courant dans les démarches administratives."
  },

  {
    id: 'b1_vocab_09',
    section: 'vocabulary',
    level: 'b1',
    topic: 'émotions / sentiments',
    question: 'Quel adjectif décrit une personne qui ressent une grande tristesse mêlée de regret à cause d\'une perte ?',
    context: null,
    audioHint: null,
    options: ['Anxieux', 'Nostalgique', 'Enthousiaste', 'Méfiant'],
    correct: 1,
    explanation: "« Nostalgique » décrit un sentiment de tristesse douce lié au regret du passé, d'un lieu ou de personnes qu'on a quittés. C'est un sentiment fréquent chez les personnes qui vivent loin de leur pays d'origine."
  },

  {
    id: 'b1_vocab_10',
    section: 'vocabulary',
    level: 'b1',
    topic: 'vocabulaire de l\'immigration canadienne',
    question: 'Dans le système d\'immigration canadien, que signifie le sigle « CLB » ?',
    context: null,
    audioHint: null,
    options: [
      'Certificat de Langue Bilingue',
      'Centre de Logement et de Bienvenue',
      'Niveaux de compétence linguistique canadiens (Canadian Language Benchmarks)',
      'Commission des Lois sur le Bilinguisme'
    ],
    correct: 2,
    explanation: "CLB signifie « Canadian Language Benchmarks » (Niveaux de compétence linguistique canadiens). C'est l'échelle utilisée pour évaluer les compétences en français et en anglais dans le cadre de l'immigration au Canada."
  },

  // ============================================================
  // READING (9 questions)
  // ============================================================

  {
    id: 'b1_reading_01',
    section: 'reading',
    level: 'b1',
    topic: 'article de journal',
    question: 'Selon cet article, pourquoi le nombre d\'inscriptions en francisation augmente-t-il ?',
    context: 'Le ministère de l\'Immigration du Québec rapporte une hausse de 15 % des inscriptions aux cours de francisation cette année. Cette augmentation s\'explique principalement par l\'arrivée de nouveaux résidents permanents qui souhaitent s\'intégrer rapidement au marché du travail québécois. Les cours gratuits offerts à temps plein et à temps partiel répondent à une demande croissante.',
    audioHint: null,
    options: [
      'Parce que les cours sont devenus obligatoires',
      'Parce que de nouveaux résidents veulent s\'intégrer au marché du travail',
      'Parce que le gouvernement a augmenté les frais d\'inscription',
      'Parce que les entreprises financent les cours'
    ],
    correct: 1,
    explanation: "L'article indique que la hausse « s'explique principalement par l'arrivée de nouveaux résidents permanents qui souhaitent s'intégrer rapidement au marché du travail québécois »."
  },

  {
    id: 'b1_reading_02',
    section: 'reading',
    level: 'b1',
    topic: 'texte d\'opinion avec arguments',
    question: 'Quelle est la position de l\'auteur concernant le bilinguisme au Canada ?',
    context: 'Le bilinguisme officiel du Canada est souvent présenté comme un idéal. Cependant, dans la pratique, seuls 18 % des Canadiens se déclarent bilingues. À mon avis, plutôt que de décourager les efforts, ce chiffre devrait nous motiver à investir davantage dans l\'enseignement des deux langues officielles dès le primaire. Un pays véritablement bilingue serait plus uni et plus ouvert sur le monde.',
    audioHint: null,
    options: [
      'Le bilinguisme est impossible à atteindre',
      'Il faut abandonner la politique du bilinguisme',
      'Il faut renforcer l\'enseignement des deux langues dès l\'école primaire',
      'Le bilinguisme ne concerne que le Québec'
    ],
    correct: 2,
    explanation: "L'auteur écrit qu'il faut « investir davantage dans l'enseignement des deux langues officielles dès le primaire ». Il ne rejette pas le bilinguisme ; au contraire, il souhaite le renforcer."
  },

  {
    id: 'b1_reading_03',
    section: 'reading',
    level: 'b1',
    topic: 'lettre formelle',
    question: 'Quel est l\'objet principal de cette lettre ?',
    context: 'Madame, Monsieur, Par la présente, je souhaite contester la décision de refus concernant ma demande de permis de travail (dossier nº 2025-4872). Je considère que mon dossier remplit toutes les conditions requises, notamment en ce qui concerne mon niveau de français (CLB 7). Je vous prie de bien vouloir réexaminer ma demande et de me communiquer les motifs précis de ce refus. Veuillez agréer mes salutations distinguées.',
    audioHint: null,
    options: [
      'Demander un nouveau permis de travail',
      'Contester un refus et demander un réexamen du dossier',
      'Remercier l\'administration pour l\'obtention du permis',
      'Se plaindre du niveau de service de l\'administration'
    ],
    correct: 1,
    explanation: "La lettre commence par « je souhaite contester la décision de refus » et se termine par la demande de « réexaminer ma demande ». L'objectif est de contester le refus et d'obtenir un réexamen."
  },

  {
    id: 'b1_reading_04',
    section: 'reading',
    level: 'b1',
    topic: 'document professionnel / note de service',
    question: 'Que doivent faire les employés avant le 30 mars ?',
    context: 'Note de service — À l\'attention de tout le personnel. Objet : Formation obligatoire en santé et sécurité au travail. Nous vous informons que tous les employés doivent compléter la formation en ligne sur la prévention des risques avant le 30 mars. Un lien personnalisé vous sera envoyé par courriel. Les employés n\'ayant pas terminé la formation à cette date ne pourront pas accéder aux locaux de production.',
    audioHint: null,
    options: [
      'Envoyer un courriel à la direction',
      'Terminer une formation en ligne sur la sécurité au travail',
      'Renouveler leur carte d\'accès aux locaux',
      'Participer à une réunion d\'information'
    ],
    correct: 1,
    explanation: "La note indique clairement que « tous les employés doivent compléter la formation en ligne sur la prévention des risques avant le 30 mars ». C'est une formation obligatoire en santé et sécurité."
  },

  {
    id: 'b1_reading_05',
    section: 'reading',
    level: 'b1',
    topic: 'page d\'information gouvernementale',
    question: 'Selon ce texte, quelle est la condition pour renouveler sa carte de résident permanent ?',
    context: 'Pour renouveler votre carte de résident permanent, vous devez avoir été physiquement présent au Canada pendant au moins 730 jours au cours des cinq dernières années. Vous pouvez soumettre votre demande en ligne ou par la poste. Le délai de traitement est actuellement de 60 jours ouvrables. Assurez-vous d\'inclure deux photos conformes aux exigences d\'IRCC.',
    audioHint: null,
    options: [
      'Avoir vécu au Canada pendant 5 ans sans interruption',
      'Avoir été présent au Canada au moins 730 jours sur les 5 dernières années',
      'Avoir un emploi à temps plein au Canada',
      'Avoir passé un test de langue dans les 12 derniers mois'
    ],
    correct: 1,
    explanation: "Le texte précise qu'il faut « avoir été physiquement présent au Canada pendant au moins 730 jours au cours des cinq dernières années ». Ce n'est pas 5 ans sans interruption, mais 730 jours (2 ans) sur 5 ans."
  },

  {
    id: 'b1_reading_06',
    section: 'reading',
    level: 'b1',
    topic: 'extrait littéraire',
    question: 'Quel sentiment domine dans cet extrait ?',
    context: 'En descendant de l\'avion à Montréal, Fatima sentit le froid mordant de janvier lui piquer le visage. Elle serra son manteau contre elle et regarda autour d\'elle. Tout était blanc, immense, inconnu. Pourtant, au fond d\'elle-même, une petite flamme brûlait : celle de l\'espoir d\'une vie meilleure pour ses enfants.',
    audioHint: null,
    options: [
      'La peur et le découragement',
      'L\'indifférence totale',
      'L\'espoir malgré l\'inconnu',
      'La joie sans aucune inquiétude'
    ],
    correct: 2,
    explanation: "L'extrait mêle le froid et l'inconnu à « une petite flamme » qui représente « l'espoir d'une vie meilleure ». Le sentiment dominant est l'espoir malgré les difficultés et l'incertitude."
  },

  {
    id: 'b1_reading_07',
    section: 'reading',
    level: 'b1',
    topic: 'article de journal',
    question: 'D\'après cet article, quel est le principal avantage du télétravail mentionné ?',
    context: 'Depuis la pandémie, le télétravail s\'est imposé dans de nombreuses entreprises canadiennes. Selon un sondage récent, 68 % des travailleurs affirment être plus productifs en travaillant de chez eux. Toutefois, certains employeurs craignent un affaiblissement de la culture d\'entreprise et souhaitent un retour au bureau au moins trois jours par semaine.',
    audioHint: null,
    options: [
      'Une meilleure culture d\'entreprise',
      'Une réduction des salaires',
      'Une augmentation de la productivité des travailleurs',
      'Un retour complet au bureau'
    ],
    correct: 2,
    explanation: "L'article indique que « 68 % des travailleurs affirment être plus productifs en travaillant de chez eux ». L'avantage principal mentionné est donc l'augmentation de la productivité."
  },

  {
    id: 'b1_reading_08',
    section: 'reading',
    level: 'b1',
    topic: 'courriel formel',
    question: 'Que demande l\'expéditeur dans ce courriel ?',
    context: 'Objet : Demande de report d\'entrevue. Madame Tremblay, Je me permets de vous écrire pour vous demander s\'il serait possible de reporter mon entrevue prévue le 25 mars à une date ultérieure. En effet, je dois me rendre à un rendez-vous médical imprévu ce jour-là. Je reste disponible toute la semaine suivante. Je vous remercie de votre compréhension. Cordialement, Ahmed Benali.',
    audioHint: null,
    options: [
      'Annuler définitivement son entrevue',
      'Changer le lieu de l\'entrevue',
      'Reporter son entrevue à une autre date',
      'Obtenir les résultats de son entrevue'
    ],
    correct: 2,
    explanation: "L'expéditeur demande explicitement de « reporter mon entrevue prévue le 25 mars à une date ultérieure ». Il ne veut pas annuler, mais déplacer la date."
  },

  {
    id: 'b1_reading_09',
    section: 'reading',
    level: 'b1',
    topic: 'page d\'information gouvernementale',
    question: 'Selon ce texte, que permet le Programme de l\'expérience québécoise (PEQ) ?',
    context: 'Le Programme de l\'expérience québécoise (PEQ) offre une voie accélérée vers la résidence permanente pour les travailleurs étrangers temporaires et les étudiants internationaux diplômés au Québec. Les candidats doivent démontrer une connaissance du français oral de niveau 7 selon l\'Échelle québécoise. Le traitement des demandes dans le cadre du PEQ est généralement plus rapide que celui du Programme régulier des travailleurs qualifiés.',
    audioHint: null,
    options: [
      'Obtenir un visa de touriste pour le Québec',
      'Accéder à une voie rapide vers la résidence permanente',
      'Obtenir la citoyenneté canadienne directement',
      'S\'inscrire gratuitement à l\'université'
    ],
    correct: 1,
    explanation: "Le texte indique que le PEQ « offre une voie accélérée vers la résidence permanente ». Il ne s'agit ni de citoyenneté ni de visa touristique, mais bien d'une procédure rapide pour obtenir la résidence permanente."
  },

  // ============================================================
  // LISTENING (9 questions)
  // ============================================================

  {
    id: 'b1_listening_01',
    section: 'listening',
    level: 'b1',
    topic: 'réunion de travail',
    question: 'Selon le directeur, quelle est la priorité pour le prochain trimestre ?',
    context: null,
    audioHint: 'Vous écoutez un extrait d\'une réunion d\'équipe dans une entreprise de technologie à Ottawa. Le directeur s\'adresse à son équipe : « Chers collègues, après avoir analysé les résultats du trimestre passé, il est clair que nous devons améliorer notre service à la clientèle. Nos délais de réponse sont trop longs. Je souhaite que chaque membre de l\'équipe suive la nouvelle formation et que nous réduisions notre temps de réponse de 48 heures à 24 heures. »',
    options: [
      'Augmenter les ventes de produits',
      'Réduire le temps de réponse du service à la clientèle',
      'Embaucher de nouveaux employés',
      'Déménager dans de nouveaux bureaux'
    ],
    correct: 1,
    explanation: "Le directeur dit que les « délais de réponse sont trop longs » et souhaite « réduire le temps de réponse de 48 heures à 24 heures ». La priorité est l'amélioration du service client."
  },

  {
    id: 'b1_listening_02',
    section: 'listening',
    level: 'b1',
    topic: 'débat radiophonique',
    question: 'Sur quoi les deux intervenants ne sont-ils pas d\'accord ?',
    context: null,
    audioHint: 'Vous écoutez un débat à la radio de Radio-Canada. Le premier intervenant déclare : « L\'immigration est essentielle pour la croissance économique du Canada. Sans les travailleurs immigrants, de nombreux secteurs seraient en pénurie. » Le deuxième répond : « Je suis d\'accord sur l\'importance de l\'immigration, mais je pense que nous devons d\'abord nous assurer que les infrastructures — logement, santé, éducation — peuvent accueillir ces nouveaux arrivants. »',
    options: [
      'L\'importance de l\'immigration pour le Canada',
      'Le rythme d\'accueil des immigrants par rapport aux infrastructures',
      'La nécessité d\'apprendre le français',
      'Le besoin de travailleurs qualifiés'
    ],
    correct: 1,
    explanation: "Les deux intervenants sont d'accord sur l'importance de l'immigration. Leur désaccord porte sur le rythme : le second estime qu'il faut d'abord s'assurer que les infrastructures peuvent accueillir les nouveaux arrivants."
  },

  {
    id: 'b1_listening_03',
    section: 'listening',
    level: 'b1',
    topic: 'bulletin d\'information',
    question: 'Quelle est la nouvelle principale de ce bulletin ?',
    context: null,
    audioHint: 'Vous écoutez un bulletin d\'information à la radio. La présentatrice annonce : « Bonsoir. Le gouvernement fédéral a annoncé aujourd\'hui un investissement de 500 millions de dollars pour la construction de logements abordables dans les grandes villes canadiennes. Le ministre du Logement a précisé que ce programme vise à construire 12 000 nouveaux logements d\'ici 2028. Les premiers projets devraient voir le jour à Toronto, Vancouver et Montréal. »',
    options: [
      'Une baisse du prix de l\'immobilier',
      'Un investissement fédéral pour construire des logements abordables',
      'La fermeture de logements sociaux',
      'Une nouvelle taxe sur les propriétés'
    ],
    correct: 1,
    explanation: "Le bulletin annonce « un investissement de 500 millions de dollars pour la construction de logements abordables ». C'est l'information principale du bulletin."
  },

  {
    id: 'b1_listening_04',
    section: 'listening',
    level: 'b1',
    topic: 'entrevue',
    question: 'Quel conseil la conseillère donne-t-elle à l\'immigrant ?',
    context: null,
    audioHint: 'Vous écoutez une entrevue entre un nouvel arrivant et une conseillère en emploi dans un centre d\'aide aux immigrants à Québec. La conseillère dit : « Votre expérience professionnelle est très intéressante, mais je vous recommande fortement de faire reconnaître vos diplômes par le ministère de l\'Éducation avant de postuler. Beaucoup d\'employeurs demandent cette équivalence. En attendant, vous pourriez aussi faire du bénévolat dans votre domaine pour enrichir votre CV canadien. »',
    options: [
      'Retourner dans son pays pour obtenir un nouveau diplôme',
      'Faire reconnaître ses diplômes et faire du bénévolat en attendant',
      'Accepter n\'importe quel emploi immédiatement',
      'S\'inscrire à un programme universitaire canadien'
    ],
    correct: 1,
    explanation: "La conseillère recommande deux choses : « faire reconnaître vos diplômes » et « faire du bénévolat dans votre domaine pour enrichir votre CV canadien » en attendant l'équivalence."
  },

  {
    id: 'b1_listening_05',
    section: 'listening',
    level: 'b1',
    topic: 'cours universitaire',
    question: 'Quel est le sujet principal de cet extrait de cours ?',
    context: null,
    audioHint: 'Vous écoutez un extrait d\'un cours d\'histoire à l\'Université de Montréal. Le professeur explique : « Aujourd\'hui, nous allons examiner la Révolution tranquille des années 1960 au Québec. Cette période a profondément transformé la société québécoise avec la modernisation de l\'État, la laïcisation de l\'éducation et de la santé, et l\'émergence d\'un nationalisme québécois moderne. C\'est à cette époque que le slogan "Maîtres chez nous" est devenu populaire. »',
    options: [
      'La Confédération canadienne de 1867',
      'La Révolution tranquille au Québec dans les années 1960',
      'Les relations franco-canadiennes actuelles',
      'L\'histoire de l\'immigration au Canada'
    ],
    correct: 1,
    explanation: "Le professeur annonce clairement le sujet : « la Révolution tranquille des années 1960 au Québec » et décrit ses principales caractéristiques : modernisation, laïcisation et nationalisme."
  },

  {
    id: 'b1_listening_06',
    section: 'listening',
    level: 'b1',
    topic: 'message téléphonique',
    question: 'Que doit faire la personne qui reçoit ce message ?',
    context: null,
    audioHint: 'Vous écoutez un message sur votre boîte vocale. Une voix féminine dit : « Bonjour, ici le cabinet du docteur Lavoie. Nous vous appelons pour vous rappeler que votre rendez-vous est prévu mercredi prochain, le 26 mars, à 14 h 30. Nous vous demandons d\'apporter votre carte d\'assurance maladie et la liste de vos médicaments actuels. Si vous devez annuler, veuillez nous prévenir au moins 48 heures à l\'avance au 514-555-0198. Merci et bonne journée. »',
    options: [
      'Rappeler immédiatement le cabinet pour confirmer',
      'Apporter sa carte d\'assurance maladie et sa liste de médicaments au rendez-vous',
      'Prendre un nouveau rendez-vous pour une autre date',
      'Se rendre au cabinet aujourd\'hui même'
    ],
    correct: 1,
    explanation: "Le message demande d'« apporter votre carte d'assurance maladie et la liste de vos médicaments actuels ». On ne lui demande pas de confirmer ni de changer la date, mais de préparer ces documents."
  },

  {
    id: 'b1_listening_07',
    section: 'listening',
    level: 'b1',
    topic: 'description d\'événement culturel',
    question: 'Qu\'est-ce qui rend cet événement particulier selon le présentateur ?',
    context: null,
    audioHint: 'Vous écoutez une annonce à la radio communautaire. Le présentateur dit : « Le Festival interculturel de Gatineau revient pour sa 15e édition du 5 au 8 juin ! Cette année, l\'événement met à l\'honneur les cultures africaines avec des spectacles de musique, de danse et de cuisine traditionnelle. Ce qui rend ce festival unique, c\'est qu\'il est entièrement organisé par des bénévoles issus de l\'immigration. L\'entrée est gratuite pour tous. »',
    options: [
      'Il a lieu en plein air',
      'Il est entièrement organisé par des bénévoles immigrants',
      'Il ne présente que de la musique québécoise',
      'Il dure tout le mois de juin'
    ],
    correct: 1,
    explanation: "Le présentateur dit que « ce qui rend ce festival unique, c'est qu'il est entièrement organisé par des bénévoles issus de l'immigration ». C'est la particularité mise en avant."
  },

  {
    id: 'b1_listening_08',
    section: 'listening',
    level: 'b1',
    topic: 'présentation professionnelle',
    question: 'Quel résultat l\'entreprise a-t-elle atteint ?',
    context: null,
    audioHint: 'Vous assistez à une présentation professionnelle dans une entreprise agroalimentaire de Laval. La directrice des ventes déclare : « Je suis heureuse de vous annoncer que nos ventes ont augmenté de 22 % au dernier trimestre, grâce notamment à notre expansion dans les provinces de l\'Ouest. Nous avons également réduit nos coûts de production de 8 % en adoptant des pratiques plus durables. Notre objectif pour l\'année prochaine est d\'entrer sur le marché américain. »',
    options: [
      'L\'entreprise a réduit son nombre d\'employés',
      'Les ventes ont augmenté de 22 % grâce à l\'expansion dans l\'Ouest canadien',
      'L\'entreprise a déjà pénétré le marché américain',
      'Les coûts de production ont augmenté de 8 %'
    ],
    correct: 1,
    explanation: "La directrice annonce que « nos ventes ont augmenté de 22 % au dernier trimestre, grâce notamment à notre expansion dans les provinces de l'Ouest ». Le marché américain est un objectif futur, pas un résultat atteint."
  },

  {
    id: 'b1_listening_09',
    section: 'listening',
    level: 'b1',
    topic: 'séance d\'information sur l\'immigration',
    question: 'Quelle étape doit être complétée en premier selon la présentatrice ?',
    context: null,
    audioHint: 'Vous assistez à une séance d\'information sur l\'immigration au Canada dans un centre communautaire. La présentatrice explique : « Le processus d\'immigration au Canada comporte plusieurs étapes. La première et la plus importante est de passer un test de langue reconnu, comme le TEF Canada, pour prouver votre niveau de français. Ensuite, vous devez créer votre profil dans le système Entrée express et calculer votre score CRS. Plus votre score est élevé, plus vos chances d\'être invité à présenter une demande sont grandes. »',
    options: [
      'Créer un profil dans Entrée express',
      'Passer un test de langue reconnu comme le TEF Canada',
      'Calculer son score CRS',
      'Soumettre une demande de résidence permanente'
    ],
    correct: 1,
    explanation: "La présentatrice indique que « la première et la plus importante étape est de passer un test de langue reconnu, comme le TEF Canada ». La création du profil Entrée express vient ensuite."
  }

];
