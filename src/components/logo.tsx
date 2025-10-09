import { ShieldCheck } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <ShieldCheck className="h-8 w-8 text-primary" />
      <h1 className="text-2xl font-bold font-headline tracking-tight text-foreground">
        வைப்புத்தொகை 360
      </h1>
    </div>
  );
}
