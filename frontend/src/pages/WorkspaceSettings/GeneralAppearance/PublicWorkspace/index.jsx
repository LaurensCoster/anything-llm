import { useState } from "react";
import ToggleSwitch from "@/components/lib/ToggleSwitch";

export default function PublicWorkspace({ workspace, setHasChanges }) {
  const [isPublic, setIsPublic] = useState(workspace.public);
  const handleToggle = (newValue) => {
    setIsPublic(newValue);
    setHasChanges(true);
  };

  return (
    <div className="border-b border-theme-sidebar-border pb-6">
      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-y-1">
          <h3 className="text-lg font-semibold text-theme-text-primary">
            Public Access
          </h3>
          <p className="text-sm text-theme-text-secondary">
            Make this workspace publicly accessible to all users in your
            organization.
          </p>
        </div>

        <div className="bg-theme-bg-secondary rounded-lg p-4">
          {/* Hidden input to ensure 'public' field is always sent in form data */}
          <input type="hidden" name="public" value={isPublic ? "true" : ""} />
          <ToggleSwitch
            enabled={isPublic}
            onToggle={handleToggle}
            label="Public Workspace"
            description="When enabled, all users will be able to view and access this workspace, even if they haven't been explicitly added to it."
          />
        </div>

        {isPublic && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="text-yellow-500 text-sm">⚠️</div>
              <div className="text-xs text-yellow-600">
                <strong>Note:</strong> Public workspaces are visible to all
                users in your organization. Make sure you're comfortable sharing
                the content and documents in this workspace.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
