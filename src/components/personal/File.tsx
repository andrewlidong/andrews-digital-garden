import React from "react";
import { Rnd } from "react-rnd";

interface FileProps {
  name: string;
  initialPosition?: { x: number; y: number };
  onOpen: () => void;
  disabled?: boolean;
  clicked?: boolean;
  onClick: () => void;
  id: string;
}

export const File: React.FC<FileProps> = ({
  name,
  initialPosition,
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

  const FileContent = (
    <div
      id={id}
      className={`file-container flex items-center p-2 w-full ${!disabled ? "cursor-pointer" : ""} ${clicked ? "bg-term-elevated bg-opacity-60 rounded" : ""}`}
      onDoubleClick={!disabled ? handleDoubleClick : undefined}
      onClick={!disabled ? handleClick : undefined}
    >
      <div className="mr-2 flex items-center justify-center w-6 h-6 flex-shrink-0">
        <span className={`text-xl ${disabled ? "text-term-faint" : clicked ? "text-term-accent" : "text-term-accent"}`}>
          📄
        </span>
      </div>
      <p
        className={`font-mono ${disabled ? "text-term-faint" : clicked ? "text-term-accent" : "text-term-fg"} text-lg break-all`}
      >
        {name}
      </p>
    </div>
  );

  if (initialPosition) {
    return (
      <Rnd
        default={{
          x: initialPosition.x,
          y: initialPosition.y,
          width: 200,
          height: 40,
        }}
        enableResizing={false}
      >
        {FileContent}
      </Rnd>
    );
  }

  return FileContent;
};
