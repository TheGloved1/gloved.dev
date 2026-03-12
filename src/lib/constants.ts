import { GLOVED_API_URL } from './glovedapi';

const Constants = {
  NAME: 'gloved.dev',
  DESC: 'A personal website for my projects and interests. Built with Next.js',
  ICON: '/logo.png',
  API: GLOVED_API_URL,
  GITHUB_URL: 'https://github.com/TheGloved1/gloved.dev/blob/master/src/app/',
  FILE_SIZE_LIMIT_MB: 2.5,
  MAX_FILE_SIZE: 2.5 * 1024 * 1024,
  Home: {
    title: 'Home',
    link: '/home',
    description: 'The home page for my About Me based web project built with Next.js',
  },
  FileUploader: {
    title: 'GlovedFiles',
    link: '/files',
    description: 'Just a simple file uploader.',
  },
  Todos: {
    title: 'Todo App',
    link: '/todos',
    description: 'A simple todo list web app. Uses local storage to save and get todos list even after reloading',
  },
  Hangman: {
    title: 'Janky Hangman',
    link: '/hangman',
    description: 'A simple hangman game web app. Guess the word (Might be broken)',
  },
  Calc: {
    title: 'Calculator',
    link: '/calc',
    description: 'A simple calculator web app. Do math calculations',
  },
  BGRemover: {
    title: 'BG Remover',
    link: '/bgremover',
    description: 'Remove the background from an image',
  },
  Github: {
    title: 'Github',
    link: 'https://github.com/TheGloved1/',
    description: 'View the source code. Visit my Github profile to take a look at my other projects',
  },
  Black: {
    title: 'Black Screen',
    link: '/black',
    description: 'This is just a black screen',
  },
  White: {
    title: 'White Screen',
    link: '/white',
    description: 'This is just a white screen',
  },
  Discord: {
    title: 'Discord',
    link: '/discord',
    description: 'Join my Discord to chat!',
  },
  Chat: {
    title: 'GlovedChat',
    link: '/chat',
    description: 'A VERY fast, local-first, AI chat web app using local IndexedDB database, WARNING: HE IS EVIL',
  },
  Groceries: {
    title: 'Grocery List',
    link: '/groceries',
    description: 'A synced grocery tracking web app',
  },
  Colors: {
    title: 'Stupid Game',
    link: '/colors',
    description: 'Play the stupid game...',
  },
  Cookies: {
    title: 'Cookie Clicker',
    link: '/cookies',
    description: 'Cookie Clicker Clone',
  },
  Shortener: {
    title: 'Shortener',
    link: '/shortener',
    description: 'A simple URL shortener web app. (Must be signed in)',
  },
  Fax: {
    title: 'Fax',
    link: '/fax',
    description: 'A simple fact generator web app suggested by a friend.',
  },
  Admin: {
    title: 'Admin Panel',
    link: '/admin',
    description: 'Admin panel for admin stuff',
  },
} as const;

export default Constants;
