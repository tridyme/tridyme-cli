# Guide d'installation pour les développeurs

Ce guide vous aidera à installer et configurer l'outil CLI TriDyme pour le développement.

## Prérequis

- Node.js (v12 ou supérieur)
- npm ou yarn
- Git

## Étapes d'installation

1. **Clonez le dépôt**

```bash
git clone https://github.com/tridyme/tridyme-cli.git
cd tridyme-cli
```

2. **Installez les dépendances**

```bash
npm install
```

3. **Liez le CLI pour le développement**

Cette étape permet d'utiliser la commande `tridyme` en local pendant le développement.

```bash
npm link
```

4. **Testez l'installation**

```bash
tridyme --version
```

## Structure du projet

```
tridyme-cli/
├── index.js           # Point d'entrée du CLI
├── package.json       # Configuration du package
├── README.md          # Documentation
└── templates/         # Modèles (si vous ajoutez des templates supplémentaires)
```

## Publier une nouvelle version

1. Mettez à jour la version dans `package.json`
2. Créez les notes de version
3. Publiez sur npm

```bash
npm version [patch|minor|major]
npm publish
```

## Tester les commandes pendant le développement

```bash
# Créer un nouveau projet
tridyme create test-project

# Démarrer le mode développement (dans le dossier du projet)
cd test-project
tridyme dev

# Construire le projet
tridyme build

# Guide de déploiement
tridyme deploy
```

## Déboguer

Si vous rencontrez des problèmes, vous pouvez exécuter le CLI avec plus de verbosité :

```bash
NODE_DEBUG=tridyme tridyme [command]
```

## Contribution

1. Créez une branche pour votre fonctionnalité
2. Faites vos modifications
3. Exécutez les tests
4. Soumettez une pull request

## Licence

MIT
