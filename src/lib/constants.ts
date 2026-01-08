const Constants = {
  NAME: 'gloved.dev' as const,
  DESC: 'A personal website for my projects and interests. Built with Next.js' as const,
  ICON: '/logo.png' as const,
  API: 'https://api.gloved.dev' as const,
  GITHUB_URL: 'https://github.com/TheGloved1/gloved.dev/blob/master/src/app' as const,
  FILE_SIZE_LIMIT_MB: 2.5 as const,
  MAX_FILE_SIZE: 2.5 * 1024 * 1024,
  Home: {
    title: 'Home',
    link: '/home',
    description: 'The home page for my About Me based web project built with Next.js',
  } as const,
  FileUploader: {
    title: 'File Uploader',
    link: '/file-uploader',
    description: 'Just the simple file uploader from the home page',
  } as const,
  Todos: {
    title: 'Todo App',
    link: '/todos',
    description: 'A simple todo list web app. Uses local storage to save and get todos list even after reloading',
  } as const,
  Hangman: {
    title: 'Janky Hangman',
    link: '/hangman',
    description: 'A simple hangman game web app. Guess the word (Might be broken)',
  } as const,
  Calc: {
    title: 'Calculator',
    link: '/calc',
    description: 'A simple calculator web app. Do math calculations',
  } as const,
  Github: {
    title: 'Github',
    link: 'https://github.com/TheGloved1/',
    description: 'View the source code. Visit my Github profile to take a look at my other projects',
  } as const,
  Black: {
    title: 'Black Screen',
    link: '/black',
    description: 'This is just a black screen',
  } as const,
  White: {
    title: 'White Screen',
    link: '/white',
    description: 'This is just a white screen',
  } as const,
  Discord: {
    title: 'Discord',
    link: '/discord',
    description: 'Join my Discord to chat!',
  } as const,
  Chat: {
    title: 'GlovedChat',
    link: '/chat',
    description: 'A VERY fast, local-first, AI chat web app using local IndexedDB database, WARNING: HE IS EVIL',
  } as const,
  Colors: {
    title: 'Stupid Game',
    link: '/colors',
    description: 'Play the stupid game...',
  } as const,
  Cookies: {
    title: 'Cookie Clicker',
    link: '/cookies',
    description: 'Cookie Clicker Clone',
  } as const,
  Shortener: {
    title: 'Shortener',
    link: '/shortener',
    description: 'A simple URL shortener web app. (Must be signed in)',
  } as const,
  Fax: {
    title: 'Fax',
    link: '/fax',
    description: 'A simple fact generator web app suggested by a friend.',
  } as const,
} as const;

export default Constants;
