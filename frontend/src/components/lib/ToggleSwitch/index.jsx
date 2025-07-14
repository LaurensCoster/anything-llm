/**
 * Reusable Toggle Switch Component
 * @param {boolean} enabled - Current state of the toggle
 * @param {function} onToggle - Callback function when toggle changes
 * @param {string} label - Label text for the toggle
 * @param {string} description - Optional description text
 * @param {boolean} disabled - Whether the toggle is disabled
 */
export default function ToggleSwitch({
  name,
  enabled,
  onToggle,
  label,
  description,
  disabled = false,
}) {
  const handleToggle = () => {
    if (disabled) return;
    onToggle(!enabled);
  };

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <label className="font-medium text-theme-text-primary">{label}</label>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            name={name}
            type="checkbox"
            readOnly
            onClick={handleToggle}
            checked={enabled}
            disabled={disabled}
            className="peer sr-only pointer-events-none"
          />
          <div className="peer-disabled:opacity-50 pointer-events-none peer h-6 w-11 rounded-full bg-[#CFCFD0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:shadow-xl after:border-none after:bg-white after:box-shadow-md after:transition-all after:content-[''] peer-checked:bg-[#32D583] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-transparent"></div>
        </label>
      </div>
      {description && (
        <p className="text-xs text-theme-text-secondary">{description}</p>
      )}
    </div>
  );
}
