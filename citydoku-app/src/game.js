import CA from './data/ca.json';
import US from './data/us.json';
import GL from './data/global.json';
import LAND from './data/land.txt?raw';

const DATA={ca:CA,us:US,global:GL};const GLC=Object.fromEntries(DATA.global.map(c=>[c.p,c.cn]));let CITIES=DATA.ca;

// ---------- editions ----------
const EDITIONS={
 global:{flag:'🌍',name:{en:'Global',fr:'Monde'},brand:['City','doku'],ready:true,langs:['en','fr','es'],hash:'global',img:'#1D5FA8',seed:'citydoku-global-',launch:'2026-11-01',leaf:'🌍',
  title:'Citydoku Global',lead:'Cities from every continent. Name a city that matches a country, a continent, a population, a coastline or an Olympic past.',
  cities:'Every national capital plus cities with 1 million+ people (about 650 cities in 190+ countries).',
  cats:['Continent or country','National capital','Population: over 1 million, 5 million or 10 million','On the ocean coast','Hosted the Summer or Winter Olympics','Hosted FIFA World Cup matches','Has a metro or subway','Home to a UNESCO World Heritage Site','Northern or Southern Hemisphere','Above 1,000 m elevation','Below sea level','Name starts with San, Santa, São or Saint'],
  data:'UN World Urbanization Prospects, national censuses, Wikidata and GeoNames.',
  sample:[['Continent','Europe'],['Population','Over 5 million'],['Sport','Olympic host'],['Geography','On the ocean'],['Transit','Has a metro'],['Status','National capital']]},
 ca:{flag:'🇨🇦',name:{en:'Canada',fr:'Canada'},brand:['Cana','doku'],ready:true,langs:['en','fr'],hash:'canada',img:'#D52B1E',seed:'canadoku-',launch:'2026-10-01',leaf:'🍁'},
 us:{flag:'🇺🇸',name:{en:'United States',fr:'États-Unis'},short:{en:'USA',fr:'É.-U.'},brand:['City','doku'],ready:true,langs:['en','fr','es'],hash:'usa',img:'#0A3161',seed:'citydoku-us-',launch:'2026-11-01',leaf:'🇺🇸',
  title:'Citydoku USA',lead:'From Anchorage to Miami. Name a US city that matches a state, a team, a college or an interstate.',
  cities:'Incorporated places with 50,000+ people plus all 50 state capitals (about 850 cities).',
  cats:['State or Census region','State capital','Population bands','Pacific, Atlantic or Gulf coast, Great Lakes, or on the Mississippi','NFL, NBA, MLB, NHL, MLS or WNBA team','Lost a major-league team (e.g. Seattle SuperSonics, Oakland Raiders)','Power 4 university (SEC, Big Ten, Big 12, ACC; Notre Dame counts) or Ivy League','Amtrak station','Rapid transit station (subway, elevated or light rail)','Commuter rail station (e.g. Metra, NJ Transit, LIRR, Caltrain)','Major airline hub','On a major interstate highway, either north–south (e.g. I-95) or east–west (e.g. I-10, I-80, I-90)','On historic Route 66','Time zone'],
  data:'US Census Bureau (2020 Census and latest population estimates), league sites, Amtrak and FAA.',
  sample:[['State','Texas'],['Sports','NFL team'],['Geography','Gulf coast'],['Education','Power 4 university'],['Population','Over 500,000'],['Transit','Amtrak station']]},
 au:{flag:'🇦🇺',name:{en:'Australia',fr:'Australie'},brand:['City','doku'],ready:false,langs:['en'],hash:'australia',img:'#00843D',
  title:'Citydoku Australia',lead:'From Darwin to Hobart. Name an Aussie city that fits a state, a footy club, a uni or a famous train.',
  cities:'Significant urban areas with 10,000+ people plus all state and territory capitals (about 130 cities).',
  cats:['State or territory','Capital city','Population bands','On the coast, on the Murray River, or near the Great Barrier Reef','AFL, NRL, A-League, NBL, Super Rugby or Big Bash team','Group of Eight university','Stop on the Indian Pacific or The Ghan','International airport','On Highway 1','North of the Tropic of Capricorn','Wine region'],
  data:'Australian Bureau of Statistics (2021 Census, Significant Urban Areas), league and rail operator sites.',
  sample:[['State','Queensland'],['Footy','NRL team'],['Geography','On the coast'],['Rail','On The Ghan'],['Population','Under 50,000'],['Education','Group of Eight']]},
 uk:{flag:'🇬🇧',name:{en:'United Kingdom',fr:'Royaume-Uni'},short:{en:'UK',fr:'R.-U.'},brand:['City','doku'],ready:false,langs:['en'],hash:'uk',img:'#012169',
  title:'Citydoku UK',lead:'From Inverness to Penzance. Name a UK town or city that fits a nation, a football club, a university or a railway line.',
  cities:'Built-up areas with 20,000+ people plus every place with official city status (about 450 places).',
  cats:['England, Scotland, Wales or Northern Ireland; English region','Official city status','Population bands','Coastal, ferry port, or on the Thames','Premier League, EFL or Scottish Premiership club','Rugby union or county cricket team','Russell Group university','On the West Coast or East Coast Main Line','Has a tube, metro or tram','Cathedral city','Name ends in -chester, -ham, -ford or -bury'],
  data:'ONS (2021 Census built-up areas), National Records of Scotland, NISRA, league and rail sites.',
  sample:[['Nation','England'],['Football','Premier League club'],['Status','City status'],['Rail','East Coast Main Line'],['Education','Russell Group'],['Geography','Coastal']]},
 in:{flag:'🇮🇳',name:{en:'India',fr:'Inde'},brand:['City','doku'],ready:false,langs:['en'],hash:'india',img:'#138808',
  title:'Citydoku India',lead:'From Srinagar to Thiruvananthapuram. Name an Indian city that fits a state, an IPL team, an IIT or a metro line.',
  cities:'Cities and urban agglomerations with 100,000+ people (one lakh) plus every state and union territory capital (about 500 cities). Hindi names to follow.',
  cats:['State or union territory; region (North, South, East, West, Northeast)','State or UT capital','Population: over 10 lakh, or over 1 crore (megacity)','Coastal, or on the Ganga, Yamuna or Godavari','IPL, ISL or Pro Kabaddi team','Home to an IIT, IIM or AIIMS','Has a metro rail system','Smart Cities Mission city','UNESCO World Heritage Site','Former capital of an empire or princely state','Name ends in -pur, -abad, -garh or -nagar'],
  data:'Census of India 2011 (the next census is due in 2027), Ministry of Housing and Urban Affairs, league and institute sites.',
  sample:[['State','Maharashtra'],['Cricket','IPL team'],['Geography','Coastal'],['Education','Has an IIT'],['Transit','Metro rail'],['Population','Over 10 lakh']]},
 cn:{flag:'🇨🇳',name:{en:'China',fr:'Chine'},brand:['City','doku'],ready:false,langs:['en'],hash:'china',img:'#DE2910',
  title:'Citydoku China',lead:'From Harbin to Haikou. Name a Chinese city that fits a province, a river, a rail line or a dynasty.',
  cities:'Municipalities, prefecture-level cities and county-level cities with 1 million+ people (about 350 cities). English and 中文 names.',
  cats:['Province, autonomous region or municipality','Provincial capital or SAR','Population bands','Coastal, on the Yangtze, or on the Yellow River','Has a metro system','On the Beijing–Shanghai or Beijing–Guangzhou high-speed railway','Chinese Super League or CBA team','Project 985 university','Special Economic Zone','Former imperial capital','Name contains 州, 京 or 阳'],
  data:'National Bureau of Statistics (7th National Census, 2020), city statistical yearbooks, China Railway.',
  sample:[['Province','Guangdong'],['Geography','On the Yangtze'],['Transit','Has a metro'],['History','Former capital'],['Population','Over 10 million'],['Status','Provincial capital']]},
};
const ED_ORDER=['global','ca','us']; // hidden for now: 'au','uk','in','cn' (configs kept below)
let ED='global';
const EDC=()=>EDITIONS[ED];
const edName=e=>(EDITIONS[e].name[LANG]||EDITIONS[e].name.en);
const edShort=e=>(EDITIONS[e].short?.[LANG]||EDITIONS[e].short?.en||edName(e));
const brandName=()=>ED==='ca'?'Canadoku':'Citydoku – '+edName(ED);
const dk=ds=>ED+':'+ds;
function edDays(days){const p=ED+':';return Object.fromEntries(Object.entries(days||{}).filter(([k])=>k.startsWith(p)).map(([k,v])=>[k.slice(p.length),v]))}
// ---------- language ----------
const I18N={
en:{sub:'Cities edition · name a city that fits both signs',tabDaily:'Daily',tabArchive:'Archive',tabFree:'Free play',howTitle:'How to play',
 how1:'Tap a square and name a Canadian city that matches both its row and its column.',
 how2:'Cities are municipalities with 10,000+ people, plus capitals and smaller towns that are home to a university, college or CEGEP.',
 how3:'You have 9 guesses, and each city can be used once.',
 how4:'Rarity is the share of players who gave the same answer. Lower is better, and a unique answer scores 1.',
 how5:'Miss a day? One streak freeze per week keeps your streak alive.',
 level:'Level',easy:'Easy',medium:'Medium',hard:'Hard',newGrid:'New grid',pickDate:'Date',archNote:'Archive games don’t count toward streaks or today’s leaderboard.',
 dailyMeta:'Daily #{n} · {d} · {lvl}',archMeta:'Archive #{n} · {d}',freeMeta:'Free play · {l}',players:'· {n} players',player1:'· 1 player',
 guessesLeft:'guesses left',correct:'Correct',raritySoFar:'Rarity so far',rarityScore:'Rarity score',streak:'Streak',giveUp:'Give up',
 perfect:'Perfect grid',closed:'Grid closed',outOf:'Out of guesses',endHelp:'Tap any square to see every valid answer and how often each was picked.',
 freezeLeft:'Streak freeze: 1 available this week.',freezeUsed:'Streak freeze: used this week.',
 copy:'Copy result',img:'Share image',copied:'Result copied',copyBelow:'Copy the result below',
 pickLabel:'Name a city',ph:'Start typing…',close:'Close',used:'used',noCity:'No city in the game by that name.',
 fits:'fits',pickRate:'{p}% of players picked it.',estRate:'About {p}% estimated pick rate.',unique:'Unique so far!',doesntFit:'doesn’t fit.',
 nAnswers:'{n} answers',ansTitle:'{n} valid answers, most picked first',ansReal:'Pick rates from {n} players.',ansEst:'Few players so far, so pick rates are partly estimated.',you:'your pick',
 guest:'Playing as a guest. Sign in to save your scores and join the leaderboard.',connecting:'Connecting to the scoreboard…',
 unreach:'The scoreboard can’t be reached right now. Your game still saves on this device.',
 readonly:'Your scores couldn’t be saved. Sign out, sign back in and try again.',
 signedAs:'Signed in as {name} · scores saved',change:'Change username',needName:'You’re signed in. Choose a username to save your scores to the leaderboard.',create:'Create player profile',
 uTitle:'Choose your username',uHelp:'Your username appears on the leaderboard with your scores. Use 3 to 20 letters, numbers, hyphens or underscores.',uLabel:'Username',cancel:'Cancel',uSave:'Save username',
 badName:'Use 3 to 20 letters, numbers, hyphens or underscores, with no spaces.',taken:'That username is taken. Try another one.',needSignIn:'Sign in to create a player profile.',saveFail:'Couldn’t save just now. Try again in a moment.',nameSaved:'Username saved',
 lbTitle:'Leaderboard',today:'Today',allTime:'All time',cPlayer:'Player',cCorrect:'Correct',cRarity:'Rarity',cPlayed:'Played',cPerfect:'Perfect',cAvg:'Avg rarity',cStreak:'Streak',cUniq:'Unique',
 lbNote:'Ranked by correct answers, then lowest rarity. Only players with a username are shown.',lbNoteAll:'Ranked by perfect grids, then lowest average rarity. Only players with a username are shown.',
 lbEmptyToday:'No one with a username has finished today’s grid yet.',lbEmptyAll:'No finished games yet.',lbSignIn:'Sign in to see the leaderboard.',lbLoading:'Loading the leaderboard…',
 soon:'Coming soon',plusText:'Support Canadoku and get extras.',plus1:'Full archive back to day one',plus2:'Detailed stats and answer history',plus3:'Two streak freezes a week',plus4:'No ads',notify:'Notify me',notified:'We’ll let you know when Canadoku+ launches.',notifyGuest:'Sign in to get notified.',
 sponsor:'Sponsor spot · Your Canadian business here',
 imgTitle:'Your result image',imgHelp:'On a phone, you can also press and hold the image to save it.',imgSave:'Save image',igHelp:'Save the image, then open Instagram and add it to your story or a post. On a phone, you can also press and hold the image to save it.',imgSaved:'Image saved',imgLine:'Can you beat my grid?',shareOn:'Share on',built:'Built in Canada',signIn:'Sign in',delAcct:'Delete account',signOut:'Sign out',remNative:'Daily reminder set for {t}.',mixed:'Mixed',mapTitle:'Your grid on the map',mapHelp:'Numbers match the squares, left to right and top to bottom. After the game, grey dots show every other valid answer.',lgTitle:'Friend leagues',lgHelp:'Create a league, share the code, and compare scores with friends, a class or your office.',lgEveryone:'Everyone',lgCreate:'Create a league',lgJoin:'Join with a code',lgName:'League name',lgCode:'League code',lgCreateBtn:'Create',lgJoinBtn:'Join',lgInvite:'Copy invite',lgCopied:'Invite copied: {code}',lgNotFound:'No league uses that code. Check it and try again.',lgJoined:'You joined {name}',lgCreated:'League created. Share code {code} with friends.',lgLeave:'Leave league',lgLeft:'You left the league',lgNeedName:'Create a player profile first, so friends can see your name.',lgShow:'Show',lgNameErr:'Give your league a name of 3 to 30 characters.',lgMembers:'{n} members',lgCodeIs:'Code: {code}',remTitle:'Reminders',remNext:'Next grid in {t}',remStreak:'Your {n}-day streak ends at midnight Eastern if you don’t play today.',remCalL:'Daily reminder time',remCal:'Add to my calendar',remHelp:'Saves a calendar file with a repeating daily event and alert. Open it to add the reminder to Google Calendar, Apple Calendar or Outlook. Email and push reminders will come with the Citydoku app.',remSaved:'Calendar file saved. Open it to add the reminder.',remNoDl:'Saving files isn’t available here. Set a daily alarm on your phone instead.',remEvt:'Play today’s Citydoku',pickCountry:'Choose a country',inDev:'In development',previewCap:'Sample grid · not playable yet',soonCitiesH:'What counts as a city',soonCatsH:'Category ideas',soonDataH:'Data sources',suggest:'Suggest a category',playCa:'Play Canadoku while you wait',edSoon:'soon',subOther:'{name} edition · coming soon',fbBtn:'Send feedback or a correction',fbReport:'Report a problem with this square',fbTitle:'Send feedback',fbHelp:'Spotted a wrong answer, a missing city or a bad translation? Tell us and we’ll fix it.',fbTypeL:'What’s it about?',fbT1:'Wrong answer or data correction',fbT2:'Missing city',fbT3:'Translation',fbT4:'Something isn’t working',fbT5:'Idea or suggestion',fbT6:'Other',fbCityL:'City (optional)',fbMsgL:'Details',fbSend:'Send',fbEmpty:'Add a few words about the problem.',fbThanks:'Thanks! Your feedback was sent.',fbGuest:'Sign in to send feedback.',fbCtx:'We’ll include: {ctx}',newTab:'opens in a new tab',
 foot:'Rarity is the share of players who picked the same answer in that square. With few players, it’s blended with an estimate where bigger cities count as more common. Populations: Statistics Canada, 2021 Census (table 98-10-0002-01); six New Brunswick municipalities use their post-2023 boundaries. Teams: 2026–27 seasons (2026 CFL); former NHL teams are franchises that moved or folded. Transit: stations and services open as of November 2026. Schools count only where their main campus is; colleges are public colleges outside Quebec.',
 rowcol:'Row: {r}. Column: {c}.',empty:'Empty square.',answered:'Answered: {city}.',grid:'Puzzle grid',modeLbl:'Game mode'},
fr:{sub:'Édition villes · nomme une ville qui fitte avec les deux panneaux',tabDaily:'Du jour',tabArchive:'Archives',tabFree:'Partie libre',howTitle:'Comment jouer',
 how1:'Touche une case et nomme une ville canadienne qui correspond à sa rangée et à sa colonne.',
 how2:'Les villes sont les municipalités de 10 000 habitants et plus, les capitales et les petites villes où se trouve une université, un collège ou un cégep.',
 how3:'Tu as 9 essais, et chaque ville ne peut servir qu’une fois.',
 how4:'La rareté, c’est la part des joueurs qui ont donné la même réponse. Plus c’est bas, mieux c’est : une réponse unique vaut 1.',
 how5:'T’as manqué une journée? Un gel de série par semaine garde ta série en vie.',
 level:'Niveau',easy:'Facile',medium:'Moyen',hard:'Difficile',newGrid:'Nouvelle grille',pickDate:'Date',archNote:'Les parties des archives ne comptent pas pour les séries ni pour le classement du jour.',
 dailyMeta:'Grille #{n} · {d} · {lvl}',archMeta:'Archives #{n} · {d}',freeMeta:'Partie libre · {l}',players:'· {n} joueurs',player1:'· 1 joueur',
 guessesLeft:'essais restants',correct:'Bonnes réponses',raritySoFar:'Rareté jusqu’ici',rarityScore:'Score de rareté',streak:'Série',giveUp:'Abandonner',
 perfect:'Grille parfaite',closed:'Grille terminée',outOf:'Plus d’essais',endHelp:'Touche une case pour voir toutes les bonnes réponses et à quel point chacune a été choisie.',
 freezeLeft:'Gel de série : 1 disponible cette semaine.',freezeUsed:'Gel de série : déjà utilisé cette semaine.',
 copy:'Copier le résultat',img:'Image à partager',copied:'Résultat copié',copyBelow:'Copie le résultat ci-dessous',
 pickLabel:'Nomme une ville',ph:'Commence à taper…',close:'Fermer',used:'déjà utilisée',noCity:'Aucune ville de ce nom dans le jeu.',
 fits:'fonctionne',pickRate:'{p} % des joueurs l’ont choisie.',estRate:'Environ {p} % (estimation).',unique:'Réponse unique jusqu’ici!',doesntFit:'ne fonctionne pas.',
 nAnswers:'{n} réponses',ansTitle:'{n} bonnes réponses, les plus choisies d’abord',ansReal:'Popularité selon {n} joueurs.',ansEst:'Peu de joueurs jusqu’ici : la popularité est en partie estimée.',you:'ton choix',
 guest:'Tu joues en invité. Connecte-toi pour sauvegarder tes scores et apparaître au classement.',connecting:'Connexion au tableau des scores…',
 unreach:'Le tableau des scores est inaccessible pour l’instant. Ta partie reste sauvegardée sur cet appareil.',
 readonly:'Impossible de sauvegarder tes scores. Déconnecte-toi, reconnecte-toi et réessaie.',
 signedAs:'Connecté en tant que {name} · scores sauvegardés',change:'Changer de nom d’utilisateur',needName:'T’es connecté. Choisis un nom d’utilisateur pour inscrire tes scores au classement.',create:'Créer mon profil',
 uTitle:'Choisis ton nom d’utilisateur',uHelp:'Ton nom d’utilisateur s’affiche au classement avec tes scores. Utilise de 3 à 20 lettres, chiffres, traits d’union ou traits de soulignement.',uLabel:'Nom d’utilisateur',cancel:'Annuler',uSave:'Enregistrer',
 badName:'Utilise de 3 à 20 lettres, chiffres, traits d’union ou traits de soulignement, sans espace.',taken:'Ce nom est déjà pris. Essaie-en un autre.',needSignIn:'Connecte-toi pour créer un profil.',saveFail:'Impossible d’enregistrer pour l’instant. Réessaie dans un moment.',nameSaved:'Nom enregistré',
 lbTitle:'Classement',today:'Aujourd’hui',allTime:'Depuis le début',cPlayer:'Joueur',cCorrect:'Bonnes',cRarity:'Rareté',cPlayed:'Parties',cPerfect:'Parfaites',cAvg:'Rareté moy.',cStreak:'Série',cUniq:'Uniques',
 lbNote:'Classé selon les bonnes réponses, puis la rareté la plus basse. Seuls les joueurs avec un nom d’utilisateur apparaissent.',lbNoteAll:'Classé selon les grilles parfaites, puis la rareté moyenne la plus basse. Seuls les joueurs avec un nom d’utilisateur apparaissent.',
 lbEmptyToday:'Personne avec un nom d’utilisateur n’a encore terminé la grille du jour.',lbEmptyAll:'Aucune partie terminée pour l’instant.',lbSignIn:'Connecte-toi pour voir le classement.',lbLoading:'Chargement du classement…',
 soon:'Bientôt',plusText:'Encourage Canadoku et obtiens des extras.',plus1:'Toutes les archives depuis le premier jour',plus2:'Statistiques détaillées et historique des réponses',plus3:'Deux gels de série par semaine',plus4:'Aucune pub',notify:'Me prévenir',notified:'On te fera signe au lancement de Canadoku+.',notifyGuest:'Connecte-toi pour être prévenu.',
 sponsor:'Espace commanditaire · Ton entreprise canadienne ici',
 imgTitle:'Ton image de résultat',imgHelp:'Sur un téléphone, tu peux aussi garder le doigt sur l’image pour l’enregistrer.',imgSave:'Enregistrer l’image',igHelp:'Enregistre l’image, puis ouvre Instagram et ajoute-la à ta story ou à une publication. Sur un téléphone, tu peux aussi garder le doigt sur l’image pour l’enregistrer.',imgSaved:'Image enregistrée',imgLine:'Peux-tu battre ma grille?',shareOn:'Partager sur',built:'Conçu au Canada',signIn:'Se connecter',delAcct:'Supprimer mon compte',signOut:'Se déconnecter',remNative:'Rappel quotidien réglé à {t}.',mixed:'Mixte',mapTitle:'Ta grille sur la carte',mapHelp:'Les numéros suivent les cases, de gauche à droite et de haut en bas. Après la partie, les points gris montrent les autres bonnes réponses.',lgTitle:'Ligues entre amis',lgHelp:'Crée une ligue, partage le code et compare tes scores avec tes amis, ta classe ou ton bureau.',lgEveryone:'Tout le monde',lgCreate:'Créer une ligue',lgJoin:'Rejoindre avec un code',lgName:'Nom de la ligue',lgCode:'Code de la ligue',lgCreateBtn:'Créer',lgJoinBtn:'Rejoindre',lgInvite:'Copier l’invitation',lgCopied:'Invitation copiée : {code}',lgNotFound:'Aucune ligue n’utilise ce code. Vérifie-le et réessaie.',lgJoined:'T’as rejoint {name}',lgCreated:'Ligue créée. Partage le code {code} avec tes amis.',lgLeave:'Quitter la ligue',lgLeft:'T’as quitté la ligue',lgNeedName:'Crée d’abord ton profil pour que tes amis voient ton nom.',lgShow:'Afficher',lgNameErr:'Donne à ta ligue un nom de 3 à 30 caractères.',lgMembers:'{n} membres',lgCodeIs:'Code : {code}',remTitle:'Rappels',remNext:'Prochaine grille dans {t}',remStreak:'Ta série de {n} jours se termine à minuit (heure de l’Est) si tu ne joues pas aujourd’hui.',remCalL:'Heure du rappel quotidien',remCal:'Ajouter à mon calendrier',remHelp:'Enregistre un fichier de calendrier avec un événement quotidien et une alerte. Ouvre-le pour ajouter le rappel à Google Agenda, Calendrier d’Apple ou Outlook. Les rappels par courriel et notifications viendront avec l’appli Citydoku.',remSaved:'Fichier de calendrier enregistré. Ouvre-le pour ajouter le rappel.',remNoDl:'L’enregistrement de fichiers n’est pas disponible ici. Mets plutôt une alarme quotidienne sur ton téléphone.',remEvt:'Jouer à la grille Citydoku du jour',pickCountry:'Choisis un pays',inDev:'En développement',previewCap:'Exemple de grille · pas encore jouable',soonCitiesH:'Ce qui compte comme ville',soonCatsH:'Idées de catégories',soonDataH:'Sources des données',suggest:'Suggérer une catégorie',playCa:'Joue à Canadoku en attendant',edSoon:'bientôt',subOther:'Édition {name} · bientôt',fbBtn:'Envoyer un commentaire ou une correction',fbReport:'Signaler un problème avec cette case',fbTitle:'Envoyer un commentaire',fbHelp:'T’as vu une mauvaise réponse, une ville manquante ou une erreur de traduction? Dis-le-nous et on va corriger ça.',fbTypeL:'De quoi s’agit-il?',fbT1:'Mauvaise réponse ou correction de données',fbT2:'Ville manquante',fbT3:'Traduction',fbT4:'Quelque chose ne marche pas',fbT5:'Idée ou suggestion',fbT6:'Autre',fbCityL:'Ville (facultatif)',fbMsgL:'Détails',fbSend:'Envoyer',fbEmpty:'Ajoute quelques mots pour décrire le problème.',fbThanks:'Merci! Ton commentaire a été envoyé.',fbGuest:'Connecte-toi pour envoyer un commentaire.',fbCtx:'On va inclure : {ctx}',newTab:'s’ouvre dans un nouvel onglet',
 foot:'La rareté, c’est la part des joueurs qui ont choisi la même réponse dans une case. Quand il y a peu de joueurs, on la combine avec une estimation où les grandes villes comptent comme plus populaires. Populations : Statistique Canada, Recensement de 2021 (tableau 98-10-0002-01); six municipalités du Nouveau-Brunswick utilisent leurs limites d’après 2023. Équipes : saisons 2026-2027 (LCF 2026); les anciennes équipes de la LNH ont déménagé ou disparu. Transport : stations et services ouverts en novembre 2026. Les établissements comptent seulement là où se trouve leur campus principal; les collèges sont les collèges publics hors Québec.',
 rowcol:'Rangée : {r}. Colonne : {c}.',empty:'Case vide.',answered:'Réponse : {city}.',grid:'Grille de jeu',modeLbl:'Mode de jeu'},
es:{sub:'Edición ciudades · nombra una ciudad que cumpla ambas pistas',tabDaily:'Del día',tabArchive:'Archivo',tabFree:'Juego libre',howTitle:'Cómo jugar',
 how1:'Toca una casilla y nombra una ciudad que cumpla con su fila y su columna.',how2:'Cada edición tiene su propia lista de ciudades.',how3:'Tienes 9 intentos y cada ciudad solo se puede usar una vez.',
 how4:'La rareza es el porcentaje de jugadores que dieron la misma respuesta. Cuanto más baja, mejor; una respuesta única vale 1.',how5:'¿Te saltaste un día? Una protección de racha por semana mantiene viva tu racha.',
 level:'Nivel',easy:'Fácil',medium:'Medio',hard:'Difícil',mixed:'Mixta',newGrid:'Nueva cuadrícula',pickDate:'Fecha',archNote:'Las partidas del archivo no cuentan para las rachas ni para la clasificación del día.',
 dailyMeta:'Del día #{n} · {d} · {lvl}',archMeta:'Archivo #{n} · {d}',freeMeta:'Juego libre · {l}',players:'· {n} jugadores',player1:'· 1 jugador',
 guessesLeft:'intentos restantes',correct:'Aciertos',raritySoFar:'Rareza hasta ahora',rarityScore:'Puntaje de rareza',streak:'Racha',giveUp:'Rendirse',
 perfect:'Cuadrícula perfecta',closed:'Cuadrícula cerrada',outOf:'Sin intentos',endHelp:'Toca cualquier casilla para ver todas las respuestas válidas y cuántas veces se eligió cada una.',
 freezeLeft:'Protección de racha: 1 disponible esta semana.',freezeUsed:'Protección de racha: ya usada esta semana.',
 copy:'Copiar resultado',img:'Compartir imagen',copied:'Resultado copiado',copyBelow:'Copia el resultado de abajo',
 pickLabel:'Nombra una ciudad',ph:'Empieza a escribir…',close:'Cerrar',used:'ya usada',noCity:'No hay ninguna ciudad con ese nombre en el juego.',
 fits:'cumple',pickRate:'El {p} % de los jugadores la eligió.',estRate:'Alrededor del {p} % (estimado).',unique:'¡Única hasta ahora!',doesntFit:'no cumple.',
 nAnswers:'{n} respuestas',ansTitle:'{n} respuestas válidas, las más elegidas primero',ansReal:'Porcentajes de {n} jugadores.',ansEst:'Aún hay pocos jugadores, así que los porcentajes son en parte estimados.',you:'tu elección',
 guest:'Juegas como invitado. Inicia sesión para guardar tus puntajes y entrar en la clasificación.',connecting:'Conectando con el marcador…',
 unreach:'No se puede acceder al marcador ahora. Tu partida sigue guardada en este dispositivo.',readonly:'No se pudieron guardar tus puntajes. Cierra sesión, vuelve a entrar e inténtalo de nuevo.',
 signedAs:'Sesión iniciada como {name} · puntajes guardados',change:'Cambiar nombre de usuario',needName:'Ya iniciaste sesión. Elige un nombre de usuario para guardar tus puntajes en la clasificación.',create:'Crear perfil',
 uTitle:'Elige tu nombre de usuario',uHelp:'Tu nombre de usuario aparece en la clasificación con tus puntajes. Usa de 3 a 20 letras, números, guiones o guiones bajos.',uLabel:'Nombre de usuario',cancel:'Cancelar',uSave:'Guardar',
 badName:'Usa de 3 a 20 letras, números, guiones o guiones bajos, sin espacios.',taken:'Ese nombre ya está en uso. Prueba otro.',needSignIn:'Inicia sesión para crear un perfil.',saveFail:'No se pudo guardar. Inténtalo de nuevo en un momento.',nameSaved:'Nombre guardado',
 lbTitle:'Clasificación',today:'Hoy',allTime:'Histórico',cPlayer:'Jugador',cCorrect:'Aciertos',cRarity:'Rareza',cPlayed:'Partidas',cPerfect:'Perfectas',cAvg:'Rareza media',cStreak:'Racha',cUniq:'Únicas',
 lbNote:'Ordenado por aciertos y luego por menor rareza. Solo aparecen jugadores con nombre de usuario.',lbNoteAll:'Ordenado por cuadrículas perfectas y luego por menor rareza media. Solo aparecen jugadores con nombre de usuario.',
 lbEmptyToday:'Nadie con nombre de usuario ha terminado la cuadrícula de hoy.',lbEmptyAll:'Todavía no hay partidas terminadas.',lbSignIn:'Inicia sesión para ver la clasificación.',lbLoading:'Cargando la clasificación…',
 soon:'Próximamente',plusText:'Apoya Citydoku y obtén extras.',plus1:'Archivo completo desde el primer día',plus2:'Estadísticas detalladas e historial de respuestas',plus3:'Dos protecciones de racha por semana',plus4:'Sin anuncios',notify:'Avísame',notified:'Te avisaremos cuando salga Citydoku+.',notifyGuest:'Inicia sesión para recibir el aviso.',
 imgTitle:'Tu imagen de resultado',imgHelp:'En el teléfono también puedes mantener presionada la imagen para guardarla.',imgSave:'Guardar imagen',igHelp:'Guarda la imagen, abre Instagram y agrégala a tu historia o a una publicación. En el teléfono también puedes mantener presionada la imagen para guardarla.',imgSaved:'Imagen guardada',imgLine:'¿Puedes superar mi cuadrícula?',shareOn:'Compartir en',built:'Hecho en Canadá',signIn:'Iniciar sesión',delAcct:'Eliminar cuenta',signOut:'Cerrar sesión',remNative:'Recordatorio diario a las {t}.',
 pickCountry:'Elige un país',inDev:'En desarrollo',previewCap:'Cuadrícula de ejemplo · aún no se puede jugar',soonCitiesH:'Qué cuenta como ciudad',soonCatsH:'Ideas de categorías',soonDataH:'Fuentes de datos',suggest:'Sugerir una categoría',playCa:'Juega a Canadoku mientras tanto',edSoon:'pronto',subOther:'Edición {name} · próximamente',
 fbBtn:'Enviar comentarios o una corrección',fbReport:'Reportar un problema con esta casilla',fbTitle:'Enviar comentarios',fbHelp:'¿Viste una respuesta incorrecta, una ciudad que falta o una mala traducción? Cuéntanos y lo corregimos.',fbTypeL:'¿De qué se trata?',fbT1:'Respuesta incorrecta o corrección de datos',fbT2:'Ciudad faltante',fbT3:'Traducción',fbT4:'Algo no funciona',fbT5:'Idea o sugerencia',fbT6:'Otro',fbCityL:'Ciudad (opcional)',fbMsgL:'Detalles',fbSend:'Enviar',fbEmpty:'Agrega algunas palabras sobre el problema.',fbThanks:'¡Gracias! Enviamos tus comentarios.',fbGuest:'Inicia sesión para enviar comentarios.',fbCtx:'Incluiremos: {ctx}',newTab:'se abre en una pestaña nueva',
 rowcol:'Fila: {r}. Columna: {c}.',empty:'Casilla vacía.',answered:'Respuesta: {city}.',grid:'Cuadrícula',modeLbl:'Modo de juego',
 mapTitle:'Tu cuadrícula en el mapa',mapHelp:'Los números siguen las casillas, de izquierda a derecha y de arriba abajo. Al terminar, los puntos grises muestran las demás respuestas válidas.',lgTitle:'Ligas de amigos',lgHelp:'Crea una liga, comparte el código y compara puntajes con amigos, tu clase o tu oficina.',lgEveryone:'Todos',lgCreate:'Crear una liga',lgJoin:'Unirse con un código',lgName:'Nombre de la liga',lgCode:'Código de la liga',lgCreateBtn:'Crear',lgJoinBtn:'Unirse',lgInvite:'Copiar invitación',lgCopied:'Invitación copiada: {code}',lgNotFound:'Ninguna liga usa ese código. Revísalo e inténtalo de nuevo.',lgJoined:'Te uniste a {name}',lgCreated:'Liga creada. Comparte el código {code} con tus amigos.',lgLeave:'Salir de la liga',lgLeft:'Saliste de la liga',lgNeedName:'Primero crea tu perfil para que tus amigos vean tu nombre.',lgShow:'Mostrar',lgNameErr:'Ponle a tu liga un nombre de 3 a 30 caracteres.',lgMembers:'{n} miembros',lgCodeIs:'Código: {code}',
 remTitle:'Recordatorios',remNext:'Próxima cuadrícula en {t}',remStreak:'Tu racha de {n} días termina a la medianoche (hora del Este) si no juegas hoy.',remCalL:'Hora del recordatorio diario',remCal:'Agregar a mi calendario',remHelp:'Guarda un archivo de calendario con un evento diario y una alerta. Ábrelo para agregar el recordatorio a Google Calendar, Calendario de Apple u Outlook. Los recordatorios por correo y notificaciones llegarán con la app de Citydoku.',remSaved:'Archivo de calendario guardado. Ábrelo para agregar el recordatorio.',remNoDl:'Aquí no se pueden guardar archivos. Pon una alarma diaria en tu teléfono.',remEvt:'Jugar la cuadrícula de Citydoku del día'}};
let LANG='en';try{const nl=(navigator.language||'').toLowerCase();LANG=localStorage.getItem('lang')||(nl.startsWith('fr')?'fr':nl.startsWith('es')?'es':'en')}catch(e){}
if(!['en','fr','es'].includes(LANG))LANG=(navigator.language||'').toLowerCase().startsWith('es')?'es':'en';
let PREFLANG=LANG;
const I18N_ED={global:{fr:{plusText:'Encourage Citydoku et obtiens des extras.',sub:'Édition mondiale · nomme une ville qui fitte avec les deux panneaux',how1:'Touche une case et nomme une ville n’importe où dans le monde qui correspond à sa rangée et à sa colonne.',how2:'Les villes sont les capitales nationales, les villes de plus d’un million d’habitants, ainsi que les villes hôtes des Jeux olympiques et de la Coupe du monde et celles des 100 aéroports les plus achalandés.',foot:'La rareté, c’est la part des joueurs qui ont choisi la même réponse dans une case. Villes et populations : GeoNames (ville proprement dite). Les hémisphères suivent les coordonnées de la ville. Métros : ouverts en novembre 2026. La Coupe du monde inclut le tournoi de 2026.'},es:{plusText:'Apoya Citydoku y obtén extras.',sub:'Edición mundial · nombra una ciudad que cumpla ambas pistas',how1:'Toca una casilla y nombra una ciudad de cualquier parte del mundo que cumpla con su fila y su columna.',how2:'Las ciudades son las capitales nacionales, las ciudades de más de un millón de habitantes y las sedes de Juegos Olímpicos, de Copas del Mundo y de los 100 aeropuertos con más tráfico.',foot:'La rareza es el porcentaje de jugadores que eligió la misma respuesta en una casilla. Ciudades y poblaciones: GeoNames (ciudad propiamente dicha). Los hemisferios siguen las coordenadas de la ciudad. Metros: abiertos en noviembre de 2026. La Copa del Mundo incluye el torneo de 2026.'},en:{plusText:'Support Citydoku and get extras.',sub:'Global edition · name a city that fits both signs',how1:'Tap a square and name a city anywhere in the world that matches both its row and its column.',how2:'Cities are every national capital and every city with 1 million+ people, plus Olympic and World Cup host cities and cities with one of the world’s 100 busiest airports (about 740 cities).',
 foot:'Rarity is the share of players who picked the same answer in that square. With few players, it’s blended with an estimate where bigger cities count as more common. Cities and populations: GeoNames (city proper, not metro area). Smaller cities are included when they hosted the Olympics or World Cup matches, or are served by one of the world’s 100 busiest airports. Hemispheres use the city’s coordinates. Metro systems: open as of November 2026. World Cup matches include the 2026 tournament; suburban stadiums count for the city they’re named after.'}},us:{fr:{plusText:'Encourage Citydoku et obtiens des extras.',sub:'Édition É.-U. · nomme une ville qui fitte avec les deux panneaux',how1:'Touche une case et nomme une ville américaine qui correspond à sa rangée et à sa colonne.',how2:'Les villes sont les municipalités de 50 000 habitants et plus (estimations du Census 2025), les capitales des États, Washington et les villes universitaires du Power 4 et de l’Ivy League.',foot:'La rareté, c’est la part des joueurs qui ont choisi la même réponse dans une case. Populations : US Census Bureau, estimations de juillet 2025, y compris les villes de Nouvelle-Angleterre et les townships du New Jersey. Équipes : saisons 2026 et 2026-2027; une équipe compte pour la ville de son nom et celle où elle joue.'},es:{plusText:'Apoya Citydoku y obtén extras.',sub:'Edición EE. UU. · nombra una ciudad que cumpla ambas pistas',how1:'Toca una casilla y nombra una ciudad de EE. UU. que cumpla con su fila y su columna.',how2:'Las ciudades son las localidades de 50 000 habitantes o más (estimaciones del Censo 2025), las capitales estatales, Washington D. C. y las ciudades universitarias del Power 4 y la Ivy League.',foot:'La rareza es el porcentaje de jugadores que eligió la misma respuesta en una casilla. Poblaciones: Oficina del Censo de EE. UU., estimaciones de julio de 2025, incluidas las ciudades de Nueva Inglaterra y los townships de Nueva Jersey. Equipos: temporadas 2026 y 2026-27; un equipo cuenta para la ciudad de su nombre y la ciudad donde juega.'},en:{plusText:'Support Citydoku and get extras.',sub:'USA edition · name a city that fits both signs',how1:'Tap a square and name a US city that matches both its row and its column.',how2:'Cities are incorporated places with 50,000+ people (Census 2025 estimates), plus every state capital, Washington, DC and the home towns of Power 4 and Ivy League universities.',
 foot:'Rarity is the share of players who picked the same answer in that square. With few players, it’s blended with an estimate where bigger cities count as more common. Populations: US Census Bureau, July 2025 estimates (SUB-IP-EST2025); a few small capitals and college towns use the 2020 Census. Teams: 2026 and 2026–27 seasons; a team counts for the city in its name and the city where it plays. Transit, Amtrak and hubs: as of November 2026. Universities count where their main campus is. New England towns and New Jersey townships with 50,000+ people are included from the Census minor civil division estimates.'}}};
const T=(k,v={})=>(I18N_ED[ED]?.[LANG]?.[k]??I18N[LANG][k]??I18N.en[k]??k).replace(/\{(\w+)\}/g,(_,x)=>v[x]??'');
const L=(en,fr)=>LANG==='fr'?fr:en;
const fmt=n=>n.toLocaleString(LANG==='fr'?'fr-CA':LANG==='es'?'es-MX':'en-CA');
const PROV={en:{ON:'Ontario',QC:'Quebec',BC:'British Columbia',AB:'Alberta',SK:'Saskatchewan',MB:'Manitoba',NB:'New Brunswick',NS:'Nova Scotia',PE:'Prince Edward Island',NL:'Newfoundland and Labrador',YT:'Yukon',NT:'Northwest Territories',NU:'Nunavut'},
 fr:{ON:'Ontario',QC:'Québec',BC:'Colombie-Britannique',AB:'Alberta',SK:'Saskatchewan',MB:'Manitoba',NB:'Nouveau-Brunswick',NS:'Nouvelle-Écosse',PE:'Île-du-Prince-Édouard',NL:'Terre-Neuve-et-Labrador',YT:'Yukon',NT:'Territoires du Nord-Ouest',NU:'Nunavut'}};
const USST={AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',DC:'District of Columbia',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming'};
const PV=p=>ED==='us'?stName(p):ED==='global'?(ctryName({p,cn:GLC[p]})):PROV[LANG]?.[p]??PROV.en[p];
const inProv=c=>L('in ','au ')+PV(c.p)+(c.p2?L(' and ',' et ')+PV(c.p2):'');
const lg=(c,l)=>c.t.filter(t=>t[1]===l);
const teamFact=(c,ls)=>{const t=c.t.filter(x=>ls.includes(x[1]));return t.length?t.map(x=>x[0]).join(', '):L('none','aucune')};
const letters=s=>s.replace(/\(.*\)/,'').normalize('NFD').replace(/[^A-Za-z]/g,'');
const yn=(v,en1,en0,fr1,fr0)=>v?L(en1,fr1):L(en0,fr0);
const col_=(en,fr)=>L(en+': ',fr+' : ');
// Category definitions: g = group (a group only ever appears on one axis), w = draw weight, k/l = [en, fr]
const C=(id,g,k,l,w,f,why)=>({id,g,k,l,w,f,why});
const CATS_CA=[
 ...['ON','QC','BC','AB','SK','MB','NB','NS','NL','PE'].map(p=>C(p,'prov',['Province','Province'],[PROV.en[p],PROV.fr[p]],['ON','QC','BC','AB'].includes(p)?3:1.2,c=>c.p===p||c.p2===p,inProv)),
 C('ATL','prov',['Region','Région'],['Atlantic Canada','Provinces de l’Atlantique'],1.5,c=>['NB','NS','PE','NL'].includes(c.p),inProv),
 C('PRA','prov',['Region','Région'],['The Prairies','Les Prairies'],1.5,c=>['AB','SK','MB'].includes(c.p)||['AB','SK','MB'].includes(c.p2),inProv),
 C('p1','pop',['Population','Population'],['Under 25,000','Moins de 25 000'],1.5,c=>c.pop<25000,c=>'pop. '+fmt(c.pop)),
 C('p2','pop',['Population','Population'],['25,000 to 75,000','De 25 000 à 75 000'],1.2,c=>c.pop>=25000&&c.pop<75000,c=>'pop. '+fmt(c.pop)),
 C('p3','pop',['Population','Population'],['Over 100,000','Plus de 100 000'],1.5,c=>c.pop>100000,c=>'pop. '+fmt(c.pop)),
 C('p4','pop',['Population','Population'],['Over 250,000','Plus de 250 000'],.8,c=>c.pop>250000,c=>'pop. '+fmt(c.pop)),
 C('oc','geo',['Geography','Géographie'],['On the ocean coast','Sur la côte océanique'],1.5,c=>!!c.o,c=>yn(c.o,'on the coast','not on an ocean coast','sur la côte','pas sur la côte océanique')),
 C('gl','geo',['Geography','Géographie'],['On a Great Lake','Au bord d’un Grand Lac'],1.5,c=>!!c.gl,c=>yn(c.gl,'on a Great Lake','not on a Great Lake','au bord d’un Grand Lac','pas au bord d’un Grand Lac')),
 C('sl','geo',['Geography','Géographie'],['On the St. Lawrence','Au bord du Saint-Laurent'],1,c=>!!c.sl,c=>yn(c.sl,'on the St. Lawrence','not on the St. Lawrence','au bord du Saint-Laurent','pas au bord du Saint-Laurent')),
 C('cap','cap',['Status','Statut'],['A capital city','Une capitale'],1,c=>!!c.cap,c=>yn(c.cap,'a capital','not a capital','une capitale','pas une capitale')),
 C('nhl','sport',['Sports','Sports'],['NHL team','Équipe de la LNH'],.7,c=>lg(c,'NHL').length>0,c=>col_('NHL','LNH')+teamFact(c,['NHL'])),
 C('cfl','sport',['Sports','Sports'],['CFL team','Équipe de la LCF'],.7,c=>lg(c,'CFL').length>0,c=>col_('CFL','LCF')+teamFact(c,['CFL'])),
 C('ahl','sport',['Sports','Sports'],['AHL or ECHL team','Équipe de la LAH ou de l’ECHL'],.7,c=>c.t.some(t=>t[1]==='AHL'||t[1]==='ECHL'),c=>col_('AHL/ECHL','LAH/ECHL')+teamFact(c,['AHL','ECHL'])),
 C('pwhl','sport',['Sports','Sports'],['PWHL team','Équipe de la LPHF'],.4,c=>lg(c,'PWHL').length>0,c=>col_('PWHL','LPHF')+teamFact(c,['PWHL'])),
 C('chl','sport',['WHL · OHL · QMJHL','WHL · OHL · LHJMQ'],['Major junior hockey team','Équipe de hockey junior majeur'],2,c=>c.t.some(t=>['WHL','OHL','QMJHL'].includes(t[1])),c=>col_('Major junior','Junior majeur')+teamFact(c,['WHL','OHL','QMJHL'])),
 C('whl','sport',['Hockey','Hockey'],['WHL team','Équipe de la WHL'],.8,c=>lg(c,'WHL').length>0,c=>col_('WHL','WHL')+teamFact(c,['WHL'])),
 C('ohl','sport',['Hockey','Hockey'],['OHL team','Équipe de l’OHL'],.8,c=>lg(c,'OHL').length>0,c=>col_('OHL','OHL')+teamFact(c,['OHL'])),
 C('qmj','sport',['Hockey','Hockey'],['QMJHL team','Équipe de la LHJMQ'],.8,c=>lg(c,'QMJHL').length>0,c=>col_('QMJHL','LHJMQ')+teamFact(c,['QMJHL'])),
 C('pro','sport',['NHL · AHL · ECHL · PWHL','LNH · LAH · ECHL · LPHF'],['Pro hockey team','Équipe de hockey professionnel'],1,c=>c.t.some(t=>['NHL','AHL','ECHL','PWHL'].includes(t[1])),c=>col_('Pro hockey','Hockey pro')+teamFact(c,['NHL','AHL','ECHL','PWHL'])),
 C('fnhl','sport',['NHL history','Histoire de la LNH'],['Lost an NHL team','A perdu une équipe de la LNH'],.6,c=>c.fn.length>0,c=>c.fn.length?col_('Former NHL','Ancienne équipe de la LNH')+c.fn.join(', '):L('no former NHL team','aucune ancienne équipe de la LNH')),
 C('nott','sport',['Sports','Sports'],['No pro or major junior team','Aucune équipe pro ou junior majeur'],1.2,c=>c.t.length===0,c=>c.t.length?L('has ','a ')+c.t.map(x=>x[0]).join(', '):L('no teams','aucune équipe')),
 C('um','edu',['Education','Éducation'],['Home to a university','Siège d’une université'],2,c=>c.u.length>0,c=>c.u.length?col_('Universities','Universités')+c.u.join(', '):L('no university main campus','aucun campus principal d’université')),
 C('u2','edu',['Education','Éducation'],['Two or more universities','Deux universités ou plus'],.7,c=>c.u.length>=2,c=>c.u.length+' '+L(c.u.length===1?'university':'universities',c.u.length===1?'université':'universités')),
 C('co','edu',['Education','Éducation'],['Home to a public college','Siège d’un collège public'],1.5,c=>c.co.length>0,c=>c.co.length?col_('Colleges','Collèges')+c.co.join(', '):L('no public college main campus','aucun campus principal de collège public')),
 C('ce','edu',['Education','Éducation'],['Home to a CEGEP','Siège d’un cégep'],1,c=>c.ce.length>0,c=>c.ce.length?col_('CEGEPs','Cégeps')+c.ce.join(', '):L('no CEGEP main campus','aucun campus principal de cégep')),
 C('nops','edu',['Education','Éducation'],['No university, college or CEGEP','Ni université, ni collège, ni cégep'],1,c=>!c.u.length&&!c.co.length&&!c.ce.length,c=>(c.u.length+c.co.length+c.ce.length)?L('has a post-secondary main campus','a un campus principal postsecondaire'):L('no main campuses','aucun campus principal')),
 C('rt','transit',['Transit','Transport'],['Rapid transit station','Station de métro ou de train léger'],1,c=>!!c.rt,c=>yn(c.rt,'has a rapid transit station','no rapid transit station','a une station de métro ou de train léger','aucune station de métro ou de train léger')),
 C('cr','transit',['Transit','Transport'],['Commuter rail or REM station','Gare de train de banlieue ou du REM'],1.3,c=>!!c.cr,c=>yn(c.cr,'has a commuter rail or REM station','no commuter rail or REM station','a une gare de train de banlieue ou du REM','aucune gare de train de banlieue ni du REM')),
 C('via','transit',['Transit','Transport'],['VIA Rail station','Gare de VIA Rail'],1.5,c=>!!c.via,c=>yn(c.via,'has a VIA Rail station','no VIA Rail station','a une gare de VIA Rail','aucune gare de VIA Rail')),
 C('cn','transit',['VIA Rail','VIA Rail'],['Stop on The Canadian','Arrêt du Canadien'],.6,c=>!!c.cn,c=>yn(c.cn,'a stop on The Canadian','not a stop on The Canadian','un arrêt du Canadien','pas un arrêt du Canadien')),
 C('fe','transit',['Transit','Transport'],['Ferry terminal','Terminal de traversier'],1.2,c=>!!c.fe,c=>yn(c.fe,'has a ferry terminal','no ferry terminal','a un terminal de traversier','aucun terminal de traversier')),
 C('ap','transit',['Transit','Transport'],['International airport','Aéroport international'],1,c=>!!c.ap,c=>yn(c.ap,'has an international airport','no international airport','a un aéroport international','aucun aéroport international')),
 C('tch','transit',['Highway','Route'],['On the Trans-Canada Highway','Sur la Transcanadienne'],1.5,c=>!!c.tch,c=>yn(c.tch,'on the Trans-Canada','not on the Trans-Canada','sur la Transcanadienne','pas sur la Transcanadienne')),
 C('st','name',['Name','Nom'],['Starts with Saint, Sainte or St.','Commence par Saint, Sainte ou St.'],1,c=>/^(saint|sainte|st\.?)[\s-]/i.test(c.n),c=>L(`“${c.n}”`,`« ${c.n} »`)),
 C('hy','name',['Name','Nom'],['Hyphenated name','Nom avec trait d’union'],1,c=>c.n.replace(/\(.*\)/,'').includes('-'),c=>L(`“${c.n}”`,`« ${c.n} »`)),
 C('sh','name',['Name','Nom'],['Six letters or fewer','Six lettres ou moins'],1,c=>letters(c.n).length<=6,c=>L(`“${c.n}” has ${letters(c.n).length} letters`,`« ${c.n} » a ${letters(c.n).length} lettres`)),
];

// ---------- USA + Global categories (EN / FR / ES) ----------
const LI=()=>LANG==='fr'?1:LANG==='es'?2:0;
const W=(en,fr,es)=>[en,fr??en,es??en][LI()];
const A=x=>Array.isArray(x)?x:[x,x,x];
const U=(id,g,k,l,w,f,why,rare)=>({id,g,k:A(k),l:A(l),w,f,why,rare:!!rare});
const USST_FR={CA:'Californie',NC:'Caroline du Nord',SC:'Caroline du Sud',PA:'Pennsylvanie',VA:'Virginie',GA:'Géorgie',FL:'Floride',LA:'Louisiane',HI:'Hawaï',NM:'Nouveau-Mexique',WV:'Virginie-Occidentale',ND:'Dakota du Nord',SD:'Dakota du Sud',DC:'District de Columbia',WA:'État de Washington'};
const USST_ES={CA:'California',NC:'Carolina del Norte',SC:'Carolina del Sur',PA:'Pensilvania',NY:'Nueva York',NJ:'Nueva Jersey',LA:'Luisiana',MO:'Misuri',OR:'Oregón',MI:'Míchigan',HI:'Hawái',NM:'Nuevo México',WV:'Virginia Occidental',ND:'Dakota del Norte',SD:'Dakota del Sur',NH:'Nuevo Hampshire',MS:'Misisipi',DC:'Distrito de Columbia'};
const stName=(s,li)=>[USST[s],USST_FR[s]||USST[s],USST_ES[s]||USST[s]][li??LI()];
const usTeams=(c,ls)=>{const t=c.t.filter(x=>ls.includes(x[1]));return t.length?t.map(x=>x[0]).join(', '):W('none','aucune','ninguno')};
const MAJ=['NFL','NBA','MLB','NHL','MLS','WNBA'],BIG4=['NFL','NBA','MLB','NHL'];
const LGN={NFL:['NFL','NFL','NFL'],NBA:['NBA','NBA','NBA'],MLB:['MLB','MLB','MLB'],NHL:['NHL','LNH','NHL'],MLS:['MLS','MLS','MLS'],WNBA:['WNBA','WNBA','WNBA']};
const usIn=c=>W('in ','en ','en ')+stName(c.p);
const yes=(v,en1,en0,fr1,fr0,es1,es0)=>v?W(en1,fr1,es1):W(en0,fr0,es0);
const NS=['I-5','I-35','I-75','I-95'],EW=['I-10','I-40','I-80','I-90'];
const hwyFact=(c,list)=>{const h=c.hw.filter(x=>list.includes(x));return h.length?W('on ','sur ','en la ')+h.join(', '):W('not on ','pas sur ','no está en ')+list.join(', ')};
const US_STATES=['CA','TX','FL','NJ','IL','MA','WA','MI','NC','IN','AZ','GA','MN','CT','CO','TN','UT','OH','NY','MO','VA','OR','WI','IA','PA'];
const REGN={Northeast:['The Northeast','Le Nord-Est','El Noreste'],Midwest:['The Midwest','Le Midwest','El Medio Oeste'],South:['The South','Le Sud','El Sur'],West:['The West','L’Ouest','El Oeste']};
const TZN={Eastern:['Eastern Time','Heure de l’Est','Hora del Este'],Central:['Central Time','Heure du Centre','Hora del Centro'],Mountain:['Mountain Time','Heure des Rocheuses','Hora de la Montaña'],Pacific:['Pacific Time','Heure du Pacifique','Hora del Pacífico'],Alaska:['Alaska Time','Heure de l’Alaska','Hora de Alaska'],Hawaii:['Hawaii Time','Heure d’Hawaï','Hora de Hawái']};
const KK={state:['State','État','Estado'],region:['Region','Région','Región'],pop:['Population','Population','Población'],status:['Status','Statut','Estatus'],geo:['Geography','Géographie','Geografía'],tz:['Time zone','Fuseau horaire','Huso horario'],sports:['Sports','Sports','Deportes'],hist:['Sports history','Histoire sportive','Historia deportiva'],college:['College','Université','Universidad'],transit:['Transit','Transport','Transporte'],air:['Air travel','Aviation','Aviación'],hwy:['Highway','Autoroute','Carretera'],name:['Name','Nom','Nombre'],cont:['Continent','Continent','Continente'],ctry:['Country','Pays','País'],hemi:['Hemisphere','Hémisphère','Hemisferio'],oly:['Olympics','Jeux olympiques','Juegos Olímpicos'],foot:['Football','Soccer','Fútbol'],her:['Heritage','Patrimoine','Patrimonio']};
const popW=c=>W('pop. ','pop. ','pob. ')+fmt(c.pop);
const CATS_US=[
 ...US_STATES.map(s=>U('u_'+s,'prov',KK.state,[stName(s,0),stName(s,1),stName(s,2)],['CA','TX','FL'].includes(s)?3:['NJ','IL','MA','WA'].includes(s)?1.6:1.1,c=>c.p===s,usIn)),
 ...Object.entries(REGN).map(([r,l])=>U('u_r'+r,'prov',KK.region,l,1.4,c=>c.reg===r,c=>REGN[c.reg][LI()])),
 U('u_p1','pop',KK.pop,['Under 75,000','Moins de 75 000','Menos de 75 000'],1.5,c=>c.pop<75000,popW),
 U('u_p2','pop',KK.pop,['75,000 to 150,000','De 75 000 à 150 000','De 75 000 a 150 000'],1.3,c=>c.pop>=75000&&c.pop<150000,popW),
 U('u_p3','pop',KK.pop,['Over 250,000','Plus de 250 000','Más de 250 000'],1.4,c=>c.pop>250000,popW),
 U('u_p4','pop',KK.pop,['Over 1 million','Plus d’un million','Más de 1 millón'],.4,c=>c.pop>=1000000,popW,1),
 U('u_cap','cap',KK.status,['State capital','Capitale d’État','Capital estatal'],1,c=>!!c.cap,c=>c.cap==='national'?W('the national capital','la capitale nationale','la capital nacional'):yes(c.cap,'a state capital','not a capital','une capitale d’État','pas une capitale','una capital estatal','no es capital')),
 U('u_pac','geo',KK.geo,['On the Pacific coast','Sur la côte du Pacifique','En la costa del Pacífico'],1.2,c=>!!c.pac,c=>yes(c.pac,'on the Pacific','not on the Pacific','sur le Pacifique','pas sur le Pacifique','en el Pacífico','no está en el Pacífico')),
 U('u_atl','geo',KK.geo,['On the Atlantic coast','Sur la côte atlantique','En la costa atlántica'],1.2,c=>!!c.atl,c=>yes(c.atl,'on the Atlantic','not on the Atlantic','sur l’Atlantique','pas sur l’Atlantique','en el Atlántico','no está en el Atlántico')),
 U('u_gulf','geo',KK.geo,['On the Gulf coast','Sur la côte du golfe','En la costa del Golfo'],.9,c=>!!c.gulf,c=>yes(c.gulf,'on the Gulf','not on the Gulf','sur le golfe','pas sur le golfe','en el Golfo','no está en el Golfo')),
 U('u_gl','geo',KK.geo,['On a Great Lake','Au bord d’un Grand Lac','A orillas de un Gran Lago'],.9,c=>!!c.gl,c=>yes(c.gl,'on a Great Lake','not on a Great Lake','au bord d’un Grand Lac','pas au bord d’un Grand Lac','a orillas de un Gran Lago','no está en un Gran Lago')),
 U('u_miss','geo',KK.geo,['On the Mississippi River','Au bord du Mississippi','A orillas del Misisipi'],.7,c=>!!c.miss,c=>yes(c.miss,'on the Mississippi','not on the Mississippi','au bord du Mississippi','pas au bord du Mississippi','a orillas del Misisipi','no está en el Misisipi'),1),
 ...['Eastern','Central','Mountain','Pacific'].map(z=>U('u_tz'+z,'tz',KK.tz,TZN[z],z==='Mountain'?1:1.3,c=>c.tz===z,c=>TZN[c.tz][LI()])),
 ...MAJ.map(l=>U('u_'+l,'sport',KK.sports,[l+' team','Équipe de la '+LGN[l][1],'Equipo de la '+l],['NFL','NBA','MLB'].includes(l)?.8:.6,c=>c.t.some(x=>x[1]===l),c=>LGN[l][LI()]+' : '.slice(LI()===1?0:1)+usTeams(c,[l]),l==='WNBA')),
 U('u_any','sport',['NFL·NBA·MLB·NHL·MLS·WNBA','NFL·NBA·MLB·LNH·MLS·WNBA','NFL·NBA·MLB·NHL·MLS·WNBA'],['Major-league team','Équipe des ligues majeures','Equipo de ligas mayores'],1.5,c=>c.t.length>0,c=>c.t.length?c.t.map(x=>x[0]).join(', '):W('no major-league team','aucune équipe des ligues majeures','sin equipo de ligas mayores')),
 U('u_big4','sport',['NFL · NBA · MLB · NHL','NFL · NBA · MLB · LNH','NFL · NBA · MLB · NHL'],['Teams in all four big leagues','Équipes dans les quatre grandes ligues','Equipos en las cuatro grandes ligas'],.3,c=>BIG4.every(l=>c.t.some(x=>x[1]===l)),c=>[...new Set(c.t.map(x=>x[1]))].join(', ')||W('none','aucune','ninguno'),1),
 U('u_lost','sport',KK.hist,['Lost a major-league team','A perdu une équipe des ligues majeures','Perdió un equipo de ligas mayores'],.8,c=>c.lost.length>0,c=>c.lost.length?W('lost: ','a perdu : ','perdió: ')+c.lost.map(x=>x.split(' (')[0]).join(', '):W('never lost a team','n’a jamais perdu d’équipe','nunca perdió un equipo')),
 U('u_none','sport',KK.sports,['No major-league team','Aucune équipe des ligues majeures','Sin equipo de ligas mayores'],1.3,c=>c.t.length===0,c=>c.t.length?c.t.map(x=>x[0]).join(', '):W('no major-league team','aucune équipe des ligues majeures','sin equipo de ligas mayores')),
 U('u_p4u','edu',['SEC · Big Ten · Big 12 · ACC','SEC · Big Ten · Big 12 · ACC','SEC · Big Ten · Big 12 · ACC'],['Power 4 university','Université du Power 4','Universidad del Power 4'],1.6,c=>c.p4.length>0,c=>c.p4.length?c.p4.map(x=>x[0]).join(', '):W('no Power 4 main campus','aucun campus principal du Power 4','sin campus principal del Power 4')),
 ...['SEC','Big Ten','Big 12','ACC'].map(cf=>U('u_'+cf.replace(' ',''),'edu',KK.college,[cf+' university','Université de la '+cf,'Universidad de la '+cf],.7,c=>c.p4.some(x=>x[1]===cf),c=>c.p4.length?c.p4.map(x=>x[0]+' ('+x[1]+')').join(', '):W('no Power 4 main campus','aucun campus principal du Power 4','sin campus principal del Power 4'),1)),
 U('u_ivy','edu',KK.college,['Ivy League university','Université de l’Ivy League','Universidad de la Ivy League'],.4,c=>c.ivy.length>0,c=>c.ivy.length?c.ivy.join(', '):W('no Ivy League campus','aucun campus de l’Ivy League','sin campus de la Ivy League'),1),
 U('u_am','transit',KK.transit,['Amtrak station','Gare Amtrak','Estación de Amtrak'],1.5,c=>!!c.am,c=>yes(c.am,'has an Amtrak station','no Amtrak station','a une gare Amtrak','aucune gare Amtrak','tiene estación de Amtrak','sin estación de Amtrak')),
 U('u_rt','transit',['Subway · light rail','Métro · train léger','Metro · tren ligero'],['Rapid transit station','Station de transport rapide','Estación de transporte rápido'],1.1,c=>!!c.rt,c=>yes(c.rt,'has a rapid transit station','no rapid transit station','a une station de métro ou de train léger','aucune station de métro ni de train léger','tiene metro o tren ligero','sin metro ni tren ligero')),
 U('u_cr','transit',KK.transit,['Commuter rail station','Gare de train de banlieue','Estación de tren de cercanías'],1.1,c=>!!c.cr,c=>yes(c.cr,'has a commuter rail station','no commuter rail station','a une gare de train de banlieue','aucune gare de train de banlieue','tiene tren de cercanías','sin tren de cercanías')),
 U('u_hub','transit',KK.air,['Airline hub','Plaque tournante aérienne','Centro de conexiones aéreo'],.8,c=>c.hub.length>0,c=>c.hub.length?W('hub for ','plaque tournante de ','centro de conexiones de ')+c.hub.join(', '):W('not an airline hub','pas une plaque tournante','no es centro de conexiones')),
 U('u_ns','hwy',['I-5 · I-35 · I-75 · I-95','I-5 · I-35 · I-75 · I-95','I-5 · I-35 · I-75 · I-95'],['Major north–south interstate','Grande autoroute nord-sud','Gran autopista norte-sur'],1.3,c=>c.hw.some(x=>NS.includes(x)),c=>hwyFact(c,NS)),
 U('u_ew','hwy',['I-10 · I-40 · I-80 · I-90','I-10 · I-40 · I-80 · I-90','I-10 · I-40 · I-80 · I-90'],['Major east–west interstate','Grande autoroute est-ouest','Gran autopista este-oeste'],1.3,c=>c.hw.some(x=>EW.includes(x)),c=>hwyFact(c,EW)),
 U('u_r66','hwy',KK.hwy,['On historic Route 66','Sur la Route 66 historique','En la histórica Ruta 66'],.8,c=>!!c.r66,c=>yes(c.r66,'on Route 66','not on Route 66','sur la Route 66','pas sur la Route 66','en la Ruta 66','no está en la Ruta 66')),
 U('u_san','name',KK.name,['Starts with San or Santa','Commence par San ou Santa','Empieza con San o Santa'],.8,c=>/^(San|Santa) /.test(c.n),c=>`“${c.n}”`),
 U('u_ville','name',KK.name,['Ends in -ville','Se termine par -ville','Termina en -ville'],.7,c=>/ville$/.test(c.n),c=>`“${c.n}”`),
 U('u_dup','name',KK.name,['Shares its name with a city in another state','Même nom qu’une ville d’un autre État','Comparte nombre con una ciudad de otro estado'],1,c=>!!c.dn,c=>yes(c.dn,`another “${c.n}” is in the game`,`the only “${c.n}”`,`un autre « ${c.n} » est dans le jeu`,`le seul « ${c.n} »`,`hay otra “${c.n}” en el juego`,`la única “${c.n}”`)),
 U('u_two','name',KK.name,['Name of two or more words','Nom de deux mots ou plus','Nombre de dos o más palabras'],.8,c=>c.n.trim().includes(' '),c=>`“${c.n}”`),
];
// ---------- Global categories ----------
let DN=null;const ctryName=c=>{try{if(LANG==='en')return c.cn;DN=DN&&DN.l===LANG?DN:{l:LANG,d:new Intl.DisplayNames([LANG],{type:'region'})};return DN.d.of(c.p)||c.cn}catch(e){return c.cn}};
const CONTN={Asia:['Asia','Asie','Asia'],Europe:['Europe','Europe','Europa'],Africa:['Africa','Afrique','África'],'North America':['North America','Amérique du Nord','América del Norte'],'South America':['South America','Amérique du Sud','América del Sur'],Oceania:['Oceania','Océanie','Oceanía']};
const glIn=c=>W('in ','au/en ','en ').replace('au/en ','')+ctryName(c)+' ('+CONTN[c.cont][LI()]+')';
const GL_CTRY=[['CN',['China','Chine','China']],['IN',['India','Inde','India']],['US',['United States','États-Unis','Estados Unidos']],['ID',['Indonesia','Indonésie','Indonesia']],['BR',['Brazil','Brésil','Brasil']],['RU',['Russia','Russie','Rusia']],['MX',['Mexico','Mexique','México']],['JP',['Japan','Japon','Japón']],['DE',['Germany','Allemagne','Alemania']],['NG',['Nigeria','Nigeria','Nigeria']],['ES',['Spain','Espagne','España']],['FR',['France','France','Francia']],['IT',['Italy','Italie','Italia']],['KR',['South Korea','Corée du Sud','Corea del Sur']],['PK',['Pakistan','Pakistan','Pakistán']],['TR',['Turkey','Turquie','Turquía']],['SE',['Sweden','Suède','Suecia']],['GB',['United Kingdom','Royaume-Uni','Reino Unido']]];
const lat=c=>(c.lat>=0?c.lat.toFixed(1)+'°N':(-c.lat).toFixed(1)+'°S'),lon=c=>(c.lon>=0?c.lon.toFixed(1)+'°E':(-c.lon).toFixed(1)+'°W');
const CATS_GL=[
 ...Object.keys(CONTN).map(k=>U('g_'+k.replace(' ',''),'prov',KK.cont,CONTN[k],k==='Asia'?2:k==='Oceania'?.6:1.6,c=>c.cont===k,glIn)),
 ...GL_CTRY.map(([cc,nm])=>U('g_'+cc,'prov',KK.ctry,nm,cc==='CN'||cc==='IN'||cc==='US'?1.2:.6,c=>c.p===cc,glIn)),
 U('g_cap','cap',KK.status,['National capital','Capitale nationale','Capital nacional'],1.6,c=>!!c.cap,c=>c.cap?W('capital of ','capitale : ','capital de ')+ctryName(c):W('not a national capital','pas une capitale nationale','no es capital nacional')),
 U('g_p0','pop',KK.pop,['Under 1 million','Moins d’un million','Menos de 1 millón'],1,c=>c.pop<1000000,popW),
 U('g_p1','pop',KK.pop,['1 to 3 million','De 1 à 3 millions','De 1 a 3 millones'],1.3,c=>c.pop>=1000000&&c.pop<3000000,popW),
 U('g_p2','pop',KK.pop,['Over 5 million','Plus de 5 millions','Más de 5 millones'],1.3,c=>c.pop>5000000,popW),
 U('g_p3','pop',KK.pop,['Over 10 million','Plus de 10 millions','Más de 10 millones'],.6,c=>c.pop>10000000,popW,1),
 U('g_oc','geo',KK.geo,['On the ocean coast','Sur la côte océanique','En la costa del océano'],1.6,c=>!!c.oc,c=>yes(c.oc,'on the coast','not on the ocean coast','sur la côte','pas sur la côte','en la costa','no está en la costa')),
 U('g_hi','geo',KK.geo,['Above 1,000 m elevation','Plus de 1 000 m d’altitude','A más de 1000 m de altitud'],1,c=>!!c.hi,c=>yes(c.hi,'above 1,000 m','below 1,000 m','au-dessus de 1 000 m','sous 1 000 m','a más de 1000 m','a menos de 1000 m')),
 U('g_bs','geo',KK.geo,['Below sea level','Sous le niveau de la mer','Bajo el nivel del mar'],.2,c=>!!c.bs,c=>yes(c.bs,'at least partly below sea level','above sea level','au moins en partie sous le niveau de la mer','au-dessus du niveau de la mer','al menos en parte bajo el nivel del mar','sobre el nivel del mar'),1),
 U('g_N','hemi',KK.hemi,['Northern Hemisphere','Hémisphère Nord','Hemisferio norte'],.8,c=>c.lat>=0,lat),
 U('g_S','hemi',KK.hemi,['Southern Hemisphere','Hémisphère Sud','Hemisferio sur'],1.2,c=>c.lat<0,lat),
 U('g_E','hemi',KK.hemi,['Eastern Hemisphere','Hémisphère Est','Hemisferio oriental'],.8,c=>c.lon>=0,lon),
 U('g_W','hemi',KK.hemi,['Western Hemisphere','Hémisphère Ouest','Hemisferio occidental'],1.2,c=>c.lon<0,lon),
 U('g_so','event',KK.oly,['Hosted the Summer Olympics','A accueilli les Jeux d’été','Sede de Juegos Olímpicos de verano'],1,c=>c.so.length>0,c=>c.so.length?W('Summer Olympics ','Jeux d’été ','Juegos de verano ')+c.so.join(', '):W('never hosted the Summer Olympics','n’a jamais accueilli les Jeux d’été','nunca fue sede de los Juegos de verano')),
 U('g_wo','event',KK.oly,['Hosted the Winter Olympics','A accueilli les Jeux d’hiver','Sede de Juegos Olímpicos de invierno'],.6,c=>c.wo.length>0,c=>c.wo.length?W('Winter Olympics ','Jeux d’hiver ','Juegos de invierno ')+c.wo.join(', '):W('never hosted the Winter Olympics','n’a jamais accueilli les Jeux d’hiver','nunca fue sede de los Juegos de invierno')),
 U('g_wc','event',KK.foot,['Hosted FIFA World Cup matches','A accueilli des matchs de la Coupe du monde','Sede de partidos del Mundial'],1.4,c=>c.wc.length>0,c=>c.wc.length?W('World Cup ','Coupe du monde ','Mundial ')+c.wc.join(', '):W('no World Cup matches','aucun match de Coupe du monde','sin partidos del Mundial')),
 U('g_me','transit',KK.transit,['Has a metro or subway','A un métro','Tiene metro'],1.5,c=>!!c.me,c=>yes(c.me,'has a metro','no metro','a un métro','pas de métro','tiene metro','sin metro')),
 U('g_un','heritage',KK.her,['UNESCO World Heritage Site','Site du patrimoine mondial de l’UNESCO','Patrimonio de la Humanidad (UNESCO)'],1.4,c=>c.un.length>0,c=>c.un.length?'UNESCO: '+c.un.join('; '):W('no World Heritage Site in the city','aucun site du patrimoine mondial dans la ville','sin sitio del patrimonio mundial en la ciudad')),
 U('g_san','name',KK.name,['Starts with San, Santa, São or Saint','Commence par San, Santa, São ou Saint','Empieza con San, Santa, São o Saint'],.4,c=>/^(San|Santa|São|Saint|St\.?|Sankt) /.test(c.n),c=>`“${c.n}”`,1),
 U('g_abad','name',KK.name,['Ends in -abad or -pur','Se termine par -abad ou -pur','Termina en -abad o -pur'],.4,c=>/(abad|pur)$/i.test(c.n),c=>`“${c.n}”`,1),
 U('g_two','name',KK.name,['Name of two or more words','Nom de deux mots ou plus','Nombre de dos o más palabras'],.8,c=>/[ -]/.test(c.n.replace(/\(.*\)/,'').trim()),c=>`“${c.n}”`),
];
let CATS=CATS_CA;
let CAT=Object.fromEntries(CATS.map(c=>[c.id,c]));
const lab=id=>{const a=CAT[id].l;return a[LI()]??a[0]},kick=id=>{const a=CAT[id].k;return a[LI()]??a[0]};
// ---------- RNG + generator ----------
function hashStr(s){let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){let a=seed;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function pickW(r,arr){const s=arr.reduce((a,c)=>a+c.w,0);let x=r()*s;for(const c of arr){x-=c.w;if(x<=0)return c}return arr[arr.length-1]}
function answersFor(a,b){return CITIES.map((c,i)=>i).filter(i=>a.f(CITIES[i])&&b.f(CITIES[i]))}
function hasMatching(sets){const match=new Map();
  const tryCell=(ci,seen)=>{for(const x of sets[ci]){if(seen.has(x))continue;seen.add(x);if(!match.has(x)||tryCell(match.get(x),seen)){match.set(x,ci);return true}}return false};
  return sets.every((_,ci)=>tryCell(ci,new Set()))}
const NESTED=[['p3','p4'],['via','cn']];
const MIX_FROM='2026-11-08';const dailyLevel=ds=>ds>=MIX_FROM?'mixed':'medium';
const DIFF={mixed:{min:1,max:60,mix:true},easy:{min:6,max:60,cats:c=>c.g!=='name'&&!c.rare&&!['pwhl','u2','sl','p4','cn','rt'].includes(c.id)},medium:{min:3,max:40},hard:{min:1,max:30,needSmall:3}};
function generate(seedStr,level){
  const r=rng(hashStr(seedStr)),d=DIFF[level],pool=CATS.filter(d.cats||(()=>true));
  for(let tries=0;tries<20000;tries++){
    const rows=[],cols=[],rg=new Set(),cg=new Set();let ok=true;
    for(let k=0;k<6&&ok;k++){
      const toRow=k%2===0,mine=toRow?rows:cols,myG=toRow?rg:cg,other=toRow?cg:rg;
      const cand=pool.filter(c=>!NESTED.some(([a,b])=>(c.id===a&&mine.some(m=>m.id===b))||(c.id===b&&mine.some(m=>m.id===a)))&&!other.has(c.g)&&!rows.includes(c)&&!cols.includes(c)&&!(myG.has(c.g)&&c.g!=='prov'&&c.g!=='pop'));
      if(!cand.length){ok=false;break}
      const c=pickW(r,cand);mine.push(c);myG.add(c.g);
    }
    if(!ok)continue;
    const sets=[];let small=0,bad=false;
    for(const a of rows)for(const b of cols){const s=answersFor(a,b);if(s.length<d.min||s.length>d.max){bad=true;break}if(s.length<=3)small++;sets.push(s)}
    if(bad)continue;
    if(d.needSmall&&small<d.needSmall)continue;
    if(level==='medium'&&small<1)continue;
    if(d.mix){const easyN=sets.filter(s=>s.length>=10).length,hardN=sets.filter(s=>s.length<=3).length;if(easyN<3||hardN<2)continue}
    if(!hasMatching(sets))continue;
    return {rows:rows.map(c=>c.id),cols:cols.map(c=>c.id),sets};
  }
  throw new Error('no grid');
}
// ---------- dates ----------
const LAUNCH_DEFAULT='2026-10-01';const launch=()=>EDC().launch||LAUNCH_DEFAULT;
function todayET(){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
const dms=s=>Date.parse(s+'T12:00:00Z');
const prevDay=s=>new Date(dms(s)-864e5).toISOString().slice(0,10);
function puzzleNo(ds){return Math.round((dms(ds)-dms(launch()))/864e5)+1}
function weekOf(ds){const d=new Date(dms(ds));const off=(d.getUTCDay()+6)%7;return new Date(dms(ds)-off*864e5).toISOString().slice(0,10)}
const niceDate=ds=>new Date(dms(ds)).toLocaleDateString(LANG==='fr'?'fr-CA':'en-CA',{timeZone:'UTC',weekday:'short',month:'short',day:'numeric'});
// ---------- state ----------
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let mode='daily',G=null,S=null,key=null,active=-1,curDate=null;
const dated=()=>mode!=='free';
function freshState(){return{cells:Array(9).fill(null),guesses:9,done:false,gaveUp:false,log:[]}}
function load(){
  document.getElementById('fb').innerHTML='';
  if(dated()){
    curDate=mode==='daily'?todayET():(document.getElementById('archDate').value||prevDay(todayET()));
    key=ED+':daily:'+curDate;G=generate((EDC().seed||ED+'-')+curDate,dailyLevel(curDate));S=store.get(key,null)||freshState();S.log=S.log||[];restoreFromDb();
  }else{const lvl=document.getElementById('diff').value;curDate=null;key=null;G=generate('free-'+Date.now()+Math.random(),lvl);S=freshState()}
  aggregate();render();
}
function save(){if(key)store.set(key,S)}
// New day while the tab or iOS app was in the background: reload so the new daily grid shows.
function rollover(){if(mode==='daily'&&curDate&&curDate!==todayET())location.reload()}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)rollover()});window.addEventListener('focus',rollover);
// ---------- rarity ----------
// Smoothed pick rate: the real share of players who chose this answer, blended with a
// population-based estimate while few have played (K = weight of the estimate, in players).
const MINP=5,K=5;
function estRate(cell,ci){const s=G.sets[cell];const w=i=>Math.pow(CITIES[i].pop,.6);const tot=s.reduce((a,i)=>a+w(i),0);return 100*w(ci)/tot}
const liveN=cell=>dated()?LIVE.cellN[cell]:0,liveC=(cell,ci)=>dated()?(LIVE.counts[cell][ckey(ci)]||0):0;
function rate(cell,ci){return (liveC(cell,ci)+K*estRate(cell,ci)/100)/(liveN(cell)+K)*100}
const isUnique=(cell,ci)=>liveN(cell)>=MINP&&liveC(cell,ci)<=1;
function rarity(cell,ci){if(S.cells[cell]===ci&&isUnique(cell,ci))return 1;return Math.max(1,Math.round(rate(cell,ci)))}
function totals(){let n=0,r=0,u=0;S.cells.forEach((c,i)=>{if(c!=null){n++;r+=rarity(i,c);if(isUnique(i,c))u++}});return{n,r,u,final:r+(9-n)*100}}
// ---------- streaks (one freeze per week bridges a single missed day) ----------
function statsOf(days){const ent=Object.entries(days||{}).filter(([,v])=>v&&v.done);
  const played=ent.length,perfect=ent.filter(([,v])=>v.n===9).length,rs=ent.map(([,v])=>v.rarity).filter(x=>typeof x==='number');
  const avg=rs.length?Math.round(rs.reduce((a,b)=>a+b,0)/rs.length):null,uniq=ent.reduce((a,[,v])=>a+(v.u||0),0);
  const on=new Set(ent.filter(([,v])=>!v.late).map(([k])=>k)),used=new Set();
  let d=todayET();if(!on.has(d))d=prevDay(d);let streak=0;
  for(let g=0;g<5000;g++){if(on.has(d)){streak++;d=prevDay(d);continue}
    const wk=weekOf(d);if(!used.has(wk)&&on.has(prevDay(d))){used.add(wk);d=prevDay(d);continue}break}
  return{played,perfect,avg,uniq,streak,freezeLeft:used.has(weekOf(todayET()))?0:1}}
function myDays(){return ME?edDays(ME.days):store.get(ED+':doneDays',{})}
// ---------- render ----------
function plate(id){return`<div class="plate"><small>${kick(id)}</small>${lab(id)}</div>`}
function render(){
  const b=document.getElementById('board');b.setAttribute('aria-label',T('grid'));
  let h=`<div class="corner"><b>${S.guesses}</b><span>${T('guessesLeft')}</span></div>`;
  h+=G.cols.map(plate).join('');
  G.rows.forEach((rid,ri)=>{h+=plate(rid);for(let ci=0;ci<3;ci++){const i=ri*3+ci,v=S.cells[i];
    const rc=T('rowcol',{r:lab(rid),c:lab(G.cols[ci])});
    if(v!=null){const c=CITIES[v];h+=`<button class="cell ok" data-i="${i}" aria-label="${esc(rc+' '+T('answered',{city:c.n+', '+PV(c.p)}))}"><span class="ck" aria-hidden="true">✓</span><span class="nm${c.n.length>9?' long':''}">${esc(c.n)}</span><span class="pv">${c.p}</span><span class="rr">${rarity(i,v)}%</span></button>`}
    else h+=`<button class="cell" data-i="${i}" aria-label="${esc(rc+' '+T('empty'))}">${S.done?`<span class="cnt">${T('nAnswers',{n:G.sets[i].length})}</span>`:''}</button>`}});
  b.innerHTML=h;
  b.querySelectorAll('.cell').forEach(el=>el.addEventListener('click',()=>{const i=+el.dataset.i;if(S.done)showAnswers(i);else if(S.cells[i]==null)openPick(i)}));
  const t=totals();
  document.getElementById('lCorrect').textContent=`${t.n}/9`;document.getElementById('lRarity').textContent=t.n?t.r:'–';
  document.getElementById('livePanel').hidden=S.done;document.getElementById('endPanel').hidden=!S.done;
  document.getElementById('meta').textContent=mode==='daily'?T('dailyMeta',{n:puzzleNo(curDate),d:curDate,lvl:T(dailyLevel(curDate))}):mode==='archive'?T('archMeta',{n:puzzleNo(curDate),d:curDate}):T('freeMeta',{l:T(document.getElementById('diff').value)});
  drawLive();drawMap();drawRem();
  if(S.done){const st=statsOf(myDays());document.getElementById('sCorrect').textContent=`${t.n}/9`;document.getElementById('sRarity').textContent=t.final;
    document.getElementById('sStreak').textContent=st.streak;document.getElementById('freezeNote').textContent=st.freezeLeft?T('freezeLeft'):T('freezeUsed');
    document.getElementById('endTitle').textContent=t.n===9?T('perfect'):S.gaveUp?T('closed'):T('outOf');drawSocial()}
}
function chips(i){const r=Math.floor(i/3),c=i%3;return`<span class="chip">${lab(G.rows[r])}</span><span class="chip">${lab(G.cols[c])}</span>`}
function drawLangs(){const el=document.getElementById('langTabs');el.innerHTML=EDC().langs.map(l=>`<button type="button" lang="${l}" data-l="${l}" aria-pressed="${l===LANG}">${l.toUpperCase()}</button>`).join('');el.hidden=EDC().langs.length<2;el.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.l)))}
function applyLang(){document.documentElement.lang=LANG==='fr'?'fr-CA':LANG==='es'?'es':'en-CA';
  document.querySelectorAll('[data-i]').forEach(el=>{el.textContent=T(el.dataset.i)});
  document.getElementById('q').placeholder=T('ph');
  drawLangs();
  document.getElementById('modeTabs').setAttribute('aria-label',T('modeLbl'));document.getElementById('lbTabs').setAttribute('aria-label',T('lbTitle'));
  drawEdRow();drawBrand();if(!EDC().ready){drawSoon();return}fillArchive();if(G){render();drawAcct()}}
function setLang(l){LANG=l;PREFLANG=l;try{localStorage.setItem('lang',l)}catch(e){}applyLang()}
const howto=document.getElementById('howto');if(store.get('howtoOpen',false))howto.open=true;
howto.addEventListener('toggle',()=>store.set('howtoOpen',howto.open));
// ---------- picking ----------
const norm=s=>s.toLowerCase().replace(/œ/g,'oe').replace(/æ/g,'ae').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\bste?\.?(?=[\s-])/g,m=>m.startsWith('ste')?'sainte':'saint').replace(/[^a-z0-9]+/g,' ').trim();
let INDEX=CITIES.map((c,i)=>({i,keys:[c.n,...c.a].map(norm)}));
let hits=[],act=0;
function openPick(i){if(S.done)return;active=i;document.getElementById('dlgCrit').innerHTML=chips(i);const q=document.getElementById('q');q.value='';hits=[];drawHits();document.getElementById('dlg').showModal();q.focus()}
document.getElementById('dlg').addEventListener('close',()=>{const el=document.querySelector(`.cell[data-i="${active}"]`);el&&el.focus()});
function search(v){const n=norm(v);if(!n)return[];const used=new Set(S.cells.filter(x=>x!=null));
  const sc=INDEX.map(o=>{let s=0;for(const k of o.keys){if(k===n)s=Math.max(s,3);else if(k.startsWith(n))s=Math.max(s,2);else if(k.includes(n))s=Math.max(s,1)}return{...o,s,used:used.has(o.i)}}).filter(o=>o.s);
  return sc.sort((a,b)=>b.s-a.s||CITIES[b.i].pop-CITIES[a.i].pop).slice(0,8)}
function drawHits(){const ul=document.getElementById('results');ul.innerHTML=hits.map((h,k)=>{const c=CITIES[h.i];return`<li role="option" aria-selected="${k===act}"><button type="button" class="${k===act?'act':''}" data-k="${k}" aria-disabled="${h.used}"><span>${esc(c.n)}${h.used?' · '+T('used'):''}</span><span class="pv">${c.p}</span></button></li>`}).join('')||(document.getElementById('q').value?`<li class="foot" style="padding:8px">${T('noCity')}</li>`:'');
  ul.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>choose(+b.dataset.k)))}
document.getElementById('q').addEventListener('input',e=>{hits=search(e.target.value);act=0;drawHits()});
document.getElementById('q').addEventListener('keydown',e=>{if(e.key==='ArrowDown'){act=Math.min(act+1,hits.length-1);drawHits();e.preventDefault()}else if(e.key==='ArrowUp'){act=Math.max(act-1,0);drawHits();e.preventDefault()}else if(e.key==='Enter'){e.preventDefault();if(hits.length)choose(act)}});
function choose(k){const h=hits[k];if(!h||h.used)return;document.getElementById('dlg').close();guess(active,h.i)}
function guess(i,ci){
  const c=CITIES[ci],r=CAT[G.rows[Math.floor(i/3)]],col=CAT[G.cols[i%3]];const okR=r.f(c),okC=col.f(c);S.guesses--;
  const fb=document.getElementById('fb');const who=`<strong>${esc(c.n)}, ${c.p}</strong>`;
  if(okR&&okC){S.cells[i]=ci;
    const rt=liveN(i)>=MINP?(isUnique(i,ci)?T('unique'):T('pickRate',{p:rarity(i,ci)})):T('estRate',{p:rarity(i,ci)});
    fb.innerHTML=`<div class="feedback good">✓ ${who} ${T('fits')}${L(': ',' : ')}${esc(r.why(c))}; ${esc(col.why(c))}. ${rt}</div>`}
  else fb.innerHTML=`<div class="feedback">✗ ${who} ${T('doesntFit')}<ul><li>${okR?'✓':'✗'} ${lab(r.id)} — ${esc(r.why(c))}</li><li>${okC?'✓':'✗'} ${lab(col.id)} — ${esc(col.why(c))}</li></ul></div>`;
  if(dated())S.log.push([i,ckey(ci),okR&&okC?1:0]);
  if(S.guesses<=0||S.cells.every(x=>x!=null))finish();save();render();if(dated())syncPlay()}
function finish(){S.done=true;if(dated()){const dd=store.get(ED+':doneDays',{});const t=totals();dd[curDate]={done:true,n:t.n,rarity:t.final,u:t.u,late:curDate!==todayET()};store.set(ED+':doneDays',dd)}}
function showAnswers(i){ansCell=i;const s=[...G.sets[i]].sort((a,b)=>rate(i,b)-rate(i,a));document.getElementById('ansCrit').innerHTML=chips(i);
  document.getElementById('ansTitle').textContent=T('ansTitle',{n:s.length})+'. '+(liveN(i)>=MINP?T('ansReal',{n:liveN(i)}):T('ansEst'));
  document.getElementById('ansList').innerHTML=s.map(x=>`<li><span>${esc(CITIES[x].n)}, ${CITIES[x].p}${S.cells[i]===x?' ✓ '+T('you'):''}</span><span class="pct">${Math.max(1,Math.round(rate(i,x)))}%</span></li>`).join('');
  document.getElementById('ansDlg').showModal()}
function giveUp(){if(S.done)return;S.gaveUp=true;finish();save();render();if(dated())syncPlay()}
document.getElementById('giveUp2').addEventListener('click',giveUp);
// ---------- sharing ----------
function toast(m){const t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),2400)}
const shareHead=()=>{const L2=EDC().leaf||EDC().flag;return L2+' '+(mode==='free'?`${brandName()} ${EDC().flag} · `+T('tabFree'):`${brandName()} ${EDC().flag} #${puzzleNo(curDate)}`)+' '+L2};
const SITE_URL=(import.meta.env.VITE_SITE_URL||'https://citydoku.app').replace(/\/$/,'');const GAME_URL=()=>SITE_URL+'#'+EDC().hash;
function shareText(){const t=totals();let g='';for(let r=0;r<3;r++){g+=S.cells.slice(r*3,r*3+3).map(x=>x!=null?'🟥':'⬜').join('')+'\n'}return`${shareHead()}\n${t.n}/9 · ${T('cRarity')} ${t.final}\n${g}`}
function drawSocial(){const txt=shareText(),full=txt+GAME_URL(),e=encodeURIComponent;
  const links=[['X','https://twitter.com/intent/tweet?text='+e(full)],['Bluesky','https://bsky.app/intent/compose?text='+e(full)],['Threads','https://www.threads.net/intent/post?text='+e(full)],['Facebook','https://www.facebook.com/sharer/sharer.php?u='+e(GAME_URL())],['WhatsApp','https://wa.me/?text='+e(full)]];
  document.getElementById('socRow').innerHTML=`<a href="#" id="igBtn" role="button">Instagram</a>`+links.map(([n,u])=>`<a href="${u}" target="_blank" rel="noopener noreferrer">${n}<span class="sr"> (${T('newTab')})</span></a>`).join('');
  document.getElementById('igBtn').addEventListener('click',e=>{e.preventDefault();openImage(true)})}
document.getElementById('shareBtn').addEventListener('click',()=>{const txt=shareText()+GAME_URL();
  (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>toast(T('copied'))).catch(()=>{document.getElementById('fb').innerHTML=`<div class="feedback good"><pre style="margin:0;font-family:var(--font-mono);white-space:pre-wrap">${esc(txt)}</pre></div>`;toast(T('copyBelow'))})});
let imgBlob=null;
async function makeImage(){try{await document.fonts.ready}catch(e){}
  const W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');const RED=EDC().img,INK='#211717';
  const rr=(px,py,w,h,r)=>{x.beginPath();if(x.roundRect)x.roundRect(px,py,w,h,r);else x.rect(px,py,w,h)};
  x.fillStyle='#FFFFFF';x.fillRect(0,0,W,H);x.fillStyle=RED;[[0,0],[W*3/4,0],[0,H-40],[W*3/4,H-40]].forEach(([a,b])=>x.fillRect(a,b,W/4,40));
  x.font='900 120px Overpass, system-ui, sans-serif';const [B1,B2]=EDC().brand;const wa=x.measureText(B1).width,wb=x.measureText(B2).width,sx=W/2-(wa+wb)/2;
  x.textAlign='left';x.fillStyle=INK;x.fillText(B1,sx,210);x.fillStyle=RED;x.fillText(B2,sx+wa,210);
  const EM='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';x.textAlign='center';x.font='64px '+EM;const LF=EDC().leaf||EDC().flag;x.fillText(LF,110,190);x.fillText(LF,W-110,190);x.fillText(LF,110,H-140);x.fillText(LF,W-110,H-140);x.font='48px '+EM;x.fillText(EDC().flag,W/2,100);
  x.textAlign='center';x.font='600 34px "Overpass Mono", monospace';x.fillStyle=RED;x.fillText(((ED==='ca'?'':edName(ED)+' · ')+(mode==='free'?T('tabFree'):`#${puzzleNo(curDate)} · ${curDate}`)).toUpperCase(),W/2,280);
  const t=totals(),gs=215,gap=22,gx=(W-(gs*3+gap*2))/2,gy=330;
  S.cells.forEach((v,i)=>{const r=Math.floor(i/3),c=i%3,px=gx+c*(gs+gap),py=gy+r*(gs+gap);rr(px,py,gs,gs,22);
    if(v!=null){x.fillStyle=RED;x.fill();x.fillStyle='#FFFFFF';x.font='900 92px Overpass, system-ui, sans-serif';x.fillText(String(rarity(i,v)),px+gs/2,py+gs/2+20);x.font='600 30px "Overpass Mono", monospace';x.fillText('%',px+gs/2,py+gs/2+70)}
    else{x.fillStyle='#F4F1F0';x.fill();x.strokeStyle='#EAD9D6';x.lineWidth=4;x.stroke()}});
  const by=gy+gs*3+gap*2+110;x.fillStyle=INK;x.font='800 72px Overpass, system-ui, sans-serif';x.fillText(`${t.n}/9`,W/2-200,by);x.fillText(String(t.final),W/2+200,by);
  x.fillStyle='#6E5C5A';x.font='600 26px "Overpass Mono", monospace';x.fillText(T('correct').toUpperCase(),W/2-200,by+45);x.fillText(T('rarityScore').toUpperCase(),W/2+200,by+45);
  x.fillStyle=RED;x.font='700 36px Overpass, system-ui, sans-serif';x.fillText(T('imgLine'),W/2,H-100);x.fillStyle='#6E5C5A';x.font='600 22px "Overpass Mono", monospace';x.fillText(`${LF} ${brandName().toUpperCase()} ${LF}`,W/2,H-60);
  return await new Promise(res=>cv.toBlob(res,'image/png'))}
async function openImage(ig){imgBlob=await makeImage();document.getElementById('imgHelp').textContent=ig?T('igHelp'):T('imgHelp');document.getElementById('igOpen').hidden=!ig;const img=document.getElementById('imgPrev');img.src=URL.createObjectURL(imgBlob);
  const t=totals();img.alt=L(`Canadoku result: ${t.n} of 9 correct, rarity score ${t.final}`,`Résultat Canadoku : ${t.n} sur 9, score de rareté ${t.final}`);document.getElementById('imgDlg').showModal()}
document.getElementById('imgBtn').addEventListener('click',()=>openImage(false));
document.getElementById('imgSave').addEventListener('click',async()=>{const dl=window.claude?.use?await claude.use('downloads'):null;
  if(!dl){toast(T('imgHelp'));return}
  try{await dl.save({filename:`${brandName().toLowerCase().replace(/\s+/g,'-')}-${curDate||'free'}.png`,data:imgBlob});toast(T('imgSaved'))}catch(e){if(e?.code!=='cancelled')toast(T('imgHelp'))}});
// ---------- modes ----------
function fillArchive(){const sel=document.getElementById('archDate');const cur=sel.value;const out=[];let d=prevDay(todayET());
  while(d>=launch()){const done=store.get(ED+':daily:'+d,null)?.done||ME?.days?.[dk(d)]?.done;out.push(`<option value="${d}">#${puzzleNo(d)} · ${niceDate(d)}${done?' ✓':''}</option>`);d=prevDay(d)}
  sel.innerHTML=out.join('');if(cur)sel.value=cur}
function setMode(m){mode=m;[['daily','tabDaily'],['archive','tabArchive'],['free','tabFree']].forEach(([k,id])=>document.getElementById(id).setAttribute('aria-pressed',m===k));
  document.getElementById('freeControls').hidden=m!=='free';document.getElementById('archControls').hidden=m!=='archive';document.getElementById('archNote').hidden=m!=='archive';load()}
document.getElementById('tabDaily').addEventListener('click',()=>setMode('daily'));
document.getElementById('tabArchive').addEventListener('click',()=>setMode('archive'));
document.getElementById('tabFree').addEventListener('click',()=>setMode('free'));
document.getElementById('newGrid').addEventListener('click',load);
document.getElementById('diff').addEventListener('change',load);
document.getElementById('archDate').addEventListener('change',load);
// ---------- backend: player profiles + pick history (artifact db) ----------
// plays/<userId> = { username, username_lc, nameAt, plus?, last,
//                    days:{ 'YYYY-MM-DD':{ cells:["Name|PR"|null x9], log:[[cell,"Name|PR",ok]], done, gaveUp, late, n, rarity, u, ts } } }
let DB=null,UID=null,meDoc=null,meExists=false,writing=Promise.resolve(),ALL=[],ME=null,dbState='off',lbTab='today';
let LIVE={players:0,cellN:Array(9).fill(0),counts:Array.from({length:9},()=>({}))};
const ckey=i=>CITIES[i].n+'|'+CITIES[i].p;let KEYIDX=Object.fromEntries(CITIES.map((c,i)=>[c.n+'|'+c.p,i]));
function useData(){if(!EDC().ready)return;CITIES=DATA[ED];CATS=ED==='us'?CATS_US:ED==='global'?CATS_GL:CATS_CA;CAT=Object.fromEntries(CATS.map(c=>[c.id,c]));INDEX=CITIES.map((c,i)=>({i,keys:[c.n,...c.a].map(norm)}));KEYIDX=Object.fromEntries(CITIES.map((c,i)=>[c.n+'|'+c.p,i]))}
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function drawLive(){const el=document.getElementById('live');el.textContent=!dated()||(dbState!=='on'&&dbState!=='readonly')?'':LIVE.players===1?T('player1'):T('players',{n:LIVE.players})}
function aggregate(){const counts=Array.from({length:9},()=>({})),cellN=Array(9).fill(0);let players=0;
  if(curDate)for(const d of ALL){const day=d.days?.[dk(curDate)];if(!day||!Array.isArray(day.cells))continue;players++;
    day.cells.forEach((k,i)=>{if(typeof k==='string'&&k in KEYIDX&&i<9){counts[i][k]=(counts[i][k]||0)+1;cellN[i]++}})}
  LIVE={players,cellN,counts}}
function nameOf(d){if(!d?.username)return null;const same=ALL.filter(x=>x.username_lc===d.username_lc).sort((a,b)=>(a.nameAt||0)-(b.nameAt||0));
  return same[0]?.id===d.id?d.username:d.username+'#'+d.id.slice(-3)}
async function initDb(){
  if(!window.claude?.use){dbState='none';drawAcct();return}
  const [db,user]=await Promise.all([claude.use('db'),claude.use('user')]);
  if(!db){dbState='none';drawAcct();return}
  DB=db;UID=user?await user.id():null;if(UID)meDoc=DB.doc('plays/'+UID);
  dbState='loading';drawAcct();
  const timer=setTimeout(()=>{if(dbState==='loading'){dbState='slow';drawAcct()}},10000);
  DB.collection('plays').limit(1000).onSnapshot(snap=>{
    if(!snap.metadata.fromCache)clearTimeout(timer);if(dbState!=='readonly')dbState='on';
    ALL=snap.docs.filter(d=>d.exists).map(d=>({id:d.id,...d.data()}));
    ME=UID?ALL.find(x=>x.id===UID)||null:null;if(ME)meExists=true;
    if(EDC().ready&&G){restoreFromDb();aggregate();render();fillArchive()}drawAcct()},
    e=>{clearTimeout(timer);dbState='slow';drawAcct()});
}
function drawAcct(){drawLeagues();drawLB();const el=document.getElementById('acct');
  if(dbState==='none'||(dbState!=='off'&&dbState!=='loading'&&!UID)){el.innerHTML=`<span>${T('guest')}</span>`+(dbState==='none'?'':`<button class="btn primary" id="signInBtn" type="button">${T('signIn')}</button>`);return}
  if(dbState==='off'||dbState==='loading'){el.innerHTML=`<span>${T('connecting')}</span>`;return}
  if(dbState==='slow'&&!ME){el.innerHTML=`<span>${T('unreach')}</span>`;return}
  if(dbState==='readonly'){el.innerHTML=`<span>${T('readonly')}</span>`;return}
  const nm=nameOf(ME);
  el.innerHTML=nm?`<span>${T('signedAs',{name:`<b>${esc(nm)}</b>`})}</span><span class="acctlinks"><button class="linkbtn" id="chgName">${T('change')}</button><button class="linkbtn" id="signOutBtn" type="button">${T('signOut')}</button><button class="linkbtn dangerlink" id="deleteAcctBtn" type="button">${T('delAcct')}</button></span>`
    :`<span>${T('needName')}</span><span class="acctlinks"><button class="btn primary" id="chgName">${T('create')}</button><button class="linkbtn" id="signOutBtn" type="button">${T('signOut')}</button></span>`;
  document.getElementById('chgName').addEventListener('click',openUser)}
function drawLB(){const body=document.getElementById('lbBody');const ds=todayET();const BASE=LG?ALL.filter(d=>d.leagues?.[LG]):ALL;
  if(dbState!=='on'&&dbState!=='readonly'){body.innerHTML=`<p class="foot" style="margin:0">${dbState==='none'?T('lbSignIn'):T('lbLoading')}</p>`;return}
  let rows,head,note;
  if(lbTab==='today'){
    const K2=dk(ds);rows=BASE.filter(d=>nameOf(d)&&d.days?.[K2]?.done&&!d.days[K2].late).map(d=>({id:d.id,name:nameOf(d),n:d.days[K2].n,r:d.days[K2].rarity,u:d.days[K2].u||0})).sort((a,b)=>b.n-a.n||a.r-b.r);
    head=`<tr><th class="rk">#</th><th>${T('cPlayer')}</th><th class="num">${T('cCorrect')}</th><th class="num">${T('cUniq')}</th><th class="num">${T('cRarity')}</th></tr>`;
    rows=rows.map((x,k)=>`<tr class="${x.id===UID?'me':''}"><td class="rk">${k+1}</td><td>${esc(x.name)}</td><td class="num">${+x.n||0}/9</td><td class="num">${+x.u||0}</td><td class="num">${typeof x.r==='number'?x.r:'–'}</td></tr>`);note=T('lbNote');
  }else{
    rows=BASE.filter(d=>nameOf(d)).map(d=>({id:d.id,name:nameOf(d),...statsOf(edDays(d.days))})).filter(x=>x.played).sort((a,b)=>b.perfect-a.perfect||(a.avg??1e9)-(b.avg??1e9)||b.played-a.played);
    head=`<tr><th class="rk">#</th><th>${T('cPlayer')}</th><th class="num">${T('cPlayed')}</th><th class="num">${T('cPerfect')}</th><th class="num">${T('cAvg')}</th><th class="num">${T('cStreak')}</th></tr>`;
    rows=rows.map((x,k)=>`<tr class="${x.id===UID?'me':''}"><td class="rk">${k+1}</td><td>${esc(x.name)}</td><td class="num">${x.played}</td><td class="num">${x.perfect}</td><td class="num">${x.avg??'–'}</td><td class="num">${x.streak}</td></tr>`);note=T('lbNoteAll');
  }
  body.innerHTML=rows.length?`<table class="lb"><thead>${head}</thead><tbody>${rows.slice(0,50).join('')}</tbody></table><p class="foot">${note}</p>`
    :`<p class="foot" style="margin:0">${lbTab==='today'?T('lbEmptyToday'):T('lbEmptyAll')}</p>`}
function setLB(t){lbTab=t;document.getElementById('lbToday').setAttribute('aria-pressed',t==='today');document.getElementById('lbAll').setAttribute('aria-pressed',t==='all');drawLB()}
document.getElementById('lbToday').addEventListener('click',()=>setLB('today'));
document.getElementById('lbAll').addEventListener('click',()=>setLB('all'));
function openUser(){const i=document.getElementById('uname');i.value=ME?.username||'';document.getElementById('unameErr').textContent='';document.getElementById('userDlg').showModal();i.focus()}
document.getElementById('userCancel').addEventListener('click',()=>document.getElementById('userDlg').close());
function write(data){return writing=writing.catch(()=>{}).then(async()=>{if(meExists)await meDoc.update(data);else{await meDoc.set({days:{},...data});meExists=true}})}
document.getElementById('userForm').addEventListener('submit',e=>{e.preventDefault();const v=document.getElementById('uname').value.trim(),err=document.getElementById('unameErr');
  if(!/^[A-Za-z0-9_-]{3,20}$/.test(v)){err.textContent=T('badName');return}
  const lc=v.toLowerCase();if(ALL.some(x=>x.id!==UID&&x.username_lc===lc)){err.textContent=T('taken');return}
  if(!meDoc){err.textContent=T('needSignIn');return}
  const btn=document.getElementById('userSave');btn.disabled=true;
  write({username:v,username_lc:lc,nameAt:ME?.username_lc===lc?ME.nameAt:Date.now()}).then(()=>{document.getElementById('userDlg').close();toast(T('nameSaved'))})
    .catch(x=>{if(x?.code==='taken'){err.textContent=T('taken')}else if(x?.code==='invalid_argument'){dbState='readonly';drawAcct();document.getElementById('userDlg').close()}else err.textContent=T('saveFail')}).finally(()=>{btn.disabled=false})});
document.getElementById('notifyBtn').addEventListener('click',()=>{if(!meDoc||dbState==='readonly'){toast(T('notifyGuest'));return}
  write({plus:true}).then(()=>toast(T('notified'))).catch(()=>toast(T('saveFail')))});
function restoreFromDb(){ // cross-device: use the saved play if this browser has none
  if(!ME||!curDate||!dated())return;const d=ME.days?.[dk(curDate)];
  if(!d||!Array.isArray(d.cells)||S.cells.some(x=>x!=null)||S.guesses<9)return;
  S.cells=d.cells.map(k=>k&&k in KEYIDX?KEYIDX[k]:null);S.log=d.log||[];S.guesses=Math.max(0,9-S.log.length);S.done=!!d.done;S.gaveUp=!!d.gaveUp;save()}
function syncPlay(){if(!meDoc||dbState==='readonly')return;const t=totals();
  const day={cells:S.cells.map(x=>x==null?null:ckey(x)),log:S.log||[],done:!!S.done,gaveUp:!!S.gaveUp,late:curDate!==todayET(),n:t.n,rarity:S.done?t.final:null,u:t.u,ts:Date.now()};
  const data={days:{[dk(curDate)]:day}};if(!day.late)data.last=dk(curDate);
  write(data).catch(e=>{if(e?.code==='invalid_argument'){dbState='readonly';drawAcct()}})}

// ---------- world map (Global edition) ----------
const mx=c=>((c.lon+180)*2).toFixed(1),my=c=>((90-c.lat)*2).toFixed(1);
function drawMap(){const p=document.getElementById('mapPanel');p.hidden=!(ED==='global'&&G);if(p.hidden)return;
  let h='';if(S.done){const seen=new Set(S.cells.filter(x=>x!=null));G.sets.flat().forEach(i=>{if(seen.has(i))return;seen.add(i);const c=CITIES[i];h+=`<circle class="alt" cx="${mx(c)}" cy="${my(c)}" r="1.8"/>`})}
  S.cells.forEach((v,i)=>{if(v==null)return;const c=CITIES[v];h+=`<g><title>${esc(c.n)}</title><circle class="pick" cx="${mx(c)}" cy="${my(c)}" r="5"/><text class="pickn" x="${mx(c)}" y="${my(c)}">${i+1}</text></g>`});
  document.getElementById('mapDots').innerHTML=h;document.getElementById('mapSvg').setAttribute('aria-label',T('mapTitle')+': '+S.cells.filter(x=>x!=null).map(v=>CITIES[v].n).join(', '))}
// ---------- reminders ----------
function msToMidnightET(){const n=new Date(),p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Toronto',hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'}).formatToParts(n).map(x=>[x.type,+x.value||0]));return((24-(p.hour%24))*3600-p.minute*60-p.second)*1000}
function drawRem(){const p=document.getElementById('remPanel');p.hidden=!EDC().ready;if(p.hidden)return;const ms=msToMidnightET(),h=Math.floor(ms/3600000),m=Math.floor(ms%3600000/60000);
  document.getElementById('remNext').textContent=T('remNext',{t:`${h} h ${String(m).padStart(2,'0')} min`});
  const st=statsOf(myDays()),today=myDays()[todayET()];const warn=document.getElementById('remStreak');warn.hidden=!(st.streak>0&&!today?.done);if(!warn.hidden)warn.textContent=T('remStreak',{n:st.streak})}
setInterval(()=>{if(EDC().ready)drawRem()},30000);
document.getElementById('remCal').addEventListener('click',async()=>{const [hh,mm]=(document.getElementById('remTime').value||'09:00').split(':');
  if(window.NATIVE?.isNative){try{await NATIVE.scheduleDaily(+hh,+mm,T('remEvt')+' '+EDC().flag,GAME_URL());toast(T('remNative',{t:hh+':'+mm}))}catch(e){toast(T('remNoDl'))}return}const d=new Date();
  const pad=n=>String(n).padStart(2,'0'),day=`${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`,stamp=new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z';
  const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Citydoku//Daily reminder//EN','BEGIN:VEVENT',`UID:citydoku-${Date.now()}@citydoku`,`DTSTAMP:${stamp}`,`DTSTART:${day}T${hh}${mm}00`,'DURATION:PT10M','RRULE:FREQ=DAILY',`SUMMARY:${T('remEvt')} ${EDC().flag}`,`DESCRIPTION:${GAME_URL()}`,`URL:${GAME_URL()}`,'BEGIN:VALARM','ACTION:DISPLAY','TRIGGER:PT0M',`DESCRIPTION:${T('remEvt')}`,'END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
  const dl=window.claude?.use?await claude.use('downloads'):null;if(!dl){toast(T('remNoDl'));return}
  try{await dl.save({filename:'citydoku-reminder.ics',data:ics});toast(T('remSaved'))}catch(e){if(e?.code!=='cancelled')toast(T('remNoDl'))}});
// ---------- friend leagues ----------
// Membership lives in each player's own doc: plays/<uid>.leagues = { CODE: {name, owner?, at} }
let LG=store.get('league',''),lgMode='create';
const myLeagues=()=>Object.entries(ME?.leagues||{}).filter(([,v])=>v&&v.name);
function leagueName(code){for(const d of ALL){const l=d.leagues?.[code];if(l&&l.owner&&l.name)return l.name}return null}
function drawLeagues(){const sel=document.getElementById('lgSel'),mine=myLeagues();if(LG&&!mine.some(([k])=>k===LG))LG='';
  sel.innerHTML=`<option value="">${T('lgEveryone')}</option>`+mine.map(([k,v])=>`<option value="${k}" ${k===LG?'selected':''}>${esc(v.name)} · ${k}</option>`).join('');
  const acts=document.getElementById('lgActs');if(!LG){acts.innerHTML='';return}
  const n=ALL.filter(d=>d.leagues?.[LG]).length;acts.innerHTML=`<span class="foot">${T('lgMembers',{n})}</span><button class="linkbtn" id="lgInv" type="button">${T('lgInvite')}</button><button class="linkbtn" id="lgLeave" type="button">${T('lgLeave')}</button>`;
  document.getElementById('lgInv').addEventListener('click',()=>{const nm=leagueName(LG)||'';const txt=`${EDC().flag} Citydoku: ${nm} · ${T('lgCodeIs',{code:LG})}\n${SITE_URL}#join-${LG}`;(navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>toast(T('lgCopied',{code:LG}))).catch(()=>toast(T('lgCodeIs',{code:LG})))});
  document.getElementById('lgLeave').addEventListener('click',()=>{const c=LG;write({leagues:{[c]:null}}).then(()=>{LG='';store.set('league','');toast(T('lgLeft'))}).catch(()=>toast(T('saveFail')))})}
document.getElementById('lgSel').addEventListener('change',e=>{LG=e.target.value;store.set('league',LG);drawLeagues();drawLB()});
function openLg(m,pref){if(!meDoc||dbState==='readonly'||dbState==='none'){toast(T('needSignIn'));return}
  if(!ME?.username){toast(T('lgNeedName'));openUser();return}
  lgMode=m;document.getElementById('lgTitle').textContent=T(m==='create'?'lgCreate':'lgJoin');document.getElementById('lgInputL').textContent=T(m==='create'?'lgName':'lgCode');
  document.getElementById('lgSubmit').textContent=T(m==='create'?'lgCreateBtn':'lgJoinBtn');const i=document.getElementById('lgInput');i.value=pref||'';i.maxLength=m==='create'?30:6;
  document.getElementById('lgErr').textContent='';document.getElementById('lgDlg').showModal();i.focus()}
document.getElementById('lgCreateOpen').addEventListener('click',()=>openLg('create'));
document.getElementById('lgJoinOpen').addEventListener('click',()=>openLg('join'));
document.getElementById('lgCancel').addEventListener('click',()=>document.getElementById('lgDlg').close());
document.getElementById('lgForm').addEventListener('submit',e=>{e.preventDefault();const v=document.getElementById('lgInput').value.trim(),err=document.getElementById('lgErr');let code,data;
  if(lgMode==='create'){if(v.length<3||v.length>30){err.textContent=T('lgNameErr');return}
    const AB='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';do{code=Array.from({length:6},()=>AB[Math.floor(Math.random()*AB.length)]).join('')}while(leagueName(code));
    data={leagues:{[code]:{name:v,owner:true,at:Date.now()}}}}
  else{code=v.toUpperCase().replace(/[^A-Z0-9]/g,'');const nm=leagueName(code);if(!nm){err.textContent=T('lgNotFound');return}data={leagues:{[code]:{name:nm,at:Date.now()}}}}
  write(data).then(()=>{document.getElementById('lgDlg').close();LG=code;store.set('league',code);drawLeagues();drawLB();toast(lgMode==='create'?T('lgCreated',{code}):T('lgJoined',{name:data.leagues[code].name}))}).catch(()=>{err.textContent=T('saveFail')})});
// ---------- feedback / corrections ----------
// feedback/<userId>/items/<auto> = { type, city, message, context:{grid,date,row,col,lang}, ts } — only the owner and editors can read it
let fbCell=null;
function fbContext(){const c={edition:ED,grid:mode==='free'?'free':'#'+puzzleNo(curDate),date:curDate||null,lang:LANG};
  if(fbCell!=null&&G){c.row=CAT[G.rows[Math.floor(fbCell/3)]].l[0];c.col=CAT[G.cols[fbCell%3]].l[0]}return c}
function openFeedback(cell){fbCell=cell;const ctx=fbContext();document.getElementById('fbType').value=cell!=null?'correction':'idea';
  document.getElementById('fbCity').value='';document.getElementById('fbMsg').value='';document.getElementById('fbErr').textContent='';
  document.getElementById('fbCtx').textContent=T('fbCtx',{ctx:[ctx.grid,ctx.date,ctx.row&&ctx.col?`${lab(G.rows[Math.floor(cell/3)])} × ${lab(G.cols[cell%3])}`:null].filter(Boolean).join(' · ')});
  document.getElementById('fbDlg').showModal();document.getElementById('fbType').focus()}
let ansCell=null;
document.getElementById('fbOpen').addEventListener('click',()=>openFeedback(null));
document.getElementById('ansReport').addEventListener('click',()=>{document.getElementById('ansDlg').close();openFeedback(ansCell)});
document.getElementById('fbCancel').addEventListener('click',()=>document.getElementById('fbDlg').close());
document.getElementById('fbForm').addEventListener('submit',async e=>{e.preventDefault();const err=document.getElementById('fbErr'),msg=document.getElementById('fbMsg').value.trim();
  if(msg.length<3){err.textContent=T('fbEmpty');return}
  if(!DB||!UID){err.textContent=T('fbGuest');return}
  const btn=document.getElementById('fbSend');btn.disabled=true;
  try{await DB.collection('feedback/'+UID+'/items').add({type:document.getElementById('fbType').value,city:document.getElementById('fbCity').value.trim().slice(0,80),message:msg.slice(0,1500),context:fbContext(),ts:Date.now()});
    document.getElementById('fbDlg').close();toast(T('fbThanks'))}
  catch(x){err.textContent=x?.code==='invalid_argument'?T('readonly'):T('saveFail')}finally{btn.disabled=false}});
// ---------- edition switching ----------
function drawEdRow(){document.getElementById('edRow').innerHTML=ED_ORDER.map(e=>`<button type="button" data-ed="${e}" aria-pressed="${e===ED}"><span aria-hidden="true">${EDITIONS[e].flag}</span>${esc(edShort(e))}${EDITIONS[e].ready?'':` <span class="dev">${T('edSoon')}</span>`}</button>`).join('');
  document.querySelectorAll('#edRow button').forEach(b=>b.addEventListener('click',()=>setEdition(b.dataset.ed,true)))}
function drawBrand(){const [a,b]=EDC().brand;document.getElementById('brandH1').innerHTML=`${a}<span class="doku">${b}</span>${ED==='ca'?'':`<span class="edn"> – ${esc(edName(ED))}</span>`} <span class="flagemoji" role="img" aria-label="${esc(edName(ED))}">${EDC().flag}</span>`;
  document.getElementById('subLine').textContent=ED==='ca'?T('sub'):EDC().ready?T('sub'):T('subOther',{name:edName(ED)});
  document.getElementById('leaves').textContent=ED==='ca'?'🍁 🇨🇦 🍁':EDC().flag;
  document.querySelectorAll('.brandName').forEach(el=>el.textContent=ED==='ca'?'Canadoku':'Citydoku')}
function drawSoon(){const c=EDC();document.getElementById('soonTitle').textContent=brandName();document.getElementById('soonLead').textContent=c.lead;
  document.getElementById('soonCities').textContent=c.cities;document.getElementById('soonData').textContent=c.data;
  document.getElementById('soonCats').innerHTML=c.cats.map(x=>`<li>${esc(x)}</li>`).join('');
  const s=c.sample,pl=([k,l])=>`<div class="plate"><small>${esc(k)}</small>${esc(l)}</div>`;let h='<div class="corner"><b>9</b><span>'+T('guessesLeft')+'</span></div>'+s.slice(3).map(pl).join('');
  for(let r=0;r<3;r++){h+=pl(s[r]);for(let k=0;k<3;k++)h+='<div class="cell"></div>'}document.getElementById('soonBoard').innerHTML=h}
function setEdition(e,user){if(!EDITIONS[e])e='global';ED=e;document.documentElement.dataset.ed=e;
  LANG=EDC().langs.includes(PREFLANG)?PREFLANG:EDC().langs[0];
  if(user)store.set('edition',e);if(location.hash!=='#'+EDC().hash){try{history.replaceState(null,'','#'+EDC().hash)}catch(x){location.hash=EDC().hash}}
  useData();G=null;const ready=EDC().ready;document.getElementById('gameArea').hidden=!ready;document.getElementById('navRow').hidden=!ready;document.getElementById('soon').hidden=ready;
  applyLang();if(ready){setMode(mode)}else drawSoon()}
document.getElementById('suggestBtn').addEventListener('click',()=>{openFeedback(null);document.getElementById('fbType').value='idea'});
document.getElementById('playCa').addEventListener('click',()=>setEdition('ca',true));
function checkJoinHash(code0){const m=code0?[0,code0]:location.hash.match(/^#join-([A-Za-z0-9]{6})$/);if(!m)return false;const code=m[1].toUpperCase();try{history.replaceState(null,'','#'+EDC().hash)}catch(x){}
  const go=()=>{if(dbState==='on'||dbState==='readonly'){openLg('join',code)}else if(dbState==='none'){toast(T('needSignIn'))}else setTimeout(go,800)};go();return true}
window.addEventListener('hashchange',()=>{if(checkJoinHash())return;const e=ED_ORDER.find(k=>'#'+EDITIONS[k].hash===location.hash);if(e&&e!==ED)setEdition(e,true)});
const JOIN0=(location.hash.match(/^#join-([A-Za-z0-9]{6})$/)||[])[1];
{const h=ED_ORDER.find(k=>'#'+EDITIONS[k].hash===location.hash);setEdition(h||store.get('edition','global'),!!h)}
initDb();
if(JOIN0)checkJoinHash(JOIN0);

document.querySelector('.map .land')?.setAttribute('d',LAND);
window.CD={T:(k,v)=>T(k,v),toast:m=>toast(m),get LANG(){return LANG},get UID(){return UID}};
