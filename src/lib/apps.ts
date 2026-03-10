import Constants from '@/lib/constants';
import { SiDiscord, SiGithub } from '@icons-pack/react-simple-icons';
import {
  BookMarked,
  Calculator,
  CheckSquare,
  Cookie,
  Gamepad2,
  Home,
  Link2,
  LucideProps,
  MessageCircle,
  Palette,
  Scissors,
  Shield,
  Upload,
  Zap,
} from 'lucide-react';

export type AppItem = {
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;
  title: string;
  description: string;
  link: string;
};

export const apps: AppItem[] = [
  { icon: Home, title: Constants.Home.title, description: Constants.Home.description, link: Constants.Home.link },
  { icon: MessageCircle, title: Constants.Chat.title, description: Constants.Chat.description, link: Constants.Chat.link },
  {
    icon: Upload,
    title: Constants.FileUploader.title,
    description: Constants.FileUploader.description,
    link: Constants.FileUploader.link,
  },
  {
    icon: Scissors,
    title: Constants.BGRemover.title,
    description: Constants.BGRemover.description,
    link: Constants.BGRemover.link,
  },
  { icon: Palette, title: Constants.Colors.title, description: Constants.Colors.description, link: Constants.Colors.link },
  {
    icon: Cookie,
    title: Constants.Cookies.title,
    description: Constants.Cookies.description,
    link: Constants.Cookies.link,
  },
  {
    icon: CheckSquare,
    title: Constants.Todos.title,
    description: Constants.Todos.description,
    link: Constants.Todos.link,
  },
  {
    icon: Gamepad2,
    title: Constants.Hangman.title,
    description: Constants.Hangman.description,
    link: Constants.Hangman.link,
  },
  { icon: Calculator, title: Constants.Calc.title, description: Constants.Calc.description, link: Constants.Calc.link },
  {
    icon: Link2,
    title: Constants.Shortener.title,
    description: Constants.Shortener.description,
    link: Constants.Shortener.link,
  },
  { icon: BookMarked, title: Constants.Fax.title, description: Constants.Fax.description, link: Constants.Fax.link },
  {
    icon: SiGithub,
    title: Constants.Github.title,
    description: Constants.Github.description,
    link: Constants.Github.link,
  },
] as const;

export const adminApps: AppItem[] = [
  {
    icon: Shield,
    title: Constants.Admin.title,
    description: Constants.Admin.description,
    link: Constants.Admin.link,
  },
  { icon: Zap, title: Constants.Black.title, description: Constants.Black.description, link: Constants.Black.link },
  { icon: Palette, title: Constants.White.title, description: Constants.White.description, link: Constants.White.link },
  {
    icon: SiDiscord,
    title: Constants.Discord.title,
    description: Constants.Discord.description,
    link: Constants.Discord.link,
  },
];
