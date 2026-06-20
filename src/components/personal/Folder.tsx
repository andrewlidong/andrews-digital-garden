import React from "react";

interface FolderProps {
  name: string;
  onOpen: () => void;
  disabled?: boolean;
  clicked?: boolean;
  onClick: () => void;
  id: string;
}

export const Folder: React.FC<FolderProps> = ({
  name,
  onOpen,
  disabled = false,
  clicked = false,
  onClick,
  id,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpen();
  };

  return (
    <div
      id={id}
      className={`file-container flex items-center p-2 w-full ${!disabled ? "cursor-pointer" : ""} ${clicked ? "bg-term-elevated bg-opacity-60 rounded" : ""}`}
      onDoubleClick={!disabled ? handleDoubleClick : undefined}
      onClick={!disabled ? handleClick : undefined}
    >
      <div className="mr-2 flex items-center justify-center w-6 h-6 flex-shrink-0">
        <span className={`text-xl ${disabled ? "text-term-faint" : clicked ? "text-term-yellow" : "text-term-yellow"}`}>
          📁
        </span>
      </div>
      <p
        className={`font-mono ${disabled ? "text-term-faint" : clicked ? "text-term-yellow" : "text-term-fg"} text-lg break-all`}
      >
        {name}
      </p>
    </div>
  );
};
