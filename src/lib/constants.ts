type ChatModelCategory = 'google' | 'groq';
/**
 * The Constants class serves as a centralized collection of static constants
 * used throughout the application. It contains information related to various
 * sections of the website, including titles, links, and descriptions for each
 * page. Additionally, it holds general configuration constants such as the
 * site name and API endpoint.
 */
export default class Constants {
  static readonly NAME: string = 'gloved.dev';
  static readonly DESC: string = 'A personal website for my projects and interests. Built with Next.js';
  static readonly ICON: string = '/logo.png';
  static readonly API: string = 'https://api.gloved.dev';
  static readonly GITHUB_URL: string = 'https://github.com/TheGloved1/gloved.dev/blob/master/src/app';
  static readonly FILE_SIZE_LIMIT_MB: number = 2.5;
  static readonly MAX_FILE_SIZE: number = this.FILE_SIZE_LIMIT_MB * 1024 * 1024;
  public static readonly ChatModels = {
    google: {
      // 'Gemini 1.5 Flash': 'gemini-1.5-flash', // being deprecated
      'Gemini 2.0 Flash': 'gemini-2.0-flash',
      'Gemini 2.0 Flash Lite': 'gemini-2.0-flash-lite',
      'Gemini 2.0 Pro Experimental': 'gemini-2.0-pro-exp-02-05',
    } as const,
    groq: {
      // 'Qwen-32b': 'qwen-2.5-32b',
      'Qwen Coder-32b': 'qwen-2.5-coder-32b',
      'Qwen qwq-32b': 'qwen-qwq-32b',
      'Llama 3.1-8b': 'llama-3.1-8b-instant',
      'Llama 3.3-70b': 'llama-3.3-70b-versatile',
      // 'Mixtral 8x7b': 'mixtral-8x7b-32768',
      'Deepseek R1 (Qwen Distill)': 'deepseek-r1-distill-qwen-32b',
      'Deepseek R1 (Llama Distill)': 'deepseek-r1-distill-llama-70b',
    } as const,
  };
  public static getModelName(modelKey: string): string | undefined {
    for (const category in this.ChatModels) {
      const models = this.ChatModels[category as ChatModelCategory];
      for (const name in models) {
        if (models[name as keyof typeof models] === modelKey) {
          return name;
        }
      }
    }
    return undefined;
  }
  static readonly Home = {
    title: 'Home',
    link: '/home',
    description: 'The home page for my About Me based web project built with Next.js',
  };
  static readonly FileUploader = {
    title: 'File Uploader',
    link: '/file-uploader',
    description: 'Just the simple file uploader from the home page',
  };
  static readonly Todos = {
    title: 'Todo App',
    link: '/todos',
    description: 'A simple todo list web app. Uses local storage to save and get todos list even after reloading',
  };
  static readonly Hangman = {
    title: 'Janky Hangman',
    link: '/hangman',
    description: 'A simple hangman game web app. Guess the word (Might be broken)',
  };
  static readonly Calc = {
    title: 'Calculator',
    link: '/calc',
    description: 'A simple calculator web app. Do math calculations',
  };
  static readonly Github = {
    title: 'Github',
    link: 'https://github.com/TheGloved1/',
    description: 'View the source code. Visit my Github profile to take a look at my other projects',
  };
  static readonly Black = {
    title: 'Black Screen',
    link: '/black',
    description: 'This is just a black screen',
  };
  static readonly Discord = {
    title: 'Discord',
    link: '/discord',
    description: 'Join my Discord to chat!',
  };
  static readonly Chat = {
    title: 'Chat',
    link: '/chat',
    description: 'A VERY fast, local-first, AI chat web app using a local IndexedDB database, WARNING: HE IS EVIL',
  };
  static readonly Colors = {
    title: 'Stupid Game',
    link: '/colors',
    description: 'Play the stupid game...',
  };
}
