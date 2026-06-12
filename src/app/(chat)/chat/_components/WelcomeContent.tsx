'use client';
import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/use-chat';
import { useMount } from '@/hooks/use-mount';
import { CustomTool } from '@/lib/ai';
import { SiDungeonsanddragons } from '@icons-pack/react-simple-icons';
import { AnimatePresence, motion } from 'framer-motion';
import { Code, GraduationCap, Newspaper, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const activeTabStyle =
  'justify-center whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 disabled:cursor-not-allowed text-primary-foreground bg-[rgb(162,59,103)] dark:bg-primary/20 dark:hover:bg-pink-800/70 p-2 shadow border-reflect button-reflect relative hover:bg-[#d56698] active:bg-[rgb(162,59,103)] dark:active:bg-pink-800/40 disabled:hover:bg-[rgb(162,59,103)] disabled:active:bg-[rgb(162,59,103)] disabled:dark:hover:bg-primary/20 disabled:dark:active:bg-primary/20 h-9 flex items-center gap-1 rounded-xl px-5 py-2 font-semibold outline-1 outline-secondary/70 backdrop-blur-xl data-[selected=false]:bg-secondary/30 data-[selected=false]:text-secondary-foreground/90 data-[selected=false]:outline data-[selected=false]:hover:bg-secondary max-sm:size-16 max-sm:flex-col sm:gap-2 sm:rounded-full';
const inactiveTabStyle =
  'max-sm:size-16 max-sm:flex-col flex h-9 items-center justify-center gap-1 whitespace-nowrap rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow outline-1 outline-secondary/70 backdrop-blur-xl transition-colors hover:bg-pink-600/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary data-[selected=false]:bg-secondary/30 data-[selected=false]:text-secondary-foreground/90 data-[selected=false]:outline data-[selected=false]:hover:bg-secondary sm:gap-2 sm:rounded-full [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0';

const tabs = {
  Default: [
    'How does AI work?',
    'Are black holes real?',
    'How many Rs are in the word "strawberry"?',
    'What is the meaning of life?',
  ],
  'D&D': [
    'Generate a random D&D character',
    'What are the best spells for a wizard?',
    'How do I play D&D?',
    'What D&D tools do you have access to?',
  ],
  Create: [
    'Write a short story about a robot discovering emotions',
    'Help me outline a sci-fi novel set in a post-apocalyptic world',
    'Create a character profile for a complex villain with sympathetic motives',
    'Give me 5 creative writing prompts for flash fiction',
  ],
  Explore: [
    'Good books for fans of Rick Rubin',
    'Countries ranked by number of corgis',
    'Most successful companies in the world',
    'How much does Agent cost?',
  ],
  Code: [
    'Write code to invert a binary search tree in Python',
    "What's the difference between Promise.all and Promise.allSettled?",
    "Explain React's useEffect cleanup function",
    'Best practices for error handling in async/await',
  ],
  Learn: [
    'Beginner guide to TypeScript',
    'Explain the CAP theorem in distributed systems',
    'Why is AI so expensive?',
    'What are black holes?',
  ],
} as const;

const tabIcons = {
  Default: Sparkles,
  'D&D': SiDungeonsanddragons,
  Create: Sparkles,
  Explore: Newspaper,
  Code: Code,
  Learn: GraduationCap,
} as const;

type Tab = keyof typeof tabs;

const randomWelcomeMessages = [
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
] as const;

const getRandomWelcomeMessage = () => randomWelcomeMessages[Math.floor(Math.random() * randomWelcomeMessages.length)];

export default function WelcomeContent() {
  const [welcomeMessage, setWelcomeMessage] = useState<(typeof randomWelcomeMessages)[number] | null>(null);
  const [currentTab, setCurrentTab] = useState<Tab>('Default');
  const { tools, setInput } = useChat();

  useMount(() => {
    setWelcomeMessage(getRandomWelcomeMessage());
  });

  const isActiveTab = (tab: Tab) => tab === currentTab;

  const handleTabClick = (tab: Tab) => {
    if (tab !== currentTab) {
      setCurrentTab(tab);
    } else {
      setCurrentTab('Default');
    }
  };

  const getTabStyles = (tab: Tab) => {
    return isActiveTab(tab) ? activeTabStyle : inactiveTabStyle;
  };

  const getTabIcon = (tab: Tab): React.JSX.Element => {
    const Icon = tabIcons[tab];
    return <Icon className='size-4' />;
  };

  useEffect(() => {
    if (!tools?.includes(CustomTool.DND) && currentTab === 'D&D') {
      setTimeout(() => {
        setCurrentTab('Default');
      }, 0);
    }
  }, [tools, currentTab]);

  return (
    <AnimatePresence>
      <motion.div
        key='welcome'
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className='w-full space-y-6 px-2 sm:px-8 md:mt-32'
      >
        <h2 className='text-3xl font-semibold' suppressHydrationWarning>
          {welcomeMessage}
        </h2>
        <div id='suggestions' className='flex flex-row flex-wrap gap-2.5 max-sm:justify-evenly sm:text-xs md:text-sm'>
          {(Object.entries(tabs) as [Tab, (typeof tabs)[Tab]][]).map(([tab]): React.ReactNode => {
            if (tab === 'Default') return null;
            if (tab === 'D&D' && tools && !tools.includes(CustomTool.DND)) return null;
            return (
              <Button
                key={tab}
                className={getTabStyles(tab)}
                data-selected={isActiveTab(tab)}
                onClick={() => handleTabClick(tab)}
              >
                {getTabIcon(tab)}
                <div>{tab.charAt(0).toUpperCase() + tab.slice(1)}</div>
              </Button>
            );
          })}
        </div>
        <div className='flex flex-col text-foreground'>
          {tabs[currentTab].map((item, index) => (
            <div key={index} className='flex items-start gap-2 border-t border-secondary/40 py-1 first:border-none'>
              <button
                className='w-full rounded-md py-2 text-left text-secondary-foreground hover:bg-secondary/40 sm:px-3'
                onClick={() => {
                  setInput('__new__', { input: item });
                }}
              >
                <span>{item}</span>
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
