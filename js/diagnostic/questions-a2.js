const QUESTIONS_A2 = [

  // ============================================================
  // GRAMMAR (10 questions)
  // ============================================================

  {
    id: 'a2_grammar_01',
    section: 'grammar',
    level: 'a2',
    topic: 'passe_compose_avoir',
    question: 'Complétez : Hier, nous ___ un bon film au cinéma.',
    context: null,
    audioHint: null,
    options: ['regardons', 'avons regarder', 'avons regardé', 'regardé'],
    correct: 2,
    explanation: "Le passé composé avec 'avoir' se forme avec le sujet + auxiliaire 'avoir' conjugué au présent + participe passé. Pour 'nous' : nous avons regardé."
  },
  {
    id: 'a2_grammar_02',
    section: 'grammar',
    level: 'a2',
    topic: 'passe_compose_etre',
    question: 'Complétez : Marie ___ à Montréal la semaine dernière.',
    context: null,
    audioHint: null,
    options: ['a allé', 'est allée', 'est allé', 'a allée'],
    correct: 1,
    explanation: "Certains verbes de mouvement (aller, venir, partir, arriver...) se conjuguent au passé composé avec 'être'. Le participe passé s'accorde avec le sujet : Marie (féminin) → est allée."
  },
  {
    id: 'a2_grammar_03',
    section: 'grammar',
    level: 'a2',
    topic: 'imparfait_introduction',
    question: 'Complétez : Quand j\'étais enfant, je ___ tous les jours au parc.',
    context: null,
    audioHint: null,
    options: ['suis allé', 'vais', 'allais', 'irai'],
    correct: 2,
    explanation: "L'imparfait décrit des habitudes ou des situations dans le passé. On utilise le radical de la 1re personne du pluriel au présent (all-ons → all-) + les terminaisons de l'imparfait : -ais, -ais, -ait, -ions, -iez, -aient. Je allais → j'allais."
  },
  {
    id: 'a2_grammar_04',
    section: 'grammar',
    level: 'a2',
    topic: 'pronoms_cod',
    question: 'Tu aimes cette chanson ? — Oui, je ___ écoute souvent.',
    context: null,
    audioHint: null,
    options: ['le', 'la', 'les', 'lui'],
    correct: 1,
    explanation: "Les pronoms compléments d'objet direct (COD) remplacent un nom. 'Cette chanson' est féminin singulier, donc on utilise 'la'. Le pronom se place avant le verbe : je la écoute → je l'écoute."
  },
  {
    id: 'a2_grammar_05',
    section: 'grammar',
    level: 'a2',
    topic: 'comparatifs',
    question: 'L\'hiver à Québec est ___ froid ___ l\'hiver à Paris.',
    context: null,
    audioHint: null,
    options: ['plus ... que', 'moins ... de', 'aussi ... de', 'plus ... de'],
    correct: 0,
    explanation: "Le comparatif de supériorité se forme avec 'plus + adjectif + que'. Québec est plus froid que Paris. Attention : on utilise 'que' (pas 'de') pour introduire le deuxième élément de la comparaison."
  },
  {
    id: 'a2_grammar_06',
    section: 'grammar',
    level: 'a2',
    topic: 'futur_proche',
    question: 'Complétez : Ce soir, nous ___ manger au restaurant.',
    context: null,
    audioHint: null,
    options: ['allons', 'allons à', 'irons', 'vont'],
    correct: 0,
    explanation: "Le futur proche se forme avec le verbe 'aller' conjugué au présent + l'infinitif du verbe principal. Pour 'nous' : nous allons + manger. Il n'y a pas de préposition entre 'aller' et l'infinitif dans le futur proche."
  },
  {
    id: 'a2_grammar_07',
    section: 'grammar',
    level: 'a2',
    topic: 'verbes_pronominaux',
    question: 'Complétez : Le matin, je ___ à six heures pour aller travailler.',
    context: null,
    audioHint: null,
    options: ['lève', 'me lève', 'se lève', 'me lever'],
    correct: 1,
    explanation: "Les verbes pronominaux (se lever, se coucher, se laver...) utilisent un pronom réfléchi qui correspond au sujet. Pour 'je' : je me lève. Le pronom 'se' est la forme à l'infinitif seulement."
  },
  {
    id: 'a2_grammar_08',
    section: 'grammar',
    level: 'a2',
    topic: 'pronoms_y_en',
    question: 'Tu vas souvent au gymnase ? — Oui, j\' ___ vais trois fois par semaine.',
    context: null,
    audioHint: null,
    options: ['en', 'y', 'le', 'là'],
    correct: 1,
    explanation: "Le pronom 'y' remplace un complément de lieu introduit par 'à', 'au', 'en', 'dans', 'chez', etc. 'Au gymnase' → j'y vais. Le pronom 'en' remplace un complément introduit par 'de' ou une quantité."
  },
  {
    id: 'a2_grammar_09',
    section: 'grammar',
    level: 'a2',
    topic: 'question_est_ce_que',
    question: 'Quelle est la forme correcte de la question ?',
    context: null,
    audioHint: null,
    options: [
      'Qu\'est-ce que tu fais ce soir ?',
      'Qu\'est-ce que tu fais-tu ce soir ?',
      'Que est-ce que tu fais ce soir ?',
      'Qu\'est que tu fais ce soir ?'
    ],
    correct: 0,
    explanation: "La structure 'est-ce que' se place après le mot interrogatif. 'Que' devient 'qu'' devant une voyelle : Qu'est-ce que + sujet + verbe. On ne combine pas 'est-ce que' avec l'inversion du sujet."
  },
  {
    id: 'a2_grammar_10',
    section: 'grammar',
    level: 'a2',
    topic: 'pronoms_relatifs_qui_que',
    question: 'Complétez : C\'est le professeur ___ m\'a aidé à préparer le TEF.',
    context: null,
    audioHint: null,
    options: ['que', 'qui', 'où', 'dont'],
    correct: 1,
    explanation: "Le pronom relatif 'qui' remplace le sujet du verbe dans la proposition relative. Ici, le professeur fait l'action d'aider (il m'a aidé), donc on utilise 'qui'. On utilise 'que' quand le pronom remplace le complément d'objet direct."
  },

  // ============================================================
  // VOCABULARY (8 questions)
  // ============================================================

  {
    id: 'a2_vocab_01',
    section: 'vocabulary',
    level: 'a2',
    topic: 'routines_quotidiennes',
    question: 'Que signifie « faire la grasse matinée » ?',
    context: null,
    audioHint: null,
    options: [
      'Préparer un gros petit-déjeuner',
      'Se lever très tard le matin',
      'Faire de l\'exercice le matin',
      'Manger beaucoup au brunch'
    ],
    correct: 1,
    explanation: "'Faire la grasse matinée' signifie dormir tard le matin, rester au lit plus longtemps que d'habitude. C'est une expression courante pour décrire les habitudes du week-end."
  },
  {
    id: 'a2_vocab_02',
    section: 'vocabulary',
    level: 'a2',
    topic: 'professions',
    question: 'Mon frère travaille à l\'hôpital. Il soigne les dents des patients. Il est ___.',
    context: null,
    audioHint: null,
    options: ['médecin', 'pharmacien', 'dentiste', 'infirmier'],
    correct: 2,
    explanation: "Un dentiste est le professionnel de la santé qui soigne les dents. Un médecin soigne les maladies en général, un pharmacien vend les médicaments et un infirmier donne les soins prescrits par le médecin."
  },
  {
    id: 'a2_vocab_03',
    section: 'vocabulary',
    level: 'a2',
    topic: 'sante_corps',
    question: 'J\'ai mal à la gorge et je tousse beaucoup. Je crois que j\'ai ___.',
    context: null,
    audioHint: null,
    options: ['une fracture', 'un rhume', 'mal au dos', 'une allergie au soleil'],
    correct: 1,
    explanation: "Un rhume est une maladie courante avec des symptômes comme le mal de gorge, la toux, le nez qui coule et parfois de la fièvre. Une fracture concerne un os cassé, ce qui ne correspond pas aux symptômes décrits."
  },
  {
    id: 'a2_vocab_04',
    section: 'vocabulary',
    level: 'a2',
    topic: 'transport_directions',
    question: 'Pour aller de Laval au centre-ville de Montréal, le moyen le plus rapide est de prendre ___.',
    context: null,
    audioHint: null,
    options: ['le traversier', 'le métro', 'la bicyclette', 'le tramway'],
    correct: 1,
    explanation: "Le métro de Montréal relie Laval au centre-ville grâce à la ligne orange. Un traversier est un bateau pour traverser un cours d'eau. Montréal n'a pas de tramway actuellement."
  },
  {
    id: 'a2_vocab_05',
    section: 'vocabulary',
    level: 'a2',
    topic: 'logement_meubles',
    question: 'Dans quelle pièce de la maison trouve-t-on normalement une cuisinière, un réfrigérateur et un évier ?',
    context: null,
    audioHint: null,
    options: ['la chambre', 'le salon', 'la cuisine', 'la salle de bain'],
    correct: 2,
    explanation: "La cuisine est la pièce où l'on prépare les repas. On y trouve une cuisinière (pour cuire les aliments), un réfrigérateur (pour conserver la nourriture au froid) et un évier (pour laver la vaisselle et les aliments)."
  },
  {
    id: 'a2_vocab_06',
    section: 'vocabulary',
    level: 'a2',
    topic: 'achats_prix',
    question: 'Au marché, vous demandez le prix des pommes. Le vendeur dit : « C\'est trois dollars ___ . »',
    context: null,
    audioHint: null,
    options: ['le kilo', 'la pièce', 'le gramme', 'la tonne'],
    correct: 0,
    explanation: "Au marché, les fruits et légumes sont généralement vendus au kilo (kilogramme). 'Trois dollars le kilo' signifie que chaque kilogramme coûte trois dollars. Au Canada, les prix sont en dollars canadiens."
  },
  {
    id: 'a2_vocab_07',
    section: 'vocabulary',
    level: 'a2',
    topic: 'loisirs',
    question: 'Quel mot ne désigne PAS un sport d\'hiver populaire au Canada ?',
    context: null,
    audioHint: null,
    options: ['le hockey', 'le ski de fond', 'le patinage', 'la pétanque'],
    correct: 3,
    explanation: "La pétanque est un sport d'été d'origine française (sud de la France), pas un sport d'hiver. Le hockey sur glace, le ski de fond et le patinage sont des sports d'hiver très populaires au Canada."
  },
  {
    id: 'a2_vocab_08',
    section: 'vocabulary',
    level: 'a2',
    topic: 'canadianismes',
    question: 'Au Québec, quand on dit « je vais au dépanneur », on va ___.',
    context: null,
    audioHint: null,
    options: [
      'chez le mécanicien',
      'dans un petit magasin de quartier ouvert tard',
      'au centre commercial',
      'à la station-service'
    ],
    correct: 1,
    explanation: "Au Québec, un 'dépanneur' est un petit commerce de proximité ouvert tôt le matin et tard le soir, où l'on peut acheter des produits de base (nourriture, boissons, journaux). En France, on dirait une 'supérette' ou une 'épicerie de quartier'."
  },

  // ============================================================
  // READING (8 questions)
  // ============================================================

  {
    id: 'a2_reading_01',
    section: 'reading',
    level: 'a2',
    topic: 'annonce_publicitaire',
    question: 'Quel est le prix de l\'abonnement pour un étudiant ?',
    context: "CENTRE SPORTIF DU QUARTIER\nNouveaux tarifs à partir du 1er septembre\n\nAbonnement annuel :\n- Adulte : 450 $ / an\n- Étudiant (avec carte valide) : 280 $ / an\n- Famille (2 adultes + enfants) : 750 $ / an\n\nAccès : piscine, gymnase, cours de groupe\nHoraires : lundi au vendredi 6 h – 22 h, samedi et dimanche 8 h – 18 h\nInscription en ligne : www.centresportif.qc.ca",
    audioHint: null,
    options: ['450 $ par an', '280 $ par an', '750 $ par an', '180 $ par an'],
    correct: 1,
    explanation: "L'annonce indique clairement : 'Étudiant (avec carte valide) : 280 $ / an'. Il faut lire attentivement les différentes catégories de tarifs pour trouver celle qui correspond à la question."
  },
  {
    id: 'a2_reading_02',
    section: 'reading',
    level: 'a2',
    topic: 'courriel',
    question: 'Pourquoi Nathalie écrit-elle à Marco ?',
    context: "De : nathalie.tremblay@courriel.ca\nÀ : marco.silva@courriel.ca\nObjet : Changement d'horaire – réunion de jeudi\n\nBonjour Marco,\n\nJe t'écris pour te dire que la réunion de jeudi est déplacée de 14 h à 16 h. La salle B2 n'est plus disponible, donc nous serons dans la salle C5 au troisième étage.\n\nPeux-tu apporter les documents du projet Laval ? J'ai aussi besoin du rapport de budget.\n\nMerci et à jeudi !\nNathalie",
    audioHint: null,
    options: [
      'Pour annuler la réunion de jeudi',
      'Pour informer d\'un changement d\'heure et de salle',
      'Pour demander un nouveau projet',
      'Pour inviter Marco à un dîner'
    ],
    correct: 1,
    explanation: "Nathalie informe Marco de deux changements : l'heure de la réunion (de 14 h à 16 h) et la salle (de B2 à C5). Elle ne l'annule pas, elle la déplace. L'objet du courriel donne aussi un indice : 'Changement d'horaire'."
  },
  {
    id: 'a2_reading_03',
    section: 'reading',
    level: 'a2',
    topic: 'article_court',
    question: 'D\'après l\'article, pourquoi le Bixi est-il populaire à Montréal ?',
    context: "LE BIXI : LE VÉLO EN LIBRE-SERVICE DE MONTRÉAL\n\nDepuis 2009, le Bixi permet aux Montréalais de se déplacer facilement dans la ville. Ce système de vélos en libre-service compte aujourd'hui plus de 9 000 vélos et 680 stations. Pour l'utiliser, il suffit d'acheter un accès sur l'application ou directement à une station.\n\nLe Bixi est populaire parce qu'il est pratique, économique et bon pour l'environnement. Beaucoup de personnes l'utilisent pour aller au travail ou simplement pour se promener le long du canal Lachine.\n\nLe service fonctionne d'avril à novembre. En hiver, les vélos sont rangés à cause de la neige et du froid.",
    audioHint: null,
    options: [
      'Parce qu\'il fonctionne toute l\'année',
      'Parce qu\'il est gratuit pour les résidents',
      'Parce qu\'il est pratique, économique et écologique',
      'Parce qu\'il remplace le métro de Montréal'
    ],
    correct: 2,
    explanation: "L'article dit clairement : 'Le Bixi est populaire parce qu'il est pratique, économique et bon pour l'environnement.' Le service ne fonctionne pas toute l'année (seulement d'avril à novembre) et il n'est pas gratuit."
  },
  {
    id: 'a2_reading_04',
    section: 'reading',
    level: 'a2',
    topic: 'instructions_recette',
    question: 'Combien de temps faut-il cuire la soupe après avoir ajouté les légumes ?',
    context: "RECETTE : SOUPE AUX LÉGUMES (pour 4 personnes)\n\nIngrédients : 2 carottes, 3 pommes de terre, 1 oignon, 1 litre de bouillon de poulet, sel, poivre, un peu de crème.\n\nPréparation :\n1. Épluchez et coupez les légumes en petits morceaux.\n2. Faites chauffer un peu d'huile dans une grande casserole.\n3. Ajoutez l'oignon et faites-le cuire 3 minutes.\n4. Ajoutez les carottes, les pommes de terre et le bouillon.\n5. Laissez cuire 25 minutes à feu moyen.\n6. Mixez la soupe et ajoutez la crème, le sel et le poivre.\n\nConseil : servez avec du pain frais !",
    audioHint: null,
    options: ['3 minutes', '15 minutes', '25 minutes', '45 minutes'],
    correct: 2,
    explanation: "L'étape 5 de la recette indique : 'Laissez cuire 25 minutes à feu moyen.' Les 3 minutes mentionnées à l'étape 3 concernent uniquement la cuisson de l'oignon, pas de la soupe entière."
  },
  {
    id: 'a2_reading_05',
    section: 'reading',
    level: 'a2',
    topic: 'formulaire',
    question: 'Quelle information n\'est PAS demandée dans ce formulaire ?',
    context: "FORMULAIRE D'INSCRIPTION – COURS DE FRANCISATION\nCentre de langues de Québec\n\nNom : _______________\nPrénom : _______________\nDate de naissance : ___ / ___ / ______\nPays d'origine : _______________\nNuméro de téléphone : _______________\nAdresse courriel : _______________\nNiveau de français actuel : ☐ Débutant  ☐ Intermédiaire  ☐ Avancé\nDisponibilité : ☐ Matin  ☐ Après-midi  ☐ Soir\n\nDocuments à joindre : copie du passeport, preuve de résidence au Québec.",
    audioHint: null,
    options: [
      'Le pays d\'origine',
      'La situation familiale',
      'Le niveau de français',
      'La disponibilité pour les cours'
    ],
    correct: 1,
    explanation: "Le formulaire demande le nom, prénom, date de naissance, pays d'origine, téléphone, courriel, niveau de français et disponibilité. La situation familiale (marié, célibataire, etc.) n'est pas demandée dans ce formulaire."
  },
  {
    id: 'a2_reading_06',
    section: 'reading',
    level: 'a2',
    topic: 'affiche_evenement',
    question: 'Que doit-on faire pour participer à cet événement ?',
    context: "🎵 FÊTE DE LA MUSIQUE 🎵\nSamedi 21 juin – Parc Lafontaine, Montréal\n\n14 h – 22 h : concerts gratuits en plein air\nStyles : rock, jazz, musique du monde, chanson québécoise\n\n17 h – 19 h : atelier de percussion africaine\n(Places limitées – inscription obligatoire sur festivalmusique.qc.ca)\n\nBuvette et food trucks sur place\nEn cas de pluie : événement déplacé au Centre communautaire (500, rue Rachel Est)\n\nÉvénement gratuit – Apportez votre chaise ou votre couverture !",
    audioHint: null,
    options: [
      'Acheter un billet en ligne',
      'Venir avec son instrument de musique',
      'S\'inscrire uniquement pour l\'atelier de percussion',
      'Réserver une place assise à l\'avance'
    ],
    correct: 2,
    explanation: "L'affiche précise que les concerts sont gratuits et en accès libre. Seul l'atelier de percussion africaine demande une inscription obligatoire sur le site web, car les places sont limitées."
  },
  {
    id: 'a2_reading_07',
    section: 'reading',
    level: 'a2',
    topic: 'annonce',
    question: 'Quel type de logement est proposé dans cette annonce ?',
    context: "À LOUER – DISPONIBLE 1er JUILLET\n\n4 ½ lumineux au 2e étage\nQuartier Villeray, Montréal\n\nCaractéristiques :\n- 2 chambres à coucher\n- Salon, cuisine, salle de bain\n- Planchers de bois franc\n- Laveuse et sécheuse incluses\n- Rangement au sous-sol\n\nLoyer : 1 350 $ / mois (chauffage et eau chaude inclus)\nAnimaux : chats acceptés, pas de chiens\nProche métro Jean-Talon (5 min à pied)\n\nContact : propriétaire au 514-555-0178",
    audioHint: null,
    options: [
      'Une maison avec jardin',
      'Un appartement de deux chambres',
      'Un studio meublé',
      'Un condo à acheter'
    ],
    correct: 1,
    explanation: "L'annonce propose un '4 ½' (terme québécois pour un appartement avec 2 chambres, un salon, une cuisine et une salle de bain). C'est un logement à louer (pas à acheter) au 2e étage d'un immeuble dans le quartier Villeray."
  },
  {
    id: 'a2_reading_08',
    section: 'reading',
    level: 'a2',
    topic: 'lettre',
    question: 'Qu\'est-ce que Sophie demande à la fin de sa lettre ?',
    context: "Gatineau, le 5 mars 2026\n\nChère Amélie,\n\nComment vas-tu ? Je t'écris parce que j'ai une grande nouvelle : j'ai trouvé un emploi à Ottawa ! Je commence le 15 avril comme adjointe administrative dans un bureau du gouvernement fédéral.\n\nJe cherche un appartement près du centre-ville, mais c'est difficile de trouver quelque chose de pas trop cher. Est-ce que tu connais des sites web ou des groupes Facebook pour la recherche de logement dans la région ?\n\nJ'espère te voir bientôt. On pourrait prendre un café ensemble quand je serai installée.\n\nBisous,\nSophie",
    audioHint: null,
    options: [
      'Une recommandation pour un emploi',
      'De l\'aide pour trouver un logement',
      'Une invitation à venir à Gatineau',
      'Des conseils pour son entrevue d\'emploi'
    ],
    correct: 1,
    explanation: "Sophie demande à Amélie si elle connaît des sites web ou des groupes Facebook pour chercher un appartement. Elle a déjà trouvé son emploi, donc elle n'a pas besoin d'aide pour cela. Sa demande porte sur la recherche de logement."
  },

  // ============================================================
  // LISTENING (9 questions)
  // ============================================================

  {
    id: 'a2_listening_01',
    section: 'listening',
    level: 'a2',
    topic: 'rendez_vous_medical',
    question: 'Pourquoi le patient appelle-t-il la clinique ?',
    context: null,
    audioHint: "Un homme appelle une clinique médicale. La réceptionniste décroche. L'homme dit : « Bonjour, je voudrais prendre un rendez-vous avec le docteur Nguyen, s'il vous plaît. J'ai très mal au dos depuis trois jours et ça ne passe pas. » La réceptionniste répond : « Le docteur Nguyen peut vous recevoir jeudi à 10 h 30. Est-ce que ça vous convient ? » L'homme dit : « Jeudi, c'est parfait. Merci beaucoup. »",
    options: [
      'Pour annuler un rendez-vous existant',
      'Pour prendre un rendez-vous à cause d\'un mal de dos',
      'Pour demander les résultats de ses analyses',
      'Pour renouveler une ordonnance'
    ],
    correct: 1,
    explanation: "Le patient dit clairement qu'il veut prendre un rendez-vous parce qu'il a 'très mal au dos depuis trois jours'. Il ne s'agit pas d'une annulation ni d'une demande de résultats."
  },
  {
    id: 'a2_listening_02',
    section: 'listening',
    level: 'a2',
    topic: 'appel_telephonique',
    question: 'Quel est le message laissé sur le répondeur ?',
    context: null,
    audioHint: "Un message sur le répondeur téléphonique d'un appartement : « Bonjour, ici Plomberie Lapointe. Nous appelons pour confirmer notre visite demain matin entre 9 h et 11 h pour réparer la fuite dans votre salle de bain. Si cet horaire ne vous convient pas, veuillez nous rappeler au 514-555-0234 avant 17 h aujourd'hui. Merci et bonne journée. »",
    options: [
      'Un ami invite à dîner demain',
      'Le propriétaire demande le loyer',
      'Un plombier confirme une visite pour une réparation',
      'Un livreur annonce un colis'
    ],
    correct: 2,
    explanation: "Le message est de 'Plomberie Lapointe' qui confirme une visite 'demain matin entre 9 h et 11 h pour réparer la fuite dans la salle de bain'. C'est un plombier qui confirme un rendez-vous pour une réparation."
  },
  {
    id: 'a2_listening_03',
    section: 'listening',
    level: 'a2',
    topic: 'annonce_radio',
    question: 'Qu\'est-ce que la radio annonce ?',
    context: null,
    audioHint: "À la radio, un animateur dit : « Avis important aux automobilistes : en raison des travaux sur le pont Jacques-Cartier, la circulation est très lente ce matin en direction de Montréal. Nous vous recommandons de prendre le pont Victoria ou le tunnel Louis-Hippolyte-La Fontaine comme alternatives. Les travaux devraient se terminer vendredi prochain. »",
    options: [
      'Un accident grave sur l\'autoroute',
      'La fermeture définitive du pont Jacques-Cartier',
      'Des problèmes de circulation à cause de travaux sur un pont',
      'L\'ouverture d\'une nouvelle route à Montréal'
    ],
    correct: 2,
    explanation: "L'annonce radio informe les automobilistes de travaux sur le pont Jacques-Cartier qui causent une circulation lente. Ce n'est pas un accident ni une fermeture définitive, mais des travaux temporaires (qui finissent vendredi prochain)."
  },
  {
    id: 'a2_listening_04',
    section: 'listening',
    level: 'a2',
    topic: 'demander_son_chemin',
    question: 'Où se trouve la bibliothèque ?',
    context: null,
    audioHint: "Une femme demande à un passant : « Excusez-moi, est-ce que vous savez où se trouve la bibliothèque municipale ? » Le passant répond : « Oui, bien sûr. Vous continuez tout droit sur cette rue pendant deux minutes. Au feu rouge, vous tournez à gauche sur la rue Saint-Denis. La bibliothèque est juste après la pharmacie, sur votre droite. Vous ne pouvez pas la manquer, c'est un grand bâtiment en brique rouge. »",
    options: [
      'En face de la pharmacie, sur la rue principale',
      'À droite sur la rue Saint-Denis, après la pharmacie',
      'À gauche après le feu rouge, à côté du parc',
      'Au bout de la rue Saint-Denis, en face de l\'église'
    ],
    correct: 1,
    explanation: "Le passant indique : tourner à gauche au feu rouge sur la rue Saint-Denis, puis la bibliothèque est 'juste après la pharmacie, sur votre droite'. Elle se trouve donc à droite sur la rue Saint-Denis, après la pharmacie."
  },
  {
    id: 'a2_listening_05',
    section: 'listening',
    level: 'a2',
    topic: 'meteo',
    question: 'Quel temps est prévu pour le week-end ?',
    context: null,
    audioHint: "Le bulletin météo à la radio : « Bonjour, voici votre météo pour la région de Montréal. Aujourd'hui mercredi, ciel nuageux avec des températures autour de moins cinq degrés. Demain jeudi, retour du soleil mais il fera encore froid, moins huit le matin. Pour le week-end, bonne nouvelle : on attend un redoux avec des températures de plus deux degrés samedi et plus cinq dimanche. Attention, ce redoux pourrait apporter un peu de pluie verglaçante samedi soir. »",
    options: [
      'De la neige abondante et du froid intense',
      'Des températures plus douces avec un risque de pluie verglaçante',
      'Un temps ensoleillé et chaud toute la fin de semaine',
      'Des vents violents et des tempêtes'
    ],
    correct: 1,
    explanation: "La météo annonce un 'redoux' pour le week-end (températures plus douces : +2 °C samedi, +5 °C dimanche) avec un risque de 'pluie verglaçante samedi soir'. Un redoux signifie une hausse des températures après une période froide."
  },
  {
    id: 'a2_listening_06',
    section: 'listening',
    level: 'a2',
    topic: 'dialogue_achats',
    question: 'Combien la cliente doit-elle payer au total ?',
    context: null,
    audioHint: "Dans une boulangerie. La vendeuse : « Bonjour ! Qu'est-ce que je vous sers ? » La cliente : « Bonjour, je voudrais une baguette et quatre croissants, s'il vous plaît. » La vendeuse : « Alors, une baguette à 3,50 $ et quatre croissants à 2 $ chacun, ça fait 11,50 $. Est-ce que vous voulez autre chose ? » La cliente : « Non, ce sera tout, merci. Je paie par carte. » La vendeuse : « Bien sûr, allez-y. »",
    options: ['8,00 $', '10,00 $', '11,50 $', '13,50 $'],
    correct: 2,
    explanation: "La vendeuse calcule le total : une baguette à 3,50 $ + quatre croissants à 2 $ chacun (4 × 2 = 8 $) = 3,50 + 8,00 = 11,50 $. Il est important de savoir comprendre les prix et les calculs simples."
  },
  {
    id: 'a2_listening_07',
    section: 'listening',
    level: 'a2',
    topic: 'commande_restaurant',
    question: 'Que choisit l\'homme comme plat principal ?',
    context: null,
    audioHint: "Au restaurant. Le serveur : « Vous avez choisi ? » La femme : « Oui, je vais prendre la salade César en entrée et le saumon grillé comme plat principal. » Le serveur : « Très bien. Et pour monsieur ? » L'homme : « Pour moi, pas d'entrée. Comme plat principal, je vais prendre la tourtière avec la salade verte. Et est-ce qu'on peut aussi avoir une carafe d'eau, s'il vous plaît ? » Le serveur : « Bien sûr, je vous apporte ça tout de suite. »",
    options: [
      'La salade César',
      'Le saumon grillé',
      'La tourtière avec salade verte',
      'Le poulet rôti avec des frites'
    ],
    correct: 2,
    explanation: "L'homme commande 'la tourtière avec la salade verte' comme plat principal. La tourtière est un plat traditionnel québécois, une sorte de tourte à la viande. La salade César et le saumon grillé sont les choix de la femme."
  },
  {
    id: 'a2_listening_08',
    section: 'listening',
    level: 'a2',
    topic: 'annonce_transport',
    question: 'Pourquoi le train est-il retardé ?',
    context: null,
    audioHint: "Annonce dans une gare : « Attention, mesdames et messieurs. Le train numéro 635 en direction de Québec, prévu à 15 h 45, aura un retard d'environ trente minutes en raison de conditions météorologiques difficiles sur la voie. Le départ est maintenant estimé à 16 h 15. Nous nous excusons pour ce désagrément. Veuillez consulter les écrans d'affichage pour les mises à jour. »",
    options: [
      'Un problème technique sur le train',
      'Une grève des employés',
      'Des conditions météorologiques difficiles',
      'Un accident sur la voie'
    ],
    correct: 2,
    explanation: "L'annonce indique que le retard est dû à des 'conditions météorologiques difficiles sur la voie'. Le train numéro 635 vers Québec partira à 16 h 15 au lieu de 15 h 45, soit 30 minutes de retard."
  },
  {
    id: 'a2_listening_09',
    section: 'listening',
    level: 'a2',
    topic: 'conversation_travail',
    question: 'Que propose la collègue à Karim ?',
    context: null,
    audioHint: "Conversation entre deux collègues au bureau. La femme : « Karim, tu as l'air fatigué aujourd'hui. Ça va ? » Karim : « Oui, ça va, mais j'ai eu du mal à finir le rapport pour le client de Sherbrooke. J'ai travaillé dessus jusqu'à minuit hier soir. » La femme : « Oh là là ! Écoute, si tu veux, je peux t'aider avec la présentation de demain. Comme ça, tu peux te concentrer sur le rapport. » Karim : « C'est vraiment gentil, merci beaucoup. Ça me soulagerait énormément. »",
    options: [
      'De prendre un jour de congé',
      'De l\'aider avec la présentation de demain',
      'De demander un délai au client',
      'De changer de projet'
    ],
    correct: 1,
    explanation: "La collègue propose : 'je peux t'aider avec la présentation de demain. Comme ça, tu peux te concentrer sur le rapport.' Elle offre de partager la charge de travail en s'occupant de la présentation pendant que Karim finit le rapport."
  }

];
