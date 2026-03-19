const QUESTIONS_A1 = [

  // ===========================
  // GRAMMAR (8 questions)
  // ===========================

  {
    id: 'a1_grammar_01',
    section: 'grammar',
    level: 'a1',
    topic: 'present_tense_er',
    question: 'Complétez : Je ___ français.',
    context: null,
    audioHint: null,
    options: ['parle', 'parles', 'parlons', 'parlez'],
    correct: 0,
    explanation: "Le verbe « parler » est un verbe en -er. Avec le pronom « je », on enlève -er et on ajoute -e : je parle. Les autres terminaisons sont : tu parles, nous parlons, vous parlez."
  },

  {
    id: 'a1_grammar_02',
    section: 'grammar',
    level: 'a1',
    topic: 'etre_avoir',
    question: 'Complétez : Nous ___ étudiants à Montréal.',
    context: null,
    audioHint: null,
    options: ['avons', 'sommes', 'êtes', 'sont'],
    correct: 1,
    explanation: "Pour indiquer une identité ou une profession, on utilise le verbe « être ». Avec « nous », la forme correcte est « sommes » : nous sommes. « Avoir » (avons) s'utilise pour la possession."
  },

  {
    id: 'a1_grammar_03',
    section: 'grammar',
    level: 'a1',
    topic: 'articles',
    question: 'Complétez : J\'achète ___ pain à la boulangerie.',
    context: null,
    audioHint: null,
    options: ['le', 'la', 'du', 'des'],
    correct: 2,
    explanation: "Quand on achète une quantité indéterminée d'un nom masculin singulier, on utilise l'article partitif « du » (de + le). « Pain » est masculin, donc on dit « du pain ». On utilise « de la » pour le féminin (de la confiture)."
  },

  {
    id: 'a1_grammar_04',
    section: 'grammar',
    level: 'a1',
    topic: 'gender_agreement',
    question: 'Choisissez la phrase correcte :',
    context: null,
    audioHint: null,
    options: [
      'Elle est grand.',
      'Elle est grande.',
      'Elle est grands.',
      'Elle est grandet.'
    ],
    correct: 1,
    explanation: "L'adjectif doit s'accorder avec le sujet. « Elle » est féminin singulier, donc on ajoute un -e à l'adjectif : grande. Au masculin, on dit « il est grand ». Au pluriel féminin : « elles sont grandes »."
  },

  {
    id: 'a1_grammar_05',
    section: 'grammar',
    level: 'a1',
    topic: 'negation',
    question: 'Complétez : Marie ___ aime ___ le chocolat.',
    context: null,
    audioHint: null,
    options: [
      'ne ... pas',
      'ne ... plus',
      'n\' ... jamais',
      'n\' ... pas'
    ],
    correct: 3,
    explanation: "La négation de base en français est « ne ... pas ». On place « ne » avant le verbe et « pas » après. Devant une voyelle, « ne » devient « n' ». Le verbe « aime » commence par une voyelle, donc : Marie n'aime pas le chocolat."
  },

  {
    id: 'a1_grammar_06',
    section: 'grammar',
    level: 'a1',
    topic: 'prepositions',
    question: 'Complétez : J\'habite ___ Canada.',
    context: null,
    audioHint: null,
    options: ['à', 'en', 'au', 'dans'],
    correct: 2,
    explanation: "Devant un nom de pays masculin singulier commençant par une consonne, on utilise « au » (contraction de à + le). Le Canada est masculin, donc on dit « au Canada ». Pour les pays féminins, on utilise « en » (en France)."
  },

  {
    id: 'a1_grammar_07',
    section: 'grammar',
    level: 'a1',
    topic: 'imperative',
    question: 'Comment dit-on « Listen! » en français à un ami (tu) ?',
    context: null,
    audioHint: null,
    options: ['Écoutes !', 'Écoute !', 'Écoutez !', 'Écoutons !'],
    correct: 1,
    explanation: "À l'impératif avec « tu », les verbes en -er perdent le -s final : écoute ! (sans -s). « Écoutez » est la forme pour « vous » et « écoutons » pour « nous ». C'est une règle spéciale des verbes en -er à l'impératif."
  },

  {
    id: 'a1_grammar_08',
    section: 'grammar',
    level: 'a1',
    topic: 'il_y_a',
    question: 'Complétez : ___ un parc près de chez moi.',
    context: null,
    audioHint: null,
    options: ['Il est', 'Il y a', 'C\'est', 'Il fait'],
    correct: 1,
    explanation: "« Il y a » signifie « there is / there are » en anglais. On l'utilise pour indiquer l'existence ou la présence de quelque chose. « Il y a un parc » = there is a park. « Il y a » ne change pas au pluriel : il y a des parcs."
  },

  // ===========================
  // VOCABULARY (8 questions)
  // ===========================

  {
    id: 'a1_vocabulary_01',
    section: 'vocabulary',
    level: 'a1',
    topic: 'greetings',
    question: 'Vous rencontrez votre professeur le matin. Que dites-vous ?',
    context: null,
    audioHint: null,
    options: ['Bonsoir, monsieur.', 'Bonjour, monsieur.', 'Bonne nuit, monsieur.', 'Salut, mec.'],
    correct: 1,
    explanation: "Le matin et l'après-midi, on dit « bonjour ». « Bonsoir » est utilisé à partir de la fin de l'après-midi. « Bonne nuit » se dit avant d'aller dormir. « Salut, mec » est très familier et inapproprié avec un professeur."
  },

  {
    id: 'a1_vocabulary_02',
    section: 'vocabulary',
    level: 'a1',
    topic: 'numbers',
    question: 'Comment écrit-on le nombre 71 en français ?',
    context: null,
    audioHint: null,
    options: ['septante et un', 'soixante et onze', 'soixante-onze', 'soixante-dix-un'],
    correct: 2,
    explanation: "En français standard (utilisé au Canada et en France), 71 se dit « soixante-et-onze ». On prend soixante-dix (70) et on ajoute un (1), ce qui donne soixante-et-onze. « Septante » est utilisé en Belgique et en Suisse."
  },

  {
    id: 'a1_vocabulary_03',
    section: 'vocabulary',
    level: 'a1',
    topic: 'family',
    question: 'La mère de ma mère est ma ___.',
    context: null,
    audioHint: null,
    options: ['tante', 'cousine', 'grand-mère', 'belle-mère'],
    correct: 2,
    explanation: "La mère de votre mère (ou de votre père) est votre « grand-mère ». La tante est la sœur de votre père ou de votre mère. La cousine est la fille de votre oncle ou de votre tante. La belle-mère est la mère de votre conjoint(e)."
  },

  {
    id: 'a1_vocabulary_04',
    section: 'vocabulary',
    level: 'a1',
    topic: 'food_drinks',
    question: 'Quel mot désigne une boisson ?',
    context: null,
    audioHint: null,
    options: ['le fromage', 'le poulet', 'le jus d\'orange', 'le riz'],
    correct: 2,
    explanation: "« Le jus d'orange » est une boisson (a drink). Le fromage (cheese), le poulet (chicken) et le riz (rice) sont des aliments solides, pas des boissons."
  },

  {
    id: 'a1_vocabulary_05',
    section: 'vocabulary',
    level: 'a1',
    topic: 'colors',
    question: 'De quelle couleur est le ciel quand il fait beau ?',
    context: null,
    audioHint: null,
    options: ['vert', 'bleu', 'rouge', 'gris'],
    correct: 1,
    explanation: "Quand il fait beau, le ciel est « bleu ». Quand il y a des nuages, le ciel peut être « gris ». Les couleurs de base en français sont : bleu, rouge, vert, jaune, blanc, noir, gris, rose, orange, violet."
  },

  {
    id: 'a1_vocabulary_06',
    section: 'vocabulary',
    level: 'a1',
    topic: 'telling_time',
    question: 'Il est 14 h 30. Comment dit-on l\'heure ?',
    context: null,
    audioHint: null,
    options: [
      'Il est quatorze heures et quart.',
      'Il est deux heures et demie.',
      'Il est quatorze heures trente.',
      'Il est deux heures moins le quart.'
    ],
    correct: 2,
    explanation: "14 h 30, c'est « quatorze heures trente » en format officiel (24 heures), souvent utilisé au Canada. On peut aussi dire « deux heures et demie » (format 12 heures), mais 14 h 30 correspond exactement à « quatorze heures trente »."
  },

  {
    id: 'a1_vocabulary_07',
    section: 'vocabulary',
    level: 'a1',
    topic: 'body_parts',
    question: 'Avec quelle partie du corps est-ce qu\'on écoute ?',
    context: null,
    audioHint: null,
    options: ['les yeux', 'les oreilles', 'la bouche', 'le nez'],
    correct: 1,
    explanation: "On écoute avec « les oreilles » (the ears). On voit avec « les yeux » (the eyes). On parle avec « la bouche » (the mouth). On sent les odeurs avec « le nez » (the nose)."
  },

  {
    id: 'a1_vocabulary_08',
    section: 'vocabulary',
    level: 'a1',
    topic: 'weather',
    question: 'En hiver à Québec, quel temps fait-il généralement ?',
    context: null,
    audioHint: null,
    options: ['Il fait chaud.', 'Il fait froid et il neige.', 'Il fait beau et soleil.', 'Il pleut beaucoup.'],
    correct: 1,
    explanation: "En hiver à Québec, il fait très froid et il neige souvent. Les expressions météo de base : il fait chaud (it's hot), il fait froid (it's cold), il neige (it's snowing), il pleut (it's raining), il fait beau (the weather is nice)."
  },

  // ===========================
  // READING (7 questions)
  // ===========================

  {
    id: 'a1_reading_01',
    section: 'reading',
    level: 'a1',
    topic: 'signs_notices',
    question: 'Que signifie ce panneau ?',
    context: '🚫 ENTRÉE INTERDITE\nPersonnel autorisé seulement',
    audioHint: null,
    options: [
      'Tout le monde peut entrer.',
      'L\'entrée est gratuite.',
      'Seul le personnel autorisé peut entrer.',
      'L\'entrée est ouverte le matin.'
    ],
    correct: 2,
    explanation: "« Entrée interdite » signifie qu'on ne peut pas entrer. « Personnel autorisé seulement » précise que seules les personnes qui ont la permission peuvent entrer. « Interdit » = not allowed, « autorisé » = authorized."
  },

  {
    id: 'a1_reading_02',
    section: 'reading',
    level: 'a1',
    topic: 'menus',
    question: 'Combien coûte un café au lait ?',
    context: '☕ CAFÉ DU COIN — MENU\nCafé noir ............ 2,50 $\nCafé au lait ......... 3,75 $\nThé .................. 2,25 $\nJus d\'orange ......... 4,00 $\nCroissant ............ 3,00 $',
    audioHint: null,
    options: ['2,50 $', '3,75 $', '2,25 $', '4,00 $'],
    correct: 1,
    explanation: "D'après le menu, le café au lait coûte 3,75 $. Pour lire un menu en français, il faut repérer le nom de l'article et regarder le prix à côté. Au Canada, les prix sont en dollars canadiens ($)."
  },

  {
    id: 'a1_reading_03',
    section: 'reading',
    level: 'a1',
    topic: 'notes_messages',
    question: 'Qui a écrit ce message et pourquoi ?',
    context: 'Salut Marc,\nJe suis au supermarché. Il n\'y a plus de lait dans le frigo. Tu veux du pain aussi ?\nÀ tout à l\'heure !\nSophie',
    audioHint: null,
    options: [
      'Marc écrit à Sophie pour acheter du pain.',
      'Sophie écrit à Marc parce qu\'elle est au supermarché.',
      'Sophie écrit à Marc pour inviter à dîner.',
      'Marc écrit à Sophie parce qu\'il n\'y a plus de lait.'
    ],
    correct: 1,
    explanation: "Le message est signé « Sophie » (c'est elle qui écrit) et commence par « Salut Marc » (c'est lui qui reçoit le message). Sophie explique qu'elle est au supermarché et demande si Marc veut du pain."
  },

  {
    id: 'a1_reading_04',
    section: 'reading',
    level: 'a1',
    topic: 'instructions',
    question: 'Que faut-il faire en premier ?',
    context: 'INSCRIPTION À LA BIBLIOTHÈQUE\n1. Remplissez le formulaire.\n2. Présentez une pièce d\'identité.\n3. Recevez votre carte de bibliothèque.\n4. Empruntez jusqu\'à 5 livres.',
    audioHint: null,
    options: [
      'Emprunter des livres.',
      'Présenter une pièce d\'identité.',
      'Remplir le formulaire.',
      'Recevoir la carte de bibliothèque.'
    ],
    correct: 2,
    explanation: "L'étape numéro 1 dit « Remplissez le formulaire ». C'est la première chose à faire. Les étapes sont numérotées dans l'ordre : d'abord le formulaire (1), puis la pièce d'identité (2), puis la carte (3), et enfin emprunter des livres (4)."
  },

  {
    id: 'a1_reading_05',
    section: 'reading',
    level: 'a1',
    topic: 'forms',
    question: 'Quelle information n\'est PAS demandée dans ce formulaire ?',
    context: 'FORMULAIRE D\'INSCRIPTION\nNom : _______________\nPrénom : _______________\nDate de naissance : ___/___/______\nAdresse courriel : _______________\nNuméro de téléphone : _______________',
    audioHint: null,
    options: ['Le nom de famille', 'La profession', 'La date de naissance', 'Le numéro de téléphone'],
    correct: 1,
    explanation: "Le formulaire demande le nom, le prénom, la date de naissance, l'adresse courriel et le numéro de téléphone. La profession n'est pas demandée. « Courriel » est le mot utilisé au Canada pour « e-mail »."
  },

  {
    id: 'a1_reading_06',
    section: 'reading',
    level: 'a1',
    topic: 'signs_notices',
    question: 'Quand est-ce que le magasin est fermé ?',
    context: 'HEURES D\'OUVERTURE\nLundi au vendredi : 9 h à 18 h\nSamedi : 10 h à 17 h\nDimanche : FERMÉ',
    audioHint: null,
    options: ['Le samedi', 'Le lundi', 'Le dimanche', 'Le vendredi'],
    correct: 2,
    explanation: "D'après l'affiche, le magasin est « FERMÉ » le dimanche. Il est ouvert du lundi au vendredi (9 h à 18 h) et le samedi (10 h à 17 h). « Fermé » = closed, « ouvert » = open."
  },

  {
    id: 'a1_reading_07',
    section: 'reading',
    level: 'a1',
    topic: 'notes_messages',
    question: 'À quelle heure est le rendez-vous ?',
    context: 'Bonjour Madame Tremblay,\nVotre rendez-vous chez le dentiste est confirmé pour le mardi 15 mars à 10 h 45.\nMerci de venir 10 minutes avant.\nClinique Dentaire Saint-Laurent',
    audioHint: null,
    options: ['10 h 35', '10 h 45', '10 h 55', '11 h 00'],
    correct: 1,
    explanation: "Le message indique clairement que le rendez-vous est « à 10 h 45 ». On demande aussi de venir 10 minutes avant (donc à 10 h 35), mais le rendez-vous lui-même est à 10 h 45."
  },

  // ===========================
  // LISTENING (7 questions)
  // ===========================

  {
    id: 'a1_listening_01',
    section: 'listening',
    level: 'a1',
    topic: 'introductions',
    question: 'D\'où vient cette personne ?',
    context: null,
    audioHint: 'Vous entendez une femme dire : « Bonjour, je m\'appelle Fatima. Je suis marocaine. J\'habite à Montréal depuis deux ans. Je suis étudiante en informatique. »',
    options: ['De France', 'Du Maroc', 'Du Canada', 'De Belgique'],
    correct: 1,
    explanation: "La femme dit « Je suis marocaine ». L'adjectif de nationalité « marocaine » indique qu'elle vient du Maroc. Elle habite à Montréal, mais elle n'est pas canadienne. Notez la forme féminine : marocain → marocaine."
  },

  {
    id: 'a1_listening_02',
    section: 'listening',
    level: 'a1',
    topic: 'directions',
    question: 'Où se trouve la pharmacie ?',
    context: null,
    audioHint: 'Vous entendez un homme répondre à un passant : « La pharmacie ? C\'est facile. Vous allez tout droit, puis vous tournez à gauche au feu rouge. La pharmacie est à côté de la banque. »',
    options: [
      'À droite au feu rouge, à côté de la poste.',
      'Tout droit, à gauche au feu rouge, à côté de la banque.',
      'Tout droit, à droite au feu rouge, à côté de la banque.',
      'Derrière la banque, à droite.'
    ],
    correct: 1,
    explanation: "L'homme dit : « tout droit » (straight ahead), puis « à gauche au feu rouge » (left at the traffic light), et « à côté de la banque » (next to the bank). Ces expressions de direction sont essentielles pour se repérer en ville."
  },

  {
    id: 'a1_listening_03',
    section: 'listening',
    level: 'a1',
    topic: 'shopping',
    question: 'Combien la cliente doit-elle payer ?',
    context: null,
    audioHint: 'Vous entendez un dialogue dans une boulangerie. La cliente dit : « Je voudrais deux croissants et une baguette, s\'il vous plaît. » Le boulanger répond : « Alors, deux croissants à un dollar cinquante chacun et une baguette à trois dollars. Ça fait six dollars, s\'il vous plaît. »',
    options: ['4,50 $', '5,00 $', '6,00 $', '7,50 $'],
    correct: 2,
    explanation: "Le boulanger dit « Ça fait six dollars ». On peut vérifier : deux croissants à 1,50 $ chacun = 3,00 $, plus une baguette à 3,00 $ = 6,00 $ au total. L'expression « ça fait » est utilisée pour annoncer le prix total."
  },

  {
    id: 'a1_listening_04',
    section: 'listening',
    level: 'a1',
    topic: 'announcements',
    question: 'Quel est le numéro du quai de départ ?',
    context: null,
    audioHint: 'Vous entendez une annonce dans une gare : « Attention, le train à destination de Québec, départ prévu à seize heures quinze, partira du quai numéro trois. Nous vous souhaitons un bon voyage. »',
    options: ['Quai 1', 'Quai 2', 'Quai 3', 'Quai 4'],
    correct: 2,
    explanation: "L'annonce dit « quai numéro trois ». Dans les gares et les aéroports, il est important de bien écouter le numéro du quai (platform) ou de la porte (gate). « À destination de » signifie « going to »."
  },

  {
    id: 'a1_listening_05',
    section: 'listening',
    level: 'a1',
    topic: 'phone_calls',
    question: 'Pourquoi est-ce que Thomas appelle ?',
    context: null,
    audioHint: 'Vous entendez un message sur un répondeur : « Bonjour, c\'est Thomas. Je suis désolé, mais je ne peux pas venir au dîner ce soir. Je suis malade. On peut reporter à samedi ? Rappelle-moi quand tu peux. Merci, à bientôt ! »',
    options: [
      'Pour confirmer le dîner.',
      'Pour annuler le dîner parce qu\'il est malade.',
      'Pour inviter son ami au restaurant.',
      'Pour demander l\'adresse du restaurant.'
    ],
    correct: 1,
    explanation: "Thomas dit qu'il « ne peut pas venir au dîner » et explique qu'il « est malade ». Il demande de « reporter à samedi ». « Reporter » signifie remettre à plus tard (to postpone). « Je suis désolé » exprime une excuse."
  },

  {
    id: 'a1_listening_06',
    section: 'listening',
    level: 'a1',
    topic: 'introductions',
    question: 'Quelle est la profession de cet homme ?',
    context: null,
    audioHint: 'Vous entendez un homme se présenter : « Je m\'appelle Pierre Dubois. J\'ai trente-cinq ans. Je suis infirmier à l\'hôpital Sainte-Justine. J\'aime beaucoup mon travail parce que j\'aide les gens. »',
    options: ['Médecin', 'Infirmier', 'Pharmacien', 'Dentiste'],
    correct: 1,
    explanation: "L'homme dit « Je suis infirmier ». Un infirmier (nurse) travaille à l'hôpital et aide les patients. La forme féminine est « infirmière ». Pour exprimer sa profession en français, on dit « je suis + profession » sans article."
  },

  {
    id: 'a1_listening_07',
    section: 'listening',
    level: 'a1',
    topic: 'shopping',
    question: 'Quelle taille est-ce que la cliente cherche ?',
    context: null,
    audioHint: 'Vous entendez un dialogue dans un magasin de vêtements. La cliente dit : « Excusez-moi, est-ce que vous avez cette robe en taille moyenne ? » La vendeuse répond : « Je vais vérifier. De quelle couleur ? » La cliente dit : « En bleu, s\'il vous plaît. »',
    options: ['Petite', 'Moyenne', 'Grande', 'Très grande'],
    correct: 1,
    explanation: "La cliente demande « en taille moyenne » (medium size). Les tailles courantes en français sont : petit(e) (small), moyen(ne) (medium), grand(e) (large). Elle cherche aussi la couleur bleue."
  }

];
