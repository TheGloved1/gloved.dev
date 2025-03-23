type ChatModelCategory = 'google' | 'groq';
const Constants = {
  NAME: 'gloved.dev' as const,
  DESC: 'A personal website for my projects and interests. Built with Next.js' as const,
  ICON: '/logo.png' as const,
  API: 'https://api.gloved.dev' as const,
  GITHUB_URL: 'https://github.com/TheGloved1/gloved.dev/blob/master/src/app' as const,
  FILE_SIZE_LIMIT_MB: 2.5 as const,
  MAX_FILE_SIZE: 2.5 * 1024 * 1024,
  ChatModels: {
    default: 'gemini-2.0-flash' as const,
    google: {
      'Gemini 1.5 Flash': 'gemini-1.5-flash', // being deprecated
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
  } as const,
  NewChatModels: [
    {
      label: 'Gemini 2.0 Flash',
      value: 'gemini-2.0-flash',
      provider: 'google',
      enabled: true,
      description:
        "Google's flagship AI model, optimized for speed and efficiency while maintaining high performance in various tasks",
    },
    {
      label: 'Gemini 2.0 Flash Lite',
      value: 'gemini-2.0-flash-lite',
      provider: 'google',
      enabled: true,
      description: 'A lightweight version of Gemini 2.0 Flash, designed for faster responses and lower resource usage',
    },
    {
      label: 'Gemini 2.0 Pro Experimental',
      value: 'gemini-2.0-pro-exp-02-05',
      provider: 'google',
      enabled: true,
      description: 'An experimental version of Gemini with enhanced capabilities for advanced reasoning and complex tasks',
    },
    {
      label: 'Qwen Coder-32b',
      value: 'qwen-2.5-coder-32b',
      provider: 'groq',
      enabled: true,
      description:
        'Specialized code generation model with production-quality code output, trained on 5.5 trillion tokens of code and technical content',
    },
    {
      label: 'Qwen qwq-32b',
      value: 'qwen-qwq-32b',
      provider: 'groq',
      enabled: true,
      description:
        'Advanced reasoning model delivering performance comparable to state-of-the-art models 20x larger, excelling in complex reasoning tasks',
    },
    {
      label: 'Llama 3.1-8b',
      value: 'llama-3.1-8b-instant',
      provider: 'groq',
      enabled: true,
      description: 'Lightweight version of Llama 3 optimized for fast responses and efficient inference',
    },
    {
      label: 'Llama 3.3-70b',
      value: 'llama-3.3-70b-versatile',
      provider: 'groq',
      enabled: true,
      description: 'Large-scale Llama model with versatile capabilities across various AI tasks',
    },
    {
      label: 'Deepseek R1 (Qwen Distill)',
      value: 'deepseek-r1-distill-qwen-32b',
      provider: 'groq',
      enabled: true,
      description:
        'Distilled version of DeepSeek R1, optimized for high performance reasoning tasks using Qwen architecture',
    },
    {
      label: 'Deepseek R1 (Llama Distill)',
      value: 'deepseek-r1-distill-llama-70b',
      provider: 'groq',
      enabled: true,
      description: 'Distilled version of DeepSeek R1, fine-tuned from Llama-3.3-70B for robust reasoning capabilities',
    },
  ] as {
    label: string;
    value: string;
    provider: ChatModelCategory;
    enabled: boolean;
    description?: string;
  }[],
  getModelName: (modelKey: string): string | undefined => {
    for (const category in Constants.ChatModels) {
      const models = Constants.ChatModels[category as ChatModelCategory];
      for (const name in models) {
        if (models[name as keyof typeof models] === modelKey) {
          return name;
        }
      }
    }
    return 'unknown';
  },
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
  Discord: {
    title: 'Discord',
    link: '/discord',
    description: 'Join my Discord to chat!',
  } as const,
  Chat: {
    title: 'Chat',
    link: '/chat',
    description: 'A VERY fast, local-first, AI chat web app using a local IndexedDB database, WARNING: HE IS EVIL',
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
} as const;

export default Constants;
