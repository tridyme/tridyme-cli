## Créer mon application

> Ce projet vous permet de créer et de publier vos propres applications de ligne et de les proposer dans la marketplace de <a href="https://www.tridyme.com/fr/" target="_blank">TriDyme</a>.

> Il vous permet de conserver le controle de votre code, ce dernier n'étant pas présent dans la marketplace ou sur les serveurs de TriDyme

> Il permet d'intégrer du code en Python.

## Sommaire (Optional)

- [Installation des prérequis](#installations)
- [Créer notre première application](#create-my-own-app)
- [Mode développement](#development)
- [Ajouter des fonctionnalités](#add-features)
- [Les composants](#components)
- [Modification et ajout de composant](#modify-add-components)
- [Déployer son code sur GitHub](#github)
- [Mettre son application en ligne](#online-webapp)
- [Ajouter son application dans la plateforme TriDyme](#platform-webapp)
- [License](#license)

## <a name="installations"></a>Installation des prérequis

Les prérequis suivants doivent être installé:

- Un environnement d'exécution JavaScript: [Node.js](#nodejs), téléchargeable <a href="https://nodejs.org/fr/download/" target="_blank">**ici**</a>
- Un environnement d'exécution Python: [Python](#python), téléchargeable <a href="https://www.python.org/downloads/" target="_blank">**ici**</a>
- Un logiciel de gestion de versions: [Git](#git), téléchargeable <a href="https://git-scm.com/downloads" target="_blank">**ici**</a>
- Un éditeur de code cross-platform: [VSCode](#vscode), téléchargeable <a href="https://code.visualstudio.com/Download" target="_blank">**ici**</a>

### <a name="nodejs"></a>Node.js

L'interface graphique de ce kit de développement est écrit en <a href="https://fr.reactjs.org/" target="_blank">**React.js**</a> qui lui même nécessite <a href="https://nodejs.org/fr/" target="_blank">**Node.js**</a>. **Node.js** est un environnement d'exécution JavaScript installable partout, qui permet d'écrire n'importe quel type de programme en JavaScript : outil en ligne de commande, serveur, application desktop, internet des objets (IoT).

Pour installer Node.js, allez sur <a href="https://nodejs.org/fr/download/" target="_blank">**https://nodejs.org/fr/download/**</a> puis suivez les instructions.

Afin de vérifier que Node.js a été bien installé, vous pouvez utiliser **Invite de Commandes** (cmd.exe sur Windows), et tapez la commande `node -v` afin de vérifier que vous n'avez pas de message d'erreur et que la version de Node est supérieur à la version 6.

```shell
$ node -v
v16.14.0
```

**Node.js** est installé avec **npm** est le gestionnaire de modules de Node. Afin de vérifier que **npm** est bien installé et que la version de Node est supérieur à la version 5, tapez la commande `npm -v` :

```shell
$ npm -v
6.9.0
```

### <a name="python"></a>Python

Le serveur de ce kit est en **Python**.
Pour installer: <a href="https://www.python.org/downloads/" target="_blank">**aller ici**</a>

### <a name="git"></a>Git

<a href="https://git-scm.com/">**Git**</a> est un logiciel de gestion de versions, il permet de versionner, d'enregistrer et de rendre open-source du code. Pour l'installer: <a href="https://git-scm.com/downloads" target="_blank">**https://git-scm.com/downloads**</a>.

De même, pour vérifier que l'installation c'est bien déroulé, taper la commande `git version`:

```shell
$ git version
git version 2.21.0.windows.1
```

### <a name="vscode"></a>VSCode (recommandé)

Afin de pouvoir développer son application, le plus simple est d'utiliser <a href="https://code.visualstudio.com">**VSCode**</a> qui est un éditeur de code cross-platform, open-source et gratuit supportant une dizaine de langages.

Pour l'installer: <a href="https://code.visualstudio.com/Download" target="_blank">**https://code.visualstudio.com/Download**</a>.

## <a name="create-my-own-app"></a>Créer notre première application

Afin de créer notre première application, commençons par cloner <a href="https://github.com/tridyme/sdk-webapp-python.git" target="_blank">sdk-webapp-python</a> grâce à **git** dans le repertoire ou nous souhaitons :

```shell
$ git clone https://github.com/tridyme/sdk-webapp-python.git
Cloning into 'sdk-webapp-python'...
remote: Enumerating objects: 91, done.
remote: Counting objects: 100% (91/91), done.
remote: Compressing objects: 100% (76/76), done.
remote: Total 91 (delta 13), reused 0 (delta 0)
Unpacking objects: 100% (91/91), done.
```

### Démarrage

Une fois le clonage finalisé, vous pouvez renommer le dossier **sdk-webapp-python** comme vous le souhaitez, ici nous l'appelerons **my-first-app**:

Puis, entrez dans votre dossier:

- Sur Mac / Linux
  pour lancer le fichier init.sh qui va initialiser le projet.

```shell
$ chmod +x init.sh
```

```shell
$ ./init.sh
```

- Sur Windows:
  pour lancer le fichier init.ps1 qui va initialiser le projet.

```shell
$ ./init.ps1
```

Notez que notre application a dû s'ouvrir automatiquement dans notre navigateur (si ce n'est pas le cas, ouvrez un nouvel onglet dans votre navigateur et saisissez l'URL indiquée par la commande dans le terminal, normalement http://localhost:3000/ ).

## <a name="development"></a>Mode développement

En mode développement, il est préférable de lancer le frontend et le backend de manière séparée.

### Lancement du backend

1/ Création d'un environnement virtuel (si ce dernier n'a pas déja été créé)

```shell
$ cd backend
$ python3 -m venv env
```

2/ Activation de l'environnement virtuel (si ce dernier n'a pas déja été activé)

Sur Mac / Linux:

```shell
$ source env/bin/activate
```

Sur Windows:

```shell
$ .\env\Scripts\activate
```

3/ Installation des librairies (si ces dernières n'ont pas déja été installé)

Mettre à jour pip:

```shell
$ pip install --upgrade pip
```

```shell
$ python3 -m pip install -r requirements.txt
```

4/ Lancement du serveur

```shell
$ python3 main.py
```

### Lancement du frontend

```shell
$ cd frontend
$ npm run start
```

Le frontend devrait se lancer sur http://localhost:3000

Cette application permet de calculer la surface d'un rectangle ainsi que son inertie suivant X.

## <a name="add-features"></a>Ajouter des fonctionnalités

A présent, nous souhaitons pouvoir également calculer l'inertie du rectangle suivant Y.

Afin de modifier notre application, allez dans le dossier `src`.
On y trouve le point d’entrée de l’application `src/index.js` ainsi que le composant <a href="https://fr.reactjs.org/" target="_blank">**React.js**</a> contenant notre application à savoir `src/Views/MyApp.jsx`.

Cependant afin de rajouter notre calcul, seul les quatres fichiers suivant nous intéressent:

- [`calculations.js`](#calculationjs), est le fichier qui contient nos fonctions de calculs, par exemple la fonction permetant de calculer la surface du rectangle
- [`Inputs.jsx`](#inputsjsx), est le fichier qui affiche nos inputs tels que la hauteur où la largeur du rectangle
- [`Outputs.jsx`](#outputsjsx), est le fichier qui affiche nos inputs tels que la surface où l'inertie du rectangle
- [`initialData.js`](#initialdatajs), est le fichier qui contient les valeurs initiales, les descriptifs de inputs et des outputs ainsi que les unités.

### <a name="initialdatajs"></a>Valeurs initiales: initialData.js

Ce fichier contient donc les données que l'on souhaite afficher et calculer. Chaque élément que l'on souhaite afficher doit avoir la structure suivante:

```js
A: {    // Indice de l'élément à afficher
  name: 'A',    // Nom de l'élément à afficher, doit être égale à l'Indice
  text: 'Surf', // Texte qui sera afficher
  value: 15,    // Valeur initiale
  description: 'Surface du rectangle en m2', // Description de l'élément
  unit: 'm2' // Unité de l'élément
},
```

Nous souhaitons calculer l'inertie de la section rectangulaire suivant Y. Pour cela, nous rajoutons dans la partie `initialData.outputs` :

```js
Iyy: {
  name: 'Iyy',
  text: 'Iyy',
  value: 31.25,
  description: 'Inertie du rectangle suivant y',
  unit: 'm4'
}
```

### <a name="calculationjs"></a>Le calcul: calculation.js

Ce fichier permet de rajouter en un seul endroit toutes les fonctions de calcul que l'on souhaite. Ces fonctions prennent en paramètre **inputs** qui regroupe l'ensemble des **inputs** que l'on a définit dans la partie `initialData.outputs` du fichier `initialData.js`.

Par exemple, la fonction permettant de calculer la surface d'un section:

```js
surfaceRectangle: (inputs) => {   // Prends en paramètre "inputs"
  const h = inputs.h.value;   // Dans "inputs", on souhaite avoir la valeur de la hauteur "h" du rectangle
  const b = inputs.b.value;   // Dans "inputs", on souhaite avoir la valeur de la largeur "b" du rectangle

  const surface = b * h;  // On calcule la surface du rectangle

  return surface; // On retourne la surface du rectangle
}, // NE PAS OUBLIER LA VIRGULE
```

Afin de pouvoir calculer l'inertie d'une section rectangulaire suivant l'axe Y, on rajoute donc à la suite la fonction suivante:

```js
inertiaYY: (inputs) => {
  const h = inputs.h.value;
  const b = inputs.b.value;

  const Iyy = h * b**3 /12;

  return Iyy;
}, // NE PAS OUBLIER LA VIRGULE
```

### <a name="inputsjsx"></a>Les inputs: Inputs.jsx

Une fois les éléments définis, on peut afficher les **inputs** dans le fichier `Inputs.jsx` en insérant un composant `InputElem`:

```html
<!-- InputElem correspondant à la largeur "b" de la section rectangulaire -->
<InputElem data="{inputsData.b}" updateValue="{updateValue}" />
<!-- InputElem correspondant à la hauteur "h" de la section rectangulaire -->
<InputElem data="{inputsData.h}" updateValue="{updateValue}" />
```

On spécifie ainsi dans `data={inputsData.h}` que l'on fait référence à l'élément ayant l'indice `h` dans le fichier `initialData.js`.

### <a name="outputsjsx"></a>Les outputs: Outputs.jsx

De même, on peut afficher les **outputs** dans le fichier `Outputs.jsx` en insérant un composant `OutputElem`:

```html
<!-- OutputElem correspondant à la surface "A" de la section rectangulaire -->
<OutputElem
  data="{outputsData.A}"
  inputsData="{inputsData}"
  calculationFunctions="{calculationFunctions.surfaceRectangle}"
/>
```

On spécifie ainsi dans `data={outputsData.A}` que l'on fait référence à l'élément ayant l'indice `A` dans le fichier `initialData.js` et dans `calculationFunctions` la fonction de calcul que l'on souhaite utiliser.

Ainsi pour afficher l'inertie de la section rectangulaire suivant Y, on ajoute le composant suivant:

```html
<OutputElem
  data="{outputsData.Iyy}"
  inputsData="{inputsData}"
  calculationFunctions="{calculationFunctions.inertiaYY}"
/>
```

## <a name="components"></a>Les composants

Nous avons vu les composants `InputElem` et `OutputElem` qui permettent respectivement d'afficher les **inputs** et les **outputs** définis dans **initialData.js**.
Les composants sont listés dans le dossier `src/Components`:

- [`InputElem`](#inputelem)
- [`OutputElem`](#outputelem)
- [`ChartElem`](#chartelem)

### <a name="inputelem"></a>InputElem

`InputElem` sert à définir les **inputs** de l'application, il possède les propriétées:

- `data`: permet d'associer à un élément définis dans la partie **initialData.inputs** de **initialData.js**
- `updateValue`: permet de mettre à jour la valeur de l'élément

Exemple:

```html
<!-- Affiche l'input "h" définit dans le fichier initialData.js -->
<InputElem data="{inputsData.h}" updateValue="{updateValue}" />
```

### <a name="outputelem"></a>OutputElem

`OutputElem` sert à définir les **outputs** de l'application, il possède les propriétées:

- `data`: permet d'associer à un élément définis dans la partie **initialData.outputs** de **initialData.js**
- `inputsData`: permet d'associer les **inputs**
- `calculationFunctions`: permet d'associer une fonction de calcul définis dans **calculations.js**

Exemple:

```html
<!-- Affiche l'output "A" définis dans le fichier initialData.js
  associé à la fonction "surfaceRectangle" définis dans le fichier "calculation.js"
  -->
<OutputElem
  data="{outputsData.A}"
  inputsData="{inputsData}"
  calculationFunctions="{calculationFunctions.surfaceRectangle}"
/>
```

### <a name="chartelem"></a>ChartElem

`ChartElem` permet d'afficher des graphes, il possède la propriété:

- `dataForChart`: prend en paramètre un objet qui possède lui-même les propriétées suivantes:
  - `dataForChart`: qui une chaîne de caractère et qui correspond au titre du graphe
  - `value`: qui est un tableau contenant l'ensemble des coordonnées **{x: X, y: Y}** que l'on souhaite afficher
  - `axisName`: qui est un objet contenant le nom des axes que l'on souhaite afficher: **{x: nomAxeX, y: nomAxeY}**
  - `unit`: qui est un objet contenant le nom unités que l'on souhaite afficher: **{x: unitéAxeX, y: unitéAxeY}**

Exemple:

```html
<ChartElem dataForChart={{ chartTitle: 'Section Rectangulaire', value: [ {x: 0,
y: 0}, {x: inputsData.b.value, y: 0}, {x: inputsData.b.value, y:
inputsData.h.value}, {x: 0, y: inputsData.h.value}, {x: 0, y: 0} ], axisName:
{x: 'Largeur de la Section ', y: 'Hauteur de la section '}, unit: {x: 'm', y:
'm'} }} />
```

## <a name="modify-add-components"></a>Modification et ajout de composant

les composants éxistants de <a href="https://github.com/tridyme/webapp-kit-serverless.git" target="_blank">webapp-kit-serverless</a> sont écrits en <a href="https://fr.reactjs.org/" target="_blank">**React.js**</a>, ils sont donc entièrement modifiables.

Il est également possible de rajouter des composants. Pour plus d'information, voir les tutoriels suivants:

- Pour **React.js** sur Openclassrooms: <a href="https://openclassrooms.com/fr/courses/4664381-realisez-une-application-web-avec-react-js" target="_blank">Réalisez une application web avec React.js</a>
- **React.js** est basé lui-même sur **Javascript** qui est le language permettant de faire des calculs dans le navigateur web, pour plus d'information, voir le tutoriel d'Openclassrooms: <a href="https://openclassrooms.com/fr/courses/1916641-dynamisez-vos-sites-web-avec-javascript" target="_blank">Dynamisez vos sites web avec JavaScript</a>

## <a name="github"></a>Stocker son code sur GitHub

Une fois, les modifications implémentées, vous pouvez déployer votre code sur <a href="https://www.github.com/" target="_blank">**GitHub**</a>. Cela permet:

- d'enregistrer son code
- de travailler à plusieurs dessus
- et, nous le verrons ci-dessous, de le mettre en ligne

Pour cela, il faut d'abord:

- Créer un compte sur <a href="https://github.com/" target="_blank">GitHub</a>
- Créer un nouveau Repository: exemple **my-first-app** qui va générer une url https://github.com/my-git-account/my-first-app.git
- Puis intégrer son code dedans:

```shell
$ git remote set-url origin https://github.com/my-git-account/my-first-app.git
$ git push -u origin main --force

```

## <a name="online-webapp"></a>Mettre son application en ligne avec Render

Afin de mettre son application en ligne, nous allons utiliser <a href="https://render.com/" target="_blank">**Render**</a> qui permet de dépoyer des applications de manière gratuite mais avec des interruptions concernant la version gratuite.

Pour cela, il faut d'abord créer un compte Render à partir de son compte Github.
Puis se connecter avec son compte Github:
![deployment-render-login](./ressources/deployment-render-login.png)

![deployment-render-web-service](./ressources/deployment-render-web-service.png)

![deployment-render-git](./ressources/deployment-render-git.png)

Une fois déployée, l'application devrait être disponible sur **https://my-first-app.onrender.com**.

## <a name="platform-webapp"></a>Ajouter son application dans la plateforme TriDyme

Afin d'ajouter votre application dans la plateforme TriDyme, connectez-vous.
Puis dans l'onglet **Account**, cliquez sur **New Application**:
![platform-application-new](./ressources/platform-application-new.png)

Puis renseignez les informations concernant votre application et cliquez sur **Ajout**:
![platform-application-details](./ressources/platform-application-details.png)

## License

[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

- **[MIT license](http://opensource.org/licenses/mit-license.php)**
- Copyright 2024 © <a href="http://tridyme.com" target="_blank">TriDyme</a>.
