import { Link } from "wouter";

interface HeaderProps {
  gameName?: string;
  gameCode?: string;
  isInGame?: boolean;
}

export default function Header({ gameName, gameCode, isInGame = false }: HeaderProps) {
  return (
    <header className="py-3 px-4 bg-background-dark border-b border-primary border-opacity-20">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl md:text-2xl font-['Cinzel'] font-bold text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden sm:inline">Civ VI Turn Tracker</span>
          <span className="sm:hidden">Civ VI</span>
        </Link>
        
        {isInGame && gameName && gameCode && (
          <div className="flex text-xs items-center">
            <div className="bg-background px-2 py-1 rounded-full flex items-center">
              <span className="font-medium mr-1 truncate max-w-[80px] sm:max-w-none">{gameName}</span>
              <span className="font-light text-gray-400">#{gameCode}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
