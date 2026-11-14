import { CircleAlertIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type StaffWarningsProps = {
  flags: {
    notAvoidedByProfessor: boolean;
    qualifiedForThisSection: boolean;
  };
};

export function StaffWarnings({ flags }: StaffWarningsProps) {
  return (
    <>
      {!flags.notAvoidedByProfessor && (
        <Tooltip>
          <TooltipTrigger
            className="self-center"
            aria-label="Avoided by professor"
          >
            <CircleAlertIcon className="text-destructive size-6" />
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Staff is an anti-preference of the professor teaching this
              section.
            </p>
          </TooltipContent>
        </Tooltip>
      )}
      {!flags.qualifiedForThisSection && (
        <Tooltip>
          <TooltipTrigger
            className="self-center"
            aria-label="Not qualified for this section"
          >
            <CircleAlertIcon className="text-destructive size-6" />
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Staff has reported that they are unqualified for this section.
            </p>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}
