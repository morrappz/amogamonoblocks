import { Button } from "@/components/ui/button";

export default function Buttons() {
  return (
    <div className="flex flex-wrap gap-4 p-6">
      <Button
        variant="default"
        className="relative after:absolute after:inset-0 after:border-2 after:border-current after:scale-110 after:opacity-0 hover:after:scale-100 hover:after:opacity-100 after:transition-all after:duration-300"
      >
        Default
      </Button>

      <Button
        variant="secondary"
        className="relative after:absolute after:inset-0 after:border-2 after:border-current after:scale-110 after:opacity-0 hover:after:scale-100 hover:after:opacity-100 after:transition-all after:duration-300"
      >
        Secondary
      </Button>

      <Button
        variant="destructive"
        className="relative after:absolute after:inset-0 after:border-2 after:border-current after:scale-110 after:opacity-0 hover:after:scale-100 hover:after:opacity-100 after:transition-all after:duration-300"
      >
        Destructive
      </Button>

      <Button
        variant="outline"
        className="relative after:absolute after:inset-0 after:border-2 after:border-current after:scale-110 after:opacity-0 hover:after:scale-100 hover:after:opacity-100 after:transition-all after:duration-300"
      >
        Outline
      </Button>

      <Button
        variant="ghost"
        className="relative after:absolute after:inset-0 after:border-2 after:border-current after:scale-110 after:opacity-0 hover:after:scale-100 hover:after:opacity-100 after:transition-all after:duration-300"
      >
        Ghost
      </Button>
    </div>
  );
}
