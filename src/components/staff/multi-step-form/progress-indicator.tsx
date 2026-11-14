interface ProgressIndicatorProps {
  step: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  step,
  totalSteps,
}) => {
  return (
    <div
      className="mb-4 flex justify-center"
      role="progressbar"
      aria-label="Form progress"
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-valuenow={step}
      aria-valuetext={`Step ${step} of ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={`mx-1 h-2 w-8 rounded ${
            i < step ? "bg-primary" : "bg-muted"
          }`}
        />
      ))}
    </div>
  );
};

export default ProgressIndicator;
