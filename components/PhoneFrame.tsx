import Image from 'next/image';

type PhoneColor = 'white' | 'gold' | 'silver' | 'rose' | 'blue';

const phoneColors: Record<PhoneColor, { bg: string; border: string; screen: string }> = {
  white: { bg: 'bg-white', border: 'border-zinc-900', screen: 'bg-zinc-300' },
  gold: { bg: 'bg-amber-200', border: 'border-amber-900', screen: 'bg-amber-300' },
  silver: { bg: 'bg-slate-200', border: 'border-slate-900', screen: 'bg-slate-300' },
  rose: { bg: 'bg-rose-200', border: 'border-rose-900', screen: 'bg-rose-300' },
  blue: { bg: 'bg-sky-200', border: 'border-sky-900', screen: 'bg-sky-300' },
};

interface PhoneFrameProps {
  color?: PhoneColor;
}

export function PhoneFrame({ color = 'white' }: PhoneFrameProps) {
  const colorStyle = phoneColors[color];
  
  return (
    <div className={`w-[280px] h-[500px] relative p-5 border-[1.5px] ${colorStyle.border} rounded-[20px] ${colorStyle.bg} shadow-2xl pixelated shrink-0`}>
      {/* Phone screen */}
      <div className={`w-full h-full bg-zinc-200 border-[1.5px] ${colorStyle.border} rounded-[10px] overflow-hidden relative`}>
        {/* Screen content - pixelated effect */}
        <div className={`w-full h-full overflow-hidden ${colorStyle.screen} [image-rendering:pixelated]`}>
          <Image
            src="/bg.webp"
            alt="Page.fun preview"
            fill
            className="object-cover [image-rendering:pixelated]"
          />
        </div>
      </div>
      <div className={`absolute bottom-[7.5px] left-1/2 -translate-x-1/2 z-50 w-[50px] h-[3px] ${colorStyle.screen} rounded-[10px]`}>

      </div>

      <div className={`w-[280px] h-[500px] -z-10 absolute -bottom-1.5 -right-1.5 p-5 border-[1.5px] ${colorStyle.border} rounded-[20px] ${colorStyle.screen} shadow-2xl pixelated shrink-0`}>

      </div>
    </div>
  );
} 