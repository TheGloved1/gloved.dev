/**
 * The Constants class serves as a centralized collection of static constants
 * used throughout the application. It contains information related to various
 * sections of the website, including titles, links, and descriptions for each
 * page. Additionally, it holds general configuration constants such as the
 * site name and API endpoint.
 */
export default class Constants {
  static readonly NAME: string = 'gloved.dev';
  static readonly API: string = 'https://api.gloved.dev';
  static readonly FILE_SIZE_LIMIT_MB: number = 15;
  static readonly MAX_FILE_SIZE: number = Constants.FILE_SIZE_LIMIT_MB * 1024 * 1024;
  static readonly Home = {
    title: 'Home',
    link: '/home',
    description: 'The home page for my About Me based web project built with Next.js React Web Framework.',
  };
  static readonly FileUploader = {
    title: 'File Uploader',
    link: '/file-uploader',
    description: 'Just the simple file uploader from the home page.',
  };
  static readonly Todos = {
    title: 'Todo App',
    link: '/todos',
    description: 'A simple todo list web app. Uses local storage to save and get todos list even after reloading.',
  };
  static readonly Hangman = {
    title: 'Janky Hangman',
    link: '/hangman',
    description: 'A simple hangman game web app. Guess the word. (Might be broken)',
  };
  static readonly Calc = {
    title: 'Calculator',
    link: '/calc',
    description: 'A simple calculator web app. Do math calculations.',
  };
  static readonly Github = {
    title: 'Github',
    link: 'https://github.com/TheGloved1/',
    description: 'View the source code. Visit my Github profile to take a look at my other projects.',
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
    description: 'A VERY fast, local-first, chatbot web app using a local IndexedDB database, WARNING: HE IS EVIL',
  };
  static readonly Colors = {
    title: 'Stupid Game',
    link: '/colors',
    description: 'Play the stupid game...',
  };
}
