'use client';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Code, GraduationCap, Newspaper, Sparkles } from 'lucide-react';
import React from 'react';
import ChatInput from './_components/ChatInput';

export const dynamic = 'force-static';

const activeTabStyle =
  'justify-center whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 disabled:cursor-not-allowed text-primary-foreground bg-[rgb(162,59,103)] dark:bg-primary/20 dark:hover:bg-pink-800/70 p-2 shadow border-reflect button-reflect relative hover:bg-[#d56698] active:bg-[rgb(162,59,103)] dark:active:bg-pink-800/40 disabled:hover:bg-[rgb(162,59,103)] disabled:active:bg-[rgb(162,59,103)] disabled:dark:hover:bg-primary/20 disabled:dark:active:bg-primary/20 h-9 flex items-center gap-1 rounded-xl px-5 py-2 font-semibold outline-1 outline-secondary/70 backdrop-blur-xl data-[selected=false]:bg-secondary/30 data-[selected=false]:text-secondary-foreground/90 data-[selected=false]:outline data-[selected=false]:hover:bg-secondary max-sm:size-16 max-sm:flex-col sm:gap-2 sm:rounded-full';
const inactiveTabStyle =
  'max-sm:size-16 max-sm:flex-col flex h-9 items-center justify-center gap-1 whitespace-nowrap rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow outline-1 outline-secondary/70 backdrop-blur-xl transition-colors hover:bg-pink-600/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary data-[selected=false]:bg-secondary/30 data-[selected=false]:text-secondary-foreground/90 data-[selected=false]:outline data-[selected=false]:hover:bg-secondary sm:gap-2 sm:rounded-full [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0';

const tabs = {
  default: [
    'How does AI work?',
    'Are black holes real?',
    'How many Rs are in the word "strawberry"?',
    'What is the meaning of life?',
  ],
  create: [
    'Write a short story about a robot discovering emotions',
    'Help me outline a sci-fi novel set in a post-apocalyptic world',
    'Create a character profile for a complex villain with sympathetic motives',
    'Give me 5 creative writing prompts for flash fiction',
  ],
  explore: [
    'Good books for fans of Rick Rubin',
    'Countries ranked by number of corgis',
    'Most successful companies in the world',
    'How much does Claude cost?',
  ],
  code: [
    'Write code to invert a binary search tree in Python',
    "What's the difference between Promise.all and Promise.allSettled?",
    "Explain React's useEffect cleanup function",
    'Best practices for error handling in async/await',
  ],
  learn: [
    'Beginner guide to TypeScript',
    'Explain the CAP theorem in distributed systems',
    'Why is AI so expensive?',
    'What are black holes?',
  ],
};

type Tab = keyof typeof tabs;

const randomWelcomeMessages: string[] = [
  'Tea or coffee?',
  "What's your superpower?",
  'Is it Friday yet?',
  'Do you have a pet?',
  'Do you like pineapples on pizza?',
  "What's your favorite color?",
  'Are you a morning person?',
  "What's the meaning of life?",
  "What's your favorite food?",
  'Do you have a favorite animal?',
  "What's your favorite type of music?",
  "What's your favorite type of movie?",
  'Do you like sushi?',
];

const getRandomWelcomeMessage = () => {
  return randomWelcomeMessages[Math.floor(Math.random() * randomWelcomeMessages.length)];
};

export default function Page(): React.JSX.Element {
  const [currentTab, setCurrentTab] = React.useState<Tab>('default');
  const [input, setInput] = useLocalStorage('input', '');
  const [welcomeMessage] = React.useState(getRandomWelcomeMessage());

  const isActiveTab = (tab: Tab) => tab === currentTab;

  const handleTabClick = (tab: Tab) => {
    if (tab !== currentTab) {
      setCurrentTab(tab);
    } else {
      setCurrentTab('default');
    }
  };

  const getTabStyles = (tab: Tab) => {
    return isActiveTab(tab) ? activeTabStyle : inactiveTabStyle;
  };

  return (
    <main className='relative flex w-full flex-1 flex-col'>
      <ChatInput createThread={true} isAtBottom={true} />
      <div className='relative flex-1 overflow-hidden'>
        <div className='scrollbar-w-2 h-[100dvh] overflow-y-auto pb-36 scrollbar scrollbar-track-transparent scrollbar-thumb-gray-700 hover:scrollbar-thumb-gray-600'>
          <div className='pt-safe-offset-10 mx-auto flex w-full max-w-3xl flex-col space-y-12 px-4 pb-10'>
            <div className='flex h-[calc(100vh-20rem)] items-start justify-center'>
              <div className='w-full space-y-6 px-2 pt-32 duration-300 animate-in fade-in-50 zoom-in-95 sm:px-8 sm:pt-48 md:pt-60'>
                <h2 className='text-3xl font-semibold' suppressHydrationWarning>
                  {welcomeMessage}
                </h2>
                <div
                  id='suggestions'
                  className='flex flex-row flex-wrap gap-2.5 max-sm:justify-evenly sm:text-xs md:text-sm'
                >
                  <button
                    className={getTabStyles('create')}
                    data-selected={isActiveTab('create')}
                    onClick={() => handleTabClick('create')}
                  >
                    <Sparkles className='size-4' />
                    <div>Create</div>
                  </button>
                  <button
                    className={getTabStyles('explore')}
                    data-selected={isActiveTab('explore')}
                    onClick={() => handleTabClick('explore')}
                  >
                    <Newspaper className='size-4' />
                    <div>Explore</div>
                  </button>
                  <button
                    className={getTabStyles('code')}
                    data-selected={isActiveTab('code')}
                    onClick={() => handleTabClick('code')}
                  >
                    <Code className='size-4' />
                    <div>Code</div>
                  </button>
                  <button
                    className={getTabStyles('learn')}
                    data-selected={isActiveTab('learn')}
                    onClick={() => handleTabClick('learn')}
                  >
                    <GraduationCap className='size-4' />
                    <div>Learn</div>
                  </button>
                </div>
                <div className='flex flex-col text-foreground'>
                  {tabs[currentTab].map((item, index) => (
                    <div key={index} className='flex items-start gap-2 border-t border-secondary/40 py-1 first:border-none'>
                      <button
                        className='w-full rounded-md py-2 text-left text-secondary-foreground hover:bg-secondary/50 sm:px-3'
                        onClick={() => {
                          setInput(item);
                        }}
                      >
                        <span>{item}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
